import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve('.');
const pages = [
  ['/', 'dist/index.html'],
  ['/models/', 'dist/models/index.html'],
  ['/process/', 'dist/process/index.html'],
  ['/review/', 'dist/review/index.html'],
  ['/about/', 'dist/about/index.html'],
  ['/blog/', 'dist/blog/index.html'],
];

const SITE_IMAGE_PATHS = new Set();
function collectSiteImages(dir) {
  const full = path.join(ROOT, dir);
  if (!fs.existsSync(full)) return;
  for (const f of fs.readdirSync(full)) {
    SITE_IMAGE_PATHS.add(`/images/site/${f}`);
  }
}
collectSiteImages('public/images/site');

let fail = 0;
for (const [label, rel] of pages) {
  const file = path.join(ROOT, rel);
  const html = fs.readFileSync(file, 'utf8');
  const imgs = [...html.matchAll(/<img[^>]+>/gi)].map((m) => m[0]);
  const siteImgs = imgs.filter((t) => t.includes('/images/site/'));
  const noAlt = imgs.filter((t) => !/\balt="[^"]+"/.test(t) || /\balt=""/.test(t));
  const noWH = imgs.filter((t) => !(/\bwidth="\d+"/.test(t) && /\bheight="\d+"/.test(t)));
  const broken = [];
  for (const tag of imgs) {
    const src = tag.match(/\bsrc="([^"]+)"/)?.[1];
    if (!src || src.startsWith('http')) continue;
    const local = path.join(ROOT, 'public', src.replace(/^\//, ''));
    if (!fs.existsSync(local)) broken.push(src);
  }
  console.log(`=== ${label} ===`);
  console.log(`images: ${imgs.length} | site: ${siteImgs.length} | broken: ${broken.length} | noAlt: ${noAlt.length} | noWH: ${noWH.length}`);
  if (broken.length) {
    fail++;
    broken.slice(0, 5).forEach((s) => console.log('  BROKEN:', s));
  }
  if (label === '/') {
    console.log('hero preload:', html.includes('hero-home-1600x900') && html.includes('rel="preload"'));
    console.log('hero fetchpriority high:', /hero-home[^>]*fetchpriority="high"|fetchpriority="high"[^>]*hero-home/.test(html) || (html.includes('hero-home') && html.includes('fetchpriority="high"')));
  }
  if (label === '/review/' || label === '/about/') {
    const bad = ['รีวิวจากลูกค้าจริง', 'รีวิวจริง', 'ตัวอย่างการรับซื้อจริง'].filter((w) => html.includes(w));
    if (bad.length) {
      fail++;
      console.log('  CLAIM WARNING:', bad.join(', '));
    }
  }
  const footer = html.match(/site-footer[\s\S]*?<img[^>]+src="([^"]+)"/);
  if (footer) {
    const ok = fs.existsSync(path.join(ROOT, 'public', footer[1].replace(/^\//, '')));
    console.log('footer logo ok:', ok, footer[1]);
    if (!ok) fail++;
  }
  console.log('');
}

// verify all site images referenced in dist priority pages exist
for (const p of SITE_IMAGE_PATHS) {
  const local = path.join(ROOT, 'public', p.replace(/^\//, ''));
  if (!fs.existsSync(local)) {
    console.log('MISSING SITE ASSET:', p);
    fail++;
  }
}

console.log(fail ? `QA FAILED (${fail} issues)` : 'QA PASSED');
