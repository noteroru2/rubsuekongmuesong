#!/usr/bin/env node
/**
 * Restore Astro route paths to original WordPress canonical URLs (no redirects).
 * - Sets page.path from oldUrl / seo.canonical
 * - Rewrites internal links that pointed at interim paths
 * - Regenerates routes-manifest.json
 * - Clears page redirects from public/_redirects
 */
import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CONTENT_DIR = path.join(ROOT, 'src', 'data', 'content');
const MANIFEST_PATH = path.join(ROOT, 'src', 'data', 'routes-manifest.json');
const REDIRECTS_PATH = path.join(ROOT, 'public', '_redirects');
const SITE = 'https://xn--12cman8e0bjt1czaccb9b1fg31ad.com';

function normPath(pathname) {
  try {
    let p = decodeURIComponent(pathname || '/');
    if (!p.startsWith('/')) p = `/${p}`;
    if (p.length > 1 && !p.endsWith('/')) p = `${p}/`;
    return p;
  } catch {
    return pathname;
  }
}

function canonicalPath(page) {
  const raw = page.oldUrl || page.seo?.canonical || '';
  if (!raw) return normPath(page.path);
  try {
    return normPath(new URL(raw).pathname);
  } catch {
    return normPath(raw);
  }
}

function canonicalUrl(pagePath) {
  return `${SITE}${pagePath}`;
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function rewriteInternalLinks(html, fromPath, toPath) {
  if (!html || fromPath === toPath) return html;
  const variants = new Set([
    fromPath,
    encodeURI(fromPath.slice(0, -1)) + '/',
    encodeURI(fromPath),
  ]);
  let out = html;
  for (const from of variants) {
    const to = from === fromPath ? toPath : toPath; // keep decoded target
    out = out.replaceAll(`href="${from}"`, `href="${to}"`);
    out = out.replaceAll(`href='${from}'`, `href='${to}'`);
  }
  return out;
}

async function main() {
  const files = (await readdir(CONTENT_DIR)).filter((f) => f.endsWith('.json'));
  const pages = [];
  const pathMap = new Map();

  for (const file of files) {
    const filePath = path.join(CONTENT_DIR, file);
    const page = JSON.parse(await readFile(filePath, 'utf8'));
    const served = normPath(page.path);
    const original = canonicalPath(page);
    if (served !== original) {
      pathMap.set(served, original);
    }
    pages.push({ file, filePath, page, served, original });
  }

  let restored = 0;
  let linksFixed = 0;

  for (const entry of pages) {
    const { page, served, original, filePath } = entry;
    let bodyHtml = page.bodyHtml || '';

    for (const [from, to] of pathMap) {
      const next = rewriteInternalLinks(bodyHtml, from, to);
      if (next !== bodyHtml) {
        bodyHtml = next;
        linksFixed++;
      }
    }

    if (served !== original) restored++;

    page.path = original;
    page.bodyHtml = bodyHtml;
    page.seo = page.seo || {};
    page.seo.canonical = canonicalUrl(original);
    if (page.seo.ogUrl) page.seo.ogUrl = canonicalUrl(original);

    await writeFile(filePath, JSON.stringify(page), 'utf8');
  }

  const routes = pages
    .map(({ page, file }) => ({
      path: page.path,
      contentFile: file,
      pageType: page.pageType,
    }))
    .sort((a, b) => a.path.localeCompare(b.path));

  const pathCounts = new Map();
  for (const r of routes) {
    pathCounts.set(r.path, (pathCounts.get(r.path) || 0) + 1);
  }
  const duplicates = [...pathCounts.entries()].filter(([, n]) => n > 1);
  if (duplicates.length) {
    console.error('Duplicate paths after restore:', duplicates.slice(0, 10));
    process.exit(1);
  }

  const manifest = {
    siteUrl: SITE,
    generatedAt: new Date().toISOString(),
    totalPages: routes.length,
    routes,
  };

  await writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf8');
  await writeFile(REDIRECTS_PATH, '/sitemap_index.xml /sitemap-index.xml 301\n', 'utf8');

  console.log(`Restored paths: ${restored} pages`);
  console.log(`Internal link batches updated: ${linksFixed}`);
  console.log(`Routes manifest: ${routes.length} routes`);
  console.log(`Redirects cleared (sitemap only) → ${REDIRECTS_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
