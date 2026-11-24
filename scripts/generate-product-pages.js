#!/usr/bin/env node
// ============================================================
// LillyLooks — static product page + Merchant feed + sitemap generator
//
// Why this exists: product.html?p=<slug> renders everything with
// JavaScript, so crawlers saw one generic, near-empty page for all
// 21 products. This script generates one fully server-rendered HTML
// page per product at /product/<slug>.html, a Google Merchant Center
// feed (merchant-feed.xml) and a refreshed sitemap.xml — all from the
// single source of truth: products-data.js.
//
// Run:  node scripts/generate-product-pages.js
// ============================================================
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const SITE_URL = 'https://lillylooks.co.uk'; // site canonicalises to non-www (see sitemap/product.html)
const LASTMOD = '2026-11-24';

// Products confirmed out of stock (TikTok Seller Centre, 21 Nov 2026).
const OUT_OF_STOCK = new Set([
  'korean-bio-collagen-face-mask',
  'mini-finger-puff-for-foundation'
]);

// ---- Load the catalogue from products-data.js ----
const dataCode = fs.readFileSync(path.join(ROOT, 'products-data.js'), 'utf8');
const { PRODUCTS, productSlug, TIKTOK_SHOP_URL } =
  vm.runInNewContext(dataCode + ';({PRODUCTS, productSlug, TIKTOK_SHOP_URL})', {});

// ---- Helpers ----
const esc = s => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');
const xmlEsc = esc;
const absImg = img => `${SITE_URL}/${encodeURI(img)}`;
const priceNum = p => (p.price ? p.price.replace('£', '').trim() : '');
const badgeLabel = key => ({ bestseller: 'Bestseller', trending: '🔥 Trending', new: 'New In' }[key] || key);

// Meta description: longest whole-word prefix of the description that
// lands in the 150–160 character window.
function metaDescription(desc) {
  const words = desc.split(/\s+/);
  let out = '';
  for (const w of words) {
    const next = out ? out + ' ' + w : w;
    if (next.length > 160) break;
    out = next;
  }
  return out;
}

const log = [];
const feedExclusions = [];

// ============================================================
// 1) Static product pages
// ============================================================
function productCardHTML(p, prefix) {
  const slug = productSlug(p.name);
  return `
    <div class="product-card" data-category="${p.category}" data-url="${slug}.html">
      ${p.badge ? `<span class="product-badge ${p.badge}">${badgeLabel(p.badge)}</span>` : ''}
      <div class="product-img">
        <img src="${prefix}${esc(p.img)}" alt="${esc(p.name)}" class="real-product-img" loading="lazy" decoding="async">
      </div>
      <div class="product-info">
        <h3>${esc(p.name)}</h3>
        <p class="product-desc">${esc(p.desc)}</p>
        ${p.price ? `<span class="product-price">${esc(p.price)}</span>` : ''}
        <span class="tiktok-badge"><i class="fab fa-tiktok"></i> Buy on TikTok</span>
      </div>
    </div>`;
}

function extraHTML(product) {
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
        <p>${esc(step)}</p>
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
        <h4>${esc(item.q)}</h4>
        <p>${esc(item.a)}</p>
      </div>`).join('')}
    </div>`;
  }
  return html;
}

