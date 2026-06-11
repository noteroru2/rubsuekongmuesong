export type PageType =
  | 'homepage'
  | 'page'
  | 'article'
  | 'post'
  | 'location'
  | 'category'
  | 'tag'
  | 'author'
  | 'archive';

export interface PageSEO {
  title: string;
  metaDescription: string;
  canonical: string;
  h1: string;
  ogTitle?: string;
  ogDescription?: string;
  ogUrl?: string;
  ogImage?: string;
  ogType?: string;
  robots?: string;
  wordCount?: number;
}

export interface PageRecord {
  id: string;
  oldUrl: string;
  path: string;
  pageType: PageType;
  seo: PageSEO;
  bodyHtml: string;
  schemaGraph?: Record<string, unknown>[];
  datePublished?: string;
  dateModified?: string;
  tags?: string[];
  categories?: string[];
  notes?: string;
}

export interface RouteEntry {
  path: string;
  contentFile: string;
  pageType: PageType;
}

export interface RoutesManifest {
  siteUrl: string;
  generatedAt: string;
  totalPages: number;
  routes: RouteEntry[];
}

export interface RedirectRule {
  source: string;
  destination: string;
  permanent: boolean;
  reason: string;
}
