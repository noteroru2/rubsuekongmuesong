#!/usr/bin/env node
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

async function main() {
  const manifest = JSON.parse(
    await readFile(path.join(ROOT, 'src', 'data', 'routes-manifest.json'), 'utf8'),
  );

  let inventoryLines = 0;
  try {
    const csv = await readFile(path.join(ROOT, 'migration', 'url-inventory.csv'), 'utf8');
    inventoryLines = csv.trim().split('\n').length - 1;
  } catch {
    inventoryLines = manifest.totalPages;
  }

  let validation = { passed: 0, failed: 0, total: 0 };
  try {
    validation = JSON.parse(
      await readFile(path.join(ROOT, 'migration', 'seo-validation-report.json'), 'utf8'),
    );
  } catch {
    /* optional */
  }

  let redirects = [];
  try {
    redirects = JSON.parse(await readFile(path.join(ROOT, 'migration', 'redirects.json'), 'utf8'));
  } catch {
    /* optional */
  }

  const byType = manifest.routes.reduce((acc, r) => {
    acc[r.pageType] = (acc[r.pageType] || 0) + 1;
    return acc;
  }, {});

  const report = `# SEO Migration Report — รับซื้อกล้องมือสอง

Generated: ${new Date().toISOString()}

## Summary

| Metric | Value |
|--------|-------|
| Total URLs in manifest | ${manifest.totalPages} |
| URL inventory rows | ${inventoryLines} |
| Site URL | ${manifest.siteUrl} |
| Astro trailing slash | always |
| Redirect rules | ${redirects.length} |

## Page types

${Object.entries(byType)
  .map(([type, count]) => `- **${type}**: ${count}`)
  .join('\n')}

## SEO validation

| Metric | Value |
|--------|-------|
| URLs tested | ${validation.total || 'Not run yet'} |
| Passed | ${validation.passed || '-'} |
| Failed | ${validation.failed || '-'} |

Run validation before launch:
\`\`\`bash
npm run build && npm run preview
npm run validate:seo -- --new http://localhost:4321
\`\`\`

## Pre-launch checklist

- [ ] \`npm run crawl\` completed without errors
- [ ] \`npm run build\` succeeds
- [ ] \`npm run validate:seo\` passes (or failures reviewed)
- [ ] Spot-check top 20 ranking URLs manually
- [ ] robots.txt and sitemap.xml accessible
- [ ] 404 page returns proper status
- [ ] DNS cutover plan documented
- [ ] Google Search Console: submit new sitemap
- [ ] Monitor rankings for 2–4 weeks post-launch

## Redirect policy

Only URLs that cannot be preserved 1:1 receive redirects. Current redirect count: **${redirects.length}**.

## Risk notes

1. **Rankings first** — This migration preserves URLs, titles, meta, H1, canonical, and body HTML from WordPress.
2. **Thai / encoded URLs** — Paths are stored exactly as canonical URLs from Yoast.
3. **Images** — Still served from WordPress CDN paths (\`/wp-content/uploads/\`) until migrated to local assets.
4. **UI** — Minimal styling applied; visual parity comes in phase 2.

## Files

- \`migration/url-inventory.csv\` — Full URL mapping
- \`migration/seo-validation-report.json\` — Automated comparison
- \`migration/redirects.json\` — Redirect rules
- \`src/data/routes-manifest.json\` — Astro route index
- \`src/data/content/*.json\` — Per-page content + SEO
`;

  await mkdir(path.join(ROOT, 'migration'), { recursive: true });
  const outPath = path.join(ROOT, 'migration', 'MIGRATION-REPORT.md');
  await writeFile(outPath, report, 'utf8');
  console.log(`Migration report written: ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
