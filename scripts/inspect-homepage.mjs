import { readFileSync } from 'node:fs';

const p = JSON.parse(
  readFileSync('src/data/content/homepage-8a5edab282632443219e.json', 'utf8'),
);
const html = p.bodyHtml || '';

const articleLinks = [...html.matchAll(/href="([^"]*article[^"]*)"/gi)];
console.log('article links', articleLinks.length);
console.log(articleLinks.slice(0, 8).map((m) => m[1]).join('\n'));

const galleryItems = [...html.matchAll(/kadence-blocks-gallery-item/gi)];
console.log('gallery items', galleryItems.length);

console.log('\n--- tail 5000 chars ---');
console.log(html.slice(-5000));
