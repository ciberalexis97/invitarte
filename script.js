/* ============================================
   INVITARTE — Script Principal (Corregido)
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // Initialize Lucide icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  /* ==========================================
     1. NAVBAR — scroll & hamburger
     ========================================== */
  const navbar    = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');

  const handleNavbarScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  };
  window.addEventListener('scroll', handleNavbarScroll, { passive: true });
  handleNavbarScroll();

  hamburger?.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', isOpen);
    hamburger.querySelectorAll('span').forEach((s, i) => {
      s.style.transform = isOpen
        ? i === 0 ? 'rotate(45deg) translate(5px, 5px)'
          : i === 1 ? 'scale(0)'
          : 'rotate(-45deg) translate(5px, -5px)'
        : '';
      s.style.opacity = (isOpen && i === 1) ? '0' : '';
    });
  });

  navLinks?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger?.querySelectorAll('span').forEach(s => {
        s.style.transform = '';
        s.style.opacity = '';
      });
    });
  });

  /* ==========================================
     2. SCROLL-TRIGGERED ANIMATIONS
     ========================================== */
  const animatedEls = document.querySelectorAll('[data-animate]');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const delay = parseInt(el.dataset.delay || '0', 10);
        setTimeout(() => el.classList.add('visible'), delay);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  animatedEls.forEach(el => observer.observe(el));

  /* ==========================================
     3. LIGHTBOX / VISOR DE IMÁGENES
     ========================================== */
  const lightbox      = document.getElementById('lightbox');
  const lightboxImg   = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev  = document.getElementById('lightboxPrev');
  const lightboxNext  = document.getElementById('lightboxNext');
  const lightboxWA    = document.getElementById('lightboxWA');

  let currentGalleryImages = [];
  let currentImageIndex = 0;

  function openLightbox(imgSrc, caption, category, designName) {
    lightboxImg.src = imgSrc;
    lightboxCaption.textContent = caption;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Configurar el botón de WhatsApp con la información de la imagen
    const waText = encodeURIComponent(
      `¡Hola! 👋 Me interesa este diseño:\n\n` +
      `🎨 *${designName}*\n` +
      `📂 *Categoría:* ${category}\n\n` +
      `_Enviado desde el portafolio de InvitArte_`
    );
    lightboxWA.href = `https://wa.me/5219221224111?text=${waText}`;

    // Buscar todas las imágenes visibles en la galería para navegación
    updateCurrentGallery();
  }

  function updateCurrentGallery() {
    const visibleCards = document.querySelectorAll('.gallery-card[style*="display:"]:not([style*="display: none"]), .gallery-card:not([style*="display: none"])');
    // Si no hay filtros activos, tomar todas las cards visibles
    const allVisible = Array.from(document.querySelectorAll('.gallery-card')).filter(card => {
      return card.style.display !== 'none' && card.offsetParent !== null;
    });
    
    currentGalleryImages = allVisible.map(card => {
      const img = card.querySelector('img');
      const title = card.querySelector('h4')?.textContent || '';
      const cat = card.querySelector('.gallery-cat')?.textContent || '';
      return {
        src: img?.src || '',
        caption: title,
        category: cat,
        designName: title,
        card: card
      };
    }).filter(item => item.src);

    currentImageIndex = currentGalleryImages.findIndex(item => item.src === lightboxImg.src);
    if (currentImageIndex === -1) currentImageIndex = 0;
  }

  function navigateLightbox(direction) {
    if (currentGalleryImages.length === 0) return;
    currentImageIndex = (currentImageIndex + direction + currentGalleryImages.length) % currentGalleryImages.length;
    const item = currentGalleryImages[currentImageIndex];
    lightboxImg.src = item.src;
    lightboxCaption.textContent = item.caption;
    
    const waText = encodeURIComponent(
      `¡Hola! 👋 Me interesa este diseño:\n\n` +
      `🎨 *${item.designName}*\n` +
      `📂 *Categoría:* ${item.category}\n\n` +
      `_Enviado desde el portafolio de InvitArte_`
    );
    lightboxWA.href = `https://wa.me/5219221224111?text=${waText}`;
  }

  lightboxClose?.addEventListener('click', () => {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  });

  lightbox?.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
    }
  });

  lightboxPrev?.addEventListener('click', (e) => {
    e.stopPropagation();
    navigateLightbox(-1);
  });

  lightboxNext?.addEventListener('click', (e) => {
    e.stopPropagation();
    navigateLightbox(1);
  });

  // Navegación con teclado
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'ArrowLeft') navigateLightbox(-1);
    if (e.key === 'ArrowRight') navigateLightbox(1);
    if (e.key === 'Escape') {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
    }
  });

  /* ==========================================
     4. GALLERY CARD — click para abrir lightbox
     ========================================== */
  const galleryCards = document.querySelectorAll('.gallery-card');

  galleryCards.forEach(card => {
    const imgWrap = card.querySelector('.gallery-img-wrap');
    const img = card.querySelector('img');
    const title = card.querySelector('h4')?.textContent || '';
    const category = card.querySelector('.gallery-cat')?.textContent || '';

    // Click en la imagen abre el lightbox
    imgWrap?.addEventListener('click', (e) => {
      // Si el clic fue en el overlay de WhatsApp, no abrir lightbox
      if (e.target.closest('.gallery-overlay-wa')) {
        // Abrir WhatsApp directamente
        const waText = encodeURIComponent(
          `¡Hola! 👋 Me interesa este diseño:\n\n` +
          `🎨 *${title}*\n` +
          `📂 *Categoría:* ${category}\n\n` +
          `_Enviado desde el portafolio de InvitArte_`
        );
        window.open(`https://wa.me/5219221224111?text=${waText}`, '_blank');
        e.stopPropagation();
        return;
      }
      
      if (img?.src) {
        updateCurrentGallery();
        openLightbox(img.src, title, category, title);
      }
    });

    // El overlay de "Ver diseño" también abre lightbox
    const verBtn = imgWrap?.querySelector('.gallery-overlay span:first-child');
    verBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (img?.src) {
        updateCurrentGallery();
        openLightbox(img.src, title, category, title);
      }
    });
  });

  /* ==========================================
     5. GALLERY FILTERS
     ========================================== */
  const filterBtns = document.querySelectorAll('.filter-btn');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;

      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      galleryCards.forEach(card => {
        const match = filter === 'all' || card.dataset.category === filter;
        if (match) {
          card.style.display = '';
          card.style.opacity = '0';
          card.style.transform = 'translateY(16px)';
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
              card.style.opacity = '1';
              card.style.transform = 'translateY(0)';
            });
          });
        } else {
          card.style.transition = 'opacity 0.25s ease';
          card.style.opacity = '0';
          setTimeout(() => { card.style.display = 'none'; }, 250);
        }
      });
    });
  });

  /* ==========================================
     6. TESTIMONIALS SLIDER
     ========================================== */
  const track = document.getElementById('testimonialsTrack');
  const dots  = document.querySelectorAll('.slider-dots .dot');
  let current = 0;
  let autoSlide;

  const VISIBLE_SLIDES = () => window.innerWidth < 768 ? 1 : 3;

  const goTo = (idx) => {
    const cards   = track?.querySelectorAll('.testi-card') || [];
    const visible = VISIBLE_SLIDES();
    const max     = Math.max(0, cards.length - visible);
    current = Math.min(Math.max(idx, 0), max);

    const cardWidth = cards[0]?.offsetWidth || 0;
    const gap = 24;
    const offset = current * (cardWidth + gap);
    if (track) track.style.transform = `translateX(-${offset}px)`;

    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  };

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      goTo(parseInt(dot.dataset.idx, 10));
      resetAutoSlide();
    });
  });

  const startAutoSlide = () => {
    autoSlide = setInterval(() => {
      const cards   = track?.querySelectorAll('.testi-card') || [];
      const visible = VISIBLE_SLIDES();
      const max     = cards.length - visible;
      goTo(current < max ? current + 1 : 0);
    }, 5000);
  };

  const resetAutoSlide = () => {
    clearInterval(autoSlide);
    startAutoSlide();
  };

  startAutoSlide();

  let touchStartX = 0;
  track?.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });

  track?.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      goTo(diff > 0 ? current + 1 : current - 1);
      resetAutoSlide();
    }
  }, { passive: true });

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => goTo(0), 200);
  });

  /* ==========================================
     7. CONTACT FORM
     ========================================== */
  const contactForm  = document.getElementById('contactForm');
  const formSuccess  = document.getElementById('formSuccess');

  contactForm?.addEventListener('submit', (e) => {
    e.preventDefault();

    const name    = contactForm.nombre?.value.trim();
    const evento  = contactForm.evento?.value;
    const fecha   = contactForm.fecha?.value;
    const mensaje = contactForm.mensaje?.value.trim();

    if (!name || !evento) {
      [contactForm.nombre, contactForm.evento].forEach(field => {
        if (!field?.value.trim() && !field?.value) {
          field?.closest('.form-group')?.classList.add('shake');
          setTimeout(() => field?.closest('.form-group')?.classList.remove('shake'), 500);
        }
      });
      return;
    }

    let fechaTexto = 'Por confirmar';
    if (fecha) {
      const [y, m, d] = fecha.split('-');
      fechaTexto = `${d}/${m}/${y}`;
    }

    const eventoMap = {
      xv: 'XV Años', boda: 'Boda', bautizo: 'Bautizo',
      cumple: 'Cumpleaños', comunion: 'Comunión',
      confirmacion: 'Confirmación', graduacion: 'Graduación', otro: 'Otro'
    };
    const eventoTexto = eventoMap[evento] || evento;

    const submitBtn = contactForm.querySelector('[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spin"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg> Abriendo WhatsApp...`;

    const waText = encodeURIComponent(
      `¡Hola! 👋 Me interesa una invitación digital.\n\n` +
      `📛 *Nombre:* ${name}\n` +
      `🎉 *Evento:* ${eventoTexto}\n` +
      `📅 *Fecha:* ${fechaTexto}\n` +
      (mensaje ? `💬 *Mensaje:* ${mensaje}\n` : '') +
      `\n_Enviado desde el formulario de InvitArte_`
    );

    setTimeout(() => {
      window.open(`https://wa.me/5219221224111?text=${waText}`, '_blank');
      contactForm.reset();
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg> Enviar mensaje`;
      formSuccess.hidden = false;
      formSuccess.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      setTimeout(() => { formSuccess.hidden = true; }, 5000);
    }, 600);
  });

  /* ==========================================
     8. SMOOTH SCROLL for anchor links
     ========================================== */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href').slice(1);
      const target   = document.getElementById(targetId);
      if (target) {
        e.preventDefault();
        const offsetTop = target.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top: offsetTop, behavior: 'smooth' });
      }
    });
  });

  /* ==========================================
     9. WA FAB — pulse animation after 3s
     ========================================== */
  const waFab = document.querySelector('.wa-fab');
  setTimeout(() => {
    waFab?.classList.add('pulse');
  }, 3000);

  /* ==========================================
     10. CATEGORY CARDS ripple effect
     ========================================== */
  document.querySelectorAll('.cat-card').forEach(card => {
    card.addEventListener('click', function(e) {
      const ripple = document.createElement('span');
      ripple.style.cssText = `
        position:absolute;
        border-radius:50%;
        background:rgba(212,117,142,0.2);
        pointer-events:none;
        width:0; height:0;
        left:${e.offsetX}px;
        top:${e.offsetY}px;
        transform:translate(-50%,-50%);
        animation: rippleAnim 0.6s ease-out forwards;
      `;
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 700);
    });
  });

  /* ==========================================
     11. HERO IMAGE CAROUSEL
     ========================================== */
  const hcSlides    = document.querySelectorAll('.hc-slide');
  const hcDotBtns   = document.querySelectorAll('.hc-dot');
  const hcLabelText = document.getElementById('hcLabelText');

  const hcLabels = ['Boda', 'XV Años', 'Bautizo', 'Cumpleaños', 'Comunión', 'Confirmación', 'Graduación'];

  let hcCurrent  = 0;
  let hcTimer;

  const hcGoTo = (idx) => {
    hcSlides[hcCurrent]?.classList.remove('active');
    hcDotBtns[hcCurrent]?.classList.remove('active');

    hcCurrent = (idx + hcSlides.length) % hcSlides.length;

    hcSlides[hcCurrent]?.classList.add('active');
    hcDotBtns[hcCurrent]?.classList.add('active');
    if (hcLabelText) hcLabelText.textContent = hcLabels[hcCurrent] || '';
  };

  const hcStartAuto = () => {
    hcTimer = setInterval(() => hcGoTo(hcCurrent + 1), 3800);
  };
  const hcResetAuto = () => { clearInterval(hcTimer); hcStartAuto(); };

  hcDotBtns.forEach(dot => {
    dot.addEventListener('click', () => {
      hcGoTo(parseInt(dot.dataset.slide, 10));
      hcResetAuto();
    });
  });

  document.querySelector('.hero-carousel')?.addEventListener('click', () => {
    hcGoTo(hcCurrent + 1);
    hcResetAuto();
  });

  document.querySelector('.hero-carousel')?.addEventListener('mouseenter', () => clearInterval(hcTimer));
  document.querySelector('.hero-carousel')?.addEventListener('mouseleave', hcStartAuto);

  hcStartAuto();
});

/* ==========================================
   CSS: Animations injected
   ========================================== */
const style = document.createElement('style');
style.textContent = `
  @keyframes rippleAnim {
    from { width: 0; height: 0; opacity: 1; }
    to   { width: 300px; height: 300px; opacity: 0; }
  }
  .spin {
    animation: spinAnim 1s linear infinite;
  }
  @keyframes spinAnim {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  .form-group.shake {
    animation: shakeAnim 0.4s ease;
  }
  @keyframes shakeAnim {
    0%, 100% { transform: translateX(0); }
    25%       { transform: translateX(-6px); }
    75%       { transform: translateX(6px); }
  }
  .wa-fab.pulse::after {
    content: '';
    position: absolute;
    inset: -8px;
    border-radius: 50%;
    background: rgba(37,211,102,0.25);
    animation: pulseFab 2s ease-out infinite;
  }
  @keyframes pulseFab {
    0%   { transform: scale(0.8); opacity: 1; }
    100% { transform: scale(1.6); opacity: 0; }
  }
`;
document.head.appendChild(style);

/* =========================================================
   Mejora UX 2026 — cierre de menú con clic exterior
   ========================================================= */
document.addEventListener('click', (event) => {
  const nav = document.getElementById('navLinks');
  const btn = document.getElementById('hamburger');
  if (!nav || !btn || !nav.classList.contains('open')) return;
  if (nav.contains(event.target) || btn.contains(event.target)) return;
  nav.classList.remove('open');
  btn.setAttribute('aria-expanded', 'false');
  btn.querySelectorAll('span').forEach(s => {
    s.style.transform = '';
    s.style.opacity = '';
  });
});
