/**
 * Full-site image audit: content JSON, Astro pages, dist HTML, file inventory.
 * Run: node scripts/audit-images.mjs
 * Optional: npm run build first for dist crawl.
 */
import fs from 'node:fs';
import path from 'node:path';
import { load } from 'cheerio';
import sharp from 'sharp';

const ROOT = path.resolve('.');
const DIST = path.join(ROOT, 'dist');
const CONTENT = path.join(ROOT, 'src/data/content');
const MANIFEST = path.join(ROOT, 'src/data/routes-manifest.json');
const OUT_DIR = ROOT;

const PRIORITY_PATHS = [
  '/',
  '/models/',
  '/process/',
  '/review/',
  '/blog/',
  '/about/',
];

function walkHtml(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walkHtml(p, acc);
    else if (ent.name === 'index.html') acc.push(p);
  }
  return acc;
}

function pathFromDist(file) {
  const rel = path.relative(DIST, file).replace(/\\/g, '/');
  if (rel === 'index.html') return '/';
  return '/' + rel.replace(/\/index\.html$/, '/');
}

function extractImagesFromHtml(html, pagePath) {
  const $ = load(html);
  const rows = [];
  $('img').each((_, el) => {
    const $el = $(el);
    rows.push({
      page: pagePath,
      src: $el.attr('src') || '',
      alt: ($el.attr('alt') || '').trim(),
      title: ($el.attr('title') || '').trim(),
      width: $el.attr('width') || '',
      height: $el.attr('height') || '',
      loading: $el.attr('loading') || '',
      fetchpriority: $el.attr('fetchpriority') || '',
    });
  });
  return rows;
}

function extractImagesFromBody(bodyHtml, pagePath) {
  if (!bodyHtml) return [];
  return extractImagesFromHtml(bodyHtml, pagePath);
}

async function fileMeta(src) {
  if (!src || src.startsWith('http') || src.startsWith('data:')) {
    return { exists: null, bytes: 0, format: '', w: 0, h: 0, http: src.startsWith('http') ? 'external' : 'n/a' };
  }
  const local = path.join(ROOT, 'public', src.replace(/^\//, ''));
  if (!fs.existsSync(local)) {
    return { exists: false, bytes: 0, format: '', w: 0, h: 0, http: '404-local' };
  }
  const st = fs.statSync(local);
  try {
    const m = await sharp(local).metadata();
    return {
      exists: true,
      bytes: st.size,
      format: m.format || path.extname(local).slice(1),
      w: m.width || 0,
      h: m.height || 0,
      http: '200-local',
    };
  } catch {
    return { exists: true, bytes: st.size, format: 'unknown', w: 0, h: 0, http: '200-local' };
  }
}

// --- Collect from content JSON ---
const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
const contentRows = [];
const ogByPath = new Map();

for (const route of manifest.routes) {
  const file = path.join(CONTENT, route.contentFile);
  if (!fs.existsSync(file)) continue;
  const doc = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (doc.seo?.ogImage) ogByPath.set(route.path, doc.seo.ogImage);
  for (const img of extractImagesFromBody(doc.bodyHtml, route.path)) {
    contentRows.push({ ...img, source: 'content-json' });
  }
}

// --- Collect from dist ---
const distRows = [];
if (fs.existsSync(DIST)) {
  for (const file of walkHtml(DIST)) {
    const pagePath = pathFromDist(file);
    const html = fs.readFileSync(file, 'utf8');
    for (const img of extractImagesFromHtml(html, pagePath)) {
      distRows.push({ ...img, source: 'dist-html' });
    }
  }
}

// --- Collect from Astro source pages ---
const astroRows = [];
for (const file of walkHtml(path.join(ROOT, 'src/pages'))) {
  if (!file.endsWith('.astro')) continue;
  const src = fs.readFileSync(file, 'utf8');
  const re = /<img[^>]+>/gi;
  let m;
  while ((m = re.exec(src))) {
    const tag = m[0];
    const get = (a) => {
      const r = new RegExp(`${a}=["'{]([^"'}]+)["'}]`, 'i').exec(tag);
      return r ? r[1] : '';
    };
    astroRows.push({
      page: file.replace(ROOT, '').replace(/\\/g, '/'),
      src: get('src') || get(':src') || '',
      alt: get('alt'),
      width: get('width'),
      height: get('height'),
      loading: get('loading'),
      source: 'astro-source',
    });
  }
}

// --- Merge unique by page+src ---
const all = [...contentRows, ...distRows, ...astroRows];
const seen = new Set();
const enriched = [];

for (const row of all) {
  const key = `${row.page}|${row.src}`;
  if (seen.has(key) || !row.src) continue;
  seen.add(key);
  const meta = await fileMeta(row.src);
  enriched.push({
    ...row,
    ...meta,
    kb: Math.round(meta.bytes / 1024),
    missingAlt: !row.alt,
    missingDimensions: !row.width || !row.height,
  });
}

const broken = enriched.filter((r) => r.exists === false);
const missingAlt = enriched.filter((r) => r.missingAlt);
const missingDim = enriched.filter((r) => r.missingDimensions);
const external = enriched.filter((r) => r.http === 'external');
const duplicates = new Map();
for (const r of enriched) {
  if (!r.src.startsWith('/')) continue;
  duplicates.set(r.src, (duplicates.get(r.src) || 0) + 1);
}
const dupList = [...duplicates.entries()]
  .filter(([, c]) => c > 5)
  .sort((a, b) => b[1] - a[1]);

// ogImage duplicates across articles
const ogDup = new Map();
for (const [p, img] of ogByPath) {
  if (!img) continue;
  if (!ogDup.has(img)) ogDup.set(img, []);
  ogDup.get(img).push(p);
}
const ogDupList = [...ogDup.entries()].filter(([, paths]) => paths.length > 1);

// Blog articles
const articles = manifest.routes.filter((r) => r.pageType === 'article');
const articleOgIssues = articles.map((r) => ({
  path: r.path,
  ogImage: ogByPath.get(r.path) || '(none)',
}));

// CSV
const csvHeader = 'page,src,alt,width,height,loading,kb,format,dimensions,exists,source,missing_alt,missing_dimensions\n';
const csvBody = enriched
  .map((r) =>
    [
      r.page,
      r.src,
      `"${(r.alt || '').replace(/"/g, '""')}"`,
      r.width,
      r.height,
      r.loading,
      r.kb,
      r.format,
      r.w && r.h ? `${r.w}x${r.h}` : '',
      r.exists,
      r.source,
      r.missingAlt,
      r.missingDimensions,
    ].join(','),
  )
  .join('\n');
fs.writeFileSync(path.join(OUT_DIR, 'image-alt-map.csv'), csvHeader + csvBody, 'utf8');

// Reports
const auditMd = `# Image Audit Report

**Generated:** ${new Date().toISOString().slice(0, 10)}  
**Site:** https://xn--12cman8e0bjt1czaccb9b1fg31ad.com/

## Summary

| Metric | Count |
|---|---|
| Unique image references scanned | ${enriched.length} |
| Broken local images (404) | ${broken.length} |
| Missing alt text | ${missingAlt.length} |
| Missing width/height | ${missingDim.length} |
| External URLs (wp-content etc.) | ${external.length} |
| Article routes | ${articles.length} |
| ogImage duplicate groups | ${ogDupList.length} |

## Priority pages checked

${PRIORITY_PATHS.map((p) => `- \`${p}\` — ${enriched.filter((r) => r.page === p || r.page.includes(p.replace(/\//g, ''))).length} refs`).join('\n')}

