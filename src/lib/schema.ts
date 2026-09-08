import {
  absoluteAsset,
  CONTACT,
  LINE_ID,
  LOGO_URL,
  OG_DEFAULT_IMAGE,
  SITE_NAME,
  SITE_URL,
} from '../config/site';
import type { PageRecord } from './types';
import {
  PAGE_INTENTS,
  classifyPageIntent,
  getIntentBreadcrumbParent,
  isEditorialIntent,
  isServiceIntent,
} from './pageIntent.js';

const ORG_ID = `${SITE_URL}/#organization`;
const LOCAL_BUSINESS_ID = `${SITE_URL}/#localbusiness`;
const WEBSITE_ID = `${SITE_URL}/#website`;

const THAI_PROVINCES = [
  'กรุงเทพมหานคร','กระบี่','กาญจนบุรี','กาฬสินธุ์','กำแพงเพชร','ขอนแก่น','จันทบุรี','ฉะเชิงเทรา','ชลบุรี','ชัยนาท','ชัยภูมิ','ชุมพร','เชียงราย','เชียงใหม่','ตรัง','ตราด','ตาก','นครนายก','นครปฐม','นครพนม','นครราชสีมา','นครศรีธรรมราช','นครสวรรค์','นนทบุรี','นราธิวาส','น่าน','บึงกาฬ','บุรีรัมย์','ปทุมธานี','ประจวบคีรีขันธ์','ปราจีนบุรี','ปัตตานี','พระนครศรีอยุธยา','พะเยา','พังงา','พัทลุง','พิจิตร','พิษณุโลก','เพชรบุรี','เพชรบูรณ์','แพร่','ภูเก็ต','มหาสารคาม','มุกดาหาร','แม่ฮ่องสอน','ยโสธร','ยะลา','ร้อยเอ็ด','ระนอง','ระยอง','ราชบุรี','ลพบุรี','ลำปาง','ลำพูน','เลย','ศรีสะเกษ','สกลนคร','สงขลา','สตูล','สมุทรปราการ','สมุทรสงคราม','สมุทรสาคร','สระแก้ว','สระบุรี','สิงห์บุรี','สุโขทัย','สุพรรณบุรี','สุราษฎร์ธานี','สุรินทร์','หนองคาย','หนองบัวลำภู','อ่างทอง','อำนาจเจริญ','อุดรธานี','อุตรดิตถ์','อุทัยธานี','อุบลราชธานี',
];

export function buildBaseGraph(): Record<string, unknown>[] {
  return [
    {
      '@type': 'Organization',
      '@id': ORG_ID,
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: absoluteAsset(LOGO_URL),
        width: 512,
        height: 512,
      },
      contactPoint: [
        {
          '@type': 'ContactPoint',
          telephone: CONTACT.phone,
          contactType: 'customer service',
          availableLanguage: 'Thai',
          areaServed: 'TH',
        },
        {
          '@type': 'ContactPoint',
          url: CONTACT.lineCta,
          contactType: 'sales',
          availableLanguage: 'Thai',
          areaServed: 'TH',
        },
      ],
      address: {
        '@type': 'PostalAddress',
        streetAddress: '740/8 ถนนชยางกูร',
        addressLocality: 'อุบลราชธานี',
        addressRegion: 'อุบลราชธานี',
        postalCode: '34000',
        addressCountry: 'TH',
      },
      sameAs: [CONTACT.facebook, CONTACT.googleReviews, CONTACT.line],
    },
    {
      '@type': ['LocalBusiness', 'Store'],
      '@id': LOCAL_BUSINESS_ID,
      name: SITE_NAME,
      description: `รับซื้อกล้องมือสองทุกยี่ห้อ Canon, Sony, Nikon, Fujifilm, Leica พร้อมประเมินราคาออนไลน์ฟรีผ่าน Line ${LINE_ID}`,
      image: absoluteAsset(OG_DEFAULT_IMAGE),
      url: SITE_URL,
      telephone: CONTACT.phone,
      priceRange: '฿฿',
      currenciesAccepted: 'THB',
      paymentAccepted: 'Cash, Bank Transfer',
      address: {
        '@type': 'PostalAddress',
        streetAddress: '740/8 ถนนชยางกูร',
        addressLocality: 'อุบลราชธานี',
        addressRegion: 'อุบลราชธานี',
        postalCode: '34000',
        addressCountry: 'TH',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 15.2287,
        longitude: 104.8586,
      },
      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
          opens: '08:00',
          closes: '20:00',
        },
      ],
      areaServed: { '@type': 'Country', name: 'Thailand' },
      parentOrganization: { '@id': ORG_ID },
    },
    {
      '@type': 'WebSite',
      '@id': WEBSITE_ID,
      url: SITE_URL,
      name: SITE_NAME,
      description: `รับซื้อกล้องมือสองทุกรุ่น ทุกยี่ห้อ Line ${LINE_ID}`,
      publisher: { '@id': ORG_ID },
      inLanguage: 'th',
    },
  ];
}

