import type { PageRecord } from './types';

export const PAGE_INTENTS: Readonly<{
  HOME: 'HOME';
  LOCAL_SERVICE: 'LOCAL_SERVICE';
  SERVICE: 'SERVICE';
  MODEL_SERVICE: 'MODEL_SERVICE';
  GUIDE: 'GUIDE';
  ARTICLE: 'ARTICLE';
  STATIC: 'STATIC';
}>;

export type PageIntent = (typeof PAGE_INTENTS)[keyof typeof PAGE_INTENTS];

export function classifyPageIntent(page: Partial<PageRecord>): PageIntent;
export function isServiceIntent(pageOrIntent: Partial<PageRecord> | PageIntent): boolean;
export function isEditorialIntent(pageOrIntent: Partial<PageRecord> | PageIntent): boolean;
export function getOpenGraphType(page: Partial<PageRecord>): 'article' | 'website';
export function getIntentBreadcrumbParent(page: Partial<PageRecord>): { label: string; href: string } | null;
