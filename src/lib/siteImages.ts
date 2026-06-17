/** Central registry for marketing/trust images — alt text, dimensions, paths. */

export interface SiteImage {
  src: string;
  alt: string;
  width: number;
  height: number;
  /** Future production path once real photo is ready */
  targetSrc?: string;
  /** PII / usage notes for real photography */
  note?: string;
  /** placeholder = mockup or missing file; ready = approved for production */
  status?: 'placeholder' | 'ready';
}

const SITE = '/images/site';

export const SITE_IMAGES = {
  heroHome: {
    src: `${SITE}/hero-home-1600x900.webp`,
    alt: 'รับซื้อกล้องมือสอง ประเมินราคากล้อง Canon Sony Fujifilm Nikon Leica',
    width: 1600,
    height: 900,
  },
  processLineChat: {
    src: `${SITE}/process-line-chat-1200x800.webp`,
    alt: 'ส่งรูปกล้องผ่าน LINE เพื่อประเมินราคา',
    width: 1200,
    height: 800,
  },
  processInspection: {
    src: `${SITE}/process-inspection-1200x800.webp`,
    alt: 'ตรวจเช็กกล้องมือสองก่อนรับซื้อ',
    width: 1200,
    height: 800,
  },
  processPayment: {
    src: `${SITE}/process-payment-1200x800.webp`,
    alt: 'รับเงินทันทีหลังขายกล้องมือสอง',
    width: 1200,
    height: 800,
  },
  trustLineExample: {
    src: `${SITE}/trust-line-example-800x600.webp`,
    alt: 'ตัวอย่างขั้นตอนแชท LINE ประเมินราคากล้องมือสอง',
    width: 800,
    height: 600,
  },
  trustTransferExample: {
    src: `${SITE}/trust-transfer-example-800x600.webp`,
    alt: 'ตัวอย่างขั้นตอนการโอนเงินหลังขายกล้องมือสอง',
    width: 800,
    height: 600,
  },
  aboutStoreSign: {
    src: `${SITE}/about-store-sign-800x800.webp`,
    alt: 'ป้ายหน้าร้านรับซื้อกล้องมือสอง อุบลราชธานี',
    width: 800,
    height: 800,
  },
  aboutInspectionDesk: {
    src: `${SITE}/about-inspection-desk-1200x800.webp`,
    alt: 'โต๊ะตรวจเช็กกล้องมือสอง อุบลราชธานี',
    width: 1200,
    height: 800,
  },
  aboutWorkbench: {
    src: `${SITE}/about-workbench-1200x800.webp`,
    alt: 'ทีมงานตรวจสอบกล้องมือสองก่อนรับซื้อ อุบลราชธานี',
    width: 1200,
    height: 800,
  },
  processShutterCount: {
    src: `${SITE}/process-shutter-count-1200x630.webp`,
    alt: 'เช็ค shutter count ก่อนขายกล้องมือสอง',
    width: 1200,
    height: 630,
  },
  processSensorCheck: {
    src: `${SITE}/process-sensor-check-1200x630.webp`,
    alt: 'ตรวจสภาพเซนเซอร์และเลนส์ก่อนรับซื้อกล้อง',
    width: 1200,
    height: 630,
  },
  processEms: {
    src: `${SITE}/process-ems-1200x630.webp`,
    alt: 'ขายกล้องผ่าน EMS หรือนัดรับถึงที่ อุบลราชธานี',
    width: 1200,
    height: 630,
  },
} as const satisfies Record<string, SiteImage>;

/**
 * Phase 2 — real trust photography slots.
 * NOT wired into pages until status = 'ready' and targetSrc file exists.
 * src points to Phase 1 mockup so build/audit stay green.
 */
const REAL = '/images/site/real';

