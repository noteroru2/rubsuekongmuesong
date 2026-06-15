import type { ArticleMoneyEnhancement, CategoryHubEnhancement, ShutterCountEnhancement } from './types';
import { HUB_PATH, KEEP_PROVINCE_LINKS } from './shared';

export const SHUTTER_COUNT_PATH = '/article/shutter-count/';
export const CAMERA_360_PATH = '/article/กล้อง-360-องศา/';
export const PACK_CAMERA_PATH = '/article/วิธีแพ็คกล้อง/';
export const CATEGORY_HUB_PATH = HUB_PATH;

export const SHUTTER_COUNT_ENHANCEMENT: ShutterCountEnhancement = {
  quickAnswer:
    'Shutter Count คือจำนวนครั้งที่ม่านชัตเตอร์กลไกของกล้องเปิด-ปิดเพื่อถ่ายภาพ เปรียบเหมือนเลขไมล์ของรถ ยิ่งตัวเลขต่ำ ยิ่งบอกว่ากล้องใช้งานน้อยและมักได้ราคาดีกว่าเมื่อขาย',
  brandSteps: [
    {
      brand: 'Canon',
      steps: [
        'ถ่ายรูป JPEG คุณภาพสูงสุด 1 รูป',
        'อัปโหลดไฟล์ที่ CameraShutterCount.com',
        'หรือใช้ EOS Info บน Windows สำหรับบางรุ่น DSLR',
        'ดูค่า Shutter Count ในเมนูกล้องบางรุ่น (เช่น 1D series)',
      ],
    },
    {
      brand: 'Nikon',
      steps: [
        'ถ่ายรูป JPEG คุณภาพสูงสุด 1 รูป',
        'อัปโหลดไฟล์ที่ CameraShutterCount.com หรือ MyShutterCount.com',
        'หรือใช้ Nikon Shutter Count tool บน Windows',
        'บางรุ่น Z-series ดูได้ในเมนู Maintenance',
      ],
    },
    {
      brand: 'Sony',
      steps: [
        'ถ่ายรูป JPEG คุณภาพสูงสุด 1 รูป',
        'อัปโหลดไฟล์ที่ CameraShutterCount.com',
        'หรือใช้ Sony A7 Shutter Count (Windows)',
        'บางรุ่น Alpha ดูได้ผ่าน Imaging Edge Desktop',
      ],
    },
    {
      brand: 'Fujifilm',
      steps: [
        'ถ่ายรูป JPEG คุณภาพสูงสุด 1 รูป',
        'อัปโหลดไฟล์ที่ CameraShutterCount.com',
        'หรือใช้ Fujifilm Shutter Count tool',
        'บางรุ่น X-series ดูได้ในเมนู Setup > User Setting',
      ],
    },
  ],
  shutterLevels: [
    { level: 'ต่ำ', range: '0 – 20,000', meaning: 'ใช้งานน้อย มือสองยอดนิยม มักได้ราคาดีที่สุด' },
    { level: 'กลาง', range: '20,000 – 80,000', meaning: 'ใช้งานปกติ ยังขายได้ดี ราคาขึ้นอยู่กับรุ่นและสภาพ' },
    { level: 'สูง', range: '80,000 – 200,000', meaning: 'ใช้งานหนัก อาจลดราคาบ้าง แต่รุ่นโปรทนชัตเตอร์สูงกว่า' },
    { level: 'สูงมาก', range: '200,000+', meaning: 'ใช้งานหนักมาก ราคาลดลง แต่ยังขายได้ถ้าสภาพโดยรวมดี' },
  ],
  faqs: [
    {
      question: 'Shutter Count สูงแค่ไหนถึงไม่ควรซื้อ?',
      answer: 'ไม่มีตัวเลขตายตัว ขึ้นอยู่กับรุ่น กล้อง entry ที่เกิน 100,000 อาจเสี่ยง แต่กล้องโปรที่ทน 300,000+ ยังใช้ได้ ดูสภาพโดยรวมเป็นหลัก',
    },
    {
      question: 'เช็ค Shutter Count ฟรีไหม?',
      answer: 'ฟรีครับ ใช้เว็บ CameraShutterCount.com อัปโหลดไฟล์ JPEG ที่ถ่ายจากกล้องตัวเอง',
    },
    {
      question: 'Mirrorless นับ Shutter Count เหมือน DSLR ไหม?',
      answer: 'ส่วนใหญ่ยังนับชัตเตอร์กลไก แต่ถ่ายด้วย electronic shutter อาจไม่ถูกนับ ขึ้นอยู่กับยี่ห้อและรุ่น',
    },
    {
      question: 'เช็คแล้วอยากขายกล้อง ต้องทำอย่างไร?',
      answer: 'ส่งรูปกล้องพร้อมแจ้ง Shutter Count มาที่ LINE @webuy รับราคาประเมินฟรีภายใน 30 นาที',
    },
    {
      question: 'Shutter Count มีผลต่อราคารับซื้อมากแค่ไหน?',
      answer: 'เป็นปัจจัยสำคัญหนึ่ง แต่ไม่ใช่ทั้งหมด สภาพตัวกล้อง เลนส์ และอุปกรณ์ครบชุดก็มีผลเช่นกัน',
    },
  ],
};

