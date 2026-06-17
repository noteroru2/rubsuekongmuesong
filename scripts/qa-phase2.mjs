#!/usr/bin/env node
/**
 * Phase 2 QA — redirects prep, real image slots, og dedupe, trust wording.
 * Run after: npm run build && npm run images:audit
 */
import fs from 'node:fs';
import path from 'node:path';

const DIST = path.resolve('dist');
const CONTENT = path.resolve('src/data/content');
const SITE_IMAGES_TS = path.resolve('src/lib/siteImages.ts');

const PAGES = ['/', '/models/', '/process/', '/review/', '/about/', '/blog/'];
let failed = 0;

function fail(msg) {
  console.error(`FAIL: ${msg}`);
  failed++;
}

function readDist(pagePath) {
  const file =
    pagePath === '/'
      ? path.join(DIST, 'index.html')
      : path.join(DIST, pagePath.replace(/^\//, ''), 'index.html');
  return fs.readFileSync(file, 'utf8');
}

// 1. Real trust slots in siteImages.ts
const siteSrc = fs.readFileSync(SITE_IMAGES_TS, 'utf8');
const realKeys = [...siteSrc.matchAll(/^\s+(real\w+):/gm)].map((m) => m[1]);
const requiredReal = [
  'realLineChat1',
  'realLineChat2',
  'realTransferSlip1',
  'realTransferSlip2',
  'realStorefrontWide',
  'realOwnerTeam',
  'realInspectionDesk',
  'realGoogleBusiness',
];
for (const k of requiredReal) {
  if (!realKeys.includes(k)) fail(`Missing REAL_TRUST slot: ${k}`);
}
if (realKeys.length !== new Set(realKeys).size) {
  fail('Duplicate keys in REAL_TRUST_IMAGES');
}
if (!siteSrc.includes("status: 'placeholder'")) {
  fail('REAL_TRUST_IMAGES should remain placeholder until photos ready');
}

// 2. Real placeholders not used in dist / no false claims
for (const pagePath of PAGES) {
  const html = readDist(pagePath);
  if (html.includes('รีวิวจริง')) {
    fail(`${pagePath}: contains forbidden wording "รีวิวจริง"`);
  }
  if (html.includes('/images/site/real/')) {
    fail(`${pagePath}: uses unreleased /images/site/real/ path`);
  }
}
for (const p of ['/review/', '/about/']) {
  const html = readDist(p);
  if (!html.includes('ตัวอย่าง')) {
    fail(`${p}: missing safe "ตัวอย่าง" wording`);
  }
}

// 4. ogImage duplicate count for original 6 groups
const ORIGINAL_DUP_IMAGES = [
  '/images/uploads/2025/06/รับซื้อกล้องมือสอง.webp',
  '/images/uploads/2025/07/รับซื้อกล้องถึงหน้าบ้าน.webp',
  '/images/uploads/2025/07/กล้องมือสอง-รับซื้อ.webp',
  '/images/uploads/2025/07/รับซื้อกล้องใกล้ฉัน.webp',
  '/images/uploads/2025/07/รับซื้อกล้องมือสองทุกรุ่น.webp',
  '/images/uploads/2025/07/1-300x72.webp',
];

const ogCount = new Map();
for (const f of fs.readdirSync(CONTENT).filter((x) => x.endsWith('.json'))) {
  const doc = JSON.parse(fs.readFileSync(path.join(CONTENT, f), 'utf8'));
  const img = doc.seo?.ogImage;
  if (!img) continue;
  ogCount.set(img, (ogCount.get(img) || 0) + 1);
}

for (const img of ORIGINAL_DUP_IMAGES) {
  const c = ogCount.get(img) || 0;
  if (img === '/images/uploads/2025/07/1-300x72.webp' && c > 0) {
    fail(`CTA ogImage still used: ${img} (${c} pages)`);
  }
  if (img === '/images/uploads/2025/07/รับซื้อกล้องใกล้ฉัน.webp' && c > 5) {
    fail(`Mass duplicate ogImage: ${img} (${c} pages)`);
  }
}

const badOgRemaining = ORIGINAL_DUP_IMAGES.filter((img) => {
  const c = ogCount.get(img) || 0;
  if (img === '/images/uploads/2025/06/รับซื้อกล้องมือสอง.webp') return c > 2;
  if (img === '/images/uploads/2025/07/1-300x72.webp') return c > 0;
  return c > 2;
});

if (badOgRemaining.length) {
  fail(`Original duplicate groups still oversized: ${badOgRemaining.join(', ')}`);
}

// 5. Reports exist
for (const f of ['redirect-sync-report.md', 'dns-cutover-checklist.md', 'real-image-shot-list.md']) {
  if (!fs.existsSync(path.resolve(f))) fail(`Missing ${f}`);
}

console.log('Phase 2 QA checks:');
console.log(`  REAL_TRUST_IMAGES slots: ${realKeys.length}`);
console.log(`  Original 6-group CTA (1-300x72): ${ogCount.get('/images/uploads/2025/07/1-300x72.webp') || 0} pages`);
console.log(`  รับซื้อกล้องใกล้ฉัน mass dup: ${ogCount.get('/images/uploads/2025/07/รับซื้อกล้องใกล้ฉัน.webp') || 0} pages`);

const totalDupGroups = [...ogCount.entries()].filter(([, c]) => c > 1).length;
console.log(`  Total ogImage duplicate groups (site-wide): ${totalDupGroups}`);

if (failed) {
  console.error(`\nQA FAILED (${failed} checks)`);
  process.exit(1);
}
console.log('\nQA PASSED');
