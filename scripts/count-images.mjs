import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT_DIR = path.join(ROOT, 'src', 'data', 'content');
const WP_UPLOADS = /https:\/\/xn--12cman8e0bjt1czaccb9b1fg31ad\.com\/wp-content\/uploads\/[^"'\s)]+/gi;

const urls = new Set();
for (const file of await readdir(CONTENT_DIR)) {
  if (!file.endsWith('.json')) continue;
  const page = JSON.parse(await readFile(path.join(CONTENT_DIR, file), 'utf8'));
  const blob = `${page.bodyHtml || ''}${JSON.stringify(page.schemaGraph || '')}${JSON.stringify(page.seo || '')}`;
  for (const m of blob.matchAll(WP_UPLOADS)) urls.add(m[0]);
}
console.log('unique uploads urls:', urls.size);
