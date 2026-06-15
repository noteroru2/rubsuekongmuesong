import { readFileSync, writeFileSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const dataDir = join(root, 'src/data/content');

// 1. Delete the new duplicate page I just created
const newFile = join(dataDir, 'location-34c6a39b58acbbb3f75f.json');
unlinkSync(newFile);
console.log('Deleted duplicate:', 'location-34c6a39b58acbbb3f75f.json');

// 2. Remove it from blog-index.json
const indexPath = join(root, 'src/data/blog-index.json');
const index = JSON.parse(readFileSync(indexPath, 'utf8'));
const before = index.posts.length;
index.posts = index.posts.filter(p => p.path !== '/รับซื้อกล้อง/รับซื้อกล้องมือสอง-สกลนคร/');
index.total = index.posts.length;
writeFileSync(indexPath, JSON.stringify(index, null, 2));
console.log(`Removed from blog-index: ${before} → ${index.posts.length} posts`);

// 3. Improve meta description of the BEST existing page
const bestFile = join(dataDir, 'location-eacb44ef34e938e11769.json');
const best = JSON.parse(readFileSync(bestFile, 'utf8'));
best.seo.metaDescription = 'บริการรับซื้อกล้องมือสอง สกลนคร ให้ราคาสูงสุด รับถึงบ้าน ประเมินฟรี จ่ายเงินสดทันที ทุกรุ่นทุกยี่ห้อ Canon Sony Fuji Nikon ไม่มีค่าธรรมเนียม ทักไลน์ @WEBUY';
best.seo.ogDescription = best.seo.metaDescription;
writeFileSync(bestFile, JSON.stringify(best));
console.log('Updated meta for best page:', best.path);
console.log('  Title:', best.seo.title);
console.log('  Meta:', best.seo.metaDescription);
