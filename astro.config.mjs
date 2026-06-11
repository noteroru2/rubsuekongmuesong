// @ts-check
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

const SITE_URL = 'https://xn--12cman8e0bjt1czaccb9b1fg31ad.com';

export default defineConfig({
  site: SITE_URL,
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/404/'),
    }),
  ],
  vite: {
    build: {
      cssMinify: true,
    },
  },
});
