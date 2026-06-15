import type { FAQItem } from './types';
import { PROVINCE_MONEY_PAGE_MAP } from './provinces';
import { BRAND_MONEY_PAGE_MAP } from './brands';
import {
  SHUTTER_COUNT_ENHANCEMENT,
  SHUTTER_COUNT_PATH,
  CAMERA_360_PATH,
  PACK_CAMERA_PATH,
  CATEGORY_HUB_PATH,
  CATEGORY_HUB_ENHANCEMENT,
  ARTICLE_ENHANCEMENT_MAP,
} from './articles';

export * from './types';
export * from './shared';
export { PROVINCE_MONEY_PAGES, PROVINCE_MONEY_PAGE_MAP } from './provinces';
export { BRAND_MONEY_PAGES, BRAND_MONEY_PAGE_MAP } from './brands';
export {
  SHUTTER_COUNT_ENHANCEMENT,
  SHUTTER_COUNT_PATH,
  CAMERA_360_PATH,
  PACK_CAMERA_PATH,
  CATEGORY_HUB_PATH,
  CATEGORY_HUB_ENHANCEMENT,
  CAMERA_360_ENHANCEMENT,
  PACK_CAMERA_ENHANCEMENT,
} from './articles';

export function getProvinceMoneyPage(path: string) {
  return PROVINCE_MONEY_PAGE_MAP.get(path) ?? null;
}

export function getBrandMoneyPage(id: string) {
  return BRAND_MONEY_PAGE_MAP.get(id) ?? null;
}

export function getShutterCountEnhancement(path: string) {
  return path === SHUTTER_COUNT_PATH ? SHUTTER_COUNT_ENHANCEMENT : null;
}

export function getArticleMoneyEnhancement(path: string) {
  return ARTICLE_ENHANCEMENT_MAP.get(path) ?? null;
}

export function getCategoryHubEnhancement(path: string) {
  return path === CATEGORY_HUB_PATH ? CATEGORY_HUB_ENHANCEMENT : null;
}

export function getMoneyPageFaqs(path: string): FAQItem[] {
  const province = getProvinceMoneyPage(path);
  if (province) return province.faqs;

  const shutter = getShutterCountEnhancement(path);
  if (shutter) return shutter.faqs;

  const article = getArticleMoneyEnhancement(path);
  if (article) return article.faqs;

  return [];
}

export function isMoneyPage(path: string): boolean {
  return (
    PROVINCE_MONEY_PAGE_MAP.has(path) ||
    path === SHUTTER_COUNT_PATH ||
    ARTICLE_ENHANCEMENT_MAP.has(path) ||
    path === CATEGORY_HUB_PATH
  );
}

export function isMoneyArticle(path: string): boolean {
  return (
    path === SHUTTER_COUNT_PATH ||
    ARTICLE_ENHANCEMENT_MAP.has(path)
  );
}