## Broken images (fix immediately)

${broken.length ? broken.map((r) => `- \`${r.src}\` on \`${r.page}\``).join('\n') : '_None found in local public paths._'}

## Most reused images (>5 pages)

${dupList.slice(0, 20).map(([src, c]) => `- \`${src}\` — ${c} pages`).join('\n') || '_None_'}

## ogImage duplicates (articles)

${ogDupList.slice(0, 15).map(([img, paths]) => `### ${img}\n${paths.map((p) => `- ${p}`).join('\n')}`).join('\n\n') || '_None_'}

## Articles featured image status

| Path | ogImage |
|---|---|
${articleOgIssues.map((a) => `| ${a.path} | ${a.ogImage} |`).join('\n')}

## Technical SEO gaps

- Images without alt: ${missingAlt.length} (mostly legacy bodyHtml — see image-plan-blog.md)
- Images without width/height: ${missingDim.length}
- Hero target: ≤250 KB WebP — see \`/images/site/hero-home-1600x900.webp\`
- Content target: ≤150 KB WebP where possible

## Next actions

1. Replace generic hero with \`/images/site/hero-home-1600x900.webp\` (done in code)
2. Use \`OptimizedImage\` + \`siteImages.ts\` on marketing pages (done)
3. Phase 2: dedupe article ogImage per theme (see image-plan-blog.md)
4. Phase 2: add real storefront/team photos when available
`;

fs.writeFileSync(path.join(OUT_DIR, 'image-audit-report.md'), auditMd, 'utf8');

