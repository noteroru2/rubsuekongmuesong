/**
 * Generate optimized site images (WebP) for hero, process, trust, and brand sections.
 * Run: node scripts/prepare-site-images.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve('.');
const OUT = path.join(ROOT, 'public/images/site');

const JOBS = [
  {
    out: 'hero-home-1600x900.webp',
    src: 'public/images/uploads/2025/06/LINE_NOTE_250618_2.webp',
    w: 1600,
    h: 900,
    quality: 82,
  },
  {
    out: 'process-line-chat-1200x800.webp',
    src: 'public/images/uploads/2025/06/S__18038888.webp',
    w: 1200,
    h: 800,
    quality: 80,
  },
  {
    out: 'process-inspection-1200x800.webp',
    src: 'public/images/uploads/2025/06/LINE_NOTE_250618_3.webp',
    w: 1200,
    h: 800,
    quality: 80,
  },
  {
    out: 'process-payment-1200x800.webp',
    src: 'public/images/uploads/2025/06/LINE_NOTE_250618_7.webp',
    w: 1200,
    h: 800,
    quality: 80,
  },
  {
    out: 'trust-line-example-800x600.webp',
    src: 'public/images/uploads/2025/06/LINE_NOTE_250618_8.webp',
    w: 800,
    h: 600,
    quality: 78,
  },
  {
    out: 'trust-transfer-example-800x600.webp',
    src: 'public/images/uploads/2025/06/LINE_NOTE_250618_7.webp',
    w: 800,
    h: 600,
    quality: 78,
  },
  {
    out: 'about-store-sign-800x800.webp',
    src: 'public/images/uploads/2025/06/รับซื้อกล้อง.com_-1024x1024.webp',
    w: 800,
    h: 800,
    quality: 80,
  },
  {
    out: 'about-inspection-desk-1200x800.webp',
    src: 'public/images/uploads/2025/06/LINE_NOTE_250618_1.webp',
    w: 1200,
    h: 800,
    quality: 80,
  },
  {
    out: 'about-workbench-1200x800.webp',
    src: 'public/images/uploads/2025/06/LINE_NOTE_250618_2.webp',
    w: 1200,
    h: 800,
    quality: 80,
  },
  {
    out: 'brand-canon-1200x800.webp',
    src: 'public/images/uploads/2025/06/รับซื้อกล้อง-canon.webp',
    w: 1200,
    h: 800,
    quality: 80,
  },
  {
    out: 'brand-sony-1200x800.webp',
    src: 'public/images/uploads/2025/06/Sony-A7-III-Body-Black-Thai-1.webp',
    w: 1200,
    h: 800,
    quality: 80,
  },
  {
    out: 'brand-fujifilm-1200x800.webp',
    src: 'public/images/uploads/2025/06/fuji-xt4-vs-xt5.webp',
    w: 1200,
    h: 800,
    quality: 80,
  },
  {
    out: 'brand-nikon-1200x800.webp',
    src: 'public/images/uploads/2025/06/35.webp',
    w: 1200,
    h: 800,
    quality: 80,
  },
  {
    out: 'brand-leica-1200x800.webp',
    src: 'public/images/uploads/2025/06/รับซื้อกล้องมือสอง.webp',
    w: 1200,
    h: 800,
    quality: 80,
  },
  {
    out: 'brand-panasonic-1200x800.webp',
    src: 'public/images/uploads/2025/06/กล้อง-Mirrorless.webp',
    w: 1200,
    h: 800,
    quality: 80,
  },
  {
    out: 'brand-olympus-1200x800.webp',
    src: 'public/images/uploads/2025/06/กล้องคอมแพค.webp',
    w: 1200,
    h: 800,
    quality: 80,
  },
  {
    out: 'brand-dji-1200x800.webp',
    src: 'public/images/uploads/2025/06/Osmo-Action-5-Pro.webp',
    w: 1200,
    h: 800,
    quality: 80,
  },
  {
    out: 'process-photo-front-600x450.webp',
    src: 'public/images/uploads/2025/06/LINE_NOTE_250618_4.webp',
    w: 600,
    h: 450,
    quality: 78,
  },
  {
    out: 'process-photo-back-600x450.webp',
    src: 'public/images/uploads/2025/06/LINE_NOTE_250618_5.webp',
    w: 600,
    h: 450,
    quality: 78,
  },
  {
    out: 'process-photo-screen-600x450.webp',
    src: 'public/images/uploads/2025/06/LINE_NOTE_250618_6.webp',
    w: 600,
    h: 450,
    quality: 78,
  },
  {
    out: 'process-photo-lens-600x450.webp',
    src: 'public/images/uploads/2025/06/LINE_NOTE_250618_3.webp',
    w: 600,
    h: 450,
    quality: 78,
  },
  {
    out: 'process-photo-accessories-600x450.webp',
    src: 'public/images/uploads/2025/06/LINE_NOTE_250618_1.webp',
    w: 600,
    h: 450,
    quality: 78,
  },
  {
    out: 'process-photo-serial-600x450.webp',
    src: 'public/images/uploads/2025/06/LINE_NOTE_250618_10.webp',
    w: 600,
    h: 450,
    quality: 78,
  },
  {
    out: 'process-shutter-count-1200x630.webp',
    src: 'public/images/uploads/2025/06/เช็คชัตเตอร์.webp',
    w: 1200,
    h: 630,
    quality: 80,
  },
  {
    out: 'process-sensor-check-1200x630.webp',
    src: 'public/images/uploads/2025/06/วิธีเช็คสภาพกล้องมือสอง.webp',
    w: 1200,
    h: 630,
    quality: 80,
  },
  {
    out: 'process-ems-1200x630.webp',
    src: 'public/images/uploads/2025/06/LINE_NOTE_250618_5-1.webp',
    w: 1200,
    h: 630,
    quality: 80,
  },
];

fs.mkdirSync(OUT, { recursive: true });

for (const job of JOBS) {
  const srcPath = path.join(ROOT, job.src);
  const outPath = path.join(OUT, job.out);
  if (!fs.existsSync(srcPath)) {
    console.warn('SKIP missing source:', job.src);
    continue;
  }
  await sharp(srcPath)
    .resize(job.w, job.h, { fit: 'cover', position: 'centre' })
    .webp({ quality: job.quality, effort: 4 })
    .toFile(outPath);
  const kb = Math.round(fs.statSync(outPath).size / 1024);
  console.log(`OK ${job.out} (${kb} KB)`);
}

console.log(`\nDone — ${JOBS.length} images in public/images/site/`);
