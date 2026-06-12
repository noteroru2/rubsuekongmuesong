/**
 * Download wp-content/uploads images, convert to WebP, rewrite content JSON.
 * Usage: node scripts/migrate-images.mjs [--dry-run] [--limit=N]
 */
import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, writeFile, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as cheerio from 'cheerio';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT_DIR = path.join(ROOT, 'src', 'data', 'content');
const IMAGES_DIR = path.join(ROOT, 'public', 'images', 'uploads');
const MANIFEST_PATH = path.join(ROOT, 'src', 'data', 'image-manifest.json');

const WP_ORIGIN = 'https://xn--12cman8e0bjt1czaccb9b1fg31ad.com';
const UPLOADS_RE =
  /https:\/\/xn--12cman8e0bjt1czaccb9b1fg31ad\.com\/wp-content\/uploads\/[^"'\s)]+/gi;

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const limitArg = args.find((a) => a.startsWith('--limit='));
const limit = limitArg ? Number(limitArg.split('=')[1]) : Infinity;
const CONCURRENCY = 6;

function decodeUrl(url) {
  try {
    return decodeURIComponent(url.split('?')[0]);
  } catch {
    return url.split('?')[0];
  }
}

function uploadsRelative(url) {
  const decoded = decodeUrl(url);
  const marker = '/wp-content/uploads/';
  const idx = decoded.indexOf(marker);
  if (idx === -1) return null;
  return decoded.slice(idx + marker.length);
}

function toWebpRelative(relativePath) {
  const base = relativePath.replace(/\.(jpe?g|png|gif|webp|avif|bmp|tiff?)$/i, '');
  return `${base}.webp`;
}

function toPublicPath(relativeWebp) {
  return `/images/uploads/${relativeWebp.replace(/\\/g, '/')}`;
}

function hashFallback(url) {
  return createHash('sha256').update(url).digest('hex').slice(0, 16);
}

async function fileExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

function collectUrlsFromText(text, set) {
  if (!text) return;
  for (const m of text.matchAll(UPLOADS_RE)) {
    set.add(m[0]);
  }
}

function collectUrlsFromPage(page, set) {
  collectUrlsFromText(page.bodyHtml, set);
  collectUrlsFromText(JSON.stringify(page.seo || ''), set);
  collectUrlsFromText(JSON.stringify(page.schemaGraph || ''), set);
}

async function downloadAndConvert(url, mapping) {
  if (mapping.has(url)) return mapping.get(url);

  const relative = uploadsRelative(url);
  let webpRelative;
  if (relative) {
    webpRelative = toWebpRelative(relative);
  } else {
    webpRelative = `misc/${hashFallback(url)}.webp`;
  }

  const publicPath = toPublicPath(webpRelative);
  const diskPath = path.join(IMAGES_DIR, webpRelative);

  if (await fileExists(diskPath)) {
    mapping.set(url, publicPath);
    return publicPath;
  }

  if (dryRun) {
    mapping.set(url, publicPath);
    return publicPath;
  }

  await mkdir(path.dirname(diskPath), { recursive: true });

  const res = await fetch(url, {
    headers: { 'User-Agent': 'AstroMigration/1.0' },
    redirect: 'follow',
  });

  if (!res.ok) {
    console.warn(`FAIL ${res.status} ${url}`);
    mapping.set(url, url);
    return url;
  }

  const buffer = Buffer.from(await res.arrayBuffer());
  await sharp(buffer, { failOn: 'none' })
    .webp({ quality: 85, effort: 4 })
    .toFile(diskPath);

  mapping.set(url, publicPath);
  return publicPath;
}

async function runPool(items, worker) {
  const results = new Array(items.length);
  let index = 0;

  async function next() {
    while (index < items.length) {
      const i = index++;
      results[i] = await worker(items[i], i);
    }
  }

  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, items.length) }, next));
  return results;
}

function replaceUrlsInText(text, mapping) {
  if (!text) return text;
  let out = text;
  const entries = [...mapping.entries()].sort((a, b) => b[0].length - a[0].length);
  for (const [from, to] of entries) {
    if (from === to) continue;
    out = out.split(from).join(to);
    const encoded = from.replace(/ /g, '%20');
    if (encoded !== from) out = out.split(encoded).join(to);
  }
  return out;
}

function fixLazyImages(html) {
  if (!html) return html;
  const $ = cheerio.load(html, { decodeEntities: false }, false);

  $('img.lazyload, img[data-src]').each((_, el) => {
    const $img = $(el);
    const dataSrc = $img.attr('data-src');
    if (dataSrc) {
      $img.attr('src', dataSrc);
      $img.removeAttr('data-src');
    }
    const dataSrcset = $img.attr('data-srcset');
    if (dataSrcset) {
      $img.attr('srcset', dataSrcset);
      $img.removeAttr('data-srcset');
    }
    $img.removeAttr('data-sizes');
    $img.removeClass('lazyload');
    const src = $img.attr('src') || '';
    if (src.startsWith('data:image/svg+xml')) {
      $img.removeAttr('src');
    }
  });

  return $.root().html() || html;
}

async function main() {
  console.log('Scanning content for image URLs…');
  const urlSet = new Set();
  const contentFiles = (await readdir(CONTENT_DIR)).filter((f) => f.endsWith('.json'));

  for (const file of contentFiles) {
    const page = JSON.parse(await readFile(path.join(CONTENT_DIR, file), 'utf8'));
    collectUrlsFromPage(page, urlSet);
  }

  let urls = [...urlSet];
  console.log(`Found ${urls.length} unique upload URLs`);

  if (Number.isFinite(limit) && limit < urls.length) {
    urls = urls.slice(0, limit);
    console.log(`Limited to ${urls.length} URLs`);
  }

  const mapping = new Map();

  if (await fileExists(MANIFEST_PATH)) {
    const existing = JSON.parse(await readFile(MANIFEST_PATH, 'utf8'));
    for (const [k, v] of Object.entries(existing)) mapping.set(k, v);
  }

  console.log(dryRun ? 'Dry run — skipping downloads' : 'Downloading & converting to WebP…');
  let done = 0;
  await runPool(urls, async (url) => {
    const result = await downloadAndConvert(url, mapping);
    done++;
    if (done % 25 === 0 || done === urls.length) {
      console.log(`  ${done}/${urls.length}`);
    }
    return result;
  });

  if (!dryRun) {
    await writeFile(MANIFEST_PATH, JSON.stringify(Object.fromEntries(mapping), null, 2));
    console.log(`Wrote manifest: ${MANIFEST_PATH}`);
  }

  if (dryRun) {
    console.log('Dry run complete.');
    return;
  }

  console.log('Updating content JSON files…');
  let updated = 0;
  for (const file of contentFiles) {
    const filePath = path.join(CONTENT_DIR, file);
    const page = JSON.parse(await readFile(filePath, 'utf8'));
    const before = JSON.stringify(page);

    if (page.bodyHtml) {
      page.bodyHtml = replaceUrlsInText(page.bodyHtml, mapping);
      page.bodyHtml = fixLazyImages(page.bodyHtml);
    }
    if (page.seo) {
      page.seo = JSON.parse(replaceUrlsInText(JSON.stringify(page.seo), mapping));
    }
    if (page.schemaGraph) {
      page.schemaGraph = JSON.parse(replaceUrlsInText(JSON.stringify(page.schemaGraph), mapping));
    }

    const after = JSON.stringify(page);
    if (after !== before) {
      await writeFile(filePath, after);
      updated++;
    }
  }

  console.log(`Updated ${updated} content files. Done.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
