#!/usr/bin/env node
/**
 * QA Vercel redirects — top 20 GSC URLs, chains, loops, sitemap, robots.
 * Run after: npm run redirects:sync && npm run build
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve('.');
const DIST = path.join(ROOT, 'dist');
const MAX_HOPS = 3;

let failed = 0;
function fail(msg) {
  console.error(`FAIL: ${msg}`);
  failed++;
}

function loadRedirects() {
  const vercel = JSON.parse(fs.readFileSync(path.join(ROOT, 'vercel.json'), 'utf8'));
  return vercel.redirects || [];
}

function normPath(p) {
  if (!p || p === '/') return '/';
  if (p.includes('#')) return p;
  if (p.endsWith('.xml')) return p;
  return p.endsWith('/') ? p : `${p}/`;
}

function matchSource(requestPath, source) {
  const req = requestPath.split('#')[0];
  if (source === req) return true;
  const reqNorm = normPath(req);
  const srcNorm = source.endsWith('.xml') ? source : normPath(source);
  if (srcNorm === reqNorm) return true;
  try {
    if (decodeURIComponent(req) === decodeURIComponent(source)) return true;
    if (normPath(decodeURIComponent(req)) === normPath(decodeURIComponent(source))) return true;
  } catch {
    /* ignore */
  }
  return false;
}

function resolveOnce(pathname, rules) {
  for (const rule of rules) {
    if (matchSource(pathname, rule.source)) {
      return { destination: rule.destination, permanent: rule.permanent !== false };
    }
  }
  return null;
}

function followRedirects(startPath, rules) {
  const chain = [{ path: startPath, status: 'start' }];
  let current = startPath;
  const visited = new Set();

  for (let hop = 0; hop < MAX_HOPS; hop++) {
    if (visited.has(current)) {
      return { chain, loop: true, final: current };
    }
    visited.add(current);

    const hit = resolveOnce(current, rules);
    if (!hit) {
      return { chain, loop: false, final: current };
    }

    const destPath = hit.destination.split('#')[0];
    const destFull = hit.destination;
    chain.push({
      path: destFull,
      status: hit.permanent ? '301' : '302',
    });

    if (matchSource(destPath, current) || destPath === current) {
      return { chain, loop: true, final: destFull };
    }

    const again = resolveOnce(destPath, rules);
    if (again) {
      current = destPath;
      continue;
    }
    return { chain, loop: false, final: destFull };
  }
  return { chain, loop: false, final: current, tooManyHops: true };
}

/** Top 20: high-traffic KEEP destinations + redirect sources from _redirects */
const TOP_20_TESTS = [
  // Redirect sources (must 301)
  { url: '/sitemap_index.xml', expect: '/sitemap-index.xml', type: 'redirect' },
  { url: '/tag/ร้านรับซื้อกล้อง-นครสวร/', expect: '/รับซื้อกล้อง/ร้านรับซื้อกล้องนครสวร/', type: 'redirect' },
  { url: '/tag/ร้านรับซื้อกล้อง-สกลนคร/', expect: '/รับซื้อกล้อง/ร้านรับซื้อกล้องสกลนคร/', type: 'redirect' },
  { url: '/กล้อง/ร้านรับซื้อกล้อง-อุดรธา/', expect: '/รับซื้อกล้อง/ร้านรับซื้อกล้องอุดรธา/', type: 'redirect' },
  { url: '/กล้อง/รับซื้อกล้อง-gopro-มือสอง-ขอน/', expect: '/รับซื้อกล้อง/รับซื้อกล้องมือสอง-ขอนแ/', type: 'redirect' },
  { url: '/กล้อง/รับซื้อเลนส์กล้องมือสอ-9/', expect: '/models/', type: 'redirect' },
  { url: '/กล้อง/รับซื้อ-sony-zv-e10-มือสอง/', expect: '/models/#sony', type: 'redirect' },
  { url: '/กล้อง/รับซื้อกล้อง-dslr-มือสอง-สกล/', expect: '/รับซื้อกล้อง/ร้านรับซื้อกล้องสกลนคร/', type: 'redirect' },
  { url: '/กล้อง/ร้านรับซื้อกล้อง-สุรินท/', expect: '/รับซื้อกล้อง/ร้านรับซื้อกล้องสุรินท/', type: 'redirect' },
  { url: '/รับซื้อกล้อง/รับซื้อกล้องมือสอง-สกลน/', expect: '/รับซื้อกล้อง/ร้านรับซื้อกล้องสกลนคร/', type: 'redirect' },
  { url: '/tag/ร้านรับซื้อกล้อง-สระบุร/', expect: '/', type: 'redirect' },
  { url: '/กล้อง/รับซื้อกล้องมือสอง-ใกล-12/', expect: '/', type: 'redirect' },
  // Encoded Thai (must 301)
  {
    url: '/tag/%E0%B8%A3%E0%B9%89%E0%B8%B2%E0%B8%99%E0%B8%A3%E0%B8%B1%E0%B8%9A%E0%B8%8B%E0%B8%B7%E0%B9%89%E0%B8%AD%E0%B8%81%E0%B8%A5%E0%B9%89%E0%B8%AD%E0%B8%87-%E0%B8%99%E0%B8%84%E0%B8%A3%E0%B8%AA%E0%B8%A7%E0%B8%A3/',
    expect: '/รับซื้อกล้อง/ร้านรับซื้อกล้องนครสวร/',
    type: 'redirect',
  },
  // GSC KEEP pages (must exist in dist — no redirect away)
  { url: '/รับซื้อกล้อง/รับซื้อกล้องมือสอง-ขอนแ/', type: 'static' },
  { url: '/รับซื้อกล้อง/ร้านรับซื้อกล้องอุบลรา/', type: 'static' },
  { url: '/article/shutter-count/', type: 'static' },
  { url: '/article/วิธีแพ็คกล้อง/', type: 'static' },
  { url: '/รับซื้อกล้อง/ร้านรับซื้อกล้องพะเยา/', type: 'static' },
  { url: '/รับซื้อกล้อง/รับซื้อกล้องมือสอง-มหาส/', type: 'static' },
  { url: '/รับซื้อกล้อง/ร้านรับซื้อกล้องเชียงร/', type: 'static' },
  { url: '/', type: 'static' },
];