const replaceMd = `# Image Replacement Plan

**Status:** Phase 1 implemented in codebase + \`public/images/site/\`

## Completed (Phase 1)

| Area | Old | New | Notes |
|---|---|---|---|
| Homepage hero | \`/images/uploads/.../รับซื้อกล้องมือสอง.webp\` | \`/images/site/hero-home-1600x900.webp\` | 1600×900, 117KB, preload |
| Homepage process steps | text only | 3 process images | alt ตาม brief |
| Homepage reviews | text only | LINE + transfer examples | wording: "ตัวอย่างขั้นตอน" |
| /models/ brands | mixed uploads | \`/images/site/brand-*-1200x800.webp\` | unified alt |
| /process/ | text only | 6-photo grid + 3 guide images | |
| /review/ | "รีวิวจริง" wording | "ตัวอย่างประสบการณ์" + gallery | no false claims |
| /about/ | map only | trust gallery 4 images | อุบล local alt |

## Phase 2 — needs real photography

| Asset needed | Purpose | Alt keyword |
|---|---|---|
| หน้าร้านจริง (wide shot) | About hero | รับซื้อกล้องมือสอง อุบลราชธานี หน้าร้าน |
| เจ้าของ/ทีม + กล้อง | About trust | ทีมงานรับซื้อกล้องมือสอง อุบลราชธานี |
| แชท LINE จริง (blur PII) | Review proof | ตัวอย่างขั้นตอนแชท LINE |
| สลิปโอนจริง (blur PII) | Review proof | ตัวอย่างขั้นตอนโอนเงิน |
| Google Business screenshot | Review | รีวิว Google รับซื้อกล้องมือสอง อุบล |

## Phase 2 — blog ogImage dedupe

See \`image-plan-blog.md\` for per-article mapping.

## Wording rules (enforced)

- Mockup / stock / re-used shop photos → **"ตัวอย่างขั้นตอน"** not "รีวิวจริง"
- No "อันดับ 1", "ดีที่สุด", "ราคาสูงสุด" without proof
- Blur all customer PII in chat/slip photos
`;

fs.writeFileSync(path.join(OUT_DIR, 'image-replacement-plan.md'), replaceMd, 'utf8');

const brokenMd = `# Broken Image Fix Report

**Generated:** ${new Date().toISOString().slice(0, 10)}

## Local broken references

${broken.length ? broken.map((r) => `- **${r.src}** — page \`${r.page}\` (${r.source})`).join('\n') : 'No broken local image paths detected in audit sample.'}

## External / legacy wp-content URLs in bodyHtml

${external.length} references point off-site or to absolute URLs. These still work while WordPress CDN is up; mirror to \`/images/uploads/\` in Phase 2.

## Fixes applied

- Created \`public/images/site/\` with 26 optimized WebP assets
- Central registry: \`src/lib/siteImages.ts\`
- Component: \`src/components/OptimizedImage.astro\`
- Marketing pages updated to use local optimized paths

## Verify

\`\`\`bash
node scripts/prepare-site-images.mjs
npm run build
node scripts/audit-images.mjs
\`\`\`
`;

fs.writeFileSync(path.join(OUT_DIR, 'broken-image-fix-report.md'), brokenMd, 'utf8');

// Blog plan
const blogPlan = `# Blog Image Plan

**Articles:** ${articles.length}  
**Rule:** ไม่ใช้ ogImage เดียวกันซ้ำหลายบทความ — แยก theme ตามประเภท

## Theme mapping

| Theme | Example articles | Recommended ogImage direction |
|---|---|---|
| ความรู้ / shutter | /article/shutter-count/ | Shutter count diagram (unique) |
| ความรู้ / DSLR | /article/กล้อง-dslr-คืออะไร/ | DSLR body + lens |
| ความรู้ / types | /article/กล้องถ่ายรูปมีกี่ชนิด/ | 6-type collage |
| แบรนด์ / Sony | /article/sony-a7iii-vs-a7iv/ | Sony A7 body |
| แบรนย์ / Fuji | /article/ทำไมกล้อง-fuji-.../ | Fuji X body |
| 360 / action | /article/กล้อง-360-องศา/ | Insta360 (already unique) |
| ความปลอดภัย / pack | /article/วิธีแพ็คกล้อง/ | EMS packing |
| ความปลอดภัย / check | /article/วิธีเช็คสภาพ.../ | inspection desk |

## Current ogImage per article

${articleOgIssues.map((a) => `- ${a.path}\n  - og: \`${a.ogImage}\``).join('\n')}

## Duplicate ogImage groups (fix in Phase 2)

${ogDupList.map(([img, paths]) => `### ${img}\n${paths.map((p) => `- ${p}`).join('\n')}`).join('\n\n') || '_No duplicates among articles._'}

## Content body images

Legacy \`bodyHtml\` from WordPress may contain duplicate stock images. Do not bulk-replace without review — update top 10 GSC articles first.
`;

fs.writeFileSync(path.join(OUT_DIR, 'image-plan-blog.md'), blogPlan, 'utf8');

console.log('Audit complete:');
console.log(`  ${enriched.length} unique refs`);
console.log(`  ${broken.length} broken`);
console.log(`  image-audit-report.md`);
console.log(`  image-replacement-plan.md`);
console.log(`  image-alt-map.csv`);
console.log(`  broken-image-fix-report.md`);
console.log(`  image-plan-blog.md`);
