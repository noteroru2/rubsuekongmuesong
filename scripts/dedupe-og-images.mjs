#!/usr/bin/env node
/**
 * Dedupe ogImage for 6 duplicate groups (see image-plan-blog.md).
 * Run: node scripts/dedupe-og-images.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const CONTENT = path.resolve('src/data/content');
const PUBLIC_IMG = path.resolve('public/images');

/** Explicit fixes for groups 1–5 (original audit groups) */
const EXPLICIT = {
  '/images/uploads/2025/06/รับซื้อกล้องมือสอง.webp': {
    '/รับซื้อกล้อง/รับซื้อกล้องมือสอง/': '/images/uploads/2025/07/รับซื้อกล้องมือสอง.webp',
  },
  '/images/uploads/2025/07/รับซื้อกล้องถึงหน้าบ้าน.webp': {
    '/รับซื้อกล้อง/รับซื้อกล้องมือสอง-มุกด/': '/images/uploads/2025/07/มหาสารคาม-รับซื้อกล้องมือสอง.webp',
  },
  '/images/uploads/2025/07/กล้องมือสอง-รับซื้อ.webp': {
    '/รับซื้อกล้อง/ร้านรับซื้อกล้องสงขลา/': '/images/uploads/2025/07/รับซื้อกล้องมือสอง-สุรินทร์.webp',
  },
  '/images/uploads/2025/07/รับซื้อกล้องใกล้ฉัน.webp': {
    '/รับซื้อกล้อง/ร้านรับซื้อกล้องมือสอง/': '/images/uploads/2025/07/รับซื้อกล้องมือสอง-ใกล้ฉัน.webp',
  },
  '/images/uploads/2025/07/รับซื้อกล้องมือสองทุกรุ่น.webp': {
    '/รับซื้อกล้อง/ร้านรับซื้อกล้องสุพรรณ/': '/images/uploads/2025/07/รับซื้อเลนส์กล้อง.webp',
  },
};

const BAD_OG = new Set([
  '/images/uploads/2025/07/1-300x72.webp',
  '/images/uploads/2025/07/2-300x72.webp',
  '/images/uploads/2025/07/3-300x72.webp',
]);

/** Path fragment → province-specific og (local intent) */
const PROVINCE_HINTS = [
  ['ขอนแ', '/images/uploads/2025/07/ขอนแก่น-รับซื้อกล้องมือสอง.webp'],
  ['มหาส', '/images/uploads/2025/07/มหาสารคาม-รับซื้อกล้องมือสอง.webp'],
  ['สกลนค', '/images/uploads/2025/07/รับซื้อกล้องมือสอง-สกลนคร.webp'],
  ['ศรีส', '/images/uploads/2025/07/รับซื้อกล้องมือสอง-ศรีสะเกษ.webp'],
  ['สุรินท', '/images/uploads/2025/07/รับซื้อกล้องมือสอง-สุรินทร์.webp'],
  ['ร้อยเ', '/images/uploads/2025/07/รับซื้อกล้องมือสอง-ร้อยเอ็ด.webp'],
  ['โคราช', '/images/uploads/2025/07/รับซื้อกล้องมือสอง-โคราช.webp'],
  ['กาฬส', '/images/uploads/2025/07/รับซื้อกล้องมือสอง-กาฬสินธุ์.webp'],
  ['บุรี', '/images/uploads/2025/07/รับซื้อกล้องมือสอง-กาฬสินธุ์.webp'],
  ['นครพ', '/images/uploads/2025/07/กล้องมือสอง-รับซื้อ.webp'],
  ['สงขลา', '/images/uploads/2025/07/รับซื้อกล้องมือสอง-สุรินทร์.webp'],
  ['จังห', '/images/uploads/2025/07/รับซื้อกล้องถึงหน้าบ้าน.webp'],
  ['มุกด', '/images/uploads/2025/07/มหาสารคาม-รับซื้อกล้องมือสอง.webp'],
  ['บึงก', '/images/uploads/2025/07/รับซื้อกล้องมือสอง-ใกล้ฉัน.webp'],
  ['อำนา', '/images/uploads/2025/07/รับซื้อกล้องมือสองทุกรุ่น.webp'],
  ['สุพรรณ', '/images/uploads/2025/07/รับซื้อเลนส์กล้อง.webp'],
];

