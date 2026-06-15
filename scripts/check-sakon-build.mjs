import { readdirSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';

const locDir = './dist/รับซื้อกล้อง';
const items = readdirSync(locDir);
const sakon = items.filter(i => i.includes('สกล'));
console.log('Exact dir names:', JSON.stringify(sakon));

for (const dir of sakon) {
  const htmlFile = join(locDir, dir, 'index.html');
  if (existsSync(htmlFile)) {
    const html = readFileSync(htmlFile, 'utf8');
    const canonMatch = html.match(/rel="canonical" href="([^"]+)"/);
    const titleMatch = html.match(/<title>([^<]+)<\/title>/);
    console.log('Dir:', dir);
    console.log('  Canonical:', canonMatch ? canonMatch[1] : 'NOT FOUND');
    console.log('  Title:', titleMatch ? titleMatch[1] : 'NOT FOUND');
  }
}
