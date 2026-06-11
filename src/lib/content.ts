import type { PageRecord, RoutesManifest } from './types';

import routesManifest from '../data/routes-manifest.json';

const contentModules = import.meta.glob<{ default: PageRecord }>('../data/content/*.json', {
  eager: true,
});

const pageCache = new Map<string, PageRecord>();

function loadPageByFile(contentFile: string): PageRecord | undefined {
  const key = `../data/content/${contentFile}`;
  const mod = contentModules[key];
  return mod?.default;
}

export function getManifest(): RoutesManifest {
  return routesManifest as RoutesManifest;
}

export function getAllRoutes() {
  return getManifest().routes;
}

export function getPageByPath(path: string): PageRecord | undefined {
  const normalized = path === '/' ? '/' : path.endsWith('/') ? path : `${path}/`;
  if (pageCache.has(normalized)) return pageCache.get(normalized);

  const route = getManifest().routes.find((r) => r.path === normalized);
  if (!route) return undefined;

  const page = loadPageByFile(route.contentFile);
  if (page) pageCache.set(normalized, page);
  return page;
}

export function getHomePage(): PageRecord | undefined {
  return getPageByPath('/');
}
