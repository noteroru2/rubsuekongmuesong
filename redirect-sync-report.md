# Redirect Sync Report

Generated: 2026-06-17T06:40:25.668Z

## Summary

| Source | Rule count |
|--------|------------|
| `public/_redirects` | **58** |
| `redirect-map.csv` (301 actions) | **314** |
| `vercel.json` redirects | **115** |

## Platform notes

- **Astro** uses `trailingSlash: 'always'` — canonical URLs end with `/`.
- **Vercel** reads `vercel.json` redirects natively. The Netlify-style `public/_redirects` is copied to `dist/` but **Vercel does not apply Netlify _redirects format** unless using a compatible adapter.
- **Before DNS cutover:** sync high-priority rules from `_redirects` into `vercel.json` OR confirm hosting reads `_redirects` (Cloudflare Pages / Netlify yes; Vercel needs `vercel.json`).

## Critical WordPress → Astro redirects in _redirects

| Category | Count |
|----------|-------|
| TAG 301 | 9 |
| /กล้อง/ 301 | 47 |
| /รับซื้อกล้อง/ canonical | 1 |
| Infrastructure (sitemap) | 1 |
| **Total critical** | **58** |

## Gap analysis

### In redirect-map.csv (301) but NOT in _redirects

**262** rules planned in CSV but missing from deployed `_redirects`.

- `/กล้อง/รับซื้อกล้องมือสอง-หนอ-3/` → `/รับซื้อกล้อง/ร้านรับซื้อกล้องหนองคา/`
- `/กล้อง/รับซื้อกล้องด่วน-อุบลรา/` → `/รับซื้อกล้อง/ร้านรับซื้อกล้องอุบลรา/`
- `/กล้อง/รับซื้อกล้องมือสอง-ใกล-11/` → `/`
- `/กล้อง/รับซื้อกล้องถ่ายรูปมือ-5/` → `/`
- `/กล้อง/รับซื้อกล้อง-panasonic-มือสอง-ชั/` → `/models/#panasonic`
- `/กล้อง/รับซื้อกล้องใช้งานปกต-18/` → `/`
- `/กล้อง/ร้านรับซื้อกล้อง-อุบลรา/` → `/รับซื้อกล้อง/ร้านรับซื้อกล้องอุบลรา/`
- `/กล้อง/รับซื้อกล้อง-canon-มือสอง-ยโส/` → `/`
- `/กล้อง/รับซื้อกล้องมือสอง-นัด-18/` → `/`
- `/กล้อง/รับซื้อเลนส์กล้องมือสอ-7/` → `/models/`
- `/กล้อง/รับซื้อกล้องมือสอง-ใกล-7/` → `/`
- `/กล้อง/รับซื้อโดรน-dji-มือสอง-ทุกร/` → `/models/#dji`
- `/กล้อง/รับซื้อเลนส์กล้องมือส-10/` → `/models/`
- `/กล้อง/รับซื้อกล้องมือสอง-ใกล้/` → `/`
- `/กล้อง/รับซื้อกล้องมือสอง-ปราส/` → `/รับซื้อกล้อง/ร้านรับซื้อกล้องสุรินท/`
- `/กล้อง/รับซื้อกล้องมือสอง-ยโสธ/` → `/`
- `/กล้อง/ร้านรับซื้อกล้องมือสอง-3/` → `/`
- `/กล้อง/รับซื้อกล้องมือสอง-ตีร-11/` → `/`
- `/กล้อง/รับซื้อกล้อง-mirrorless-มือสอง-สุ/` → `/รับซื้อกล้อง/ร้านรับซื้อกล้องสุรินท/`
- `/article/ทำไมกล้อง-fuji-มือสองถึงน่า/` → `/models/#fujifilm`
- … and 242 more

### In _redirects but NOT in redirect-map.csv

**6** rules (may be manually added or newer than CSV).

- `/sitemap_index.xml` → `/sitemap-index.xml`
- `/tag/ร้านรับซื้อกล้อง-สกลนคร/` → `/รับซื้อกล้อง/ร้านรับซื้อกล้องสกลนคร/`
- `/tag/รับซื้อกล้องมือสอง-สกลน/` → `/รับซื้อกล้อง/ร้านรับซื้อกล้องสกลนคร/`
- `/tag/รับซื้อกล้องสกลนคร/` → `/รับซื้อกล้อง/ร้านรับซื้อกล้องสกลนคร/`
- `/กล้อง/ร้านรับซื้อกล้อง-สกลนคร/` → `/รับซื้อกล้อง/ร้านรับซื้อกล้องสกลนคร/`
- `/รับซื้อกล้อง/รับซื้อกล้องมือสอง-สกลน/` → `/รับซื้อกล้อง/ร้านรับซื้อกล้องสกลนคร/`

### In _redirects but NOT in vercel.json

**0** rules — **must sync before Vercel cutover**.




## Trailing slash

✓ All _redirects sources use trailing slash (except sitemap).

## Encoded Thai URLs

WordPress may serve percent-encoded paths (e.g. `%e0%b8%a3%e0%b8%b1%e0%b8%9a...`). Astro content uses Unicode paths in `src/data/content/*.json`. GSC may still index encoded URLs — add encoded variants to redirects if 404s appear post-cutover.

## Verdict

| Check | Status |
|-------|--------|
| _redirects has TAG + /กล้อง/ rules | ✓ PASS |
| Sitemap redirect | ✓ PASS |
| vercel.json covers _redirects | ✓ PASS |
| redirect-map.csv fully deployed | ⚠ PARTIAL (262 missing) |

## Recommended next step

1. Run `npm run redirects:sync` to merge `_redirects` → `vercel.json`.
2. Run `npm run qa:redirects` after build.
3. Test top 20 GSC URLs on Vercel preview before DNS cutover.
4. See `dns-cutover-checklist.md` and `vercel-redirect-sync-report.md`.