export const CAMERA_360_ENHANCEMENT: ArticleMoneyEnhancement = {
  quickAnswer:
    'กล้อง 360 องศา คือกล้องที่มีเลนส์มุมกว้างสองตัวขึ้นไป บันทึกภาพรอบตัวครบ 360×180 องศาในช็อตเดียว ยอดนิยมสำหรับ vlog ท่องเที่ยว และ virtual tour',
  sections: [
    {
      title: 'รุ่น 360 ที่เรารับซื้อบ่อย',
      items: ['Insta360 X4', 'Insta360 X3', 'Insta360 ONE RS', 'Ricoh Theta Z1', 'Ricoh Theta X', 'GoPro MAX'],
    },
    {
      title: 'ปัจจัยที่มีผลต่อราคา',
      items: [
        'รุ่นและความต้องการตลาด (X4, X3 ยังขายดี)',
        'สภาพเลนส์และรอยขีดข่วน',
        'อุปกรณ์ครบ: ไม้เซลฟี่, กล่อง, แบตสำรอง',
        'ประวัติการใช้งานและการซ่อม',
      ],
    },
  ],
  sellCtaTitle: 'มีกล้อง 360 อยากขาย?',
  sellCtaDesc: 'ส่งรูปกล้องพร้อมอุปกรณ์มาประเมินราคาฟรี ไม่มีค่าธรรมเนียม',
  faqs: [
    {
      question: 'รับซื้อกล้อง Insta360 มือสองไหม?',
      answer: 'รับครับ ทั้ง X4, X3, ONE RS และรุ่นอื่นๆ ส่งรูปสภาพจริงมาประเมินได้',
    },
    {
      question: 'กล้อง 360 เลนส์มีรอย ยังขายได้ไหม?',
      answer: 'ขึ้นอยู่กับระดับรอย ส่งรูปหน้าแก้วเลนส์ทั้งสองด้านมาประเมินก่อน',
    },
    {
      question: 'ขายกล้อง 360 แล้วได้เงินเมื่อไหร่?',
      answer: 'หลังตกลงราคาและตรวจสอบ โอนเงินทันที ส่ง EMS หรือนัดรับได้',
    },
    {
      question: 'รับซื้อ Ricoh Theta ด้วยไหม?',
      answer: 'รับครับ Theta Z1 และ Theta X ยังมี demand ในตลาดมือสอง',
    },
  ],
};

