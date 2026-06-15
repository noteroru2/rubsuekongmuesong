import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('dist');
const checks = [
  ['models', path.join(root, 'models', 'index.html'), 'brand-section--hub'],
  ['shutter', path.join(root, 'article', 'shutter-count', 'index.html'), 'money-page'],
  ['kalasin', path.join(root, 'รับซื้อกล้อง', 'รับซื้อกล้องมือสอง-กาฬส', 'index.html'), 'money-page--province'],
  ['surin', path.join(root, 'รับซื้อกล้อง', 'ร้านรับซื้อกล้องสุรินท', 'index.html'), 'money-page--province'],
  ['khonkaen', path.join(root, 'รับซื้อกล้อง', 'รับซื้อกล้องมือสอง-ขอนแ', 'index.html'), 'money-page--province'],
  ['prachin', path.join(root, 'รับซื้อกล้อง', 'ร้านรับซื้อกล้องปราจีน', 'index.html'), 'money-page--province'],
  ['hub', path.join(root, 'category', 'รับซื้อกล้อง', 'index.html'), 'category-hub-grid'],
  ['360', path.join(root, 'article', 'กล้อง-360-องศา', 'index.html'), 'money-page--article'],
  ['pack', path.join(root, 'article', 'วิธีแพ็คกล้อง', 'index.html'), 'money-page--article'],
  ['home', path.join(root, 'index.html'), 'home-provinces'],
];

let ok = true;
for (const [name, file, needle] of checks) {
  const html = fs.readFileSync(file, 'utf8');
  const found = html.includes(needle);
  const h1count = (html.match(/<h1/gi) || []).length;
  if (!found) ok = false;
  console.log(`${name}: ${needle}=${found} h1=${h1count}`);
}

const keep21 = [
  '/รับซื้อกล้อง/รับซื้อกล้องมือสอง-ขอนแ/',
  '/รับซื้อกล้อง/ร้านรับซื้อกล้องปราจีน/',
  '/รับซื้อกล้อง/ร้านรับซื้อกล้องชุมพร/',
  '/article/shutter-count/',
  '/article/กล้อง-360-องศา/',
  '/article/วิธีแพ็คกล้อง/',
];
let missing = 0;
for (const p of keep21) {
  const rel = p.slice(1).replace(/\/$/, '') + '/index.html';
  if (!fs.existsSync(path.join(root, rel))) {
    console.log('MISSING:', p);
    missing++;
    ok = false;
  }
}
console.log(`keep sample: ${keep21.length - missing}/${keep21.length} ok`);
console.log(ok ? 'ALL CHECKS PASSED' : 'SOME CHECKS FAILED');
