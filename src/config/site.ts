export const SITE_URL = 'https://xn--12cman8e0bjt1czaccb9b1fg31ad.com';

export function absoluteAsset(assetPath: string): string {
  if (assetPath.startsWith('http')) return assetPath;
  return `${SITE_URL}${assetPath.startsWith('/') ? assetPath : `/${assetPath}`}`;
}

export const SITE_NAME = 'รับซื้อกล้องมือสอง';
export const SITE_DESCRIPTION = 'ให้บริการรับซื้อกล้องมือสองทุกรุ่น ทุกยี่ห้อ';

export const LINE_ID = '@webuy';
export const LINE_ID_SHORT = 'webuy';

export const CONTACT = {
  phone: '0642579353',
  phoneHref: 'tel:0642579353',
  line: 'https://lin.ee/Nh7ZANi',
  lineCta: 'https://lin.ee/jItlaqF',
  facebook: 'https://www.facebook.com/Amphontrading',
  googleReviews: 'https://maps.app.goo.gl/sBehfGeforQ59iCW8',
} as const;

export const COMPANY = {
  name: 'บริษัท อำพล เทรดิ้ง จำกัด',
  address: '740/8 ถนนชยางกูร ตำบลในเมือง อำเภอเมืองอุบลราชธานี จังหวัดอุบลราชธานี 34000',
} as const;

export const NAV_LINKS = [
  { href: '/', label: 'หน้าแรก' },
  { href: '/models/', label: 'รุ่นที่รับซื้อ' },
  { href: '/process/', label: 'ขั้นตอนการขาย' },
  { href: '/review/', label: 'รีวิว' },
  { href: '/blog/', label: 'บทความ' },
  { href: '/about/', label: 'เกี่ยวกับเรา' },
] as const;

export const LOGO_URL = '/images/brand/logo-header.webp';
export const LOGO_WIDTH = 228;
export const LOGO_HEIGHT = 80;

export const FAVICON_URL = '/images/brand/favicon-32.webp';

export const APPLE_TOUCH_ICON_URL = '/images/brand/apple-touch-icon-180.webp';

export const FOOTER_LOGO_URL = '/images/brand/logo-footer.webp';
export const FOOTER_LOGO_WIDTH = 364;
export const FOOTER_LOGO_HEIGHT = 128;

export const OG_DEFAULT_IMAGE = '/images/uploads/2025/06/รับซื้อกล้องมือสอง.webp';
