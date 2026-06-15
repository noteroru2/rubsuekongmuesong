#!/usr/bin/env node
/**
 * Keep only infrastructure redirects (sitemap). Page paths match WordPress 1:1.
 */
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

async function main() {
  await writeFile(
    path.join(ROOT, 'public', '_redirects'),
    '/sitemap_index.xml /sitemap-index.xml 301\n',
    'utf8',
  );
  console.log('Wrote sitemap-only redirect to public/_redirects');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
