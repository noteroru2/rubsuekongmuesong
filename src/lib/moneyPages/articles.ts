import type { ArticleMoneyEnhancement, CategoryHubEnhancement, ShutterCountEnhancement } from './types';
import { HUB_PATH, KEEP_PROVINCE_LINKS } from './shared';

export const SHUTTER_COUNT_PATH = '/article/shutter-count/';
export const CAMERA_360_PATH = '/article/กล้อง-360-องศา/';
export const PACK_CAMERA_PATH = '/article/วิธีแพ็คกล้อง/';
export const DSLR_PATH = '/article/กล้อง-dslr-คืออะไร/';
export const BRIDGE_PATH = '/article/กล้องบริดจ์/';
export const CAMERA_TYPES_PATH = '/article/กล้องถ่ายรูปมีกี่ชนิด/';
export const SONY_A7_COMPARE_PATH = '/article/sony-a7iii-vs-a7iv/';
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

export const DSLR_ENHANCEMENT: ArticleMoneyEnhancement = {
  quickAnswer:
    'กล้อง DSLR (Digital Single-Lens Reflex) ใช้กระจกสะท้อนภาพและช่องมองแบบ Optical Viewfinder ให้ภาพคมชัด แบตทนทาน และเลนส์ให้เลือกมากมาย เหมาะทั้งมือใหม่และมืออาชีพ',
  sections: [
    {
      title: 'รุ่น DSLR ที่เรารับซื้อบ่อย',
      items: ['Canon EOS 90D', 'Canon EOS 80D', 'Canon 5D Mark IV', 'Canon 6D Mark II', 'Nikon D850', 'Nikon D750', 'Nikon D3500'],
    },
    {
      title: 'ปัจจัยที่มีผลต่อราคารับซื้อ',
      items: [
        'Shutter Count — ยิ่งน้อยยิ่งได้ราคาดี',
        'รุ่นและความต้องการตลาด (Full Frame มักได้ราคาสูงกว่า)',
        'สภาพเซ็นเซอร์และช่องมองภาพ',
        'อุปกรณ์ครบ: กล่อง แบต ที่ชาร์จ เลนส์ kit',
      ],
    },
  ],
  sellCtaTitle: 'มีกล้อง DSLR อยากขาย?',
  sellCtaDesc: 'ส่งรูปกล้องพร้อมแจ้ง Shutter Count มาประเมินราคาฟรี LINE @webuy โอนทันที',
  faqs: [
    {
      question: 'รับซื้อกล้อง DSLR ทุกแบรนด์ไหม?',
      answer: 'รับครับ ทั้ง Canon และ Nikon รุ่นยอดนิยม ส่งรูปสภาพจริงมาประเมินได้',
    },
    {
      question: 'ขายกล้อง DSLR ต้องมีกล่องไหม?',
      answer: 'ไม่จำเป็น แต่ถ้ามีกล่อง แบต และเลนส์ kit อาจได้ราคาสูงขึ้น',
    },
    {
      question: 'Shutter Count สูงยังขายได้ไหม?',
      answer: 'ได้ครับ ขึ้นอยู่กับรุ่นและสภาพโดยรวม กล้องโปรทนชัตเตอร์สูงกว่ารุ่น entry',
    },
    {
      question: 'รับซื้อเลนส์ DSLR แยกจากตัวกล้องไหม?',
      answer: 'รับครับ ทั้งเลนส์ EF, EF-S, F-mount และเลนส์เดี่ยว',
    },
  ],
};

export const BRIDGE_ENHANCEMENT: ArticleMoneyEnhancement = {
  quickAnswer:
    'กล้องบริดจ์ (Bridge Camera) คือกล้องที่มีเลนส์ซูมในตัวแบบยาว ใช้งานง่าย ไม่ต้องเปลี่ยนเลนส์ เหมาะกับงานท่องเที่ยว ถ่ายนก และงานที่ต้องการซูมไกล',
  sections: [
    {
      title: 'รุ่นบริดจ์ที่เรารับซื้อบ่อย',
      items: ['Sony RX10 IV', 'Sony RX10 III', 'Panasonic FZ1000 II', 'Canon PowerShot SX70 HS', 'Nikon P1000', 'Nikon P950'],
    },
    {
      title: 'ปัจจัยที่มีผลต่อราคา',
      items: [
        'ความยาวซูมและรุ่น (RX10 series ยังมี demand)',
        'สภาพเลนส์และระบบซูม',
        'การทำงานของระบบโฟกัสและจอ',
        'อุปกรณ์ครบ: แบต ที่ชาร์จ กล่อง',
      ],
    },
  ],
  sellCtaTitle: 'มีกล้องบริดจ์อยากขาย?',
  sellCtaDesc: 'ส่งรูปกล้องพร้อมอุปกรณ์มาประเมินราคาฟรี ไม่มีค่าธรรมเนียม',
  faqs: [
    {
      question: 'รับซื้อกล้องบริดจ์ Sony RX10 ไหม?',
      answer: 'รับครับ RX10 III และ RX10 IV ยังมี demand สูงในตลาดมือสอง',
    },
    {
      question: 'กล้องบริดจ์ซูมไม่ได้ ยังขายได้ไหม?',
      answer: 'ขึ้นอยู่กับปัญหา ส่งรูปและอธิบายอาการมาประเมินก่อน',
    },
    {
      question: 'ขายกล้องบริดจ์แล้วได้เงินเมื่อไหร่?',
      answer: 'หลังตกลงราคาและตรวจสอบ โอนเงินทันที ส่ง EMS หรือนัดรับได้',
    },
    {
      question: 'รับซื้อ Nikon P1000 ด้วยไหม?',
      answer: 'รับครับ รุ่นซูม 125x ยังมีคนสนใจในตลาดมือสอง',
    },
  ],
};

