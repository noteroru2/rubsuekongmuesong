# Internal Link Model Pages Report

Generated: 2026-06-17T11:41:59.922Z

## Summary

- Articles with model links: 13 / 15
- Brand hub pages with model links: 3 / 3
- Total internal links to /models/[slug]/: 41
- Unique model targets linked: 21 / 27

## Target model pages (incoming link count)

| Model slug | Links |
|------------|-------|
| sony-a7-iii | 6 |
| fujifilm-x-t4 | 5 |
| fujifilm-x-t5 | 3 |
| fujifilm-x100v | 3 |
| nikon-d850 | 3 |
| canon-r6 | 3 |
| fujifilm-x-s10 | 2 |
| canon-90d | 2 |
| sony-a7-iv | 2 |
| sony-a7r-iii | 1 |
| sony-a7c | 1 |
| canon-80d | 1 |
| nikon-d750 | 1 |
| canon-eos-r | 1 |
| nikon-z6 | 1 |
| sony-a6400 | 1 |
| fujifilm-x100vi | 1 |
| canon-eos-rp | 1 |
| sony-zv-e10 | 1 |
| nikon-z6-ii | 1 |
| canon-r5 | 1 |

## Key source pages

### HIGH priority articles
- /article/fujifilm-xt4-vs-xt5/ (4 links)
- /article/shutter-count/ (4 links)
- /article/sony-a7iii-vs-a7iv/ (3 links)
- /article/กล้อง-dslr-คืออะไร/ (4 links)
- /article/กล้อง-mirrorless/ (4 links)
- /article/ทำไมกล้อง-fuji-มือสองถึงน่า/ (4 links)
- /article/วิธีเช็คสภาพกล้องมือสอ/ (4 links)

### Brand hub pages
- /รับซื้อกล้อง/รับซื้อกล้อง-canon/ (2 links)
- /รับซื้อกล้อง/รับซื้อกล้อง-fuji/ (2 links)
- /รับซื้อกล้อง/รับซื้อกล้อง-sony/ (2 links)

### Other articles
- /article/กล้องคอมแพคคืออะไร/ (1 links)
- /article/กล้องถ่ายรูปมีกี่ชนิด/ (2 links)
- /article/กล้องบริดจ์/ (1 links)
- /article/กล้องแอคชั่น/ (1 links)
- /article/วิธีเช็คเลนส์กล้องมือส/ (2 links)
- /article/วิธีแพ็คกล้อง/ (1 links)

## Phase next

- `/article/กล้อง-360-องศา/` — low relevance to model money pages
- `/article/กล้องฟิล์มคืออะไร/` — low relevance to model money pages
- Nikon brand hub page — add when dedicated `/รับซื้อกล้อง/รับซื้อกล้อง-nikon/` exists
- Model pages without inbound article links yet: sony-a7r-iv, canon-m50, fujifilm-x-t3, fujifilm-x-s20, nikon-z7, nikon-z50

## QA result

| Check | Result |
|-------|--------|
| `npm run build` | PASS |
| `npm run images:audit` | PASS (0 broken local images) |
| `npm run qa:redirects` | PASS |
| `npm run qa:camera-model-pages` | PASS |
| `npm run qa:article-model-links` | PASS |
| No broken /models/ internal links | PASS |
| Max 5 model links per article body | PASS |
| No duplicate target per page | PASS |
| No banned words in model link anchors | PASS |
| Sitemap builds | PASS |

## Broken images (resolved before push)

During pre-push `images:audit`, 2 broken local image refs were found — **caused by Phase 4.2** `wrapFirstMention` matching inside `<img src="...">` attribute values:

| Broken path (404-local) | Page | Cause | Fix |
|-------------------------|------|-------|-----|
| `/images/uploads/2025/06/fuji-รับซื้อ Fujifilm...` | `/article/fujifilm-xt4-vs-xt5/` | Inline link wrapped text inside hero `src` | Restored `/images/uploads/2025/06/fuji-xt4-vs-xt5.webp` |
| `/images/uploads/2025/06/sony-ขาย Sony...` | `/article/sony-a7iii-vs-a7iv/` | Same bug on hero `src` | Restored `/images/uploads/2025/06/sony-a7iii-vs-sony-a7iv.webp` |

`wrapFirstMention` in `scripts/internal-link-model-pages.mjs` was updated to skip matches inside HTML tags/attributes.
