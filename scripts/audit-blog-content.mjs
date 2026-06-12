import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const CONTENT = 'src/data/content';
const m = JSON.parse(readFileSync('src/data/routes-manifest.json', 'utf8'));

const blogTypes = new Set(['post', 'location', 'article']);
const blogRoutes = m.routes.filter((r) => blogTypes.has(r.pageType));

let withImage = 0;
let withBody = 0;
let noImage = 0;

for (const r of blogRoutes) {
  const p = JSON.parse(readFileSync(path.join(CONTENT, r.contentFile), 'utf8'));
  const bodyLen = (p.bodyHtml || '').length;
  if (bodyLen > 100) withBody++;
  const img = p.seo?.ogImage || (p.bodyHtml || '').match(/<img[^>]+src="([^"]+)"/i)?.[1];
  if (img) withImage++;
  else noImage++;
}

console.log('blog-eligible routes', blogRoutes.length);
console.log('with body>100', withBody);
console.log('with image', withImage, 'without', noImage);
