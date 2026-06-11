#!/usr/bin/env node
/**
 * WordPress → Astro migration crawler
 * Exports URL inventory CSV, per-page JSON content, and routes manifest.
 */
import * as cheerio from 'cheerio';
import { createHash } from 'node:crypto';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SITE = 'https://xn--12cman8e0bjt1czaccb9b1fg31ad.com';
const CONTENT_DIR = path.join(ROOT, 'src', 'data', 'content');
const MIGRATION_DIR = path.join(ROOT, 'migration');
const CONCURRENCY = 8;
const DELAY_MS = 150;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function normalizePathname(pathname) {
  let p = pathname;
  try {
    p = decodeURIComponent(pathname);
  } catch {
    p = pathname;
  }
  if (!p.startsWith('/')) p = `/${p}`;
  if (!p.endsWith('/')) p = `${p}/`;
  return p;
}

function pathKey(pathname) {
  return normalizePathname(pathname).toLowerCase();
}

function urlToPath(url) {
  const u = new URL(url);
  return normalizePathname(u.pathname);
}

function detectPageType(urlPath) {
  if (urlPath === '/') return 'homepage';
  if (urlPath.startsWith('/article/')) return 'article';
  if (urlPath.startsWith('/category/')) return 'category';
  if (urlPath.startsWith('/tag/')) return 'tag';
  if (urlPath.startsWith('/author/')) return 'author';
  if (urlPath === '/blog/') return 'archive';
  if (
    urlPath.startsWith('/%e0%b8%a3%e0%b8%b1%e0%b8%9a%e0%b8%8b%e0%b8%b7%e0%b9%89%e0%b8%ad%e0%b8%81%e0%b8%a5%e0%b9%89%e0%b8%ad%e0%b8%87/') ||
    urlPath.includes('รับซื้อกล้อง')
  ) {
    return 'location';
  }
  const staticPages = ['/models/', '/process/', '/review/', '/about/', '/blog/'];
  if (staticPages.includes(urlPath)) return 'page';
  return 'post';
}

function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractH1(html) {
  const $ = cheerio.load(html);
  const h1 = $('h1').first().text().trim();
  if (h1) return h1;
  const match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  return match ? stripHtml(match[1]) : '';
}

function countWords(html) {
  const text = stripHtml(html);
  return text ? text.split(/\s+/).filter(Boolean).length : 0;
}

function parseSchemaGraph(html) {
  const $ = cheerio.load(html);
  const scripts = $('script[type="application/ld+json"]');
  for (const el of scripts.toArray()) {
    const text = $(el).html();
    if (!text) continue;
    try {
      const json = JSON.parse(text);
      if (json['@graph']) return json['@graph'];
      if (Array.isArray(json)) return json;
      return [json];
    } catch {
      /* continue */
    }
  }
  return undefined;
}

async function fetchText(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'AstroMigrationBot/1.0 (SEO-safe migration)' },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.text();
    } catch (err) {
      if (i === retries - 1) throw err;
      await sleep(500 * (i + 1));
    }
  }
}

