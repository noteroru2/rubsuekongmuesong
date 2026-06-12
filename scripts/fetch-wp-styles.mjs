/**
 * Download WordPress combined CSS for Kadence block styling parity.
 */
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'public', 'styles', 'wp-theme.css');

const CSS_URL =
  'https://xn--12cman8e0bjt1czaccb9b1fg31ad.com/wp-content/litespeed/css/f811c6b43be4c95bea7445dbde734899.css?ver=12b87';

const res = await fetch(CSS_URL, {
  headers: { 'User-Agent': 'AstroMigration/1.0' },
});
if (!res.ok) throw new Error(`CSS fetch failed: ${res.status}`);
const css = await res.text();
await mkdir(path.dirname(OUT), { recursive: true });
await writeFile(OUT, css, 'utf8');
console.log(`Saved ${(css.length / 1024).toFixed(1)} KB → ${OUT}`);
