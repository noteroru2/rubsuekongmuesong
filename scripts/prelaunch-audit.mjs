#!/usr/bin/env node
/**
 * Pre-launch audit: WordPress vs Astro
 */
import * as cheerio from 'cheerio';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OLD_BASE = 'https://xn--12cman8e0bjt1czaccb9b1fg31ad.com';
const NEW_BASE = process.argv.includes('--new')
  ? process.argv[process.argv.indexOf('--new') + 1]
  : 'http://localhost:4321';
const CONCURRENCY = 10;

const issues = {
  critical: [],
  high: [],
  medium: [],
};

function add(level, code, message, url = '') {
  issues[level].push({ code, message, url });
}

function normPath(p) {
  try {
    p = decodeURIComponent(p);
  } catch {}
  if (!p.startsWith('/')) p = `/${p}`;
  if (!p.endsWith('/')) p = `${p}/`;
  return p;
}

function stripHtml(h) {
  return h.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

async function fetchHtml(base, pagePath) {
  const url = new URL(pagePath, base).href;
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'PrelaunchAudit/1.0' },
      redirect: 'follow',
    });
    const html = await res.text();
    return { url, finalUrl: res.url, status: res.status, html, redirected: res.redirected };
  } catch (e) {
    return { url, finalUrl: url, status: 0, html: '', error: e.message, redirected: false };
  }
}

function analyzePage(html, pageUrl) {
  const $ = cheerio.load(html);
  const title = $('title').first().text().trim();
  const metaDesc = $('meta[name="description"]').attr('content') || '';
  const h1 = $('h1').first().text().trim();
  const canonical = $('link[rel="canonical"]').attr('href') || '';
  const robots = $('meta[name="robots"]').attr('content') || '';
  const ogTitle = $('meta[property="og:title"]').attr('content') || '';
  const ogDesc = $('meta[property="og:description"]').attr('content') || '';
  const ogUrl = $('meta[property="og:url"]').attr('content') || '';
  const ogImage = $('meta[property="og:image"]').attr('content') || '';
  const ogType = $('meta[property="og:type"]').attr('content') || '';

  const jsonLd = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      jsonLd.push(JSON.parse($(el).html() || '{}'));
    } catch {
      jsonLd.push(null);
    }
  });

  const internalLinks = [];
  const brokenLinkCandidates = [];
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href') || '';
    if (href.startsWith('/') || href.includes('xn--12cman8e0bjt1czaccb9b1fg31ad.com') || href.includes('localhost')) {
      internalLinks.push(href.split('#')[0]);
    }
    if (href.startsWith('http') && href.includes('xn--12cman8e0bjt1czaccb9b1fg31ad.com/wp-')) {
      brokenLinkCandidates.push(href);
    }
  });

  const images = [];
  $('img').each((_, el) => {
    const src = $(el).attr('src') || $(el).attr('data-src') || '';
    const alt = $(el).attr('alt');
    images.push({ src, alt, hasAlt: alt !== undefined && alt !== null });
  });

  const ctaLinks = [];
  $('a[href*="lin.ee"], a[href*="tel:"], a[href*="facebook"], a[href*="maps.app"], a[href*="goo.gl"]').each((_, el) => {
    ctaLinks.push({ href: $(el).attr('href'), text: $(el).text().trim().slice(0, 40) });
  });

  const bodyText = stripHtml($('main, .entry-content, article, body').first().html() || '');
  const wordCount = bodyText ? bodyText.split(/\s+/).filter(Boolean).length : 0;

  const viewport = $('meta[name="viewport"]').attr('content') || '';

  return {
    title, metaDesc, h1, canonical, robots, ogTitle, ogDesc, ogUrl, ogImage, ogType,
    jsonLd, internalLinks, images, ctaLinks, wordCount, viewport,
    hasJsonLd: jsonLd.length > 0,
    invalidJsonLd: jsonLd.filter((j) => j === null).length,
  };
}

