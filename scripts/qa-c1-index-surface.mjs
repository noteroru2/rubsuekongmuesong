import { readFileSync } from 'node:fs';
import {
  HOLD_NOINDEX,
  INDEX,
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

assert(indexRoutes.length > 0, 'C1 must retain INDEX routes');
assert(heldRoutes.length > 0, 'C1 must create HOLD_NOINDEX routes');

const provinceRoutes = decisions.filter((item) => item.path.startsWith('/รับซื้อกล้อง/'));
assert(provinceRoutes.length > 0, 'Expected province/service routes under /รับซื้อกล้อง/');
assert(provinceRoutes.every((item) => item.lifecycle === INDEX), 'All /รับซื้อกล้อง/ routes must remain INDEX in C1');

const articleRoutes = decisions.filter((item) => item.path.startsWith('/article/'));
assert(articleRoutes.length > 0, 'Expected editorial routes under /article/');
assert(articleRoutes.every((item) => item.lifecycle === INDEX), 'All /article/ routes must remain INDEX in C1');

const modelRoutes = decisions.filter((item) => item.path.startsWith('/models/'));
assert(modelRoutes.every((item) => item.lifecycle === INDEX), 'All /models/ routes must remain INDEX in C1');

for (const prefix of ['/กล้อง/', '/tag/', '/uncategorized/']) {
  const legacy = decisions.filter((item) => item.path.startsWith(prefix));
  assert(legacy.every((item) => item.lifecycle === HOLD_NOINDEX), `${prefix} must be HOLD_NOINDEX`);
}

const shutter = decisions.find((item) => item.path === '/article/shutter-count/');
if (shutter) assert(shutter.lifecycle === INDEX, 'shutter-count winner must remain INDEX');

assert(
  articleRoutes.every((item) => isEditorialIndexRoute(item)),
  'Editorial policy must recognize /article/ INDEX routes',
);
assert(astroConfig.includes('heldPaths') && astroConfig.includes('getRouteIndexPolicy'), 'Sitemap must use C1 lifecycle policy');
assert(seoHead.includes('HOLD_NOINDEX') && seoHead.includes('noindex, follow'), 'SEOHead must force noindex on HOLD routes');
assert(seoHead.includes("indexPolicy.lifecycle !== HOLD_NOINDEX"), 'FAQ schema must be disabled on HOLD routes');
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
  provinceIndex: provinceRoutes.length,
  articleIndex: articleRoutes.length,
  modelIndex: modelRoutes.length,
  reasons,
}, null, 2));
console.log('CAMERA_C1_INDEX_SURFACE_GATE=PASS');
