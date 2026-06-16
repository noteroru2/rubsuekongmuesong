/**
 * Generate optimized brand assets from public/images/brand/logo-source.png
 * Usage: node scripts/generate-brand-assets.mjs
 */
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BRAND_DIR = path.join(ROOT, 'public', 'images', 'brand');
const SOURCE = path.join(BRAND_DIR, 'logo-source.png');
const ICON_CROP_RATIO = 0.38;

const WEBP = { quality: 90, effort: 6 };

async function main() {
  await mkdir(BRAND_DIR, { recursive: true });

  const trimmed = await sharp(SOURCE).trim({ threshold: 15 }).toBuffer();
  const { width, height } = await sharp(trimmed).metadata();
  const iconWidth = Math.round(width * ICON_CROP_RATIO);
  const iconExtract = { left: 0, top: 0, width: iconWidth, height };

  await Promise.all([
    sharp(trimmed).resize({ height: 80 }).webp(WEBP).toFile(path.join(BRAND_DIR, 'logo-header.webp')),
    sharp(trimmed).resize({ height: 128 }).webp(WEBP).toFile(path.join(BRAND_DIR, 'logo-footer.webp')),
    sharp(trimmed)
      .extract(iconExtract)
      .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0 } })
      .webp(WEBP)
      .toFile(path.join(BRAND_DIR, 'favicon-32.webp')),
    sharp(trimmed)
      .extract(iconExtract)
      .resize(180, 180, { fit: 'contain', background: { r: 0, g: 0, b: 0 } })
      .webp(WEBP)
      .toFile(path.join(BRAND_DIR, 'apple-touch-icon-180.webp')),
  ]);

  console.log('Brand assets written to public/images/brand/');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
