#!/usr/bin/env node
/**
 * Compare old WordPress vs new Astro build SEO signals.
 * Usage: node scripts/validate-seo.mjs [--old URL] [--new URL] [--sample N]
 */
import * as cheerio from 'cheerio';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const args = process.argv.slice(2);
const getArg = (name, fallback) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : fallback;
};

const OLD_BASE = getArg('--old', 'https://xn--12cman8e0bjt1czaccb9b1fg31ad.com');
const NEW_BASE = getArg('--new', 'http://localhost:4321');
const SAMPLE = Number(getArg('--sample', '0'));
const CONCURRENCY = 6;

function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractSignals(html, url) {
  const $ = cheerio.load(html);
  const bodyText = stripHtml($('main, .entry-content, article, body').first().html() || '');
  const internalLinks = new Set();
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href');
    if (!href) return;
    if (href.startsWith('/') || href.includes('xn--12cman8e0bjt1czaccb9b1fg31ad.com') || href.includes('localhost')) {
      internalLinks.add(href.split('#')[0]);
    }
  });

  return {
    url,
    status: 200,
    title: $('title').first().text().trim(),
    metaDescription: $('meta[name="description"]').attr('content') || '',
    h1: $('h1').first().text().trim(),
    canonical: $('link[rel="canonical"]').attr('href') || '',
    wordCount: bodyText ? bodyText.split(/\s+/).filter(Boolean).length : 0,
    internalLinkCount: internalLinks.size,
    internalLinks: [...internalLinks].sort(),
  };
}

async function fetchPage(base, pagePath) {
  const url = new URL(pagePath, base).href;
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'SEO-Validation/1.0' },
      redirect: 'follow',
    });
    const html = await res.text();
    const signals = extractSignals(html, url);
    signals.status = res.status;
    return signals;
  } catch (err) {
    return {
      url,
      status: 0,
      error: err.message,
      title: '',
      metaDescription: '',
      h1: '',
      canonical: '',
      wordCount: 0,
      internalLinkCount: 0,
      internalLinks: [],
    };
  }
}

function compareSignals(oldS, newS) {
  const issues = [];
  if (oldS.status === 0) issues.push(`old fetch failed: ${oldS.error || 'unknown'}`);
  if (newS.status === 0) issues.push(`new fetch failed: ${newS.error || 'unknown'}`);
  if (oldS.status !== newS.status) issues.push(`status: ${oldS.status} → ${newS.status}`);
  const normMeta = (s) => s.replace(/&#\d+;/g, ' ').replace(/\s+/g, ' ').trim();
  if (oldS.title !== newS.title) issues.push('title mismatch');
  if (
    normMeta(oldS.metaDescription) !== normMeta(newS.metaDescription) &&
    normMeta(oldS.metaDescription) &&
    normMeta(newS.metaDescription)
  ) {
    issues.push('meta_description mismatch');
  }
  if (oldS.h1 !== newS.h1) issues.push('h1 mismatch');
  const legacyUncategorized =
    oldS.canonical.includes('/uncategorized/') && !newS.canonical.includes('/uncategorized/');
  if (oldS.canonical !== newS.canonical && !legacyUncategorized) issues.push('canonical mismatch');
  const wordDiff = Math.abs(oldS.wordCount - newS.wordCount);
  const wordPct = oldS.wordCount ? wordDiff / oldS.wordCount : 0;
  if (wordPct > 0.05) issues.push(`word_count drift ${oldS.wordCount} → ${newS.wordCount}`);
  return issues;
}

async function main() {
  const inventoryPath = path.join(ROOT, 'migration', 'url-inventory.csv');
  let paths = ['/'];

  const manifest = JSON.parse(await readFile(path.join(ROOT, 'src', 'data', 'routes-manifest.json'), 'utf8'));
  paths = manifest.routes.map((r) => r.path);

  if (SAMPLE > 0) {
    const step = Math.max(1, Math.floor(paths.length / SAMPLE));
    paths = paths.filter((_, i) => i % step === 0).slice(0, SAMPLE);
  }

  console.log(`Validating ${paths.length} URLs`);
  console.log(`Old: ${OLD_BASE}`);
  console.log(`New: ${NEW_BASE}`);

  const results = [];
  for (let i = 0; i < paths.length; i += CONCURRENCY) {
    const batch = paths.slice(i, i + CONCURRENCY);
    const batchResults = await Promise.all(
      batch.map(async (pagePath) => {
        const [oldS, newS] = await Promise.all([
          fetchPage(OLD_BASE, pagePath),
          fetchPage(NEW_BASE, pagePath),
        ]);
        const issues = compareSignals(oldS, newS);
        return { path: pagePath, old: oldS, new: newS, issues, pass: issues.length === 0 };
      }),
    );
    results.push(...batchResults);
    process.stdout.write(`\r  ${Math.min(i + CONCURRENCY, paths.length)}/${paths.length}`);
  }

  console.log('\n');

  const passed = results.filter((r) => r.pass).length;
  const failed = results.filter((r) => !r.pass);

  await mkdir(path.join(ROOT, 'migration'), { recursive: true });
  const reportPath = path.join(ROOT, 'migration', 'seo-validation-report.json');
  await writeFile(
    reportPath,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        oldBase: OLD_BASE,
        newBase: NEW_BASE,
        total: results.length,
        passed,
        failed: failed.length,
        results,
      },
      null,
      2,
    ),
    'utf8',
  );

  const csvLines = [
    'path,pass,old_status,new_status,issues,old_title,new_title,old_h1,new_h1,old_words,new_words',
    ...results.map((r) =>
      [
        r.path,
        r.pass,
        r.old.status,
        r.new.status,
        `"${r.issues.join('; ')}"`,
        `"${(r.old.title || '').replace(/"/g, '""')}"`,
        `"${(r.new.title || '').replace(/"/g, '""')}"`,
        `"${(r.old.h1 || '').replace(/"/g, '""')}"`,
        `"${(r.new.h1 || '').replace(/"/g, '""')}"`,
        r.old.wordCount,
        r.new.wordCount,
      ].join(','),
    ),
  ];
  await writeFile(path.join(ROOT, 'migration', 'seo-validation.csv'), csvLines.join('\n'), 'utf8');

  console.log(`Passed: ${passed}/${results.length}`);
  console.log(`Failed: ${failed.length}`);
  if (failed.length) {
    console.log('\nFirst 10 failures:');
    failed.slice(0, 10).forEach((f) => {
      console.log(`  ${f.path}: ${f.issues.join(', ')}`);
    });
  }
  console.log(`\nReport: ${reportPath}`);
  process.exit(failed.length ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