function distExists(urlPath) {
  const clean = urlPath.split('#')[0];
  if (clean === '/') return fs.existsSync(path.join(DIST, 'index.html'));
  if (clean.endsWith('.xml')) return fs.existsSync(path.join(DIST, clean.replace(/^\//, '')));
  const rel = clean.replace(/^\//, '').replace(/\/$/, '');
  return fs.existsSync(path.join(DIST, rel, 'index.html'));
}

function main() {
  const rules = loadRedirects();
  let redirectPass = 0;
  let staticPass = 0;

  console.log('=== Redirect QA (top 20) ===\n');
  console.log(`vercel.json rules: ${rules.length}\n`);

  for (const t of TOP_20_TESTS) {
    if (t.type === 'redirect') {
      const result = followRedirects(t.url, rules);
      const final = result.final;
      const expected = t.expect;

      if (result.loop) {
        fail(`${t.url}: redirect loop detected`);
        console.log(`✗ ${t.url} → LOOP`);
        continue;
      }
      if (result.tooManyHops) {
        fail(`${t.url}: redirect chain > ${MAX_HOPS} hops`);
        console.log(`✗ ${t.url} → TOO MANY HOPS`);
        continue;
      }
      if (result.chain.filter((c) => c.status === '301' || c.status === '302').length > 1) {
        fail(`${t.url}: redirect chain > 1 hop: ${result.chain.map((c) => c.path).join(' → ')}`);
        console.log(`✗ ${t.url} → chain`);
        continue;
      }

      const finalNorm = normPath(final.split('#')[0]) + (final.includes('#') ? `#${final.split('#')[1]}` : '');
      const expectNorm =
        expected.includes('#')
          ? `${normPath(expected.split('#')[0])}#${expected.split('#')[1]}`
          : normPath(expected);

      if (finalNorm !== expectNorm && final !== expected) {
        fail(`${t.url}: expected ${expected}, got ${final}`);
        console.log(`✗ ${t.url} → ${final} (expected ${expected})`);
        continue;
      }
      redirectPass++;
      console.log(`✓ ${t.url} → ${final}`);
    } else {
      const result = followRedirects(t.url, rules);
      const redirected = result.chain.some((c) => c.status === '301' || c.status === '302');
      if (redirected) {
        fail(`${t.url}: GSC KEEP page should not redirect (got ${result.final})`);
        console.log(`✗ ${t.url} redirected to ${result.final}`);
        continue;
      }
      if (!distExists(t.url)) {
        fail(`${t.url}: missing in dist/`);
        console.log(`✗ ${t.url} not in dist`);
        continue;
      }
      staticPass++;
      console.log(`✓ ${t.url} (200 static)`);
    }
  }

  console.log('\n=== Infrastructure ===\n');
  if (fs.existsSync(path.join(DIST, 'robots.txt'))) {
    console.log('✓ /robots.txt');
  } else {
    fail('robots.txt missing in dist');
    console.log('✗ /robots.txt');
  }
  if (fs.existsSync(path.join(DIST, 'sitemap-index.xml'))) {
    console.log('✓ /sitemap-index.xml');
  } else {
    fail('sitemap-index.xml missing in dist');
    console.log('✗ /sitemap-index.xml');
  }

  const sitemapRedirect = followRedirects('/sitemap_index.xml', rules);
  if (sitemapRedirect.final !== '/sitemap-index.xml') {
    fail(`sitemap redirect wrong: ${sitemapRedirect.final}`);
  }

  console.log(`\nRedirect tests: ${redirectPass}/${TOP_20_TESTS.filter((t) => t.type === 'redirect').length}`);
  console.log(`Static tests: ${staticPass}/${TOP_20_TESTS.filter((t) => t.type === 'static').length}`);

  if (failed) {
    console.error(`\nQA FAILED (${failed} checks)`);
    process.exit(1);
  }
  console.log('\nQA PASSED');
}

main();
