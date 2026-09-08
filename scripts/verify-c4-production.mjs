#!/usr/bin/env node
const BASE_URL = (process.env.CAMERA_BASE_URL || 'https://xn--12cman8e0bjt1czaccb9b1fg31ad.com').replace(/\/$/, '');
const EXPECTED_SHA = '34d15b7fe694840cda14bc89c73c8deabdb0c589';
const WINNER = '/รับซื้อกล้อง/รับซื้อกล้องมือสอง-ขอนแ/';
const ARTICLE = '/article/shutter-count/';
const MODEL = '/models/sony-a7-iv/';
const REDIRECT_SOURCE = '/tag/ร้านรับซื้อกล้อง-นครสวร/';
const REDIRECT_TARGET = '/รับซื้อกล้อง/ร้านรับซื้อกล้องนครสวร/';
const HOLD_SOURCE = '/tag/ร้านรับซื้อกล้อง-สระบุร/';

function assert(condition, message, bucket) {
  if (!condition) bucket.push(message);
}
function normalizePath(path) {
  const decoded = decodeURIComponent(path || '/');
  return decoded === '/' ? '/' : `/${decoded.split('/').filter(Boolean).join('/')}/`;
}
async function get(path, { redirect = 'follow' } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(new URL(path, `${BASE_URL}/`), {
      redirect,
      signal: controller.signal,
      headers: { 'user-agent': 'camera-c4-production-gate/1.0' },
    });
    const text = await res.text();
    return { res, text };
  } finally {
    clearTimeout(timer);
  }
}
function countH1(html) {
  return (html.match(/<h1\b/gi) || []).length;
}
function robotsMeta(html) {
  return html.match(/<meta[^>]+name=["']robots["'][^>]+content=["']([^"']+)["']/i)?.[1]?.toLowerCase() || '';
}
function jsonLdTypes(html) {
  const types = new Set();
  const re = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  function visit(value) {
    if (!value || typeof value !== 'object') return;
    const t = value['@type'];
    if (Array.isArray(t)) t.forEach((x) => types.add(String(x)));
    else if (t) types.add(String(t));
    if (Array.isArray(value)) value.forEach(visit);
    else Object.values(value).forEach(visit);
  }
  while ((match = re.exec(html))) {
    try { visit(JSON.parse(match[1])); } catch {}
  }
  return types;
}
function sitemapLocs(xml) {
  return [...xml.matchAll(/<loc>([\s\S]*?)<\/loc>/gi)].map((m) => m[1].trim().replace(/&amp;/g, '&'));
}
async function collectSitemapUrls() {
  const root = await get('/sitemap-index.xml');
  if (!root.res.ok) throw new Error(`sitemap-index HTTP ${root.res.status}`);
  const locs = sitemapLocs(root.text);
  const xmlLocs = locs.filter((u) => /\.xml(?:$|\?)/i.test(u));
  if (!xmlLocs.length) return locs;
  const urls = [];
  for (const loc of xmlLocs) {
    const child = await get(loc);
    if (!child.res.ok) throw new Error(`sitemap child HTTP ${child.res.status}: ${loc}`);
    urls.push(...sitemapLocs(child.text));
  }
  return urls;
}

const pending = [];
const failures = [];
const evidence = {};

try {
  const fp = await get('/camera-recovery-gate.json');
  if (!fp.res.ok) {
    pending.push(`fingerprint HTTP ${fp.res.status}`);
  } else {
    try {
      const data = JSON.parse(fp.text);
      evidence.fingerprint = data;
      if (data.gate !== 'CAMERA_C4' || data.includesThrough !== 'C3' || data.sourceSha !== EXPECTED_SHA) {
        pending.push('production fingerprint does not match C4/C3 source');
      }
    } catch {
      pending.push('production fingerprint is not valid JSON');
    }
  }
} catch (error) {
  pending.push(`fingerprint unavailable: ${error.message}`);
}

if (!pending.length) {
  try {
    const robots = await get('/robots.txt');
    assert(robots.res.ok, `robots.txt HTTP ${robots.res.status}`, failures);
    assert(!/User-agent:\s*\*[\s\S]{0,250}?Disallow:\s*\/\s*(?:\r?\n|$)/i.test(robots.text), 'robots.txt blocks the whole site', failures);

    for (const [label, path, expectedType, forbiddenType, breadcrumbText] of [
      ['winner', WINNER, 'Service', 'Article', 'รับซื้อกล้องตามจังหวัด'],
      ['article', ARTICLE, 'Article', 'Service', 'บทความกล้อง'],
      ['model', MODEL, 'Service', 'Article', 'รับซื้อกล้องตามรุ่น'],
    ]) {
      const page = await get(path);
      evidence[label] = { status: page.res.status, finalUrl: page.res.url, h1: countH1(page.text) };
      assert(page.res.ok, `${label} HTTP ${page.res.status}`, failures);
      assert(!robotsMeta(page.text).includes('noindex'), `${label} unexpectedly noindex`, failures);
      assert(countH1(page.text) === 1, `${label} must render exactly one H1`, failures);
      const types = jsonLdTypes(page.text);
      assert(types.has(expectedType), `${label} missing ${expectedType} schema`, failures);
      assert(!types.has(forbiddenType), `${label} contains forbidden ${forbiddenType} schema`, failures);
      assert(!types.has('FAQPage'), `${label} still emits FAQPage schema`, failures);
      assert(page.text.includes(breadcrumbText), `${label} missing intent-aware breadcrumb text`, failures);
    }

    const redirect = await get(REDIRECT_SOURCE, { redirect: 'manual' });
    const location = redirect.res.headers.get('location') || '';
    evidence.redirect = { status: redirect.res.status, location };
    assert([301, 308].includes(redirect.res.status), `owner redirect returned ${redirect.res.status}`, failures);
    if (location) {
      const actual = normalizePath(new URL(location, `${BASE_URL}/`).pathname);
      assert(actual === normalizePath(REDIRECT_TARGET), `owner redirect target mismatch: ${actual}`, failures);
    }

    const hold = await get(HOLD_SOURCE, { redirect: 'manual' });
    evidence.hold = { status: hold.res.status, robots: robotsMeta(hold.text), location: hold.res.headers.get('location') || '' };
    assert(hold.res.status === 200, `HOLD legacy route must remain 200, got ${hold.res.status}`, failures);
    assert(robotsMeta(hold.text).includes('noindex'), 'HOLD legacy route missing noindex', failures);
    assert(!hold.res.headers.get('location'), 'HOLD legacy route still redirects', failures);

    const sitemapUrls = await collectSitemapUrls();
    const decoded = sitemapUrls.map((u) => decodeURIComponent(u));
    evidence.sitemapUrlCount = sitemapUrls.length;
    assert(decoded.some((u) => u.includes(normalizePath(WINNER))), 'sitemap missing protected winner', failures);
    assert(decoded.some((u) => u.includes(ARTICLE)), 'sitemap missing article winner', failures);
    assert(decoded.some((u) => u.includes('/models/')), 'sitemap missing models surface', failures);
    assert(!decoded.some((u) => u.includes('/tag/')), 'sitemap still contains /tag/ URLs', failures);
    assert(!decoded.some((u) => u.includes('/uncategorized/')), 'sitemap still contains /uncategorized/ URLs', failures);
    assert(!decoded.some((u) => u.includes('/กล้อง/')), 'sitemap still contains legacy /กล้อง/ URLs', failures);
    assert(!decoded.some((u) => u.includes(normalizePath(REDIRECT_SOURCE))), 'sitemap contains redirect source', failures);
  } catch (error) {
    failures.push(`verification exception: ${error.message}`);
  }
}

const verdict = pending.length ? 'WAIT_FOR_DEPLOY_OR_RECRAWL' : failures.length ? 'NO_GO' : 'PASS';
console.log(JSON.stringify({ verdict, baseUrl: BASE_URL, pending, failures, evidence }, null, 2));
console.log(`CAMERA_C4_PRODUCTION_GATE=${verdict}`);
if (verdict === 'NO_GO') process.exitCode = 1;