async function processBatch(items, fn) {
  const out = [];
  for (let i = 0; i < items.length; i += CONCURRENCY) {
    const batch = items.slice(i, i + CONCURRENCY);
    out.push(...(await Promise.all(batch.map(fn))));
    if (i % 100 === 0) process.stdout.write(`\r  ${Math.min(i + CONCURRENCY, items.length)}/${items.length}`);
  }
  console.log('');
  return out;
}

async function main() {
  console.log('Pre-launch audit');
  console.log(`Old: ${OLD_BASE}`);
  console.log(`New: ${NEW_BASE}\n`);

  // --- URL inventory analysis ---
  const csv = await readFile(path.join(ROOT, 'migration', 'url-inventory.csv'), 'utf8');
  const rows = csv.trim().split('\n').slice(1).map((line) => {
    const parts = [];
    let cur = '', inQ = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') { inQ = !inQ; continue; }
      if (c === ',' && !inQ) { parts.push(cur); cur = ''; continue; }
      cur += c;
    }
    parts.push(cur);
    return {
      oldUrl: parts[0],
      newUrl: parts[1],
      status: parts[2],
      pageType: parts[3],
      title: parts[4],
    };
  });

  const paths = rows.map((r) => {
    try { return normPath(new URL(r.oldUrl).pathname); } catch { return '/'; }
  });

  // Changed URLs
  const changedUrls = rows.filter((r) => r.oldUrl !== r.newUrl);
  if (changedUrls.length) {
    add('critical', 'URL_CHANGED', `${changedUrls.length} URLs have old_url != new_url`, changedUrls[0].oldUrl);
  }

  // Missing pages in inventory
  const manifest = JSON.parse(await readFile(path.join(ROOT, 'src', 'data', 'routes-manifest.json'), 'utf8'));
  const manifestPaths = new Set(manifest.routes.map((r) => normPath(r.path)));
  const invPaths = new Set(paths);
  for (const p of invPaths) {
    if (!manifestPaths.has(p)) add('critical', 'MISSING_ROUTE', 'URL in inventory but not in routes manifest', p);
  }

  // --- robots.txt ---
  const wpRobots = await fetchHtml(OLD_BASE, '/robots.txt');
  const newRobots = await fetchHtml(NEW_BASE, '/robots.txt');
  if (!newRobots.html.includes('Sitemap:')) {
    add('high', 'ROBOTS_NO_SITEMAP', 'New robots.txt missing Sitemap directive');
  }
  if (wpRobots.html.includes('sitemap_index.xml') && newRobots.html.includes('sitemap-index.xml')) {
    add('medium', 'ROBOTS_SITEMAP_NAME', 'WP uses sitemap_index.xml; Astro uses sitemap-index.xml — set 301 if WP URL was indexed');
  }

  // --- sitemap ---
  const wpSitemap = await fetchHtml(OLD_BASE, '/sitemap_index.xml');
  const newSitemap = await fetchHtml(NEW_BASE, '/sitemap-index.xml');
  if (newSitemap.status !== 200) {
    add('critical', 'SITEMAP_MISSING', `New sitemap-index.xml returns ${newSitemap.status}`);
  }

  let wpSitemapUrls = 0;
  if (wpSitemap.status === 200) {
    const submaps = [...wpSitemap.html.matchAll(/<loc>([^<]+\.xml)<\/loc>/g)].map((m) => m[1]);
    for (const sm of submaps.slice(0, 3)) {
      const xml = await fetchHtml('', sm);
      wpSitemapUrls += (xml.html.match(/<loc>/g) || []).length;
    }
  }

  let newSitemapUrls = 0;
  if (newSitemap.status === 200) {
    const subs = [...newSitemap.html.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    for (const sm of subs) {
      if (sm.endsWith('.xml')) {
        const xml = await fetchHtml('', sm);
        newSitemapUrls += (xml.html.match(/<loc>/g) || []).length;
      }
    }
    if (!subs.length) {
      newSitemapUrls = (await fetchHtml(NEW_BASE, '/sitemap-0.xml')).html.match(/<loc>/g)?.length || 0;
    }
  }

  if (Math.abs(wpSitemapUrls - newSitemapUrls) > 50 && wpSitemapUrls > 0) {
    add('high', 'SITEMAP_COUNT', `Sitemap URL count differs significantly: WP~${wpSitemapUrls} vs New~${newSitemapUrls}`);
  }

  // --- Page-by-page comparison ---
  console.log(`Comparing ${paths.length} URLs...`);
  const comparisons = await processBatch(paths, async (pagePath) => {
    const [oldP, newP] = await Promise.all([fetchHtml(OLD_BASE, pagePath), fetchHtml(NEW_BASE, pagePath)]);
    const oldA = oldP.html ? analyzePage(oldP.html, oldP.finalUrl) : null;
    const newA = newP.html ? analyzePage(newP.html, newP.finalUrl) : null;
    return { pagePath, oldP, newP, oldA, newA };
  });

  let missingOnNew = 0, missingOnOld = 0, titleDiff = 0, metaDiff = 0, h1Diff = 0, canonDiff = 0;
  let noindexNew = 0, noJsonLd = 0, invalidJsonLd = 0, missingOg = 0;
  let redirectChains = 0;
  const brokenImages = [];
  const missingAlt = [];
  const ctaIssues = [];

  const EXPECTED_CTAS = {
    line: ['lin.ee/Nh7ZANi', 'lin.ee/jItlaqF'],
    phone: ['tel:0642579353'],
    facebook: ['facebook.com/Amphontrading'],
    google: ['maps.app.goo.gl', 'goo.gl'],
  };

  for (const c of comparisons) {
    const { pagePath, oldP, newP, oldA, newA } = c;

    if (oldP.status === 200 && newP.status !== 200) {
      missingOnNew++;
      add('critical', 'NEW_404', `WP 200 but Astro ${newP.status}`, pagePath);
    }
    if (newP.status === 200 && oldP.status === 404) {
      missingOnOld++;
    }
    if (newP.redirected && newP.finalUrl !== newP.url) {
      redirectChains++;
      if (redirectChains <= 5) add('high', 'REDIRECT', `Astro redirects ${pagePath} → ${newP.finalUrl}`, pagePath);
    }

    if (oldA && newA && oldP.status === 200 && newP.status === 200) {
      if (oldA.title !== newA.title) titleDiff++;
      if (oldA.metaDesc !== newA.metaDesc) metaDiff++;
      if (oldA.h1 !== newA.h1) h1Diff++;
      if (oldA.canonical !== newA.canonical) canonDiff++;

      if (newA.robots.includes('noindex') && !oldA.robots.includes('noindex') && pagePath !== '/404/') {
        noindexNew++;
        add('critical', 'NOINDEX', 'New page has noindex but WP did not', pagePath);
      }

      if (!newA.hasJsonLd) {
        noJsonLd++;
        if (noJsonLd <= 3) add('high', 'NO_JSONLD', 'Missing JSON-LD on new page', pagePath);
      }
      if (newA.invalidJsonLd > 0) {
        invalidJsonLd++;
        add('high', 'INVALID_JSONLD', 'Invalid JSON-LD parse error', pagePath);
      }

      if (!newA.ogTitle || !newA.ogUrl) {
        missingOg++;
        if (missingOg <= 3) add('medium', 'MISSING_OG', 'Missing OG title or url', pagePath);
      }

      if (!newA.viewport) add('medium', 'NO_VIEWPORT', 'Missing viewport meta', pagePath);

      // Images without alt (only flag content images, sample)
      for (const img of newA.images) {
        if (!img.hasAlt && img.src && !img.src.startsWith('data:')) {
          missingAlt.push({ pagePath, src: img.src.slice(0, 80) });
        }
        if (img.src === '' || img.src.startsWith('data:image/svg')) {
          if (brokenImages.length < 20) brokenImages.push({ pagePath, src: img.src || '(empty/lazy placeholder)' });
        }
      }

      // CTA check on homepage only
      if (pagePath === '/') {
        const hrefs = newA.ctaLinks.map((x) => x.href || '');
        for (const needle of EXPECTED_CTAS.line) {
          if (!hrefs.some((h) => h?.includes(needle))) {
            ctaIssues.push({ type: 'LINE', needle, pagePath });
          }
        }
        for (const needle of EXPECTED_CTAS.phone) {
          if (!hrefs.some((h) => h?.includes(needle))) {
            ctaIssues.push({ type: 'phone', needle, pagePath });
          }
        }
      }
    }
  }

  if (titleDiff > 0) add('high', 'TITLE_DIFF', `${titleDiff}/${comparisons.length} pages have title differences`);
  if (metaDiff > 0) add('medium', 'META_DIFF', `${metaDiff}/${comparisons.length} pages have meta description differences`);
  if (h1Diff > 0) add('high', 'H1_DIFF', `${h1Diff}/${comparisons.length} pages have H1 differences`);
  if (canonDiff > 0) add('critical', 'CANONICAL_DIFF', `${canonDiff}/${comparisons.length} pages have canonical differences`);
  if (missingOnNew > 0) add('critical', 'MISSING_PAGES', `${missingOnNew} pages return non-200 on Astro`);
  if (noJsonLd > 10) add('high', 'NO_JSONLD_BULK', `${noJsonLd} pages missing JSON-LD`);
  if (missingAlt.length > 100) add('medium', 'MISSING_ALT', `${missingAlt.length} images missing alt text (inherited from WP)`);
  if (brokenImages.length > 0) add('medium', 'LAZY_IMAGES', `${brokenImages.length}+ images use lazy placeholder src in HTML body`);
  for (const cta of ctaIssues) {
    add('high', 'CTA_MISSING', `Missing ${cta.type} link (${cta.needle}) in header/footer`, cta.pagePath);
  }

  // Check 404 page
  const p404 = await fetchHtml(NEW_BASE, '/404/');
  if (p404.status !== 200 && p404.status !== 404) {
    add('high', '404_PAGE', `Custom 404 returns status ${p404.status}`);
  }
  const a404 = p404.html ? analyzePage(p404.html, p404.finalUrl) : null;
  if (a404 && !a404.robots.includes('noindex')) {
    add('medium', '404_NOINDEX', '404 page should have noindex');
  }

  // Internal link spot check on homepage
  if (comparisons[0]?.newA) {
    const homeLinks = comparisons.find((c) => c.pagePath === '/')?.newA?.internalLinks || [];
    const brokenInternal = [];
    for (const link of homeLinks.slice(0, 30)) {
      if (!link || link.startsWith('http')) continue;
      const check = await fetchHtml(NEW_BASE, link);
      if (check.status >= 400) brokenInternal.push({ link, status: check.status });
    }
    for (const b of brokenInternal.slice(0, 5)) {
      add('high', 'BROKEN_INTERNAL', `Internal link ${b.link} returns ${b.status}`, '/');
    }
  }

  const summary = {
    generatedAt: new Date().toISOString(),
    urlsCompared: paths.length,
    missingOnNew,
    missingOnOld,
    changedUrls: changedUrls.length,
    redirectChains,
    titleDiff,
    metaDiff,
    h1Diff,
    canonDiff,
    noindexNew,
    noJsonLd,
    missingOg,
    missingAltCount: missingAlt.length,
    brokenImagesSample: brokenImages.slice(0, 10),
    ctaIssues,
    issues,
    verdict:
      issues.critical.length === 0
        ? issues.high.length === 0
          ? 'SAFE_WITH_MINOR_FIXES'
          : 'FIX_HIGH_BEFORE_LAUNCH'
        : 'NOT_SAFE',
  };

  await mkdir(path.join(ROOT, 'migration'), { recursive: true });
  await writeFile(path.join(ROOT, 'migration', 'prelaunch-audit.json'), JSON.stringify(summary, null, 2), 'utf8');
  console.log('\n=== AUDIT SUMMARY ===');
  console.log(`Critical: ${issues.critical.length}`);
  console.log(`High: ${issues.high.length}`);
  console.log(`Medium: ${issues.medium.length}`);
  console.log(`Verdict: ${summary.verdict}`);
  console.log(`Report: migration/prelaunch-audit.json`);
}

main().catch((e) => { console.error(e); process.exit(1); });
