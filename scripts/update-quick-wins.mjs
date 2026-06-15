import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '../src/data/content');

const updates = {
  'article-7df4ea7c39ef037372c7.json': {
    title: 'เช็ค Shutter Count กล้องทำเองได้ใน 1 นาที — ตีความค่าและรู้จังหวะขาย | รับซื้อกล้องมือสอง',
    h1: 'Shutter Count คืออะไร? เช็คฟรีเองได้ + รู้จังหวะขายกล้องให้ได้ราคาดี',
    metaDescription: 'Shutter Count คือ "เลขไมล์" ของกล้อง บอกอายุการใช้งาน เช็คได้ฟรีใน 3 คลิก พร้อมเกณฑ์ว่าค่าเท่าไหร่ถึงควรขาย รับซื้อกล้องมือสองทุกรุ่น ประเมินราคาฟรี ไม่มีค่าธรรมเนียม',
    ogTitle: 'เช็ค Shutter Count กล้องทำเองได้ใน 1 นาที — ตีความค่าและรู้จังหวะขาย',
    ogDescription: 'Shutter Count คือ "เลขไมล์" ของกล้อง บอกอายุการใช้งาน เช็คได้ฟรีใน 3 คลิก รับซื้อกล้องมือสองทุกรุ่น ประเมินราคาฟรี ไม่มีค่าธรรมเนียม',
  },
  'article-77821063e2481891a403.json': {
    title: 'กล้อง DSLR คืออะไร? ข้อดี ข้อเสีย และรุ่นยอดนิยมที่ขายได้ราคาดี | รับซื้อกล้องมือสอง',
    h1: 'กล้อง DSLR คืออะไร? ข้อดี ข้อเสีย และรุ่นที่รับซื้อสูงสุด',
    metaDescription: 'กล้อง DSLR ใช้กระจกสะท้อนแสง + Optical Viewfinder ภาพคมชัด แบตทนทาน เหมาะทุกระดับ อยากขายกล้อง DSLR มือสอง? เราประเมินราคาฟรี จ่ายเงินสดทันที ไม่หักค่าธรรมเนียม',
    ogTitle: 'กล้อง DSLR คืออะไร? ข้อดี ข้อเสีย และรุ่นยอดนิยมที่ขายได้ราคาดี',
    ogDescription: 'กล้อง DSLR ใช้กระจกสะท้อนแสง + Optical Viewfinder ภาพคมชัด เหมาะทุกระดับ อยากขายกล้อง DSLR มือสอง? ประเมินราคาฟรี จ่ายเงินสดทันที',
  },
  'article-253b26e37567b82d1489.json': {
    title: 'กล้องบริดจ์คืออะไร? ซูมได้ 60x ข้อดี-ข้อเสีย และรุ่นไหนขายได้ราคาดี | รับซื้อกล้องมือสอง',
    h1: 'กล้องบริดจ์ (Bridge Camera) คืออะไร? ซูม 60x ข้อดี-ข้อเสีย และรุ่นที่รับซื้อ',
    metaDescription: 'กล้องบริดจ์ = ซูมไกลสุดๆ ใช้ง่าย ราคาจับต้องได้ รู้จักข้อดี-ข้อเสีย เปรียบกับ DSLR และ Mirrorless ก่อนตัดสินใจ อยากขายกล้องบริดจ์มือสอง? รับซื้อราคาดี ประเมินฟรี',
    ogTitle: 'กล้องบริดจ์คืออะไร? ซูมได้ 60x ข้อดี-ข้อเสีย และรุ่นไหนขายได้ราคาดี',
    ogDescription: 'กล้องบริดจ์ = ซูมไกลสุดๆ ใช้ง่าย ราคาจับต้องได้ เปรียบกับ DSLR และ Mirrorless ก่อนตัดสินใจ อยากขายกล้องบริดจ์มือสอง? รับซื้อราคาดี ประเมินฟรี',
  },
  'article-2ca11bfb1c2e808249af.json': {
    title: 'กล้องถ่ายรูปมีกี่ชนิด? ครบ 6 ประเภท ความต่างชัดๆ เลือกถูกตัว | รับซื้อกล้องมือสอง',
    h1: 'กล้องถ่ายรูปมีกี่ชนิด? ครบ 6 ประเภท พร้อมข้อแตกต่างที่ต้องรู้',
    metaDescription: 'กล้องถ่ายรูปมี 6 ชนิดหลัก: DSLR, Mirrorless, คอมแพค, บริดจ์, โพลารอยด์ และฟิล์ม เข้าใจความต่างในไม่กี่นาที + ขายกล้องมือสองทุกชนิด รับซื้อราคาดี จ่ายสดทันที',
    ogTitle: 'กล้องถ่ายรูปมีกี่ชนิด? ครบ 6 ประเภท ความต่างชัดๆ เลือกถูกตัว',
    ogDescription: 'กล้องถ่ายรูปมี 6 ชนิดหลัก: DSLR, Mirrorless, คอมแพค, บริดจ์, โพลารอยด์ และฟิล์ม เข้าใจความต่าง + ขายกล้องมือสองทุกชนิด รับซื้อราคาดี จ่ายสดทันที',
  },
};

let count = 0;
for (const [filename, changes] of Object.entries(updates)) {
  const filePath = join(dataDir, filename);
  const data = JSON.parse(readFileSync(filePath, 'utf8'));
  const before = data.seo.title;
  data.seo.title = changes.title;
  data.seo.h1 = changes.h1;
  data.seo.metaDescription = changes.metaDescription;
  data.seo.ogTitle = changes.ogTitle;
  data.seo.ogDescription = changes.ogDescription;
  writeFileSync(filePath, JSON.stringify(data));
  console.log(`UPDATED: ${data.path}`);
  console.log(`  BEFORE: ${before}`);
  console.log(`  AFTER:  ${changes.title}`);
  count++;
}
console.log(`\nTotal updated: ${count} articles`);
