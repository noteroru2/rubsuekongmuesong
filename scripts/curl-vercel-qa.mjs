#!/usr/bin/env node
/**
 * Live curl QA against Vercel deployment URL.
 * Usage: node scripts/curl-vercel-qa.mjs <baseUrl>
 */
import { execSync } from 'node:child_process';

const BASE = (process.argv[2] || '').replace(/\/$/, '');
if (!BASE) {
  console.error('Usage: node scripts/curl-vercel-qa.mjs <baseUrl>');
  process.exit(1);
}

const REDIRECT_TESTS = [
  ['/sitemap_index.xml', '/sitemap-index.xml'],
  ['/tag/ร้านรับซื้อกล้อง-นครสวร/', '/รับซื้อกล้อง/ร้านรับซื้อกล้องนครสวร/'],
  ['/tag/ร้านรับซื้อกล้อง-สกลนคร/', '/รับซื้อกล้อง/ร้านรับซื้อกล้องสกลนคร/'],
  ['/tag/ร้านรับซื้อกล้อง-สระบุร/', '/'],
  [
    '/tag/%E0%B8%A3%E0%B9%89%E0%B8%B2%E0%B8%99%E0%B8%A3%E0%B8%B1%E0%B8%9A%E0%B8%8B%E0%B8%B7%E0%B9%89%E0%B8%AD%E0%B8%81%E0%B8%A5%E0%B9%89%E0%B8%AD%E0%B8%87-%E0%B8%99%E0%B8%84%E0%B8%A3%E0%B8%AA%E0%B8%A7%E0%B8%A3/',
    '/รับซื้อกล้อง/ร้านรับซื้อกล้องนครสวร/',
  ],
  ['/กล้อง/ร้านรับซื้อกล้อง-อุดรธา/', '/รับซื้อกล้อง/ร้านรับซื้อกล้องอุดรธา/'],
  [
    '/%E0%B8%81%E0%B8%A5%E0%B9%89%E0%B8%AD%E0%B8%87/%E0%B8%A3%E0%B9%89%E0%B8%B2%E0%B8%99%E0%B8%A3%E0%B8%B1%E0%B8%9A%E0%B8%8B%E0%B8%B7%E0%B9%89%E0%B8%AD%E0%B8%81%E0%B8%A5%E0%B9%89%E0%B8%AD%E0%B8%87-%E0%B8%AD%E0%B8%B8%E0%B8%94%E0%B8%A3%E0%B8%98%E0%B8%B2/',
    '/รับซื้อกล้อง/ร้านรับซื้อกล้องอุดรธา/',
  ],
  ['/กล้อง/รับซื้อกล้อง-gopro-มือสอง-ขอน/', '/รับซื้อกล้อง/รับซื้อกล้องมือสอง-ขอนแ/'],
  ['/กล้อง/รับซื้อเลนส์กล้องมือสอ-9/', '/models/'],
  ['/กล้อง/รับซื้อ-sony-zv-e10-มือสอง/', '/models/#sony'],
  ['/กล้อง/รับซื้อกล้อง-dslr-มือสอง-สกล/', '/รับซื้อกล้อง/ร้านรับซื้อกล้องสกลนคร/'],
  ['/กล้อง/ร้านรับซื้อกล้อง-สุรินท/', '/รับซื้อกล้อง/ร้านรับซื้อกล้องสุรินท/'],
  ['/รับซื้อกล้อง/รับซื้อกล้องมือสอง-สกลน/', '/รับซื้อกล้อง/ร้านรับซื้อกล้องสกลนคร/'],
  ['/กล้อง/รับซื้อกล้องมือสอง-ใกล-12/', '/'],
];

const STATIC_TESTS = [
  '/',
  '/robots.txt',
  '/sitemap-index.xml',
  '/models/',
  '/process/',
  '/review/',
  '/about/',
  '/article/shutter-count/',
  '/article/วิธีแพ็คกล้อง/',
  '/รับซื้อกล้อง/รับซื้อกล้องมือสอง-ขอนแ/',
  '/รับซื้อกล้อง/ร้านรับซื้อกล้องอุบลรา/',
  '/รับซื้อกล้อง/ร้านรับซื้อกล้องพะเยา/',
  '/รับซื้อกล้อง/รับซื้อกล้องมือสอง-มหาส/',
  '/รับซื้อกล้อง/ร้านรับซื้อกล้องเชียงร/',
];

