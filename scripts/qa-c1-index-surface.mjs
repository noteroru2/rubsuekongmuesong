import { readFileSync } from 'node:fs';
import {
  HOLD_NOINDEX,
  INDEX,
  REDIRECT,
  getRouteIndexPolicy,
  isEditorialIndexRoute,
  normalizeIndexPath,
} from '../src/lib/indexPolicy.js';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const manifest = JSON.parse(readFileSync(new URL('../src/data/routes-manifest.json', import.meta.url), 'utf8'));
const astroConfig = readFileSync(new URL('../astro.config.mjs', import.meta.url), 'utf8');
const seoHead = readFileSync(new URL('../src/components/SEOHead.astro', import.meta.url), 'utf8');
const articles = readFileSync(new URL('../src/lib/articles.ts', import.meta.url), 'utf8');
const blogGenerator = readFileSync(new URL('./generate-blog-index.mjs', import.meta.url), 'utf8');

const decisions = manifest.routes.map((route) => ({
  path: normalizeIndexPath(route.path),
  pageType: route.pageType,
  ...getRouteIndexPolicy(route),
}));
const indexRoutes = decisions.filter((item) => item.lifecycle === INDEX);
const heldRoutes = decisions.filter((item) => item.lifecycle === HOLD_NOINDEX);
const redirectRoutes = decisions.filter((item) => item.lifecycle === REDIRECT);

assert(indexRoutes.length > 0, 'C1 must retain INDEX routes');
assert(heldRoutes.length > 0, 'C1 must retain HOLD_NOINDEX routes');

const provinceRoutes = decisions.filter((item) => item.path.startsWith('/รับซื้อกล้อง/'));
assert(provinceRoutes.length > 0, 'Expected province/service routes under /รับซื้อกล้อง/');
assert(
  provinceRoutes.every((item) => [INDEX, REDIRECT].includes(item.lifecycle)),
  'Province family may only be INDEX or exact-owner REDIRECT',
);

const articleRoutes = decisions.filter((item) => item.path.startsWith('/article/'));
assert(articleRoutes.length > 0, 'Expected editorial routes under /article/');
assert(articleRoutes.every((item) => item.lifecycle === INDEX), 'All /article/ routes must remain INDEX');

const modelRoutes = decisions.filter((item) => item.path.startsWith('/models/'));
assert(modelRoutes.every((item) => item.lifecycle === INDEX), 'All /models/ routes must remain INDEX');

for (const prefix of ['/กล้อง/', '/tag/', '/uncategorized/']) {
  const legacy = decisions.filter((item) => item.path.startsWith(prefix));
  assert(
    legacy.every((item) => [HOLD_NOINDEX, REDIRECT].includes(item.lifecycle)),
    `${prefix} may only be HOLD_NOINDEX or exact-owner REDIRECT`,
  );
}

const shutter = decisions.find((item) => item.path === '/article/shutter-count/');
if (shutter) assert(shutter.lifecycle === INDEX, 'shutter-count winner must remain INDEX');

const khonKaen = decisions.find((item) => item.path === '/รับซื้อกล้อง/รับซื้อกล้องมือสอง-ขอนแ/');
if (khonKaen) assert(khonKaen.lifecycle === INDEX, 'Khon Kaen winner must remain INDEX');

assert(
  articleRoutes.every((item) => isEditorialIndexRoute(item)),
  'Editorial policy must recognize /article/ INDEX routes',
);
assert(
  astroConfig.includes('nonIndexPaths') && astroConfig.includes('isIndexableRoute'),
  'Sitemap must use lifecycle indexability policy',
);
assert(
  seoHead.includes('indexPolicy.lifecycle !== INDEX') && seoHead.includes('noindex, follow'),
  'SEOHead must force noindex on non-INDEX rendered routes',
);
assert(
  seoHead.includes('indexPolicy.lifecycle === INDEX'),
  'FAQ schema must be limited to INDEX routes',
);
assert(articles.includes('isEditorialIndexRoute'), 'Blog runtime must filter through editorial index policy');
assert(blogGenerator.includes('isEditorialIndexRoute'), 'Blog prebuild must filter through editorial index policy');

const reasons = decisions.reduce((acc, item) => {
  acc[item.reason] = (acc[item.reason] || 0) + 1;
  return acc;
}, {});

console.log(JSON.stringify({
  totalRoutes: decisions.length,
  index: indexRoutes.length,
  holdNoindex: heldRoutes.length,
  redirects: redirectRoutes.length,
  provinceFamily: provinceRoutes.length,
  articleIndex: articleRoutes.length,
  modelIndex: modelRoutes.length,
  reasons,
}, null, 2));
console.log('CAMERA_C1_INDEX_SURFACE_GATE=PASS');