export const REAL_TRUST_IMAGES = {
  realLineChat1: {
    src: `${SITE}/process-line-chat-1200x800.webp`,
    targetSrc: `${REAL}/real-line-chat-1-1200x800.webp`,
    alt: 'ตัวอย่างแชท LINE ประเมินราคากล้องมือสอง',
    width: 1200,
    height: 800,
    note: 'ต้อง blur ชื่อลูกค้า เบอร์โทร รูปโปรไฟล์ และข้อความส่วนตัวก่อนใช้จริง',
    status: 'placeholder',
  },
  realLineChat2: {
    src: `${SITE}/trust-line-example-800x600.webp`,
    targetSrc: `${REAL}/real-line-chat-2-1200x800.webp`,
    alt: 'ตัวอย่างบทสนทนา LINE หลังตกลงราคากล้อง',
    width: 1200,
    height: 800,
    note: 'ต้อง blur ชื่อลูกค้า เลขบัญชี และข้อความส่วนตัวก่อนใช้จริง',
    status: 'placeholder',
  },
  realTransferSlip1: {
    src: `${SITE}/trust-transfer-example-800x600.webp`,
    targetSrc: `${REAL}/real-transfer-slip-1-800x600.webp`,
    alt: 'ตัวอย่างสลิปโอนเงินหลังขายกล้องมือสอง',
    width: 800,
    height: 600,
    note: 'ต้อง blur เลขบัญชี ชื่อบัญชี ยอดเงิน และ QR ก่อนใช้จริง',
    status: 'placeholder',
  },
  realTransferSlip2: {
    src: `${SITE}/process-payment-1200x800.webp`,
    targetSrc: `${REAL}/real-transfer-slip-2-800x600.webp`,
    alt: 'ตัวอย่างการโอนเงินค่ารับซื้อกล้อง',
    width: 800,
    height: 600,
    note: 'ต้อง blur เลขบัญชี ชื่อบัญชี และรหัสอ้างอิงก่อนใช้จริง',
    status: 'placeholder',
  },
  realStorefrontWide: {
    src: `${SITE}/about-store-sign-800x800.webp`,
    targetSrc: `${REAL}/real-storefront-wide-1600x900.webp`,
    alt: 'หน้าร้านรับซื้อกล้องมือสอง อุบลราชธานี',
    width: 1600,
    height: 900,
    note: 'ถ่ายกลางวัน ป้ายร้านอ่านได้ชัด ไม่ต้อง blur (ไม่มี PII)',
    status: 'placeholder',
  },
  realOwnerTeam: {
    src: `${SITE}/about-workbench-1200x800.webp`,
    targetSrc: `${REAL}/real-owner-team-1200x800.webp`,
    alt: 'ทีมงานตรวจสอบกล้องมือสองที่ร้าน',
    width: 1200,
    height: 800,
    note: 'ขอความยินยอมก่อนเผยหน้า blur ป้ายชื่อพนักงานถ้ามี',
    status: 'placeholder',
  },
  realInspectionDesk: {
    src: `${SITE}/about-inspection-desk-1200x800.webp`,
    targetSrc: `${REAL}/real-inspection-desk-1200x800.webp`,
    alt: 'โต๊ะตรวจเช็กกล้องมือสองก่อนรับซื้อ',
    width: 1200,
    height: 800,
    note: 'blur serial number กล้องลูกค้าและสติกเกอร์ส่วนตัวถ้ามีในภาพ',
    status: 'placeholder',
  },
  realGoogleBusiness: {
    src: `${SITE}/about-store-sign-800x800.webp`,
    targetSrc: `${REAL}/real-google-business-1200x800.webp`,
    alt: 'หน้า Google Business ของร้านรับซื้อกล้องมือสอง',
    width: 1200,
    height: 800,
    note: 'blur ชื่อรีวิวเต็ม เบอร์โทรใน screenshot และข้อมูลส่วนตัว',
    status: 'placeholder',
  },
} as const satisfies Record<string, SiteImage>;

/** Keys must stay unique — used by QA */
export const REAL_TRUST_IMAGE_KEYS = Object.keys(REAL_TRUST_IMAGES);

export const PROCESS_PHOTO_TIPS: SiteImage[] = [
  {
    src: `${SITE}/process-photo-front-600x450.webp`,
    alt: 'ตัวอย่างถ่ายรูปด้านหน้ากล้องส่งประเมินราคา',
    width: 600,
    height: 450,
  },
  {
    src: `${SITE}/process-photo-back-600x450.webp`,
    alt: 'ตัวอย่างถ่ายรูปด้านหลังกล้องส่งประเมินราคา',
    width: 600,
    height: 450,
  },
  {
    src: `${SITE}/process-photo-screen-600x450.webp`,
    alt: 'ตัวอย่างถ่ายรูปจอกล้องส่งประเมินราคา',
    width: 600,
    height: 450,
  },
  {
    src: `${SITE}/process-photo-lens-600x450.webp`,
    alt: 'ตัวอย่างถ่ายรูปเลนส์กล้องส่งประเมินราคา',
    width: 600,
    height: 450,
  },
  {
    src: `${SITE}/process-photo-accessories-600x450.webp`,
    alt: 'ตัวอย่างถ่ายรูปอุปกรณ์ครบชุดส่งประเมินราคา',
    width: 600,
    height: 450,
  },
  {
    src: `${SITE}/process-photo-serial-600x450.webp`,
    alt: 'ตัวอย่างถ่ายรูปสภาพกล้องและอุปกรณ์ก่อนส่ง',
    width: 600,
    height: 450,
  },
];

