import { readFileSync } from 'node:fs';
import {
  PAGE_INTENTS,
  classifyPageIntent,
  getIntentBreadcrumbParent,
  getOpenGraphType,
} from '../src/lib/pageIntent.js';
import { countH1, sanitizeImportedHeadings } from '../src/lib/contentHygiene.js';
import { INDEX, getRouteIndexPolicy } from '../src/lib/indexPolicy.js';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const manifest = JSON.parse(readFileSync(new URL('../src/data/routes-manifest.json', import.meta.url), 'utf8'));
const schemaSource = readFileSync(new URL('../src/lib/schema.ts', import.meta.url), 'utf8');
const seoHead = readFileSync(new URL('../src/components/SEOHead.astro', import.meta.url), 'utf8');
const contentLayout = readFileSync(new URL('../src/layouts/ContentLayout.astro', import.meta.url), 'utf8');
const breadcrumbSource = readFileSync(new URL('../src/lib/breadcrumbs.ts', import.meta.url), 'utf8');

const localProbe = {
  path: '/รับซื้อกล้อง/รับซื้อกล้องมือสอง-ขอนแ/',
  pageType: 'location',
  seo: { h1: 'รับซื้อกล้องมือสอง ขอนแก่น', title: 'รับซื้อกล้องมือสอง ขอนแก่น', metaDescription: '' },
};
const guideProbe = {
  path: '/article/shutter-count/',
  pageType: 'article',
  seo: { h1: 'วิธีเช็ก Shutter Count', title: 'วิธีเช็ก Shutter Count', metaDescription: '' },
};
const articleProbe = {
  path: '/article/ข่าวกล้องมือสอง/',
  pageType: 'article',
  seo: { h1: 'ตลาดกล้องมือสอง', title: 'ตลาดกล้องมือสอง', metaDescription: '' },
};
const modelProbe = {
  path: '/models/sony-a7-iv/',
  pageType: 'article',
  seo: { h1: 'รับซื้อ Sony A7 IV', title: 'รับซื้อ Sony A7 IV', metaDescription: '' },
};

assert(classifyPageIntent(localProbe) === PAGE_INTENTS.LOCAL_SERVICE, 'Province page must be LOCAL_SERVICE');
assert(classifyPageIntent(guideProbe) === PAGE_INTENTS.GUIDE, 'Guide must be GUIDE');
assert(classifyPageIntent(articleProbe) === PAGE_INTENTS.ARTICLE, 'Editorial article must be ARTICLE');
assert(classifyPageIntent(modelProbe) === PAGE_INTENTS.MODEL_SERVICE, 'Model page must override imported article type');
assert(getOpenGraphType(modelProbe) === 'website', 'Model service og:type must be website');
assert(getOpenGraphType(guideProbe) === 'article', 'Guide og:type must be article');
assert(getIntentBreadcrumbParent(localProbe)?.href === '/category/รับซื้อกล้อง/', 'Local service breadcrumb parent must be service hub');
assert(getIntentBreadcrumbParent(modelProbe)?.href === '/models/', 'Model breadcrumb parent must be models hub');
assert(getIntentBreadcrumbParent(guideProbe)?.href === '/blog/', 'Editorial breadcrumb parent must be blog');

const dirtyHtml = '<h1 class="hero">Imported H1</h1><p>Body</p><h1>Second H1</h1>';
const cleanHtml = sanitizeImportedHeadings(dirtyHtml);
assert(countH1(cleanHtml) === 0, 'Imported H1 sanitizer must remove all H1 tags');
assert((cleanHtml.match(/<h2\b/gi) || []).length === 2, 'Imported H1 content must be preserved as H2');

const indexedRoutes = manifest.routes.filter((route) => getRouteIndexPolicy(route).lifecycle === INDEX);
const provinceRoutes = indexedRoutes.filter((route) => decodeURIComponent(route.path).startsWith('/รับซื้อกล้อง/'));
const articleRoutes = indexedRoutes.filter((route) => decodeURIComponent(route.path).startsWith('/article/'));
assert(provinceRoutes.length > 0, 'Expected indexed province routes');
assert(articleRoutes.length > 0, 'Expected indexed article routes');
assert(provinceRoutes.every((route) => classifyPageIntent(route) === PAGE_INTENTS.LOCAL_SERVICE), 'All indexed province routes must classify LOCAL_SERVICE');
assert(articleRoutes.every((route) => [PAGE_INTENTS.GUIDE, PAGE_INTENTS.ARTICLE].includes(classifyPageIntent(route))), 'All indexed /article/ routes must be editorial');

assert(schemaSource.includes('classifyPageIntent'), 'Schema must use C3 intent classifier');
assert(schemaSource.includes("'@type': 'Service'"), 'Schema must emit Service for service intent');
assert(schemaSource.includes("'@type': 'Article'"), 'Schema must emit Article for editorial intent');
assert(!schemaSource.includes('if (page.schemaGraph?.length)'), 'Imported WordPress schemaGraph must not bypass C3 schema');
assert(!schemaSource.includes("'@type': 'FAQPage'"), 'C3 schema must not emit FAQPage');
assert(seoHead.includes('getOpenGraphType'), 'SEOHead must derive og:type from intent');
assert(!seoHead.includes('buildGenericFaq'), 'SEOHead must not use generic FAQ fallback');
assert(!seoHead.includes('extractFaqFromHtml'), 'SEOHead must not infer FAQ from arbitrary headings');
assert(!seoHead.includes('FAQPage'), 'SEOHead must not emit FAQPage JSON-LD');
assert(contentLayout.includes('sanitizeImportedHeadings'), 'Content layout must sanitize imported H1s');
assert(contentLayout.includes('classifyPageIntent'), 'Content layout must use C3 intent classifier');
assert(contentLayout.includes('{isEditorialPage && <RelatedPosts'), 'RelatedPosts must be limited to editorial non-money pages');
assert(breadcrumbSource.includes('getIntentBreadcrumbParent'), 'Visible breadcrumbs must use intent-aware parent');

console.log(JSON.stringify({
  indexedRoutes: indexedRoutes.length,
  indexedProvinceRoutes: provinceRoutes.length,
  indexedArticleRoutes: articleRoutes.length,
  intents: {
    localService: classifyPageIntent(localProbe),
    guide: classifyPageIntent(guideProbe),
    article: classifyPageIntent(articleProbe),
    model: classifyPageIntent(modelProbe),
  },
}, null, 2));
console.log('CAMERA_C3_TEMPLATE_SCHEMA_HYGIENE_GATE=PASS');
