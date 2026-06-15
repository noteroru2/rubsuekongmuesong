import type { BrandMoneyPage } from './types';
import { TOP_PROVINCE_LINKS } from './shared';

const top6 = TOP_PROVINCE_LINKS.slice(0, 6);

export const BRAND_MONEY_PAGES: BrandMoneyPage[] = [
  {
    id: 'canon',
    name: 'Canon',
    quickAnswer:
      'รับซื้อกล้อง Canon มือสองทุกรุ่น ทั้ง DSLR และ Mirrorless ราคาตามตลาดจริง ประเมินฟรีผ่าน LINE @webuy โอนทันที',
    popularModels: [
      'EOS R6 Mark II', 'EOS R5', 'EOS R8', 'EOS R50', 'EOS R3',
      '5D Mark IV', '90D', 'M50 Mark II', 'EOS RP', 'G7X Mark III',
    ],
    easySellModels: ['EOS R6 Mark II', 'EOS R50', 'M50 Mark II', '90D', 'EOS R8'],
    priceFactors: [
      { title: 'รุ่นและความต้องการ', description: 'EOS R series และ M50 ยังมี demand สูงในตลาดมือสอง' },
      { title: 'Shutter Count', description: 'กล้อง Canon ที่ชัตเตอร์ต่ำมักได้ราคาดีกว่า โดยเฉพาะรุ่นโปร' },
      { title: 'สภาพตัวกล้องและเลนส์', description: 'รอยใช้งาน ฝุ่นในซีนเซอร์ และการทำงานของระบบ AF มีผลต่อราคา' },
      { title: 'อุปกรณ์ครบชุด', description: 'กล่อง แบตสำรอง ที่ชาร์จ และเลนส์ kit ช่วยเพิ่มราคาได้' },
    ],
    photoChecklist: [
      'ด้านหน้าและด้านหลังตัวกล้อง',
      'จอ LCD และช่องมองภาพ',
      'ช่องใส่แบตและขอบ mount',
      'หน้าแก้วเลนส์ (ถ้ามี)',
      'หน้าจอแสดง shutter count (ถ้าเช็คได้)',
    ],
    faqs: [
      { question: 'รับซื้อกล้อง Canon รุ่นเก่า เช่น 5D Mark III ไหม?', answer: 'รับครับ ทั้ง DSLR รุ่นเก่าและ Mirrorless รุ่นใหม่ ประเมินตามสภาพและ demand ตลาด' },
      { question: 'ขาย Canon พร้อมเลนส์ kit ได้ราคาดีกว่าไหม?', answer: 'โดยทั่วไปขายเป็นชุดได้ราคาดีกว่า แต่สามารถขายแยกชิ้นได้ตามต้องการ' },
      { question: 'กล้อง Canon ชัตเตอร์สูง ยังขายได้ไหม?', answer: 'ขายได้ครับ เราดูสภาพโดยรวมเป็นหลัก ชัตเตอร์สูงอาจลดราคาบ้างแต่ไม่ใช่ปัจจัยเดียว' },
    ],
    topProvinces: top6,
  },
  {
    id: 'sony',
    name: 'Sony',
    quickAnswer:
      'รับซื้อกล้อง Sony มือสอง ทุกรุ่น A7 A6 ZV ให้ราคาตามตลาด ประเมินฟรี LINE @webuy โอนทันที',
    popularModels: [
      'A7 IV', 'A7 III', 'A7C II', 'A7R V', 'A6700',
      'A6600', 'A6400', 'ZV-E10', 'ZV-1', 'RX100 VII',
    ],
    easySellModels: ['A7 IV', 'A7 III', 'A7C II', 'ZV-E10', 'A6700'],
    priceFactors: [
      { title: 'รุ่น Alpha series', description: 'A7 III และ A7 IV ยังเป็นที่ต้องการสูงสุดในตลาดมือสอง' },
      { title: 'Shutter Count', description: 'Sony รุ่นโปรทนชัตเตอร์สูง แต่ตัวเลขต่ำยังได้ราคาดีกว่า' },
      { title: 'สภาพเซ็นเซอร์และ IBIS', description: 'ฝุ่นในซีนเซอร์หรือ IBIS มีปัญหาจะลดราคา' },
      { title: 'อุปกรณ์ครบ', description: 'แบต Sony แท้ ที่ชาร์จ และกล่องช่วยเพิ่มราคา' },
    ],
    photoChecklist: [
      'ด้านหน้า ด้านหลัง และด้านล่างตัวกล้อง',
      'จอ LCD และช่อง EVF',
      'ช่องใส่แบตและ memory card',
      'mount และ contacts',
      'หน้าจอเมนูแสดง shutter count',
    ],
    faqs: [
      { question: 'รับซื้อ Sony A7 III ราคาเท่าไหร่?', answer: 'ขึ้นอยู่กับสภาพ shutter count และอุปกรณ์ ส่งรูปมาประเมินฟรีที่ LINE @webuy' },
      { question: 'กล้อง Sony มีฝุ่นในซีนเซอร์ ยังรับซื้อไหม?', answer: 'พิจารณาได้ตามระดับฝุ่น ส่งรูปทดสอบถ่าย f/16 มาด้วย' },
      { question: 'รับซื้อ Sony vlog camera เช่น ZV-E10 ไหม?', answer: 'รับครับ ZV-E10 และ ZV-1 ยังขายดีในตลาดมือสอง' },
    ],
    topProvinces: top6,
  },
  {
    id: 'fujifilm',
    name: 'Fujifilm',
    quickAnswer:
      'รับซื้อกล้อง Fujifilm มือสอง X-series และ GFX ให้ราคาดี ประเมินฟรี LINE @webuy โอนทันที',
    popularModels: [
      'X-T5', 'X-T4', 'X-S20', 'X100VI', 'X100V',
      'X-H2S', 'X-H2', 'X-Pro3', 'GFX 100S', 'X-S10',
    ],
    easySellModels: ['X-T5', 'X-T4', 'X100VI', 'X-S20', 'X-S10'],
    priceFactors: [
      { title: 'รุ่น X-series', description: 'X-T และ X100 series มี demand สูง โดยเฉพาะสีเงิน' },
      { title: 'สภาพสีและตัวเรือน', description: 'Fuji ที่สีสวย ไม่ลอก ไม่ร่อน ได้ราคาดี' },
      { title: 'Shutter Count', description: 'Fuji ทนชัตเตอร์สูง แต่ตัวเลขต่ำยังเป็นจุดขาย' },
      { title: 'เลนส์ Fuji', description: 'XF lens คุณภาพดีมี demand สูง ขายพร้อมกล้องได้ราคาดี' },
    ],
    photoChecklist: [
      'ด้านหน้า ด้านหลัง และ dials บนตัวกล้อง',
      'จอ LCD และช่อง EVF',
      'ช่องใส่แบตและ SD card',
      'mount และ contacts',
      'สภาพสีตัวเรือนทุกด้าน',
    ],
    faqs: [
      { question: 'รับซื้อ Fujifilm X100VI ไหม?', answer: 'รับครับ X100VI และ X100V ยังเป็นที่ต้องการสูง ส่งรูปมาประเมินได้' },
      { question: 'กล้อง Fuji สีลอก ยังขายได้ไหม?', answer: 'ขึ้นอยู่กับระดับการลอก ส่งรูปสภาพจริงมาประเมินก่อน' },
      { question: 'รับซื้อ GFX medium format ไหม?', answer: 'รับครับ GFX 100S และ GFX 50S II รวมถึงเลนส์ GF' },
    ],
    topProvinces: top6,
  },
  {
    id: 'nikon',
    name: 'Nikon',
    quickAnswer:
      'รับซื้อกล้อง Nikon มือสอง Z-series และ DSLR ให้ราคายุติธรรม ประเมินฟรี LINE @webuy โอนทันที',
    popularModels: [
      'Z8', 'Z9', 'Z6 III', 'Z6 II', 'Z5 II',
      'Z50', 'Zfc', 'D850', 'D750', 'D7500',
    ],
    easySellModels: ['Z8', 'Z6 III', 'Z5 II', 'D850', 'Z50'],
    priceFactors: [
      { title: 'รุ่น Z mirrorless', description: 'Z8 และ Z6 III มี demand สูงในตลาดมือสอง' },
      { title: 'Shutter Count', description: 'Nikon รุ่นโปรทนชัตเตอร์สูงมาก แต่ตัวเลขต่ำยังได้ราคาดี' },
      { title: 'สภาพตัวกล้อง', description: 'รอยใช้งาน การทำงานของระบบ AF และ IBIS' },
      { title: 'เลนส์ Nikon', description: 'Z lens และ F lens คุณภาพดีมี demand สูง' },
    ],
    photoChecklist: [
      'ด้านหน้า ด้านหลัง และ grip',
      'จอ LCD และช่องมองภาพ',
      'ช่องใส่แบตและ SD card',
      'mount และ contacts',
      'หน้าจอเมนู shutter count',
    ],
    faqs: [
      { question: 'รับซื้อ Nikon D850 ไหม?', answer: 'รับครับ D850 ยังเป็นที่ต้องการในตลาดมือสอง โดยเฉพาะชัตเตอร์ต่ำ' },
      { question: 'ขาย Nikon Z พร้อม adapter F-mount ได้ไหม?', answer: 'ได้ครับ adapter และเลนส์ F-mount ช่วยเพิ่มมูลค่า' },
      { question: 'กล้อง Nikon ชัตเตอร์สูงมาก ยังรับซื้อไหม?', answer: 'พิจารณาได้ตามรุ่น Nikon รุ่นโปรทนชัตเตอร์สูง เราดูสภาพโดยรวมเป็นหลัก' },
    ],
    topProvinces: top6,
  },
  {
    id: 'leica',
    name: 'Leica',
    quickAnswer:
      'รับซื้อกล้อง Leica มือสอง M Q SL series ให้ราคาสูงตามตลาด ประเมินฟรี LINE @webuy โอนทันที',
    popularModels: [
      'M11', 'M11-P', 'M10-R', 'M10', 'Q3',
      'Q2', 'SL3', 'SL2', 'SL2-S', 'CL',
    ],
    easySellModels: ['M11', 'Q3', 'Q2', 'SL2', 'M10'],
    priceFactors: [
      { title: 'รุ่นและความหายาก', description: 'Leica รุ่นหายากหรือ limited edition ได้ราคาสูง' },
      { title: 'สภาพตัวเรือน', description: 'brassing, รอยใช้งาน และสีตัวเรือนมีผลมาก' },
      { title: 'เลนส์ Leica', description: 'เลนส์ Leica แท้มีมูลค่าสูง ขายพร้อมกล้องได้ราคาดี' },
      { title: 'ประวัติและเอกสาร', description: 'กล่อง ใบเสร็จ และ certificate ช่วยเพิ่มราคา' },
    ],
    photoChecklist: [
      'ด้านหน้า ด้านหลัง และ top plate',
      'ช่องมองภาพและ rangefinder',
      'mount และ contacts',
      'สภาพสีตัวเรือนทุกด้าน',
      'เลนส์หน้าแก้วและขอบเลนส์',
    ],
    faqs: [
      { question: 'รับซื้อ Leica M11 ราคาเท่าไหร่?', answer: 'ขึ้นอยู่กับสภาพ อุปกรณ์ และเลนส์ที่แนบมา ส่งรูปมาประเมินฟรี' },
      { question: 'Leica มีรอย brassing ยังขายได้ไหม?', answer: 'ได้ครับ brassing บางคนถือเป็นความสวยงาม เราประเมินตามสภาพจริง' },
      { question: 'รับซื้อ Leica Q series ไหม?', answer: 'รับครับ Q3 Q2 และ Q ยังมี demand สูง' },
    ],
    topProvinces: top6,
  },
  {
    id: 'dji',
    name: 'DJI',
    quickAnswer:
      'รับซื้อ DJI มือสอง โดรน Action Pocket Gimbal ให้ราคาดี ประเมินฟรี LINE @webuy โอนทันที',
    popularModels: [
      'Mavic 3 Pro', 'Mini 4 Pro', 'Mini 3 Pro', 'Air 3',
      'Osmo Action 5 Pro', 'Osmo Action 4', 'Pocket 3', 'Avata 2', 'OM 6',
    ],
    easySellModels: ['Mini 4 Pro', 'Osmo Action 5 Pro', 'Pocket 3', 'Mavic 3 Pro', 'Air 3'],
    priceFactors: [
      { title: 'รุ่นและ fly count', description: 'โดรนรุ่นใหม่และ fly count ต่ำได้ราคาดี' },
      { title: 'สภาพแบตเตอรี่', description: 'แบตที่ยังดี cycle น้อยมีมูลค่าสูง' },
      { title: 'อุปกรณ์ครบ', description: 'รีโมท ใบพัดสำรอง กล่อง และใบเสร็จช่วยเพิ่มราคา' },
      { title: 'ประวัติการซ่อม', description: 'ไม่เคย crash หนักหรือเปิดซ่อมได้ราคาดีกว่า' },
    ],
    photoChecklist: [
      'ตัวเครื่องทุกด้าน',
      'แบตเตอรี่และ cycle count',
      'รีโมท/คอนโทรลเลอร์',
      'ใบพัดและอุปกรณ์เสริม',
      'ทดสอบเปิดเครื่องและจอแสดงผล',
    ],
    faqs: [
      { question: 'รับซื้อ DJI Mini 4 Pro ไหม?', answer: 'รับครับ Mini 4 Pro ยังขายดี ส่งรูปและ fly count มาประเมิน' },
      { question: 'โดรนเคย crash ยังรับซื้อได้ไหม?', answer: 'พิจารณาได้ตามความเสียหาย ส่งรูปและรายละเอียดมาก่อน' },
      { question: 'รับซื้อ Osmo Action และ Pocket ไหม?', answer: 'รับครับ Action 5 Pro, Action 4 และ Pocket 3 มี demand ดี' },
    ],
    topProvinces: top6,
  },
];

export const BRAND_MONEY_PAGE_MAP = new Map(
  BRAND_MONEY_PAGES.map((page) => [page.id, page]),
);
