import type { PageRecord } from './types';
import { getIntentBreadcrumbParent } from './pageIntent.js';

export interface BreadcrumbItem {
  label: string;
  href: string;
}

export function buildBreadcrumbItems(page: PageRecord): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [{ label: 'หน้าแรก', href: '/' }];
  if (page.path === '/') return items;

  const parent = getIntentBreadcrumbParent(page);
  if (parent && parent.href !== page.path) {
    items.push(parent);
  }

  items.push({
    label: page.seo.h1 || page.seo.title,
    href: page.path,
  });

  return items;
}
