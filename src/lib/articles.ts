import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getAllRoutes, getPageByPath } from './content';
import type { PageRecord } from './types';
import { stripHtml } from './seo';
import { OG_DEFAULT_IMAGE } from '../config/site';

export interface ArticleSummary {
  path: string;
  title: string;
  excerpt: string;
  image?: string;
  imageAlt?: string;
  datePublished?: string;
  pageType?: string;
}

const BLOG_INDEX_PATH = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '../data/blog-index.json',
);

const BLOG_PAGE_TYPES = new Set(['post', 'location', 'article']);

let blogPostsCache: ArticleSummary[] | null = null;

function decodeEntities(text: string): string {
  return text
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"');
}

export function extractFeaturedImage(html: string, ogImage?: string): string {
  if (ogImage?.startsWith('/images/')) return ogImage;
  if (ogImage?.includes('/images/uploads/')) {
    const idx = ogImage.indexOf('/images/uploads/');
    return ogImage.slice(idx);
  }

  const patterns = [
    /data-full-image="(\/images\/uploads\/[^"]+)"/i,
    /data-light-image="(\/images\/uploads\/[^"]+)"/i,
    /<img[^>]+src="(\/images\/uploads\/[^"]+)"/i,
    /background-image:\s*url\(['"]?(\/images\/uploads\/[^'")]+)/i,
  ];

  for (const pattern of patterns) {
    const m = html.match(pattern);
    if (m?.[1]) return m[1];
  }

  return OG_DEFAULT_IMAGE;
}

export function extractExcerpt(page: PageRecord, maxLen = 180): string {
  let text = decodeEntities(page.seo.metaDescription || '');
  text = stripHtml(text);
  if (text.length > maxLen) return `${text.slice(0, maxLen).trim()}…`;
  if (text) return text;

  const bodyText = stripHtml(page.bodyHtml || '');
  if (bodyText.length > maxLen) return `${bodyText.slice(0, maxLen).trim()}…`;
  return bodyText;
}

export function formatArticleDate(iso?: string): string {
  if (!iso) return '';
  try {
    return new Intl.DateTimeFormat('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(iso));
  } catch {
    return '';
  }
}

function sortByDateDesc(a: ArticleSummary, b: ArticleSummary): number {
  const da = a.datePublished ? new Date(a.datePublished).getTime() : 0;
  const db = b.datePublished ? new Date(b.datePublished).getTime() : 0;
  return db - da;
}

function buildFromRoutes(): ArticleSummary[] {
  return getAllRoutes()
    .filter((route) => BLOG_PAGE_TYPES.has(route.pageType))
    .map((route) => summarizePage(route.path))
    .filter((item): item is ArticleSummary => item !== null)
    .sort(sortByDateDesc);
}

function loadBlogPosts(): ArticleSummary[] {
  if (blogPostsCache) return blogPostsCache;

  if (existsSync(BLOG_INDEX_PATH)) {
    try {
      const data = JSON.parse(readFileSync(BLOG_INDEX_PATH, 'utf8')) as {
        posts: ArticleSummary[];
      };
      if (Array.isArray(data.posts) && data.posts.length > 0) {
        blogPostsCache = data.posts;
        return blogPostsCache;
      }
    } catch {
      // Fall back to building from route manifest.
    }
  }

  blogPostsCache = buildFromRoutes();
  return blogPostsCache;
}

/** Knowledge articles under /article/ */
export function getArticles(): ArticleSummary[] {
  return loadBlogPosts().filter((p) => p.pageType === 'article');
}

/** All buyback SEO pages: post + location + article (~1,600+). */
export function getBlogPosts(): ArticleSummary[] {
  return loadBlogPosts();
}

export const BLOG_POSTS_PER_PAGE = 10;

export function paginateBlogPosts(posts: ArticleSummary[], page = 1) {
  const totalPages = Math.max(1, Math.ceil(posts.length / BLOG_POSTS_PER_PAGE));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const start = (currentPage - 1) * BLOG_POSTS_PER_PAGE;
  return {
    posts: posts.slice(start, start + BLOG_POSTS_PER_PAGE),
    currentPage,
    totalPages,
    totalPosts: posts.length,
  };
}

/** Live summary when a page isn't in the prebuilt index yet. */
export function summarizePage(pagePath: string): ArticleSummary | null {
  const page = getPageByPath(pagePath);
  if (!page) return null;
  return {
    path: page.path,
    title: page.seo.h1 || page.seo.title,
    excerpt: extractExcerpt(page),
    image: extractFeaturedImage(page.bodyHtml, page.seo.ogImage),
    imageAlt: page.seo.h1,
    datePublished: page.datePublished,
    pageType: page.pageType,
  };
}