export const CAMERA_TYPES_ENHANCEMENT: ArticleMoneyEnhancement = {
  quickAnswer:
    'กล้องถ่ายรูปหลักๆ แบ่งเป็น 6 ประเภท: DSLR, Mirrorless, คอมแพค, บริดจ์, แอคชั่น/360 และฟิล์ม แต่ละประเภทเหมาะกับการใช้งานต่างกัน',
  sections: [
    {
      title: 'ประเภทกล้องที่เรารับซื้อทุกชนิด',
      items: ['DSLR — Canon, Nikon', 'Mirrorless — Sony, Fuji, Canon R', 'คอมแพค — RX100, X100', 'บริดจ์ — RX10, P1000', 'แอคชั่น/360 — GoPro, Insta360', 'ฟิล์ม — Leica, Contax (ตามรุ่น)'],
    },
    {
      title: 'ไม่แน่ใจว่ากล้องคุณเป็นประเภทไหน?',
      items: [
        'ส่งรูปกล้องมาที่ LINE @webuy',
        'แจ้งรุ่นและยี่ห้อ (ถ้ารู้)',
        'รับราคาเบื้องต้นภายใน 30 นาที',
      ],
    },
  ],
  sellCtaTitle: 'รู้แล้วว่ากล้องคุณเป็นประเภทไหน — อยากขาย?',
  sellCtaDesc: 'รับซื้อกล้องมือสองทุกประเภท ทุกแบรนด์ ประเมินฟรี จ่ายสดทันที',
  faqs: [
    {
      question: 'รับซื้อกล้องทุกประเภทจริงไหม?',
      answer: 'รับครับ ทั้ง DSLR, Mirrorless, คอมแพค, บริดจ์, แอคชั่น และ 360',
    },
    {
      question: 'กล้องเก่ามาก ยังขายได้ไหม?',
      answer: 'ขึ้นอยู่กับรุ่นและสภาพ รุ่นที่ยังมี demand ในตลาดมือสองยังรับซื้อได้',
    },
    {
      question: 'ขายกล้องหลายตัวพร้อมกันได้ไหม?',
      answer: 'ได้ครับ ส่งรูปทุกตัวมาประเมินราคาแยกหรือรวมยอดตามตกลง',
    },
    {
      question: 'อยู่ต่างจังหวัด ขายกล้องได้ไหม?',
      answer: 'ได้ครับ ส่ง EMS ทั่วประเทศ หลังตรวจสอบโอนเงินทันที',
    },
  ],
};

export const SONY_A7_COMPARE_ENHANCEMENT: ArticleMoneyEnhancement = {
  quickAnswer:
    'Sony A7 III เหมาะกับงบจำกัด โฟกัสดี วิดีโอ 4K ครบ — A7 IV อัปเกรดโฟกัส 33MP วิดีโอ 10-bit ดีกว่า ถ้าขาย A7 III เพื่ออัป A7 IV เรารับซื้อ A7 III ราคาดี',
  sections: [
    {
      title: 'รุ่น Sony A7 ที่เรารับซื้อ',
      items: ['Sony A7 III', 'Sony A7 IV', 'Sony A7C', 'Sony A7C II', 'Sony A7R IV', 'Sony A7R V'],
    },
    {
      title: 'เตรียมกล้องก่อนขาย — ได้ราคาดีขึ้น',
      items: [
        'เช็ค Shutter Count แล้วแจ้งมาด้วย',
        'ถ่ายรูปจอ ด้านหน้า ด้านหลัง และ mount',
        'แจ้งอุปกรณ์ครบ: กล่อง แบต ที่ชาร์จ',
        'ทำความสะอาดเลนส์ก่อนถ่ายรูป',
      ],
    },
  ],
  sellCtaTitle: 'เลือก A7 IV แล้ว — ขาย A7 III ที่นี่',
  sellCtaDesc: 'รับซื้อ Sony A7 III และ A7 IV ราคาตลาด ส่งรูปประเมินฟรี LINE @webuy',
  faqs: [
    {
      question: 'รับซื้อ Sony A7 III ราคาเท่าไหร่?',
      answer: 'ขึ้นอยู่กับสภาพ Shutter Count และอุปกรณ์ ส่งรูปมาประเมินฟรี',
    },
    {
      question: 'ขาย A7 III แล้วซื้อ A7 IV คุ้มไหม?',
      answer: 'ถ้าต้องการโฟกัสดีขึ้น วิดีโอ 10-bit และ 33MP การอัปเกรดคุ้ม ขาย A7 III ช่วยลดเงินออก',
    },
    {
      question: 'A7 III ชัตเตอร์สูง ยังขายได้ไหม?',
      answer: 'ได้ครับ A7 III ทนชัตเตอร์สูง เราดูสภาพโดยรวมเป็นหลัก',
    },
    {
      question: 'รับซื้อพร้อมเลนส์ kit 28-70 ไหม?',
      answer: 'รับครับ ประเมินแยกชิ้นหรือรวมยอดตามสภาพจริง',
    },
  ],
};

export const ARTICLE_ENHANCEMENT_MAP = new Map<string, ArticleMoneyEnhancement>([
  [CAMERA_360_PATH, CAMERA_360_ENHANCEMENT],
  [PACK_CAMERA_PATH, PACK_CAMERA_ENHANCEMENT],
  [DSLR_PATH, DSLR_ENHANCEMENT],
  [BRIDGE_PATH, BRIDGE_ENHANCEMENT],
  [CAMERA_TYPES_PATH, CAMERA_TYPES_ENHANCEMENT],
  [SONY_A7_COMPARE_PATH, SONY_A7_COMPARE_ENHANCEMENT],
]);
