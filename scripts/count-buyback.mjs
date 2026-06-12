import { readFileSync } from 'node:fs';

const m = JSON.parse(readFileSync('src/data/routes-manifest.json', 'utf8'));
const buyback = m.routes.filter(
  (r) =>
    (r.pageType === 'post' || r.pageType === 'location') &&
    (r.path.startsWith('/กล้อง/') || r.path.startsWith('/รับซื้อกล้อง/')),
);
console.log('buyback posts+locations', buyback.length);
console.log(
  'sample',
  buyback.slice(0, 8).map((r) => r.path),
);
