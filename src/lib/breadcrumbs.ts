import type { PageRecord } from './types';

export interface BreadcrumbItem {
  label: string;
  href: string;
}

export function buildBreadcrumbItems(page: PageRecord): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [{ label: 'หน้าแรก', href: '/' }];
  if (page.path === '/') return items;

  const segments = page.path.split('/').filter(Boolean);
  let acc = '';

  segments.forEach((segment, index) => {
    acc += `/${segment}`;
    const isLast = index === segments.length - 1;
    const decoded = decodeURIComponent(segment);
    items.push({
      label: isLast ? page.seo.h1 || decoded : decoded,
      href: `${acc}/`,
    });
  });

  return items;
}
