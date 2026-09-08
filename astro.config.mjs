// @ts-check
import { readFileSync } from 'node:fs';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';
import {
  HOLD_NOINDEX,
  getRouteIndexPolicy,
  normalizeIndexPath,
} from './src/lib/indexPolicy.js';

const SITE_URL = 'https://xn--12cman8e0bjt1czaccb9b1fg31ad.com';
const routesManifest = JSON.parse(
  readFileSync(new URL('./src/data/routes-manifest.json', import.meta.url), 'utf8'),
);
const heldPaths = new Set(
  routesManifest.routes
    .filter((route) => getRouteIndexPolicy(route).lifecycle === HOLD_NOINDEX)
    .map((route) => normalizeIndexPath(route.path)),
);

function sitemapIncludesPage(page) {
  try {
    const pathname = normalizeIndexPath(new URL(page).pathname);
    if (pathname === '/404/') return false;
    return !heldPaths.has(pathname);
  } catch {
    return true;
  }
}

export default defineConfig({
  site: SITE_URL,
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
  integrations: [
    sitemap({
      filter: sitemapIncludesPage,
    }),
  ],
  vite: {
    build: {
      cssMinify: true,
    },
  },
});
