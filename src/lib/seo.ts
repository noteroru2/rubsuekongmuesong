import type { PageSEO } from './types';

export function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function countWords(html: string): number {
  const text = stripHtml(html);
  if (!text) return 0;
  return text.split(/\s+/).filter(Boolean).length;
}

export function extractFirstH1(html: string): string {
  const match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (!match) return '';
  return stripHtml(match[1]);
}

export function extractInternalLinks(html: string, siteHost: string): string[] {
  const links = new Set<string>();
  const regex = /href=["']([^"']+)["']/gi;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(html)) !== null) {
    const href = match[1];
    if (href.startsWith('/') || href.includes(siteHost)) {
      links.add(href.split('#')[0]);
    }
  }
  return [...links].sort();
}

export function normalizePath(pathname: string): string {
  let path = pathname;
  try {
    path = decodeURIComponent(pathname);
  } catch {
    path = pathname;
  }
  if (!path.startsWith('/')) path = `/${path}`;
  if (!path.endsWith('/')) path = `${path}/`;
  return path;
}

export function pathToSlugParam(path: string): string {
  return path.replace(/^\//, '').replace(/\/$/, '');
}

export function mergeSeo(base: PageSEO, override?: Partial<PageSEO>): PageSEO {
  return { ...base, ...override };
}
