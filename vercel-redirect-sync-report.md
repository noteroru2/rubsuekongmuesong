# Vercel Redirect Sync Report

Generated: 2026-06-17T06:39:56.179Z

## Summary

| Source | Rules |
|--------|------:|
| `public/_redirects` | 58 |
| `redirect-map.csv` (301 + high, not in _redirects) | 0 |
| Encoded Thai variants added | 57 |
| **`vercel.json` total** | **115** |

## Vercel limits

- Hobby/Pro: **1,024** redirects per project — current usage **115** (11%)
- No wildcard grouping needed at this scale

## Sync coverage

| Check | Status |
|-------|--------|
| All `_redirects` in vercel.json | ✓ PASS |
| Sitemap redirect | ✓ PASS |
| TAG archives | 18 rules |
| /กล้อง/ paths | 94 rules |
| Headers preserved | ✓ (unchanged) |
| trailingSlash config | ✓ (`true`) |

## Categories (_redirects)

| Category | Count |
|----------|------:|
| Sitemap | 1 |
| TAG | 9 |
| /กล้อง/ | 47 |
| /รับซื้อกล้อง/ canonical | 1 |

## Not synced (by design)

- **262** redirect-map.csv 301 rules with medium/low priority — not in `_redirects`
- Add in Phase 4 if GSC shows 404s on those old URLs

## Hash destinations

Rules with fragment (e.g. `/models/#sony`):

- `/%E0%B8%81%E0%B8%A5%E0%B9%89%E0%B8%AD%E0%B8%87/%E0%B8%A3%E0%B8%B1%E0%B8%9A%E0%B8%8B%E0%B8%B7%E0%B9%89%E0%B8%AD-olympus-om-d-%E0%B8%A1%E0%B8%B7%E0%B8%AD%E0%B8%AA%E0%B8%AD%E0%B8%87/` → `/models/#olympus`
- `/%E0%B8%81%E0%B8%A5%E0%B9%89%E0%B8%AD%E0%B8%87/%E0%B8%A3%E0%B8%B1%E0%B8%9A%E0%B8%8B%E0%B8%B7%E0%B9%89%E0%B8%AD-sony-zv-e10-%E0%B8%A1%E0%B8%B7%E0%B8%AD%E0%B8%AA%E0%B8%AD%E0%B8%87/` → `/models/#sony`
- `/กล้อง/รับซื้อ-olympus-om-d-มือสอง/` → `/models/#olympus`
- `/กล้อง/รับซื้อ-sony-zv-e10-มือสอง/` → `/models/#sony`

## QA

```bash
npm run redirects:sync
npm run build
npm run qa:redirects
```