async function fetchJson(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'AstroMigrationBot/1.0' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

async function fetchAllPaginated(baseUrl) {
  const items = [];
  let page = 1;
  let totalPages = 1;
  while (page <= totalPages) {
    const url = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}per_page=100&page=${page}`;
    const res = await fetch(url, { headers: { 'User-Agent': 'AstroMigrationBot/1.0' } });
    if (!res.ok) break;
    totalPages = Number(res.headers.get('x-wp-totalpages') || 1);
    const batch = await res.json();
    if (!Array.isArray(batch) || !batch.length) break;
    items.push(...batch);
    console.log(`  ${baseUrl} page ${page}/${totalPages} (${items.length} items)`);
    page++;
    await sleep(DELAY_MS);
  }
  return items;
}

async function parseSitemapUrls(sitemapUrl, collected = new Set()) {
  const xml = await fetchText(sitemapUrl);
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
  for (const loc of locs) {
    if (loc.endsWith('.xml')) {
      if (!collected.has(loc)) {
        collected.add(loc);
        await parseSitemapUrls(loc, collected);
      }
    } else {
      collected.add(loc);
    }
  }
  return [...collected].filter((u) => !u.endsWith('.xml'));
}

function seoFromYoast(yoast) {
  if (!yoast) return {};
  return {
    title: yoast.title || '',
    metaDescription: yoast.og_description || yoast.description || '',
    canonical: yoast.canonical || '',
    ogTitle: yoast.og_title,
    ogDescription: yoast.og_description,
    ogUrl: yoast.og_url,
    ogImage: yoast.og_image?.[0]?.url || yoast.og_image,
    ogType: yoast.og_type,
    robots: yoast.robots
      ? Object.entries(yoast.robots)
          .filter(([, v]) => v && v !== 'no')
          .map(([k, v]) => (typeof v === 'string' ? v : k))
          .join(', ')
      : undefined,
  };
}

function extractMainContent(html) {
  const $ = cheerio.load(html);
  const selectors = [
    '.entry-content',
    '.single-content',
    'article .content',
    'main article',
    '#main',
    'main',
  ];
  for (const sel of selectors) {
    const el = $(sel).first();
    if (el.length && el.html()?.trim()) {
      return el.html() || '';
    }
  }
  return $('body').html() || '';
}

function parseHtmlPage(url, html) {
  const $ = cheerio.load(html);
  const title = $('title').first().text().trim();
  const metaDescription =
    $('meta[name="description"]').attr('content') ||
    $('meta[property="og:description"]').attr('content') ||
    '';
  const canonical =
    $('link[rel="canonical"]').attr('href') || url;
  const h1 = extractH1(html);
  const bodyHtml = extractMainContent(html);
  const schemaGraph = parseSchemaGraph(html);
  const ogImage = $('meta[property="og:image"]').attr('content');

  return {
    seo: {
      title,
      metaDescription,
      canonical,
      h1: h1 || title,
      ogTitle: $('meta[property="og:title"]').attr('content') || title,
      ogDescription: $('meta[property="og:description"]').attr('content') || metaDescription,
      ogUrl: $('meta[property="og:url"]').attr('content') || canonical,
      ogImage,
      ogType: $('meta[property="og:type"]').attr('content'),
      wordCount: countWords(bodyHtml),
    },
    bodyHtml,
    schemaGraph,
  };
}

async function processInBatches(items, fn) {
  const results = [];
  for (let i = 0; i < items.length; i += CONCURRENCY) {
    const batch = items.slice(i, i + CONCURRENCY);
    const batchResults = await Promise.all(batch.map(fn));
    results.push(...batchResults);
    if (i + CONCURRENCY < items.length) await sleep(DELAY_MS);
  }
  return results;
}

function csvEscape(value) {
  const str = String(value ?? '');
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

async function main() {
  console.log('=== WordPress Migration Crawl ===');
  console.log(`Site: ${SITE}`);

  await mkdir(CONTENT_DIR, { recursive: true });
  await mkdir(MIGRATION_DIR, { recursive: true });

  console.log('\n1. Parsing sitemaps...');
  const sitemapUrls = await parseSitemapUrls(`${SITE}/sitemap_index.xml`);
  const pageUrls = sitemapUrls
    .map((u) => {
      try {
        return new URL(u);
      } catch {
        return null;
      }
    })
    .filter(Boolean)
    .filter((u) => u.hostname.includes('xn--12cman8e0bjt1czaccb9b1fg31ad.com'))
    .map((u) => normalizePathname(u.pathname));

  const uniquePaths = [...new Set(pageUrls.map(pathKey))].map((key) =>
    pageUrls.find((p) => pathKey(p) === key),
  );
  console.log(`   Found ${uniquePaths.length} unique URL paths`);

  console.log('\n2. Fetching WordPress REST API...');
  const [posts, pages, categories, tags] = await Promise.all([
    fetchAllPaginated(`${SITE}/wp-json/wp/v2/posts`),
    fetchAllPaginated(`${SITE}/wp-json/wp/v2/pages`),
    fetchAllPaginated(`${SITE}/wp-json/wp/v2/categories`),
    fetchAllPaginated(`${SITE}/wp-json/wp/v2/tags`),
  ]);

  const apiByPath = new Map();
  const registerApi = (item, type) => {
    const p = urlToPath(item.link);
    apiByPath.set(pathKey(p), { type, data: item, path: p });
  };
  for (const post of posts) registerApi(post, 'post');
  for (const pg of pages) registerApi(pg, 'page');
  for (const cat of categories) registerApi(cat, 'category');
  for (const tag of tags) registerApi(tag, 'tag');

  console.log(`   API: ${posts.length} posts, ${pages.length} pages, ${categories.length} categories, ${tags.length} tags`);

  const pathByKey = new Map();
  for (const p of uniquePaths) pathByKey.set(pathKey(p), p);
  for (const entry of apiByPath.values()) pathByKey.set(pathKey(entry.path), entry.path);
  const allPaths = [...pathByKey.values()];

  console.log(`\n3. Crawling ${allPaths.length} pages (HTML + SEO)...`);
  let done = 0;
  const records = await processInBatches(allPaths, async (pagePath) => {
    const url = new URL(pagePath, SITE).href;
    const apiEntry = apiByPath.get(pathKey(pagePath));

    let record;
    try {
      const html = await fetchText(url);
      const parsed = parseHtmlPage(url, html);
      const pageType = detectPageType(pagePath);

      let bodyHtml = parsed.bodyHtml;
      let datePublished;
      let dateModified;
      let schemaGraph = parsed.schemaGraph;

      if (apiEntry) {
        const d = apiEntry.data;
        if (d.content?.rendered) bodyHtml = d.content.rendered;
        datePublished = d.date_gmt ? `${d.date_gmt}Z` : d.date;
        dateModified = d.modified_gmt ? `${d.modified_gmt}Z` : d.modified;
        const yoastSeo = seoFromYoast(d.yoast_head_json);
        if (d.yoast_head_json?.schema?.['@graph']) {
          schemaGraph = d.yoast_head_json.schema['@graph'];
        }
        parsed.seo = {
          ...parsed.seo,
          ...Object.fromEntries(Object.entries(yoastSeo).filter(([, v]) => v)),
          h1: parsed.seo.h1 || stripHtml(d.title?.rendered || ''),
        };
      }

      const id = `${pageType}-${createHash('sha256').update(pagePath).digest('hex').slice(0, 20)}`;
      record = {
        id,
        oldUrl: parsed.seo.canonical || url,
        path: pagePath,
        pageType: pagePath === '/' ? 'homepage' : pageType,
        seo: {
          ...parsed.seo,
          canonical: parsed.seo.canonical || url,
          wordCount: countWords(bodyHtml),
        },
        bodyHtml,
        schemaGraph,
        datePublished,
        dateModified,
      };
    } catch (err) {
      record = {
        id: `error-${done}`,
        oldUrl: url,
        path: pagePath,
        pageType: detectPageType(pagePath),
        seo: {
          title: '',
          metaDescription: '',
          canonical: url,
          h1: '',
        },
        bodyHtml: '',
        notes: `Crawl error: ${err.message}`,
      };
    }

    done++;
    if (done % 50 === 0 || done === allPaths.length) {
      console.log(`   Progress: ${done}/${allPaths.length}`);
    }
    return record;
  });

  console.log('\n4. Writing content files...');
  // Clear stale content from previous crawl attempts
  const { readdir, unlink } = await import('node:fs/promises');
  for (const file of await readdir(CONTENT_DIR)) {
    if (file.endsWith('.json')) await unlink(path.join(CONTENT_DIR, file));
  }

  const routes = [];
  const inventoryRows = [
    [
      'old_url',
      'new_url',
      'status',
      'page_type',
      'title',
      'meta_description',
      'h1',
      'canonical',
      'notes',
    ].join(','),
  ];

  for (const record of records) {
    const contentFile = `${record.id}.json`;
    await writeFile(path.join(CONTENT_DIR, contentFile), JSON.stringify(record, null, 0), 'utf8');

    const newUrl = new URL(record.path, SITE).href;
    const status = record.notes?.startsWith('Crawl error')
      ? 'error'
      : record.bodyHtml
        ? '200'
        : 'needs_review';

    routes.push({
      path: record.path,
      contentFile,
      pageType: record.pageType,
    });

    inventoryRows.push(
      [
        record.oldUrl,
        newUrl,
        status,
        record.pageType,
        csvEscape(record.seo.title),
        csvEscape(record.seo.metaDescription),
        csvEscape(record.seo.h1),
        csvEscape(record.seo.canonical),
        csvEscape(record.notes || 'Preserved 1:1'),
      ].join(','),
    );
  }

  routes.sort((a, b) => a.path.localeCompare(b.path));

  const manifest = {
    siteUrl: SITE,
    generatedAt: new Date().toISOString(),
    totalPages: routes.length,
    routes,
  };

  await writeFile(path.join(ROOT, 'src', 'data', 'routes-manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');
  await writeFile(path.join(MIGRATION_DIR, 'url-inventory.csv'), inventoryRows.join('\n'), 'utf8');

  const redirects = [];
  for (const r of records) {
    if (r.notes?.startsWith('Crawl error')) {
      redirects.push({
        source: r.path,
        destination: '/',
        permanent: false,
        reason: r.notes,
      });
    }
  }

  await writeFile(
    path.join(MIGRATION_DIR, 'redirects.json'),
    JSON.stringify(redirects, null, 2),
    'utf8',
  );

  const redirectLines = [
    '/sitemap_index.xml /sitemap-index.xml 301',
    ...redirects.map((r) => `${r.source} ${r.destination} ${r.permanent ? 301 : 302}`),
  ];
  await writeFile(path.join(ROOT, 'public', '_redirects'), redirectLines.join('\n') + '\n', 'utf8');

  console.log('\n=== Crawl complete ===');
  console.log(`Pages exported: ${records.length}`);
  console.log(`Content dir: ${CONTENT_DIR}`);
  console.log(`URL inventory: ${path.join(MIGRATION_DIR, 'url-inventory.csv')}`);
  console.log(`Redirects needed: ${redirects.length}`);
}

main().catch((err) => {
  console.error('Crawl failed:', err);
  process.exit(1);
});
