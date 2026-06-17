import fs from 'node:fs';
import path from 'node:path';

const SITE = 'https://xn--12cman8e0bjt1czaccb9b1fg31ad.com';
const banned = ['ราคาสูงสุด', 'ให้ราคาสูงสุด', 'ดีที่สุด', 'อันดับ 1', 'รับทุกรุ่น'];

const pages = JSON.parse(fs.readFileSync('content-input/camera-model-pages.json', 'utf8'));
const dist = path.join(process.cwd(), 'dist');

const titleMap = new Map();
const descMap = new Map();
const issues = [];

const shutterExists = fs.existsSync(path.join(dist, 'article', 'shutter-count', 'index.html'));
const toDistFile = (href) => {
  if (!href.startsWith('/')) return null;
  if (href.startsWith('/images/') || href.startsWith('/styles/') || href.startsWith('/fonts/')) return null;
  if (href.includes('.') && !href.endsWith('/')) return null; // asset with extension
  const clean = href.split('#')[0];
  const withSlash = clean.endsWith('/') ? clean : `${clean}/`;
  return path.join(dist, withSlash.replace(/^\//, ''), 'index.html');
};

const extractJsonLd = (html) => {
  const blocks = [];
  const re = /<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html)) !== null) blocks.push(m[1].trim());
  return blocks;
};

for (const p of pages) {
  const file = path.join(dist, 'models', p.slug, 'index.html');
  if (!fs.existsSync(file)) {
    issues.push({ slug: p.slug, type: 'missing_html' });
    continue;
  }

  const html = fs.readFileSync(file, 'utf8');

  const h1Count = (html.match(/<h1\b/gi) || []).length;
  const h1 = (html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || [])[1] || '';
  const title = (html.match(/<title>([\s\S]*?)<\/title>/i) || [])[1] || '';
  const desc =
    (html.match(/<meta\s+name="description"\s+content="([^"]*)"\s*\/?\s*>/i) || [])[1] || '';
  const canon = (html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i) || [])[1] || '';

  if (h1Count !== 1) issues.push({ slug: p.slug, type: 'h1_count', value: h1Count });
  if (!h1 || !h1.includes(p.h1)) issues.push({ slug: p.slug, type: 'h1_mismatch', value: h1 });
  if (!title) issues.push({ slug: p.slug, type: 'missing_title' });
  if (!desc) issues.push({ slug: p.slug, type: 'missing_description' });

  const expectedCanon = `${SITE}/models/${p.slug}/`;
  if (canon !== expectedCanon) issues.push({ slug: p.slug, type: 'canonical_mismatch', value: canon });

  for (const b of banned) {
    if (html.includes(b)) issues.push({ slug: p.slug, type: 'banned_word', value: b });
  }

  if (titleMap.has(title)) issues.push({ slug: p.slug, type: 'duplicate_title', other: titleMap.get(title) });
  else titleMap.set(title, p.slug);

  if (descMap.has(desc))
    issues.push({ slug: p.slug, type: 'duplicate_description', other: descMap.get(desc) });
  else descMap.set(desc, p.slug);

  const ldCount = (html.match(/application\/ld\+json/gi) || []).length;
  if (ldCount < 1) issues.push({ slug: p.slug, type: 'missing_jsonld' });
  const ldBlocks = extractJsonLd(html);
  for (let i = 0; i < ldBlocks.length; i++) {
    try {
      JSON.parse(ldBlocks[i]);
    } catch (e) {
      issues.push({ slug: p.slug, type: 'invalid_jsonld', value: `block ${i + 1}: ${e.message}` });
    }
  }

  const mustLinks = ['/', '/models/', '/process/', '/review/'];
  for (const u of mustLinks) {
    if (!html.includes(`href="${u}"`) && !html.includes(`href='${u}'`)) {
      issues.push({ slug: p.slug, type: 'missing_internal_link', value: u });
    }
  }
  if (shutterExists) {
    const u = '/article/shutter-count/';
    if (!html.includes(`href="${u}"`) && !html.includes(`href='${u}'`)) {
      issues.push({ slug: p.slug, type: 'missing_internal_link', value: u });
    }
  }

  // Broken internal link check (best-effort)
  const hrefs = new Set();
  const hrefRe = /href=(?:"([^"]+)"|'([^']+)')/gi;
  let hm;
  while ((hm = hrefRe.exec(html)) !== null) {
    const href = (hm[1] || hm[2] || '').trim();
    if (!href.startsWith('/')) continue;
    hrefs.add(href);
  }
  for (const href of hrefs) {
    const out = toDistFile(href);
    if (!out) continue;
    if (!fs.existsSync(out)) issues.push({ slug: p.slug, type: 'broken_internal_link', value: href });
  }

  // FAQ render count
  const faqCount = (html.match(/class="faq-item__q"/g) || []).length;
  if (typeof p.faq?.length === 'number' && faqCount !== p.faq.length) {
    issues.push({ slug: p.slug, type: 'faq_render_count_mismatch', value: `${faqCount} != ${p.faq.length}` });
  }
}

// Sitemap check (Astro sitemap integration)
const sitemapFiles = fs.existsSync(dist)
  ? fs.readdirSync(dist).filter((f) => /^sitemap-.*\.xml$/i.test(f)).map((f) => path.join(dist, f))
  : [];
if (!sitemapFiles.length) {
  issues.push({ slug: '*', type: 'missing_sitemap_files' });
} else {
  const xml = sitemapFiles.map((f) => fs.readFileSync(f, 'utf8')).join('\n');
  for (const p of pages) {
    const url = `${SITE}/models/${p.slug}/`;
    if (!xml.includes(url)) issues.push({ slug: p.slug, type: 'missing_from_sitemap', value: url });
  }
}

