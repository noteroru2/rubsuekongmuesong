// Camera C1/C2 — central index-surface lifecycle policy.
// Dependency-free so Astro config, build scripts, and app code use one policy.

import { getLegacyRedirectOwner } from './legacyOwnership.js';

export const INDEX = 'INDEX';
export const HOLD_NOINDEX = 'HOLD_NOINDEX';
export const REDIRECT = 'REDIRECT';
export const GONE = 'GONE';

const INDEX_PREFIXES = [
  '/รับซื้อกล้อง/',
  '/article/',
  '/models/',
  '/blog/',
];

const INDEX_EXACT = new Set([
  '/',
  '/about/',
  '/process/',
  '/review/',
  '/category/article/',
  '/category/รับซื้อกล้อง/',
]);

const HOLD_PREFIXES = [
  '/กล้อง/',
  '/tag/',
  '/uncategorized/',
  '/author/',
];

export function normalizeIndexPath(input = '/') {
  let value = String(input || '/').trim();
  try {
    if (/^https?:\/\//i.test(value)) value = new URL(value).pathname;
  } catch {
    // Keep the original path-like value.
  }
  try {
    value = decodeURIComponent(value);
  } catch {
    // Preserve undecodable paths rather than crashing the build.
  }
  if (!value.startsWith('/')) value = `/${value}`;
  value = value.replace(/\/{2,}/g, '/');
  if (value !== '/' && !value.endsWith('/')) value += '/';
  return value;
}

export function getRouteIndexPolicy(routeOrPage) {
  const path = normalizeIndexPath(routeOrPage?.path || '/');
  const pageType = String(routeOrPage?.pageType || '');
  const ownerPath = getLegacyRedirectOwner(path);

  if (ownerPath) {
    return {
      lifecycle: REDIRECT,
      reason: 'legacy_exact_owner',
      ownerPath,
    };
  }

  if (INDEX_EXACT.has(path)) {
    return { lifecycle: INDEX, reason: 'curated_core' };
  }

  if (INDEX_PREFIXES.some((prefix) => path.startsWith(prefix))) {
    return { lifecycle: INDEX, reason: 'curated_index_family' };
  }

  if (HOLD_PREFIXES.some((prefix) => path.startsWith(prefix))) {
    return { lifecycle: HOLD_NOINDEX, reason: 'legacy_scaled_surface' };
  }

  if (['tag', 'author', 'archive'].includes(pageType)) {
    return { lifecycle: HOLD_NOINDEX, reason: 'archive_surface' };
  }

  return { lifecycle: HOLD_NOINDEX, reason: 'unreviewed_migrated_route' };
}

export function isIndexableRoute(routeOrPage) {
  return getRouteIndexPolicy(routeOrPage).lifecycle === INDEX;
}

export function isRoutableRoute(routeOrPage) {
  const lifecycle = getRouteIndexPolicy(routeOrPage).lifecycle;
  return lifecycle === INDEX || lifecycle === HOLD_NOINDEX;
}

export function isEditorialIndexRoute(routeOrPage) {
  const path = normalizeIndexPath(routeOrPage?.path || '/');
  return isIndexableRoute(routeOrPage) && path.startsWith('/article/');
}
