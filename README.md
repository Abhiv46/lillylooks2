# Lilly Looks — Website

The live website for **LillyLooks.co.uk** — a UK beauty shop showcasing TikTok-viral skincare, makeup and beauty essentials. Purchases are completed on TikTok Shop; this site is the showcase and discovery layer that sends customers there.

## Live site

- https://lillylooks.co.uk

## Structure

| File / folder | Purpose |
| --- | --- |
| `index.html` | Homepage |
| `category.html` | Product category pages (Skin, Face, Lips, Tools) |
| `product.html` + `products-data.js` | Product detail pages driven by the product catalogue data |
| `guides.html` + `guide-*.html` | Buying guides (Bio-Collagen face mask, peel-off lip stain, satin bonnet) |
| `script.js` | Site behaviour and product rendering |
| `style.css` | Premium ivory / espresso / champagne-gold design (Cormorant Garamond + Jost) |
| `images/` | Product photography — must match the real products sold on TikTok Shop |
| `sitemap.xml`, `robots.txt`, `llms.txt` | SEO and crawler files |
| `404.html` | Custom not-found page |

## Editing notes

- This repository auto-deploys: every push to `main` goes live, so treat every commit as a publish.
- Product images and descriptions must match the real TikTok Shop listings exactly — no misleading claims.
- Prices are shown on TikTok Shop, not maintained here.