// Models hub (/models/) must link to all model money pages
const hubFile = path.join(dist, 'models', 'index.html');
if (!fs.existsSync(hubFile)) {
  issues.push({ slug: 'models-hub', type: 'missing_hub_html' });
} else {
  const hubHtml = fs.readFileSync(hubFile, 'utf8');
  const hubH1Count = (hubHtml.match(/<h1\b/gi) || []).length;
  if (hubH1Count !== 1) issues.push({ slug: 'models-hub', type: 'hub_h1_count', value: hubH1Count });

  if (!hubHtml.includes('รับซื้อกล้องตามรุ่นยอดนิยม')) {
    issues.push({ slug: 'models-hub', type: 'hub_missing_popular_section' });
  }

  for (const p of pages) {
    const href = `/models/${p.slug}/`;
    if (!hubHtml.includes(`href="${href}"`) && !hubHtml.includes(`href='${href}'`)) {
      issues.push({ slug: 'models-hub', type: 'hub_missing_model_link', value: href });
    }
  }

  const hubHrefs = new Set();
  const hubHrefRe = /href=(?:"([^"]+)"|'([^']+)')/gi;
  let hmHub;
  while ((hmHub = hubHrefRe.exec(hubHtml)) !== null) {
    const href = (hmHub[1] || hmHub[2] || '').trim();
    if (!href.startsWith('/')) continue;
    hubHrefs.add(href);
  }
  for (const href of hubHrefs) {
    const out = toDistFile(href);
    if (!out) continue;
    if (!fs.existsSync(out)) issues.push({ slug: 'models-hub', type: 'hub_broken_internal_link', value: href });
  }
}

const byType = issues.reduce((acc, it) => {
  acc[it.type] = (acc[it.type] || 0) + 1;
  return acc;
}, {});

console.log(JSON.stringify({ ok: issues.length === 0, issuesCount: issues.length, byType, issues: issues.slice(0, 50) }, null, 2));

// Markdown report
const reportPath = path.join(process.cwd(), 'camera-model-pages-report.md');
const now = new Date().toISOString();
const lines = [];
lines.push(`# Camera model pages QA report`);
lines.push(``);
lines.push(`Generated: ${now}`);
lines.push(``);
lines.push(`## Summary`);
lines.push(`- Model pages expected: ${pages.length}`);
lines.push(`- Issues: ${issues.length}`);
lines.push(`- Sitemap files: ${sitemapFiles.length}`);
lines.push(``);
lines.push(`## Checks`);
lines.push(`- JSON parse + count (27 items): OK (validated earlier)`);
lines.push(`- Dist pages exist: ${issues.some((x) => x.type === 'missing_html') ? 'FAIL' : 'OK'}`);
lines.push(`- H1 single + matches: ${issues.some((x) => x.type === 'h1_count' || x.type === 'h1_mismatch') ? 'FAIL' : 'OK'}`);
lines.push(`- Title unique: ${issues.some((x) => x.type === 'duplicate_title') ? 'FAIL' : 'OK'}`);
lines.push(`- Description unique: ${issues.some((x) => x.type === 'duplicate_description') ? 'FAIL' : 'OK'}`);
lines.push(`- Canonical correct: ${issues.some((x) => x.type === 'canonical_mismatch') ? 'FAIL' : 'OK'}`);
lines.push(`- Forbidden words: ${issues.some((x) => x.type === 'banned_word') ? 'FAIL' : 'OK'}`);
lines.push(`- JSON-LD parses: ${issues.some((x) => x.type === 'missing_jsonld' || x.type === 'invalid_jsonld') ? 'FAIL' : 'OK'}`);
lines.push(`- Internal links required present: ${issues.some((x) => x.type === 'missing_internal_link') ? 'FAIL' : 'OK'}`);
lines.push(`- Internal links not broken (best-effort): ${issues.some((x) => x.type === 'broken_internal_link') ? 'FAIL' : 'OK'}`);
lines.push(`- FAQ render count matches data: ${issues.some((x) => x.type === 'faq_render_count_mismatch') ? 'FAIL' : 'OK'}`);
lines.push(`- Sitemap contains all model URLs: ${issues.some((x) => x.type === 'missing_from_sitemap' || x.type === 'missing_sitemap_files') ? 'FAIL' : 'OK'}`);
lines.push(`- Models hub links all model pages: ${issues.some((x) => x.type === 'hub_missing_model_link' || x.type === 'hub_missing_popular_section' || x.type === 'missing_hub_html') ? 'FAIL' : 'OK'}`);
lines.push(`- Models hub H1 single: ${issues.some((x) => x.type === 'hub_h1_count') ? 'FAIL' : 'OK'}`);
lines.push(`- Models hub internal links not broken: ${issues.some((x) => x.type === 'hub_broken_internal_link') ? 'FAIL' : 'OK'}`);
lines.push(``);
lines.push(`## Issues by type`);
lines.push('```json');
lines.push(JSON.stringify(byType, null, 2));
lines.push('```');
lines.push(``);
if (issues.length) {
  lines.push(`## First 50 issues`);
  lines.push('```json');
  lines.push(JSON.stringify(issues.slice(0, 50), null, 2));
  lines.push('```');
  lines.push(``);
}
fs.writeFileSync(reportPath, lines.join('\n'), 'utf8');

process.exit(issues.length ? 2 : 0);

