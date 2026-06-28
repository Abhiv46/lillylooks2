// ============================================
// LillyLooks — Interactions
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  initPreloader();
  renderProducts();
  initFilters();
  renderReviews();
  initNavbar();
  initMobileMenu();
  initModals();
  initScrollReveal();
});

// ---- Preloader ----
function initPreloader() {
  const pre = document.getElementById('preloader');
  if (!pre) return;
  window.addEventListener('load', () => {
    setTimeout(() => pre.classList.add('hide'), 250);
  });
  // Fallback in case 'load' already fired
  setTimeout(() => pre.classList.add('hide'), 1500);
}

// ---- Render product grid ----
function renderProducts() {
  const grid = document.getElementById('productGrid');
  if (!grid || typeof PRODUCTS === 'undefined') return;

  grid.innerHTML = PRODUCTS.map((p, i) => `
    <div class="product-card" data-category="${p.category}" style="transition-delay:${(i % 8) * 40}ms">
      ${p.badge ? `<span class="product-badge ${p.badge}">${badgeLabel(p.badge)}</span>` : ''}
      <div class="product-img">
        <img src="${p.img}" alt="${p.name}" class="real-product-img" loading="lazy">
      </div>
      <div class="product-info">
        <h3>${p.name}</h3>
        <p class="product-desc">${p.desc}</p>
        <span class="tiktok-badge"><i class="fab fa-tiktok"></i> Buy on TikTok</span>
      </div>
    </div>
  `).join('');

  grid.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('click', () => {
      window.open(TIKTOK_SHOP_URL, '_blank', 'noopener');
    });
    card.setAttribute('role', 'link');
    card.setAttribute('tabindex', '0');
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        window.open(TIKTOK_SHOP_URL, '_blank', 'noopener');
      }
    });
  });

  // Re-observe for scroll-reveal after render
  observeCards();
}

function badgeLabel(key) {
  const map = { bestseller: 'Bestseller', trending: '🔥 Trending', new: 'New In' };
  return map[key] || key;
}

// ---- Category filters ----
function initFilters() {
  const buttons = document.querySelectorAll('.filter-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      const filter = btn.dataset.filter;
      document.querySelectorAll('.product-card').forEach(card => {
        const show = filter === 'all' || card.dataset.category === filter;
        card.classList.toggle('fading-out', !show);
      });
    });
  });
}

// ---- Reviews carousel ----
function renderReviews() {
  const track = document.getElementById('reviewsTrack');
  if (!track || typeof REVIEWS === 'undefined') return;

  const cardHTML = (r) => `
    <div class="review-card">
      <div class="review-stars">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</div>
      <p class="review-text">${r.text}</p>
      <div class="review-author">
        <div class="review-avatar">${r.name.charAt(0)}</div>
        <div>
          <strong>${r.name}</strong>
          <span>${r.location}</span>
        </div>
      </div>
    </div>`;

  // Duplicate the set for a seamless infinite scroll loop
  const all = [...REVIEWS, ...REVIEWS];
  track.innerHTML = all.map(cardHTML).join('');
}

// ---- Navbar scroll state ----
function initNavbar() {
  const nav = document.getElementById('navbar');
  if (!nav) return;
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 10);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// ---- Mobile menu ----
function initMobileMenu() {
  const btn = document.getElementById('menuBtn');
  const links = document.getElementById('navLinks');
  if (!btn || !links) return;

  btn.addEventListener('click', () => {
    const isOpen = links.classList.toggle('open');
    btn.classList.toggle('open', isOpen);
    btn.setAttribute('aria-expanded', String(isOpen));
  });

  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      links.classList.remove('open');
      btn.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    });
  });
}

// ---- Legal modals ----
function initModals() {
  document.querySelectorAll('[data-modal]').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const modal = document.getElementById(trigger.dataset.modal);
      if (modal) modal.classList.add('open');
    });
  });

  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('open');
    });
    modal.querySelector('.modal-close')?.addEventListener('click', () => {
      modal.classList.remove('open');
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal.open').forEach(m => m.classList.remove('open'));
    }
  });
}

// ---- Scroll reveal for product cards ----
let cardObserver;
function observeCards() {
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.product-card').forEach(c => c.classList.add('in-view'));
    return;
  }
  if (cardObserver) cardObserver.disconnect();
  cardObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        cardObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.product-card').forEach(card => cardObserver.observe(card));
}

// ---- General reveal-on-scroll for sections (lightweight) ----
function initScrollReveal() {
  const targets = document.querySelectorAll('.trust-item, .about-card, .contact-item');
  if (!('IntersectionObserver' in window)) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  targets.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(16px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    obs.observe(el);
  });
}