function canonicalUrl(page: PageRecord): string {
  return page.seo.canonical?.startsWith('http')
    ? page.seo.canonical
    : `${SITE_URL}${page.path}`;
}

function findProvince(page: PageRecord): string | null {
  const text = decodeURIComponent(
    [page.seo.h1, page.seo.title, page.path].filter(Boolean).join(' '),
  );
  return THAI_PROVINCES.find((province) => text.includes(province)) || null;
}

function buildServiceNode(page: PageRecord, pageUrl: string, intent: string): Record<string, unknown> {
  const province = intent === PAGE_INTENTS.LOCAL_SERVICE ? findProvince(page) : null;
  const serviceType = intent === PAGE_INTENTS.MODEL_SERVICE
    ? 'รับซื้อกล้องมือสองตามรุ่น'
    : 'รับซื้อกล้องมือสอง';

  return {
    '@type': 'Service',
    '@id': `${pageUrl}#service`,
    name: page.seo.h1 || page.seo.title,
    description: page.seo.metaDescription,
    serviceType,
    provider: { '@id': LOCAL_BUSINESS_ID },
    areaServed: province
      ? { '@type': 'AdministrativeArea', name: province }
      : { '@type': 'Country', name: 'Thailand' },
    url: pageUrl,
    mainEntityOfPage: { '@id': `${pageUrl}#webpage` },
  };
}

function buildArticleNode(page: PageRecord, pageUrl: string, intent: string): Record<string, unknown> {
  const articleNode: Record<string, unknown> = {
    '@type': 'Article',
    '@id': `${pageUrl}#article`,
    headline: page.seo.h1 || page.seo.title,
    description: page.seo.metaDescription,
    author: { '@id': ORG_ID },
    publisher: { '@id': ORG_ID },
    mainEntityOfPage: { '@id': `${pageUrl}#webpage` },
    inLanguage: 'th',
    articleSection: intent === PAGE_INTENTS.GUIDE ? 'คู่มือและความรู้เรื่องกล้อง' : 'บทความกล้อง',
  };
  if (page.datePublished) articleNode.datePublished = page.datePublished;
  if (page.dateModified) articleNode.dateModified = page.dateModified;
  if (page.seo.ogImage) articleNode.image = absoluteAsset(page.seo.ogImage);
  if (page.seo.wordCount) articleNode.wordCount = page.seo.wordCount;
  return articleNode;
}

function buildBreadcrumbNode(page: PageRecord, pageUrl: string): Record<string, unknown> {
  const items = [{ name: 'หน้าแรก', item: SITE_URL }];
  const parent = getIntentBreadcrumbParent(page);
  if (parent && parent.href !== page.path) {
    items.push({ name: parent.label, item: `${SITE_URL}${parent.href}` });
  }
  if (page.path !== '/') {
    items.push({ name: page.seo.h1 || page.seo.title, item: pageUrl });
  }

  return {
    '@type': 'BreadcrumbList',
    '@id': `${pageUrl}#breadcrumb`,
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.item,
    })),
  };
}

export function buildPageGraph(page: PageRecord): Record<string, unknown>[] {
  // C3 deliberately does not reuse imported WordPress schemaGraph. The current
  // page intent is the source of truth so legacy Article/FAQ markup cannot leak
  // into service and model pages.
  const pageUrl = canonicalUrl(page);
  const intent = classifyPageIntent(page);
  const graph = buildBaseGraph();

  const webPage: Record<string, unknown> = {
    '@type': 'WebPage',
    '@id': `${pageUrl}#webpage`,
    url: pageUrl,
    name: page.seo.title,
    description: page.seo.metaDescription,
    isPartOf: { '@id': WEBSITE_ID },
    inLanguage: 'th',
    publisher: { '@id': ORG_ID },
  };
  if (page.seo.ogImage) {
    webPage.primaryImageOfPage = {
      '@type': 'ImageObject',
      url: absoluteAsset(page.seo.ogImage),
    };
  }
  graph.push(webPage);

  if (isServiceIntent(intent)) {
    graph.push(buildServiceNode(page, pageUrl, intent));
  } else if (isEditorialIntent(intent)) {
    graph.push(buildArticleNode(page, pageUrl, intent));
  }

  graph.push(buildBreadcrumbNode(page, pageUrl));
  return graph;
}