function productPage(p) {
  const slug = productSlug(p.name);
  const pageUrl = `${SITE_URL}/product/${slug}.html`;
  const imgUrl = absImg(p.img);
  const inStock = !OUT_OF_STOCK.has(slug);
  const meta = metaDescription(p.desc);
  const title = `${p.name} | Lilly Looks UK`;

  const offer = {
    '@type': 'Offer',
    url: pageUrl,
    priceCurrency: 'GBP',
    availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    itemCondition: 'https://schema.org/NewCondition'
  };
  if (priceNum(p)) offer.price = priceNum(p);

  const graph = [{
    '@type': 'Product',
    name: p.name,
    image: imgUrl,
    description: p.desc,
    url: pageUrl,
    brand: { '@type': 'Brand', name: 'Lilly Looks' },
    offers: offer
  }];
  if (p.faq && p.faq.length) {
    graph.push({
      '@type': 'FAQPage',
      mainEntity: p.faq.map(item => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a }
      }))
    });
  }
  const jsonLd = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }, null, 2)
    .replace(/<\//g, '<\\/');

  // "More products": same category first, then the rest (mirrors script.js)
  const others = PRODUCTS.filter(x => x !== p);
  const more = [...others.filter(x => x.category === p.category),
                ...others.filter(x => x.category !== p.category)].slice(0, 4);

  return `<!DOCTYPE html>
<html lang="en-GB">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(meta)}">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="${pageUrl}">
    <meta name="theme-color" content="#E8487A">
    <link rel="icon" href="../favicon.ico" sizes="any">
    <link rel="icon" type="image/png" sizes="64x64" href="../favicon.png">
    <link rel="apple-touch-icon" href="../apple-touch-icon.png">

    <!-- Open Graph -->
    <meta property="og:type" content="product">
    <meta property="og:site_name" content="LillyLooks">
    <meta property="og:title" content="${esc(title)}">
    <meta property="og:description" content="${esc(meta)}">
    <meta property="og:url" content="${pageUrl}">
    <meta property="og:image" content="${imgUrl}">
    <meta property="og:locale" content="en_GB">

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${esc(title)}">
    <meta name="twitter:description" content="${esc(meta)}">
    <meta name="twitter:image" content="${imgUrl}">

    <script type="application/ld+json">
${jsonLd}
    </script>

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,400;1,9..144,500&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500;1,600&family=Jost:wght@300;400;500;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="../style.css">
</head>
<body>

    <!-- Pre-loader -->
    <div id="preloader" aria-hidden="true">
        <span class="preloader-mark">LL</span>
    </div>

    <!-- Announcement bar -->
    <div class="announce-bar">
        <div class="announce-track">
            <span>✦ Free UK shipping on select orders</span>
            <span>✦ New viral drops added weekly</span>
            <span>✦ 50,000+ happy faces across the UK</span>
            <span>✦ Shop securely via TikTok Shop</span>
            <span>✦ Free UK shipping on select orders</span>
            <span>✦ New viral drops added weekly</span>
            <span>✦ 50,000+ happy faces across the UK</span>
            <span>✦ Shop securely via TikTok Shop</span>
        </div>
    </div>

    <!-- Navigation -->
    <nav class="navbar" id="navbar">
        <div class="container nav-container">
            <a href="../index.html" class="logo-link">
                <img src="../images/logo-final.png" alt="LillyLooks" class="logo-img">
            </a>

            <ul class="nav-links" id="navLinks">
                <li><a href="../index.html#home">Home</a></li>
                <li><a href="../index.html#products">Shop the Edit</a></li>
                <li><a href="../index.html#trust">Why Us</a></li>
                <li><a href="../index.html#about">Our Story</a></li>
                <li><a href="../index.html#contact">Contact</a></li>
            </ul>

            <a href="${TIKTOK_SHOP_URL}" class="tiktok-btn-nav" target="_blank" rel="noopener">
                <i class="fab fa-tiktok"></i> Shop on TikTok
            </a>

            <button class="menu-btn" id="menuBtn" aria-label="Open menu" aria-expanded="false">
                <span></span><span></span><span></span>
            </button>
        </div>
    </nav>

    <!-- Product detail (server-rendered) -->
    <section class="product-detail">
        <div class="container">
            <a href="../index.html#products" class="back-link"><i class="fas fa-arrow-left"></i> Back to the Edit</a>
            <div class="detail-grid">
                <div class="detail-img">
                    ${p.badge ? `<span class="product-badge ${p.badge}">${badgeLabel(p.badge)}</span>` : ''}
                    <img src="../${esc(p.img)}" alt="${esc(p.name)}" class="real-product-img" decoding="async">
                </div>
                <div class="detail-info">
                    <p class="section-eyebrow">The Edit</p>
                    <h1>${esc(p.name)}</h1>
                    <p class="detail-desc">${esc(p.desc)}</p>
                    ${p.price ? `<span class="detail-price">${esc(p.price)}</span>` : ''}
                    <a href="${TIKTOK_SHOP_URL}" class="btn-primary btn-large" target="_blank" rel="noopener">
                        <i class="fab fa-tiktok"></i> Buy on TikTok Shop
                    </a>
                    <p class="detail-note"><i class="fas fa-shield-heart"></i> This site is a showcase &mdash; checkout happens securely on TikTok Shop.</p>
                    ${inStock ? '' : '<p class="detail-note"><i class="fas fa-circle-info"></i> Currently out of stock on TikTok Shop &mdash; please check back soon.</p>'}
                </div>
            </div>
            ${extraHTML(p)}
        </div>
    </section>

    <!-- More products -->
    <section class="more-products">
        <div class="container">
            <div class="section-header">
                <p class="section-eyebrow">Keep Exploring</p>
                <h2 class="section-title">More Products You'll Love</h2>
            </div>
            <div class="product-grid">${more.map(m => productCardHTML(m, '../')).join('')}
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer>
        <div class="container footer-content">
            <div class="footer-brand">
                <img src="../images/logo-white.png" alt="LillyLooks" class="footer-logo-img">
                <p>Bringing TikTok's hottest beauty trends to the UK.</p>
                <p class="footer-email"><i class="fas fa-envelope"></i> infolillylooks@gmail.com</p>
            </div>
            <div class="footer-links">
                <a href="../index.html#home">Home</a>
                <a href="../index.html#products">Shop</a>
                <a href="../index.html#about">Our Story</a>
                <a href="../index.html#contact">Contact</a>
                <a href="${TIKTOK_SHOP_URL}" target="_blank" rel="noopener">TikTok Shop</a>
            </div>
            <div class="footer-links">
                <a href="../category.html?c=skin">Skin &amp; Body</a>
                <a href="../category.html?c=face">Face &amp; Gems</a>
                <a href="../category.html?c=lips">Lips</a>
                <a href="../category.html?c=tools">Tools &amp; Brushes</a>
                <a href="../guides.html">Guides</a>
            </div>
        </div>
        <div class="footer-bottom container">
            <p>&copy; 2026 LillyLooks. All rights reserved. Prices displayed start from £2; final transaction price may vary on TikTok Shop.</p>
            <p>This website is a showcase. All purchases are completed securely through <a href="${TIKTOK_SHOP_URL}" target="_blank" rel="noopener">TikTok Shop</a>.</p>
        </div>
    </footer>

    <script src="../products-data.js"></script>
    <script src="../script.js"></script>
</body>
</html>
`;
}

