// ============================================
// LillyLooks — Interactions
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  initPreloader();
  renderProducts();
  renderProductDetail();
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
function productCardHTML(p, i) {
  return `
    <div class="product-card" data-category="${p.category}" data-url="product.html?p=${productSlug(p.name)}" style="transition-delay:${(i % 8) * 40}ms">
      ${p.badge ? `<span class="product-badge ${p.badge}">${badgeLabel(p.badge)}</span>` : ''}
      <div class="product-img">
        <img src="${p.img}" alt="${p.name}" class="real-product-img" loading="lazy">
      </div>
      <div class="product-info">
        <h3>${p.name}</h3>
        <p class="product-desc">${p.desc}</p>
        ${p.price ? `<span class="product-price">${p.price}</span>` : ''}
        <span class="tiktok-badge"><i class="fab fa-tiktok"></i> Buy on TikTok</span>
      </div>
    </div>`;
}

function attachCardLinks(scope) {
  scope.querySelectorAll('.product-card').forEach(card => {
    const go = () => { window.location.href = card.dataset.url; };
    card.addEventListener('click', go);
    card.setAttribute('role', 'link');
    card.setAttribute('tabindex', '0');
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        go();
      }
    });
  });
}

function renderProducts() {
  const grid = document.getElementById('productGrid');
  if (!grid || typeof PRODUCTS === 'undefined') return;

  grid.innerHTML = PRODUCTS.map((p, i) => productCardHTML(p, i)).join('');
  attachCardLinks(grid);

  // Re-observe for scroll-reveal after render
  observeCards();
}

// ---- Individual product page (product.html) ----
function renderProductDetail() {
  const wrap = document.getElementById('productDetail');
  if (!wrap || typeof PRODUCTS === 'undefined') return;

  const slug = new URLSearchParams(window.location.search).get('p');
  const product = slug ? PRODUCTS.find(p => productSlug(p.name) === slug) : null;

  if (!product) {
    const moreSection = document.getElementById('moreSection');
    if (moreSection) moreSection.style.display = 'none';
    wrap.innerHTML = `
      <div class="detail-fallback">
        <p class="section-eyebrow">The Edit</p>
        <h1 class="section-title">We couldn't find that product</h1>
        <p class="section-subtitle">It may have sold out, or the link could be out of date &mdash; but the rest of the Edit is waiting for you.</p>
        <a href="index.html#products" class="btn-primary">Browse the Shop <i class="fas fa-arrow-right"></i></a>
      </div>`;
    return;
  }

  document.title = `${product.name} | LillyLooks`;

  wrap.innerHTML = `
    <a href="index.html#products" class="back-link"><i class="fas fa-arrow-left"></i> Back to the Edit</a>
    <div class="detail-grid">
      <div class="detail-img">
        ${product.badge ? `<span class="product-badge ${product.badge}">${badgeLabel(product.badge)}</span>` : ''}
        <img src="${product.img}" alt="${product.name}" class="real-product-img">
      </div>
      <div class="detail-info">
        <p class="section-eyebrow">The Edit</p>
        <h1>${product.name}</h1>
        <p class="detail-desc">${product.desc}</p>
        ${product.price ? `<span class="detail-price">${product.price}</span>` : ''}
        <a href="${TIKTOK_SHOP_URL}" class="btn-primary btn-large" target="_blank" rel="noopener">
          <i class="fab fa-tiktok"></i> Buy on TikTok Shop
        </a>
        <p class="detail-note"><i class="fas fa-shield-heart"></i> This site is a showcase &mdash; checkout happens securely on TikTok Shop.</p>
      </div>
    </div>`;

  // More products: same category first, then the rest of the Edit
  const moreGrid = document.getElementById('moreGrid');
  if (moreGrid) {
    const others = PRODUCTS.filter(p => p !== product);
    const more = [
      ...others.filter(p => p.category === product.category),
      ...others.filter(p => p.category !== product.category)
    ].slice(0, 4);
    moreGrid.innerHTML = more.map((p, i) => productCardHTML(p, i)).join('');
    attachCardLinks(moreGrid);
    observeCards();
  }
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