function walkWebp(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walkWebp(p, acc);
    else if (ent.name.endsWith('.webp') && !/-\d+x\d+\.webp$/.test(ent.name)) {
      acc.push('/images/' + path.relative(PUBLIC_IMG, p).replace(/\\/g, '/'));
    }
  }
  return acc;
}

const THEME_POOL = [
  ...walkWebp(path.join(PUBLIC_IMG, 'site')),
  ...walkWebp(path.join(PUBLIC_IMG, 'uploads/2025/06')),
  ...walkWebp(path.join(PUBLIC_IMG, 'uploads/2025/07')),
].filter((src) => !BAD_OG.has(src) && !src.includes('300x72'));

function hashPath(p) {
  let h = 0;
  for (let i = 0; i < p.length; i++) h = (h * 31 + p.charCodeAt(i)) >>> 0;
  return h;
}

function provinceOg(pagePath) {
  for (const [frag, img] of PROVINCE_HINTS) {
    if (pagePath.includes(frag)) return img;
  }
  return null;
}

function pickUnique(pagePath, taken) {
  const prov = provinceOg(pagePath);
  if (prov && !taken.has(prov)) return prov;
  const start = hashPath(pagePath) % THEME_POOL.length;
  for (let i = 0; i < THEME_POOL.length; i++) {
    const img = THEME_POOL[(start + i) % THEME_POOL.length];
    if (!taken.has(img)) return img;
  }
  return THEME_POOL[start];
}

function loadDocs() {
  return fs
    .readdirSync(CONTENT)
    .filter((f) => f.endsWith('.json'))
    .map((f) => {
      const doc = JSON.parse(fs.readFileSync(path.join(CONTENT, f), 'utf8'));
      return { file: f, doc };
    });
}

function ogGroups(docs) {
  const m = new Map();
  for (const { doc } of docs) {
    const img = doc.seo?.ogImage;
    if (!img) continue;
    if (!m.has(img)) m.set(img, []);
    m.get(img).push(doc);
  }
  return m;
}

function main() {
  let docs = loadDocs();
  let updated = 0;
  const taken = new Set();

  // Pass 1: explicit + bad CTA og
  for (const { file, doc } of docs) {
    const current = doc.seo?.ogImage;
    if (!current) continue;
    let next = EXPLICIT[current]?.[doc.path] || null;
    if (!next && BAD_OG.has(current)) {
      next = pickUnique(doc.path, taken);
    }
    if (next && next !== current) {
      doc.seo.ogImage = next;
      fs.writeFileSync(path.join(CONTENT, file), JSON.stringify(doc), 'utf8');
      taken.add(next);
      updated++;
    } else if (current && !BAD_OG.has(current)) {
      taken.add(current);
    }
  }

  // Pass 2: resolve remaining duplicate groups (keep first page per image)
  docs = loadDocs();
  const groups = ogGroups(docs);
  for (const [img, pageDocs] of groups) {
    if (pageDocs.length <= 1) continue;
    // Homepage + one other sharing default is OK for group 1
    const paths = pageDocs.map((d) => d.path);
    if (
      img === '/images/uploads/2025/06/รับซื้อกล้องมือสอง.webp' &&
      paths.includes('/') &&
      paths.length === 2
    ) {
      continue;
    }
    for (let i = 1; i < pageDocs.length; i++) {
      const doc = pageDocs[i];
      const next = pickUnique(doc.path, taken);
      doc.seo.ogImage = next;
      const file = docs.find((d) => d.doc.path === doc.path)?.file;
      if (file) {
        fs.writeFileSync(path.join(CONTENT, file), JSON.stringify(doc), 'utf8');
        taken.add(next);
        updated++;
      }
    }
  }

  const after = ogGroups(loadDocs());
  const dups = [...after.entries()].filter(([, pages]) => pages.length > 1);

  console.log(`Updated ${updated} pages`);
  console.log(`Theme pool size: ${THEME_POOL.length}`);
  console.log(`Remaining ogImage duplicate groups: ${dups.length}`);
  for (const [img, pages] of dups) {
    console.log(`  ${img} (${pages.length} pages)`);
  }
}

main();
