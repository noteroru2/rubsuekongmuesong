import type { BrandModels, ProvinceLink } from './types';

export const HUB_PATH = '/category/รับซื้อกล้อง/';

export const DEFAULT_BRANDS = ['Canon', 'Sony', 'Fujifilm', 'Nikon', 'Leica', 'DJI', 'Olympus', 'Panasonic'];

export const DEFAULT_BRAND_MODELS: BrandModels[] = [
  { brand: 'Canon', slug: 'canon', models: ['EOS R6 II', 'EOS R5', 'EOS R50', '90D', 'M50 II'] },
  { brand: 'Sony', slug: 'sony', models: ['A7 IV', 'A7 III', 'A7C II', 'A6700', 'ZV-E10'] },
  { brand: 'Fujifilm', slug: 'fujifilm', models: ['X-T5', 'X-T4', 'X-S20', 'X100VI', 'GFX 100S'] },
  { brand: 'Nikon', slug: 'nikon', models: ['Z8', 'Z6 III', 'Z5 II', 'D850', 'Z50'] },
  { brand: 'Leica', slug: 'leica', models: ['M11', 'Q3', 'SL2', 'M10', 'Q2'] },
  { brand: 'DJI', slug: 'dji', models: ['Mini 4 Pro', 'Osmo Action 5 Pro', 'Pocket 3', 'Mavic 3 Pro'] },
];

export const DEFAULT_STEPS = [
  {
    title: 'ส่งรูปกล้องทาง LINE @webuy',
    description: 'ถ่ายรูปด้านหน้า ด้านหลัง จอ และอุปกรณ์ที่มี พร้อมแจ้งรุ่นและสภาพเบื้องต้น',
  },
  {
    title: 'รับราคาประเมินภายใน 30 นาที',
    description: 'เจ้าหน้าที่ดูรูปและแจ้งราคาเบื้องต้น ถาม-ตอบได้ทันที ไม่มีค่าใช้จ่าย',
  },
  {
    title: 'นัดรับหรือส่ง EMS รับเงินทันที',
    description: 'ตกลงราคาแล้วนัดรับถึงที่หรือส่งพัสดุ ตรวจสอบเสร็จโอนเงินทันที',
  },
];

export const DEFAULT_PRICE_FACTORS = [
  { title: 'รุ่นและความต้องการตลาด', description: 'รุ่นที่ขายดีในตลาดมือสองมักได้ราคาสูงกว่า โดยเฉพาะ Mirrorless รุ่นใหม่' },
  { title: 'สภาพตัวกล้องและเลนส์', description: 'รอยใช้งาน ฝุ่นในซีนเซอร์ ร่องรอยบนเลนส์ และการทำงานของระบบมีผลต่อราคาโดยตรง' },
  { title: 'Shutter Count / จำนวนชัตเตอร์', description: 'ยิ่งชัตเตอร์น้อย ยิ่งได้ราคาดี โดยเฉพาะกล้องที่ใช้งานหนัก' },
  { title: 'อุปกรณ์ครบชุด', description: 'กล่อง สายคล้อง แบตสำรอง ที่ชาร์จ และใบเสร็จช่วยเพิ่มราคาได้' },
  { title: 'ประวัติการซ่อม', description: 'กล้องที่ไม่เคยเปิดซ่อม ไม่เคยตกน้ำ จะได้ราคาดีกว่า' },
];

export const TOP_PROVINCE_LINKS: ProvinceLink[] = [
  { name: 'ขอนแก่น', path: '/รับซื้อกล้อง/รับซื้อกล้องมือสอง-ขอนแ/' },
  { name: 'อุบลราชธานี', path: '/รับซื้อกล้อง/ร้านรับซื้อกล้องอุบลรา/' },
  { name: 'มหาสารคาม', path: '/รับซื้อกล้อง/รับซื้อกล้องมือสอง-มหาส/' },
  { name: 'ร้อยเอ็ด', path: '/รับซื้อกล้อง/รับซื้อกล้องมือสอง-ร้อย/' },
  { name: 'สุราษฎร์ธานี', path: '/รับซื้อกล้อง/ร้านรับซื้อกล้องสุราษฎ/' },
  { name: 'เชียงราย', path: '/รับซื้อกล้อง/ร้านรับซื้อกล้องเชียงร/' },
  { name: 'ลำปาง', path: '/รับซื้อกล้อง/ร้านรับซื้อกล้องลำปาง/' },
  { name: 'ตรัง', path: '/รับซื้อกล้อง/ร้านรับซื้อกล้องตรัง/' },
  { name: 'บุรีรัมย์', path: '/รับซื้อกล้อง/รับซื้อกล้องมือสอง-บุรี/' },
  { name: 'ลพบุรี', path: '/รับซื้อกล้อง/ร้านรับซื้อกล้องลพบุรี/' },
];

export const KEEP_PROVINCE_LINKS: ProvinceLink[] = [
  ...TOP_PROVINCE_LINKS,
  { name: 'ปราจีนบุรี', path: '/รับซื้อกล้อง/ร้านรับซื้อกล้องปราจีน/' },
  { name: 'พะเยา', path: '/รับซื้อกล้อง/ร้านรับซื้อกล้องพะเยา/' },
  { name: 'อุดรธานี', path: '/รับซื้อกล้อง/ร้านรับซื้อกล้องอุดรธา/' },
  { name: 'ศรีสะเกษ', path: '/รับซื้อกล้อง/รับซื้อกล้องมือสอง-ศรีส/' },
  { name: 'กาญจนบุรี', path: '/รับซื้อกล้อง/ร้านรับซื้อกล้องกาญจนบ/' },
  { name: 'พิษณุโลก', path: '/รับซื้อกล้อง/ร้านรับซื้อกล้องพิษณุโ/' },
  { name: 'นครสวรรค์', path: '/รับซื้อกล้อง/ร้านรับซื้อกล้องนครสวร/' },
  { name: 'ชุมพร', path: '/รับซื้อกล้อง/ร้านรับซื้อกล้องชุมพร/' },
];
