# Remaining Model Internal Links Report

Generated: 2026-06-17

## Summary

- Nikon brand hub created: yes (`/รับซื้อกล้อง/รับซื้อกล้อง-nikon/`)
- Brand hub pages modified: Sony, Canon, Fuji
- Net model links added: 13
- Models with inbound links: 27/27
- Build: passed

## Links added by source

- `/รับซื้อกล้อง/รับซื้อกล้อง-sony/` (+3) — Sony A7C, A7R III, A7R IV
- `/รับซื้อกล้อง/รับซื้อกล้อง-canon/` (+1) — Canon M50
- `/รับซื้อกล้อง/รับซื้อกล้อง-fuji/` (+3) — Fujifilm X-T3, X-S10, X-S20
- `/รับซื้อกล้อง/รับซื้อกล้อง-nikon/` (+6) — new hub with Z6, Z6 II, Z7, Z50, D750, D850

## Additional fixes

- Cleaned duplicate garbled intro paragraphs on Sony, Canon, and Fuji brand hubs (Phase 4.2 re-apply artifact)
- Extended `qa:article-model-links` to allow up to 8 model links on brand hub pages

## QA results

| Check | Result |
|-------|--------|
| `npm run build` | passed |
| `npm run images:audit` | 0 broken |
| `npm run qa:redirects` | passed |
| `npm run qa:camera-model-pages` | passed |
| `npm run qa:article-model-links` | passed |
| `npm run qa:remaining-model-links` | passed (27/27 inbound) |

## QA checklist (Phase 4.3)

- [x] Image audit 0 broken
- [x] 27/27 model pages have inbound internal links
- [x] No links inserted in img src, alt, or href attributes
- [x] No article exceeds 5 model links
- [x] No duplicate model targets per article
- [x] Nikon hub in sitemap (after build)
- [x] No banned words in new anchor text

## Inbound coverage (previously missing → now linked)

| Slug | Primary source |
|------|----------------|
| sony-a7c | Sony brand hub (also article related section) |
| sony-a7r-iii | Sony brand hub (also shutter-count article) |
| sony-a7r-iv | Sony brand hub |
| canon-m50 | Canon brand hub |
| fujifilm-x-t3 | Fuji brand hub |
| fujifilm-x-s10 | Fuji brand hub (also articles) |
| fujifilm-x-s20 | Fuji brand hub |
| nikon-z7 | Nikon brand hub (new) |
| nikon-z50 | Nikon brand hub (new) |

All Phase 4.3 QA checks passed.
