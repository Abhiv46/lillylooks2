// ============================================
// LillyLooks — Interactions
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  initPreloader();
  renderProducts();
  renderProductDetail();
  renderCategoryPage();
  renderGuidePicks();
  initStaticCards();
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
    <a class="product-card" href="product/${productSlug(p.name)}.html" data-category="${p.category}" style="transition-delay:${(i % 8) * 40}ms">
      ${p.badge ? `<span class="product-badge ${p.badge}">${badgeLabel(p.badge)}</span>` : ''}
      <div class="product-img">
        <img src="${p.img}" alt="${p.name}" class="real-product-img" width="800" height="800" loading="lazy" decoding="async">
      </div>
      <div class="product-info">
        <h3>${p.name}</h3>
        <p class="product-desc">${p.desc}</p>
        ${p.price ? `<span class="product-price">${p.price}</span>` : ''}
        <span class="tiktok-badge"><i class="fab fa-tiktok"></i> Buy on TikTok</span>
      </div>
    </a>`;
}

function attachCardLinks(scope) {
  scope.querySelectorAll('.product-card').forEach(card => {
    if (card.tagName === 'A') return; // real anchor cards need no JS navigation
    if (card.dataset.linked) return;
    card.dataset.linked = '1';
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

  // The homepage grid is server-rendered into index.html; only render
  // from JS when the static cards are absent.
  if (!grid.querySelector('.product-card')) {
    grid.innerHTML = PRODUCTS.map((p, i) => productCardHTML(p, i)).join('');
  }
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
  updateProductMeta(product);

  wrap.innerHTML = `
    <a href="index.html#products" class="back-link"><i class="fas fa-arrow-left"></i> Back to the Edit</a>
    <div class="detail-grid">
      <div class="detail-img">
        ${product.badge ? `<span class="product-badge ${product.badge}">${badgeLabel(product.badge)}</span>` : ''}
        <img src="${product.img}" alt="${product.name}" class="real-product-img" decoding="async">
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
    </div>
    ${productExtraHTML(product)}`;

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

// ---- Product page extras: How to Use + FAQ (from products-data.js) ----
function productExtraHTML(product) {
  let html = '';

  if (product.howto && product.howto.length) {
    html += `
    <div class="section-header">
      <p class="section-eyebrow">Step by Step</p>
      <h2 class="section-title">How to Use</h2>
    </div>
    <div class="trust-grid">
      ${product.howto.map((step, i) => `
      <div class="trust-item">
        <i class="fas fa-${i + 1}"></i>
        <h4>Step ${i + 1}</h4>
        <p>${step}</p>
      </div>`).join('')}
    </div>`;
  }

  if (product.faq && product.faq.length) {
    html += `
    <div class="section-header">
      <p class="section-eyebrow">Good to Know</p>
      <h2 class="section-title">Questions &amp; Answers</h2>
    </div>
    <div class="trust-grid">
      ${product.faq.map(item => `
      <div class="trust-item">
        <i class="fas fa-circle-question"></i>
        <h4>${item.q}</h4>
        <p>${item.a}</p>
      </div>`).join('')}
    </div>`;
  }

  return html;
}

// ---- Category landing pages (static: category/<key>.html; this JS
// renderer only serves the legacy category.html?c=<key> shell) ----
function renderCategoryPage() {
  const header = document.getElementById('categoryHeader');
  const grid = document.getElementById('categoryGrid');
  if (!header || !grid || typeof PRODUCTS === 'undefined' || typeof CATEGORIES === 'undefined') return;

  const key = new URLSearchParams(window.location.search).get('c');
  if (!key) return; // static category pages (category/<key>.html) are pre-rendered
  const cat = CATEGORIES[key];

  if (!cat) {
    header.innerHTML = `
      <p class="section-eyebrow">The Edit</p>
      <h1 class="section-title">We couldn't find that category</h1>
      <p class="section-subtitle">The full Edit is waiting for you on the shop page.</p>`;
    grid.innerHTML = PRODUCTS.map((p, i) => productCardHTML(p, i)).join('');
    attachCardLinks(grid);
    observeCards();
    return;
  }

  const items = PRODUCTS.filter(p => p.category === key);
  document.title = cat.title;
  updateCategoryMeta(key, cat, items);

  header.innerHTML = `
    <p class="section-eyebrow">The Edit &mdash; ${cat.name}</p>
    <h1 class="section-title">${cat.heading}</h1>
    <p class="section-subtitle">${cat.intro}</p>`;

  grid.innerHTML = items.map((p, i) => productCardHTML(p, i)).join('');
  attachCardLinks(grid);
  observeCards();
}

function updateCategoryMeta(key, cat, items) {
  const pageUrl = `${SITE_URL}/category/${key}.html`;
  const firstImg = items.length ? `${SITE_URL}/${encodeURI(items[0].img)}` : '';

  setMeta('meta[name="description"]', 'content', cat.metaDesc);
  setMeta('link[rel="canonical"]', 'href', pageUrl);
  setMeta('meta[property="og:title"]', 'content', cat.title);
  setMeta('meta[property="og:description"]', 'content', cat.metaDesc);
  setMeta('meta[property="og:url"]', 'content', pageUrl);
  if (firstImg) setMeta('meta[property="og:image"]', 'content', firstImg);
  setMeta('meta[name="twitter:title"]', 'content', cat.title);
  setMeta('meta[name="twitter:description"]', 'content', cat.metaDesc);
  if (firstImg) setMeta('meta[name="twitter:image"]', 'content', firstImg);

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `LillyLooks — ${cat.name}`,
    numberOfItems: items.length,
    itemListElement: items.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Product',
        name: p.name,
        image: `${SITE_URL}/${encodeURI(p.img)}`,
        description: p.desc,
        url: `${SITE_URL}/product/${productSlug(p.name)}.html`,
        offers: { '@type': 'Offer', url: TIKTOK_SHOP_URL }
      }
    }))
  };
  document.querySelectorAll('script[data-category-schema]').forEach(s => s.remove());
  const tag = document.createElement('script');
  tag.type = 'application/ld+json';
  tag.setAttribute('data-category-schema', '');
  tag.textContent = JSON.stringify(schema);
  document.head.appendChild(tag);
}

// ---- Guide pages: "Shop this guide" product picks ----
function renderGuidePicks() {
  document.querySelectorAll('[data-pick]').forEach(grid => {
    if (typeof PRODUCTS === 'undefined') return;
    const slugs = grid.dataset.pick.split(',').map(s => s.trim()).filter(Boolean);
    const picks = slugs
      .map(slug => PRODUCTS.find(p => productSlug(p.name) === slug))
      .filter(Boolean);
    if (!picks.length) return;
    grid.innerHTML = picks.map((p, i) => productCardHTML(p, i)).join('');
    attachCardLinks(grid);
    observeCards();
  });
}

// ---- Static product cards (guides index) ----
function initStaticCards() {
  document.querySelectorAll('.product-grid').forEach(grid => {
    if (grid.querySelector('.product-card')) {
      attachCardLinks(grid);
      observeCards();
    }
  });
}

// ---- Per-product SEO meta + Product schema (product.html) ----
const SITE_URL = 'https://lillylooks.co.uk';

function setMeta(selector, attr, value) {
  const el = document.querySelector(selector);
  if (el) el.setAttribute(attr, value);
}

function updateProductMeta(product) {
  // Canonical for the legacy product.html view is the static product page.
  const pageUrl = `${SITE_URL}/product/${productSlug(product.name)}.html`;
  const imgUrl = `${SITE_URL}/${encodeURI(product.img)}`;
  const desc = `${product.desc} Available on TikTok Shop UK at LillyLooks.`;

  setMeta('meta[name="description"]', 'content', desc);
  setMeta('link[rel="canonical"]', 'href', pageUrl);
  setMeta('meta[property="og:title"]', 'content', `${product.name} | LillyLooks UK`);
  setMeta('meta[property="og:description"]', 'content', desc);
  setMeta('meta[property="og:url"]', 'content', pageUrl);
  setMeta('meta[property="og:image"]', 'content', imgUrl);
  setMeta('meta[name="twitter:title"]', 'content', `${product.name} | LillyLooks UK`);
  setMeta('meta[name="twitter:description"]', 'content', desc);
  setMeta('meta[name="twitter:image"]', 'content', imgUrl);

  const offer = { '@type': 'Offer', url: TIKTOK_SHOP_URL };
  if (product.price) {
    offer.priceCurrency = 'GBP';
    offer.price = product.price.replace('£', '');
  }
  const productSchema = {
    '@type': 'Product',
    name: product.name,
    image: imgUrl,
    description: product.desc,
    url: pageUrl,
    offers: offer
  };
  const graph = [productSchema];
  if (product.faq && product.faq.length) {
    graph.push({
      '@type': 'FAQPage',
      mainEntity: product.faq.map(item => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a }
      }))
    });
  }
  const schema = { '@context': 'https://schema.org', '@graph': graph };
  document.querySelectorAll('script[data-product-schema]').forEach(s => s.remove());
  const tag = document.createElement('script');
  tag.type = 'application/ld+json';
  tag.setAttribute('data-product-schema', '');
  tag.textContent = JSON.stringify(schema);
  document.head.appendChild(tag);
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
