/**
 * Build src/data/blog-index.json from all buyback content pages.
 * Usage: node scripts/generate-blog-index.mjs
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT_DIR = path.join(ROOT, 'src', 'data', 'content');
const MANIFEST_PATH = path.join(ROOT, 'src', 'data', 'routes-manifest.json');
const OUT_PATH = path.join(ROOT, 'src', 'data', 'blog-index.json');

const BLOG_PAGE_TYPES = new Set(['post', 'location', 'article']);
const DEFAULT_IMAGE = '/images/uploads/2025/06/รับซื้อกล้องมือสอง.webp';

function decodeEntities(text) {
  return text
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"');
}

function stripHtml(html) {
  return (html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractFeaturedImage(bodyHtml, ogImage) {
  if (ogImage && !ogImage.startsWith('http')) return ogImage;
  if (ogImage && ogImage.includes('/images/uploads/')) {
    const idx = ogImage.indexOf('/images/uploads/');
    return ogImage.slice(idx);
  }

  const html = bodyHtml || '';
  for (const pattern of [
    /data-full-image="(\/images\/uploads\/[^"]+)"/i,
    /data-light-image="(\/images\/uploads\/[^"]+)"/i,
    /<img[^>]+src="(\/images\/uploads\/[^"]+)"/i,
    /background-image:\s*url\(['"]?(\/images\/uploads\/[^'")]+)/i,
  ]) {
    const m = html.match(pattern);
    if (m?.[1]) return m[1];
  }

  return DEFAULT_IMAGE;
}

function extractExcerpt(page, maxLen = 180) {
  let text = decodeEntities(page.seo?.metaDescription || '');
  text = stripHtml(text);
  if (text.length > maxLen) return `${text.slice(0, maxLen).trim()}…`;
  if (text) return text;

  const bodyText = stripHtml(page.bodyHtml || '');
  if (bodyText.length > maxLen) return `${bodyText.slice(0, maxLen).trim()}…`;
  return bodyText;
}

const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));
const entries = [];

for (const route of manifest.routes) {
  if (!BLOG_PAGE_TYPES.has(route.pageType)) continue;

  const page = JSON.parse(readFileSync(path.join(CONTENT_DIR, route.contentFile), 'utf8'));
  if (!(page.bodyHtml || '').trim() && !page.seo?.h1) continue;

  entries.push({
    path: page.path,
    title: page.seo?.h1 || page.seo?.title || page.path,
    excerpt: extractExcerpt(page),
    image: extractFeaturedImage(page.bodyHtml, page.seo?.ogImage),
    imageAlt: page.seo?.h1 || page.seo?.title,
    datePublished: page.datePublished || undefined,
    pageType: page.pageType,
  });
}

entries.sort((a, b) => {
  const da = a.datePublished ? new Date(a.datePublished).getTime() : 0;
  const db = b.datePublished ? new Date(b.datePublished).getTime() : 0;
  return db - da;
});

writeFileSync(
  OUT_PATH,
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      total: entries.length,
      posts: entries,
    },
    null,
    0,
  ),
);

console.log(`Wrote ${entries.length} blog entries → ${OUT_PATH}`);
