import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  INDEX,
  HOLD_NOINDEX,
  REDIRECT,
  getRouteIndexPolicy,
  isRoutableRoute,
  normalizeIndexPath,
} from '../src/lib/indexPolicy.js';
import { getLegacyRedirectEntries } from '../src/lib/legacyOwnership.js';

const manifest = JSON.parse(readFileSync(new URL('../src/data/routes-manifest.json', import.meta.url), 'utf8'));
const redirectsText = readFileSync(new URL('../public/_redirects', import.meta.url), 'utf8');
const vercel = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));
const dynamicRoute = readFileSync(new URL('../src/pages/[...path].astro', import.meta.url), 'utf8');
const astroConfig = readFileSync(new URL('../astro.config.mjs', import.meta.url), 'utf8');

const routesByPath = new Map(
  manifest.routes.map((route) => [normalizeIndexPath(route.path), route]),
);
const entries = getLegacyRedirectEntries();

assert.ok(entries.length >= 40, `expected >=40 curated C2 redirects, got ${entries.length}`);

for (const { source, destination } of entries) {
  assert.notEqual(destination, '/', `homepage fallback forbidden: ${source}`);
  assert.notEqual(source, destination, `self redirect: ${source}`);

  const sourcePolicy = getRouteIndexPolicy({ path: source });
  assert.equal(sourcePolicy.lifecycle, REDIRECT, `source must be REDIRECT: ${source}`);
  assert.equal(sourcePolicy.ownerPath, destination, `owner mismatch: ${source}`);
  assert.equal(isRoutableRoute({ path: source }), false, `redirect source must not render: ${source}`);

  const ownerBase = normalizeIndexPath(destination.split('#')[0]);
  const ownerRoute = routesByPath.get(ownerBase) || { path: ownerBase, pageType: 'page' };
  assert.equal(
    getRouteIndexPolicy(ownerRoute).lifecycle,
    INDEX,
    `redirect owner must be INDEX: ${source} -> ${destination}`,
  );
}

for (const line of redirectsText.split(/\r?\n/)) {
  const t = line.trim();
  if (!t || t.startsWith('#')) continue;
  const parts = t.split(/\s+/);
  if (parts[2] === '301') {
    assert.notEqual(parts[1], '/', `public/_redirects homepage fallback: ${parts[0]}`);
  }
}

for (const rule of vercel.redirects || []) {
  assert.notEqual(rule.destination, '/', `vercel homepage fallback: ${rule.source}`);
}

assert.equal(
  getRouteIndexPolicy({ path: '/tag/ร้านรับซื้อกล้อง-สระบุร/', pageType: 'tag' }).lifecycle,
  HOLD_NOINDEX,
  'Saraburi tag has no exact owner and must remain HOLD',
);
assert.equal(
  getRouteIndexPolicy({ path: '/tag/รับซื้อกล้องมือสอง-สระแ/', pageType: 'tag' }).lifecycle,
  HOLD_NOINDEX,
  'Sa Kaeo tag has no exact owner and must remain HOLD',
);
assert.equal(
  getRouteIndexPolicy({ path: '/รับซื้อกล้อง/รับซื้อกล้องมือสอง-ขอนแ/', pageType: 'location' }).lifecycle,
  INDEX,
  'Khon Kaen winner must remain INDEX',
);
assert.equal(
  getRouteIndexPolicy({ path: '/article/shutter-count/', pageType: 'article' }).lifecycle,
  INDEX,
  'shutter-count winner must remain INDEX',
);

assert.match(dynamicRoute, /isRoutableRoute/, 'dynamic route must exclude REDIRECT/GONE');
assert.match(astroConfig, /buildAstroRedirects/, 'Astro redirect fallback must use C2 ownership map');

console.log(`C2_OWNERSHIP_GATE=PASS redirects=${entries.length} vercel_rules=${(vercel.redirects || []).length}`);
