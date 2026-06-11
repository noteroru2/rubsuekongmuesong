#!/usr/bin/env node
/**
 * Build 301 redirects from legacy WordPress paths (e.g. /uncategorized/) to Astro paths.
 */
import { readFile, writeFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CONTENT_DIR = path.join(ROOT, 'src', 'data', 'content');

function normPath(p) {
  try {
    p = decodeURIComponent(p);
  } catch {}
  if (!p.startsWith('/')) p = `/${p}`;
  if (!p.endsWith('/')) p = `${p}/`;
  return p;
}

async function main() {
  const files = (await readdir(CONTENT_DIR)).filter((f) => f.endsWith('.json'));
  const lines = new Set(['/sitemap_index.xml /sitemap-index.xml 301']);

  for (const file of files) {
    const page = JSON.parse(await readFile(path.join(CONTENT_DIR, file), 'utf8'));
    const served = normPath(page.path);
    let legacy = '';
    try {
      legacy = normPath(new URL(page.oldUrl || page.seo?.canonical || '').pathname);
    } catch {
      continue;
    }
    if (legacy !== served) {
      lines.add(`${legacy} ${served} 301`);
    }
  }

  const out = [...lines].sort().join('\n') + '\n';
  await writeFile(path.join(ROOT, 'public', '_redirects'), out, 'utf8');
  console.log(`Wrote ${lines.size} redirect rules to public/_redirects`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