export const BRAND_IMAGES: Record<
  string,
  SiteImage & { id: string; name: string }
> = {
  canon: {
    id: 'canon',
    name: 'Canon',
    src: `${SITE}/brand-canon-1200x800.webp`,
    alt: 'รับซื้อกล้อง Canon มือสอง EOS R DSLR',
    width: 1200,
    height: 800,
  },
  sony: {
    id: 'sony',
    name: 'Sony',
    src: `${SITE}/brand-sony-1200x800.webp`,
    alt: 'รับซื้อกล้อง Sony มือสอง A7 A6400 ZV-E10',
    width: 1200,
    height: 800,
  },
  fujifilm: {
    id: 'fujifilm',
    name: 'Fujifilm',
    src: `${SITE}/brand-fujifilm-1200x800.webp`,
    alt: 'รับซื้อกล้อง Fujifilm มือสอง X-T X100 X-S',
    width: 1200,
    height: 800,
  },
  nikon: {
    id: 'nikon',
    name: 'Nikon',
    src: `${SITE}/brand-nikon-1200x800.webp`,
    alt: 'รับซื้อกล้อง Nikon มือสอง Z series DSLR',
    width: 1200,
    height: 800,
  },
  leica: {
    id: 'leica',
    name: 'Leica',
    src: `${SITE}/brand-leica-1200x800.webp`,
    alt: 'รับซื้อกล้อง Leica มือสอง M Q SL',
    width: 1200,
    height: 800,
  },
  panasonic: {
    id: 'panasonic',
    name: 'Panasonic',
    src: `${SITE}/brand-panasonic-1200x800.webp`,
    alt: 'รับซื้อกล้อง Panasonic Lumix มือสอง',
    width: 1200,
    height: 800,
  },
  olympus: {
    id: 'olympus',
    name: 'Olympus',
    src: `${SITE}/brand-olympus-1200x800.webp`,
    alt: 'รับซื้อกล้อง Olympus OM System มือสอง',
    width: 1200,
    height: 800,
  },
  dji: {
    id: 'dji',
    name: 'DJI',
    src: `${SITE}/brand-dji-1200x800.webp`,
    alt: 'รับซื้อ DJI มือสอง โดรน Osmo Action Pocket',
    width: 1200,
    height: 800,
  },
};

export const HOME_PROCESS_STEPS = [
  SITE_IMAGES.processLineChat,
  SITE_IMAGES.processInspection,
  SITE_IMAGES.processPayment,
] as const;

export const REVIEW_GALLERY: SiteImage[] = [
  SITE_IMAGES.trustLineExample,
  SITE_IMAGES.trustTransferExample,
  {
    src: '/images/uploads/2025/06/LINE_NOTE_250618_9.webp',
    alt: 'ตัวอย่างกล้องที่รับซื้อมือสอง',
    width: 800,
    height: 600,
  },
  {
    src: '/images/uploads/2025/06/S__18694154.webp',
    alt: 'ตัวอย่างกล้องและเลนส์ที่รับซื้อ',
    width: 800,
    height: 600,
  },
  {
    src: '/images/uploads/2025/06/LINE_NOTE_250618_10.webp',
    alt: 'ตัวอย่างขั้นตอนตรวจสอบกล้องก่อนรับซื้อ',
    width: 800,
    height: 600,
  },
  {
    src: '/images/uploads/2025/06/LINE_NOTE_250618_11.webp',
    alt: 'ตัวอย่างการรับซื้อกล้องมือสองทาง EMS',
    width: 800,
    height: 600,
  },
];

export const ABOUT_TRUST_GALLERY: SiteImage[] = [
  SITE_IMAGES.aboutStoreSign,
  SITE_IMAGES.aboutInspectionDesk,
  SITE_IMAGES.aboutWorkbench,
  SITE_IMAGES.trustLineExample,
];