const productDir = path.join(ROOT, 'product');
fs.mkdirSync(productDir, { recursive: true });
for (const p of PRODUCTS) {
  const slug = productSlug(p.name);
  fs.writeFileSync(path.join(productDir, `${slug}.html`), productPage(p));
  const meta = metaDescription(p.desc);
  log.push(`page product/${slug}.html | meta ${meta.length} chars | price ${p.price || '(none)'} | stock ${OUT_OF_STOCK.has(slug) ? 'OUT' : 'IN'}`);
}

// ============================================================
// 2) Google Merchant Center feed (in-stock products with a price)
// ============================================================
const feedItems = [];
for (const p of PRODUCTS) {
  const slug = productSlug(p.name);
  if (OUT_OF_STOCK.has(slug)) { feedExclusions.push(`${p.name} — out of stock`); continue; }
  if (!priceNum(p)) { feedExclusions.push(`${p.name} — no single verified price in products-data.js (g:price is mandatory, none invented)`); continue; }
  feedItems.push(`  <item>
    <g:id>${xmlEsc(slug)}</g:id>
    <g:title>${xmlEsc(p.name)}</g:title>
    <g:description>${xmlEsc(p.desc)}</g:description>
    <g:link>${xmlEsc(`${SITE_URL}/product/${slug}.html`)}</g:link>
    <g:image_link>${xmlEsc(absImg(p.img))}</g:image_link>
    <g:price>${priceNum(p)} GBP</g:price>
    <g:availability>in_stock</g:availability>
    <g:condition>new</g:condition>
    <g:brand>Lilly Looks</g:brand>
  </item>`);
}
const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Lilly Looks UK</title>
    <link>${SITE_URL}/</link>
    <description>TikTok-viral skincare, makeup and beauty essentials for UK shoppers — showcase site, all orders via TikTok Shop.</description>
${feedItems.join('\n')}
  </channel>
</rss>
`;
fs.writeFileSync(path.join(ROOT, 'merchant-feed.xml'), feed);
log.push(`feed merchant-feed.xml | ${feedItems.length} items`);
feedExclusions.forEach(e => log.push(`feed EXCLUDED: ${e}`));

// ============================================================
// 3) Sitemap (same structure as before, static product URLs)
// ============================================================
const imgEntry = p => `
    <image:image>
      <image:loc>${xmlEsc(absImg(p.img))}</image:loc>
      <image:title>${xmlEsc(p.name)}</image:title>
    </image:image>`;
const urlEntry = (loc, lastmod, freq, priority, img) => `  <url>
    <loc>${xmlEsc(loc)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${freq}</changefreq>
    <priority>${priority}</priority>${img || ''}
  </url>`;

const guideImages = {
  'guide-korean-bio-collagen-face-mask.html': 'Korean Bio-Collagen Face Mask',
  'guide-satin-bonnet-for-sleeping.html': 'Luxury Satin Bonnet for Sleeping',
  'guide-peel-off-lip-stain.html': 'Romantic Bear Peel-Off Lip Tattoo'
};
const byName = n => PRODUCTS.find(p => p.name === n);

const sitemapParts = [
  urlEntry(`${SITE_URL}/`, LASTMOD, 'weekly', '1.0'),
  ...PRODUCTS.map(p => urlEntry(`${SITE_URL}/product/${productSlug(p.name)}.html`, LASTMOD, 'monthly', '0.8', imgEntry(p))),
  ...['skin', 'face', 'lips', 'tools'].map(c => urlEntry(`${SITE_URL}/category.html?c=${c}`, '2026-11-20', 'monthly', '0.9')),
  urlEntry(`${SITE_URL}/guides.html`, '2026-11-20', 'monthly', '0.7'),
  ...Object.entries(guideImages).map(([file, productName]) =>
    urlEntry(`${SITE_URL}/${file}`, LASTMOD, 'monthly', '0.7', imgEntry(byName(productName))))
];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${sitemapParts.join('\n')}
</urlset>
`;
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), sitemap);
log.push(`sitemap sitemap.xml | ${sitemapParts.length} URLs`);

console.log(log.join('\n'));
