# SEO Migration Report — รับซื้อกล้องมือสอง

Generated: 2026-06-11T10:08:44.530Z

## Summary

| Metric | Value |
|--------|-------|
| Total URLs in manifest | 2089 |
| URL inventory rows | 2089 |
| Site URL | https://xn--12cman8e0bjt1czaccb9b1fg31ad.com |
| Astro trailing slash | always |
| Redirect rules | 0 |

## Page types

- **homepage**: 1
- **page**: 4
- **article**: 15
- **author**: 1
- **archive**: 1
- **category**: 10
- **tag**: 403
- **location**: 1556
- **post**: 98

## SEO validation

| Metric | Value |
|--------|-------|
| URLs tested | 30 |
| Passed | 30 |
| Failed | - |

Run validation before launch:
```bash
npm run build && npm run preview
npm run validate:seo -- --new http://localhost:4321
```

## Pre-launch checklist

- [ ] `npm run crawl` completed without errors
- [ ] `npm run build` succeeds
- [ ] `npm run validate:seo` passes (or failures reviewed)
- [ ] Spot-check top 20 ranking URLs manually
- [ ] robots.txt and sitemap.xml accessible
- [ ] 404 page returns proper status
- [ ] DNS cutover plan documented
- [ ] Google Search Console: submit new sitemap
- [ ] Monitor rankings for 2–4 weeks post-launch

## Redirect policy

Only URLs that cannot be preserved 1:1 receive redirects. Current redirect count: **0**.

## Risk notes

1. **Rankings first** — This migration preserves URLs, titles, meta, H1, canonical, and body HTML from WordPress.
2. **Thai / encoded URLs** — Paths are stored exactly as canonical URLs from Yoast.
3. **Images** — Still served from WordPress CDN paths (`/wp-content/uploads/`) until migrated to local assets.
4. **UI** — Minimal styling applied; visual parity comes in phase 2.

## Files

- `migration/url-inventory.csv` — Full URL mapping
- `migration/seo-validation-report.json` — Automated comparison
- `migration/redirects.json` — Redirect rules
- `src/data/routes-manifest.json` — Astro route index
- `src/data/content/*.json` — Per-page content + SEO
