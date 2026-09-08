// @ts-check
import { readFileSync } from 'node:fs';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';
import { buildAstroRedirects } from './src/lib/legacyOwnership.js';
import {
  isIndexableRoute,
  normalizeIndexPath,
} from './src/lib/indexPolicy.js';

const SITE_URL = 'https://xn--12cman8e0bjt1czaccb9b1fg31ad.com';
const routesManifest = JSON.parse(
  readFileSync(new URL('./src/data/routes-manifest.json', import.meta.url), 'utf8'),
);
const nonIndexPaths = new Set(
  routesManifest.routes
    .filter((route) => !isIndexableRoute(route))
    .map((route) => normalizeIndexPath(route.path)),
);

function sitemapIncludesPage(page) {
  try {
    const pathname = normalizeIndexPath(new URL(page).pathname);
    if (pathname === '/404/') return false;
    return !nonIndexPaths.has(pathname);
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
  redirects: buildAstroRedirects(),
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