export const PACK_CAMERA_ENHANCEMENT: ArticleMoneyEnhancement = {
  quickAnswer:
    'หลักการแพ็คกล้องส่งพัสดุที่ปลอดภัยคือ "ลดพื้นที่ว่างให้เป็นศูนย์" — ถอดเลนส์แยกจากบอดี้ ห่อบับเบิ้ลหนา ยัดกระดาษอุดช่องว่าง แล้วเขย่าทดสอบจนไม่มีเสียงกุกกัก',
  sections: [
    {
      title: 'เช็กลิสต์ก่อนส่งกล้อง',
      items: [
        'ถอดแบตเตอรี่ออกจากตัวกล้อง',
        'ถอดเลนส์ ปิดฝา body cap และ lens cap ครบ',
        'ห่อบับเบิ้ลแต่ละชิ้นอย่างน้อย 3-4 รอบ',
        'ยัดกระดาษอุดช่องว่างรอบตัวกล้องในกล่อง',
        'เขย่ากล่องทดสอบ — ต้องเงียบสนิท',
        'ถ่ายวิดีโาขั้นตอนแพ็คเป็นหลักฐาน',
      ],
    },
    {
      title: 'อุปกรณ์ที่ควรแพ็คแยกชิ้น',
      items: ['ตัวกล้อง (body)', 'เลนส์แต่ละตัว', 'แบตเตอรี่', 'ที่ชาร์จ', 'สายคล้อง', 'การ์ด memory'],
    },
  ],
  sellCtaTitle: 'แพ็คเสร็จแล้ว ส่งมาขายกล้องเลย',
  sellCtaDesc: 'ตกลงราคาทาง LINE @webuy ก่อนส่ง EMS ตรวจเสร็จโอนเงินทันที',
  faqs: [
    {
      question: 'ส่งกล้องทาง EMS ปลอดภัยไหม?',
      answer: 'ปลอดภัยครับ ถ้าแพ็คตามขั้นตอนในบทความนี้ เรารับซื้อทั่วประเทศผ่าน EMS เป็นประจำ',
    },
    {
      question: 'ต้องใช้กล่องเดิมไหม?',
      answer: 'ไม่จำเป็น ใช้กล่องแข็งแรงที่มีขนาดพอดีกับของและมีพื้นที่สำหรับกันกระแทกรอบด้าน',
    },
    {
      question: 'ถ้าไม่ตกลงราคาหลังตรวจของ ต้องจ่ายค่าส่งคืนไหม?',
      answer: 'ไม่ต้องครับ เราส่งคืนให้ฟรีหากไม่ตกลงราคา',
    },
    {
      question: 'ควรแจ้งอะไรทาง LINE ก่อนส่ง?',
      answer: 'แจ้งรุ่นกล้อง สภาพเบื้องต้น และเลขพัสดุ EMS หลังส่ง เพื่อให้เราติดตามได้',
    },
    {
      question: 'รับซื้อกล้องที่ส่งมาจากต่างจังหวัดไหม?',
      answer: 'รับครับ ลูกค้าส่วนใหญ่ส่ง EMS มาจากทั่วประเทศ โอนเงินทันทีหลังตรวจสอบ',
    },
  ],
};

export const CATEGORY_HUB_ENHANCEMENT: CategoryHubEnhancement = {
  quickAnswer:
    'รับซื้อกล้องมือสองทุกจังหวัดทั่วประเทศ ประเมินฟรีผ่าน LINE @webuy นัดรับถึงบ้านหรือส่ง EMS โอนเงินทันที ทุกแบรนด์ Canon Sony Fuji Nikon Leica DJI',
  intro:
    'เลือกจังหวัดของคุณด้านล่างเพื่อดูบริการรับซื้อกล้องมือสองในพื้นที่นั้น หรือส่งรูปมาประเมินราคาฟรีได้ทันที ไม่ว่าจะอยู่จังหวัดไหนในประเทศไทย',
  provinces: KEEP_PROVINCE_LINKS,
};

export const ARTICLE_ENHANCEMENT_MAP = new Map<string, ArticleMoneyEnhancement>([
  [CAMERA_360_PATH, CAMERA_360_ENHANCEMENT],
  [PACK_CAMERA_PATH, PACK_CAMERA_ENHANCEMENT],
]);