function curlHeaders(url) {
  const out = execSync(`curl.exe -sI --max-redirs 0 "${url}"`, { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
  const lines = out.split(/\r?\n/).filter(Boolean);
  const statusLine = lines[0] || '';
  const code = parseInt(statusLine.split(' ')[1] || '0', 10);
  const headers = {};
  for (const line of lines.slice(1)) {
    const i = line.indexOf(':');
    if (i > 0) headers[line.slice(0, i).toLowerCase()] = line.slice(i + 1).trim();
  }
  return { code, headers, statusLine };
}

function normLoc(loc) {
  if (!loc) return '';
  try {
    const u = new URL(loc);
    return decodeURIComponent(u.pathname) + u.hash;
  } catch {
    return loc;
  }
}

function normExpect(p) {
  if (!p) return '/';
  if (p.includes('#')) {
    const [base, hash] = p.split('#');
    const b = base.endsWith('/') ? base : `${base}/`;
    return decodeURIComponent(b) + '#' + hash;
  }
  return decodeURIComponent(p.endsWith('/') || p.endsWith('.xml') ? p : `${p}/`);
}

let failed = 0;
let redirectPass = 0;
let staticPass = 0;

console.log(`Base: ${BASE}\n`);

console.log('=== Redirect tests ===\n');
for (const [path, expect] of REDIRECT_TESTS) {
  const url = BASE + path;
  try {
    const { code, headers } = curlHeaders(url);
    const loc = headers.location || '';
    const isPermanent = code === 301 || code === 308;
    const locNorm = normLoc(loc);
    const expNorm = normExpect(expect);

    if (!isPermanent) {
      console.log(`✗ ${path} → HTTP ${code} (expected 301/308)`);
      failed++;
      continue;
    }
    if (!locNorm.includes(expNorm.split('#')[0].replace(/\/$/, '')) && locNorm !== expNorm) {
      const locPath = normLoc(loc);
      if (locPath !== expNorm && !locPath.startsWith(expNorm.replace(/#.*$/, ''))) {
        console.log(`✗ ${path} → ${loc} (expected ${expect})`);
        failed++;
        continue;
      }
    }
  if (expect.includes('#') && !loc.includes('#')) {
      console.log(`✗ ${path} → ${loc} (missing hash, expected ${expect})`);
      failed++;
      continue;
    }

    const follow = curlHeaders(loc.startsWith('http') ? loc : BASE + expect);
    if (follow.code === 301 || follow.code === 308) {
      console.log(`✗ ${path} → chain detected (${code} then ${follow.code})`);
      failed++;
      continue;
    }

    redirectPass++;
    console.log(`✓ ${path} → ${code} ${loc}`);
  } catch (e) {
    console.log(`✗ ${path} ERROR: ${e.message}`);
    failed++;
  }
}

console.log('\n=== Static tests ===\n');
for (const path of STATIC_TESTS) {
  const url = BASE + path;
  try {
    const first = curlHeaders(url);
    let code = first.code;
    let finalUrl = url;
    if ((code === 301 || code === 308) && first.headers.location) {
      console.log(`✗ ${path} → unexpected redirect ${first.headers.location}`);
      failed++;
      continue;
    }
    if (code !== 200) {
      console.log(`✗ ${path} → HTTP ${code}`);
      failed++;
      continue;
    }
    staticPass++;
    console.log(`✓ ${path} → 200`);
  } catch (e) {
    console.log(`✗ ${path} ERROR: ${e.message}`);
    failed++;
  }
}

console.log(`\nRedirect: ${redirectPass}/${REDIRECT_TESTS.length}`);
console.log(`Static: ${staticPass}/${STATIC_TESTS.length}`);
console.log(failed ? `\nFAILED: ${failed}` : '\nALL PASSED');
process.exit(failed ? 1 : 0);
