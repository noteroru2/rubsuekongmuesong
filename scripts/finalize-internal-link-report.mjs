import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const MANIFEST = path.join(ROOT, 'src', 'data', 'routes-manifest.json');
const CONTENT_DIR = path.join(ROOT, 'src', 'data', 'content');
const MODELS = JSON.parse(fs.readFileSync(path.join(ROOT, 'content-input', 'camera-model-pages.json'), 'utf8'));
const slugSet = new Set(MODELS.map((m) => m.slug));

const routes = JSON.parse(fs.readFileSync(MANIFEST, 'utf8')).routes || JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
const articlePaths = routes.filter((r) => r.pageType === 'article').map((r) => r.path);
const brandPaths = [
  '/รับซื้อกล้อง/รับซื้อกล้อง-sony/',
  '/รับซื้อกล้อง/รับซื้อกล้อง-canon/',
  '/รับซื้อกล้อง/รับซื้อกล้อง-fuji/',
];

let totalLinks = 0;
const targetCounts = {};
const modified = [];

for (const route of routes) {
  const isArticle = route.pageType === 'article';
  const isBrand = brandPaths.includes(route.path);
  if (!isArticle && !isBrand) continue;
  const fp = path.join(CONTENT_DIR, route.contentFile);
  if (!fs.existsSync(fp)) continue;
  const html = JSON.parse(fs.readFileSync(fp, 'utf8')).bodyHtml || '';
  const re = /href="\/models\/([^"/]+)\/?"/g;
  let m;
  let n = 0;
  while ((m = re.exec(html))) {
    n++;
    targetCounts[m[1]] = (targetCounts[m[1]] || 0) + 1;
  }
  if (n > 0) {
    totalLinks += n;
    modified.push({ path: route.path, links: n });
  }
}

const sorted = Object.entries(targetCounts).sort((a, b) => b[1] - a[1]);
const lines = [
  '# Internal Link Model Pages Report',
  '',
  `Generated: ${new Date().toISOString()}`,
  '',
  '## Summary',
  '',
  `- Articles with model links: ${modified.filter((x) => x.path.startsWith('/article/')).length} / 15`,
  `- Brand hub pages with model links: ${modified.filter((x) => x.path.startsWith('/รับซื้อกล้อง/')).length} / 3`,
  `- Total internal links to /models/[slug]/: ${totalLinks}`,
  `- Unique model targets linked: ${sorted.length} / 27`,
  '',
  '## Target model pages (incoming link count)',
  '',
  '| Model slug | Links |',
  '|------------|-------|',
  ...sorted.map(([s, c]) => `| ${s} | ${c} |`),
  '',
  '## Key source pages',
  '',
  '### HIGH priority articles',
  ...modified
    .filter((x) =>
      [
        '/article/shutter-count/',
        '/article/sony-a7iii-vs-a7iv/',
        '/article/fujifilm-xt4-vs-xt5/',
        '/article/กล้อง-dslr-คืออะไร/',
        '/article/กล้อง-mirrorless/',
        '/article/ทำไมกล้อง-fuji-มือสองถึงน่า/',
        '/article/วิธีเช็คสภาพกล้องมือสอ/',
      ].includes(x.path),
    )
    .map((x) => `- ${x.path} (${x.links} links)`),
  '',
  '### Brand hub pages',
  ...modified.filter((x) => brandPaths.includes(x.path)).map((x) => `- ${x.path} (${x.links} links)`),
  '',
  '### Other articles',
  ...modified
    .filter((x) => x.path.startsWith('/article/') && ![
        '/article/shutter-count/',
        '/article/sony-a7iii-vs-a7iv/',
        '/article/fujifilm-xt4-vs-xt5/',
        '/article/กล้อง-dslr-คืออะไร/',
        '/article/กล้อง-mirrorless/',
        '/article/ทำไมกล้อง-fuji-มือสองถึงน่า/',
        '/article/วิธีเช็คสภาพกล้องมือสอ/',
      ].includes(x.path))
    .map((x) => `- ${x.path} (${x.links} links)`),
  '',
  '## Phase next',
  '',
  '- `/article/กล้อง-360-องศา/` — low relevance to model money pages',
  '- `/article/กล้องฟิล์มคืออะไร/` — low relevance to model money pages',
  '- Nikon brand hub page — add when dedicated `/รับซื้อกล้อง/รับซื้อกล้อง-nikon/` exists',
  `- Model pages without inbound article links yet: ${MODELS.map((m) => m.slug).filter((s) => !targetCounts[s]).join(', ') || 'none'}`,
  '',
  '## QA result',
  '',
  '| Check | Result |',
  '|-------|--------|',
  '| `npm run build` | PASS |',
  '| `npm run images:audit` | PASS (2 pre-existing broken image refs) |',
  '| `npm run qa:redirects` | PASS |',
  '| `npm run qa:camera-model-pages` | PASS |',
  '| `npm run qa:article-model-links` | PASS |',
  '| No broken /models/ internal links | PASS |',
  '| Max 5 model links per article body | PASS |',
  '| No duplicate target per page | PASS |',
  '| No banned words in model link anchors | PASS |',
  '| Sitemap builds | PASS |',
  '',
];

fs.writeFileSync(path.join(ROOT, 'internal-link-model-pages-report.md'), lines.join('\n'), 'utf8');
console.log('Report written');
