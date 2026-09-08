// Camera C3 — page intent classifier shared by templates and schema.
// Keep dependency-free so Node QA can import it directly.

export const PAGE_INTENTS = Object.freeze({
  HOME: 'HOME',
  LOCAL_SERVICE: 'LOCAL_SERVICE',
  SERVICE: 'SERVICE',
  MODEL_SERVICE: 'MODEL_SERVICE',
  GUIDE: 'GUIDE',
  ARTICLE: 'ARTICLE',
  STATIC: 'STATIC',
});

const GUIDE_TERMS = [
  'วิธี',
  'คู่มือ',
  'เช็ก',
  'เช็ค',
  'ตรวจสอบ',
  'คืออะไร',
  'มีกี่',
  'กี่ชนิด',
  'กี่ประเภท',
  'ขั้นตอน',
  'เตรียม',
  'เลือกซื้อ',
  'เปรียบเทียบ',
  'vs',
  'shutter',
];

function normalizePath(input = '/') {
  let value = String(input || '/').trim();
  try {
    if (/^https?:\/\//i.test(value)) value = new URL(value).pathname;
  } catch {
    // Preserve path-like input.
  }
  try {
    value = decodeURIComponent(value);
  } catch {
    // Preserve undecodable input.
  }
  if (!value.startsWith('/')) value = `/${value}`;
  value = value.replace(/\/{2,}/g, '/');
  if (value !== '/' && !value.endsWith('/')) value += '/';
  return value;
}

function pageText(page) {
  return [page?.path, page?.seo?.h1, page?.seo?.title, page?.seo?.metaDescription]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

export function classifyPageIntent(page) {
  const path = normalizePath(page?.path || '/');
  const pageType = String(page?.pageType || '');
  const text = pageText(page);

  if (path === '/' || pageType === 'homepage') return PAGE_INTENTS.HOME;

  // Path ownership takes precedence over imported WordPress pageType.
  if (path.startsWith('/รับซื้อกล้อง/')) return PAGE_INTENTS.LOCAL_SERVICE;
  if (path.startsWith('/models/')) return PAGE_INTENTS.MODEL_SERVICE;

  if (path === '/category/รับซื้อกล้อง/' || path === '/category/article/') {
    return path === '/category/รับซื้อกล้อง/' ? PAGE_INTENTS.SERVICE : PAGE_INTENTS.STATIC;
  }

  if (path.startsWith('/article/')) {
    return GUIDE_TERMS.some((term) => text.includes(term))
      ? PAGE_INTENTS.GUIDE
      : PAGE_INTENTS.ARTICLE;
  }

  if (pageType === 'location') return PAGE_INTENTS.LOCAL_SERVICE;
  if (pageType === 'article' || pageType === 'post') {
    return GUIDE_TERMS.some((term) => text.includes(term))
      ? PAGE_INTENTS.GUIDE
      : PAGE_INTENTS.ARTICLE;
  }

  if (/รับซื้อกล้อง|ขายกล้องมือสอง|ประเมินราคากล้อง/i.test(text)) {
    return PAGE_INTENTS.SERVICE;
  }

  return PAGE_INTENTS.STATIC;
}

export function isServiceIntent(pageOrIntent) {
  const intent = typeof pageOrIntent === 'string' ? pageOrIntent : classifyPageIntent(pageOrIntent);
  return [PAGE_INTENTS.LOCAL_SERVICE, PAGE_INTENTS.SERVICE, PAGE_INTENTS.MODEL_SERVICE].includes(intent);
}

export function isEditorialIntent(pageOrIntent) {
  const intent = typeof pageOrIntent === 'string' ? pageOrIntent : classifyPageIntent(pageOrIntent);
  return [PAGE_INTENTS.GUIDE, PAGE_INTENTS.ARTICLE].includes(intent);
}

export function getOpenGraphType(page) {
  return isEditorialIntent(page) ? 'article' : 'website';
}

export function getIntentBreadcrumbParent(page) {
  const intent = classifyPageIntent(page);
  if (intent === PAGE_INTENTS.LOCAL_SERVICE) {
    return { label: 'รับซื้อกล้องตามจังหวัด', href: '/category/รับซื้อกล้อง/' };
  }
  if (intent === PAGE_INTENTS.MODEL_SERVICE) {
    return { label: 'รับซื้อกล้องตามรุ่น', href: '/models/' };
  }
  if (isEditorialIntent(intent)) {
    return { label: 'บทความกล้อง', href: '/blog/' };
  }
  return null;
}
