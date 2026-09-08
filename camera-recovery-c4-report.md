# Camera Recovery — C4 Production Verification + Observation Gate

## Verdict at creation

`WAIT_FOR_DEPLOY_OR_RECRAWL`

C4 does not change ranking content, index ownership, redirects, or schema behavior from C1–C3. It adds a production fingerprint, a live verification script, and a frozen GSC observation baseline.

## Frozen GSC baseline

Latest finalized date: **2026-09-06**

| Window | Clicks | Impressions | CTR | Avg position |
|---|---:|---:|---:|---:|
| Pre-collapse reference — 2026-08-17 to 2026-08-30 | 216 | 3,007 | 7.18% | 7.30 |
| Recovery baseline — 2026-08-31 to 2026-09-06 | 39 | 353 | 11.05% | 12.88 |

The visibility loss is primarily impressions/ranking, not CTR.

## Production gate

Run:

```bash
npm run verify:c4-production
```

The gate requires:

- `/camera-recovery-gate.json` matching the C3 source SHA.
- `robots.txt` does not block the site.
- Protected province winner renders indexable with exactly one H1 and `Service` schema.
- Shutter Count renders indexable with exactly one H1 and `Article` schema.
- Sony A7 IV model page renders indexable with exactly one H1 and `Service` schema.
- No tested page emits `FAQPage` after C3.
- Intent-aware breadcrumb text is present.
- Curated Nakhon Sawan legacy URL returns a permanent redirect to its exact owner.
- Saraburi legacy tag remains `200 + noindex` and does not redirect to the homepage.
- Sitemap contains winner/article/model surfaces and excludes `/tag/`, `/uncategorized/`, legacy `/กล้อง/`, and redirect sources.

## Verdict rules

- `WAIT_FOR_DEPLOY_OR_RECRAWL`: fingerprint is missing/stale or deployment cannot yet be identified as C1–C3.
- `NO_GO`: fingerprint matches, but a technical/indexing/schema/redirect/sitemap invariant is broken.
- `PASS`: fingerprint matches and all production invariants pass.

## Observation clock

The observation clock is **INACTIVE** until the production gate returns `PASS`.

After PASS:

1. Freeze major SEO architecture/content changes for the first **7 new finalized GSC days** unless a technical NO_GO issue appears.
2. First recovery decision at 7 new finalized days.
3. Primary recovery window at 14 finalized days.
4. Compare clicks, impressions, CTR, average position, protected province winners, editorial winners, and model surface against the frozen baseline.

Do not interpret GSC movement before production PASS as evidence for or against C1–C3.
