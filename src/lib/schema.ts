import { absoluteAsset, COMPANY, CONTACT, LINE_ID, LOGO_URL, OG_DEFAULT_IMAGE, SITE_NAME, SITE_URL } from '../config/site';
import type { PageRecord } from './types';

const ORG_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;

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
      '@id': `${SITE_URL}/#localbusiness`,
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
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'บริการรับซื้อกล้องมือสอง',
        itemListElement: [
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'รับซื้อกล้อง DSLR มือสอง' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'รับซื้อกล้อง Mirrorless มือสอง' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'รับซื้อเลนส์กล้องมือสอง' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'ประเมินราคากล้องออนไลน์ฟรี' } },
        ],
      },
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
      potentialAction: {
        '@type': 'SearchAction',
        target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/blog/?q={search_term_string}` },
        'query-input': 'required name=search_term_string',
      },
    },
  ];
}

export function buildPageGraph(page: PageRecord): Record<string, unknown>[] {
  if (page.schemaGraph?.length) {
    const json = JSON.stringify(page.schemaGraph);
    const fixed = json.replace(/"(\/images\/[^"]+)"/g, (_, assetPath: string) =>
      JSON.stringify(absoluteAsset(assetPath)),
    );
    return JSON.parse(fixed);
  }

  const pageUrl = page.seo.canonical || `${SITE_URL}${page.path}`;
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

  if (page.datePublished) webPage.datePublished = page.datePublished;
  if (page.dateModified) webPage.dateModified = page.dateModified;
  if (page.seo.ogImage) webPage.primaryImageOfPage = absoluteAsset(page.seo.ogImage);

  graph.push(webPage);

  if (page.pageType === 'article' || page.pageType === 'post') {
    const articleNode: Record<string, unknown> = {
      '@type': 'Article',
      '@id': `${pageUrl}#article`,
      headline: page.seo.h1 || page.seo.title,
      description: page.seo.metaDescription,
      datePublished: page.datePublished,
      dateModified: page.dateModified,
      author: { '@type': 'Organization', '@id': ORG_ID, name: SITE_NAME },
      publisher: { '@id': ORG_ID },
      mainEntityOfPage: { '@id': `${pageUrl}#webpage` },
      inLanguage: 'th',
    };
    if (page.seo.ogImage) articleNode.image = absoluteAsset(page.seo.ogImage);
    if (page.seo.wordCount) articleNode.wordCount = page.seo.wordCount;
    graph.push(articleNode);
  }

  if (page.pageType === 'location') {
    const locationName = page.seo.h1 || page.seo.title;
    graph.push({
      '@type': 'Service',
      '@id': `${pageUrl}#service`,
      name: locationName,
      description: page.seo.metaDescription,
      serviceType: 'รับซื้อกล้องมือสอง',
      provider: { '@id': ORG_ID },
      areaServed: extractProvince(page.path),
      url: pageUrl,
    });
  }

  const breadcrumbItems = [{ name: 'หน้าแรก', item: SITE_URL }];
  if (page.path !== '/') {
    const segments = page.path.split('/').filter(Boolean);
    if (segments.length > 1) {
      const parentPath = `${SITE_URL}/${segments.slice(0, -1).join('/')}/`;
      breadcrumbItems.push({ name: decodeURIComponent(segments[segments.length - 2] ?? ''), item: parentPath });
    }
    breadcrumbItems.push({ name: page.seo.h1 || page.seo.title, item: pageUrl });
  }

  graph.push({
    '@type': 'BreadcrumbList',
    '@id': `${pageUrl}#breadcrumb`,
    itemListElement: breadcrumbItems.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.item,
    })),
  });

  return graph;
}

function extractProvince(path: string): string {
  const decoded = decodeURIComponent(path);
  const m = decoded.match(/จังหวัด([^/\-]+)/) || decoded.match(/([ก-๙]+)(?:จังหวัด)?/);
  if (m?.[1]) return m[1].trim();
  const segment = decoded.split('/').filter(Boolean).pop() ?? '';
  return segment.slice(0, 20) || 'ไทย';
}

export function buildFaqGraph(
  faqs: Array<{ question: string; answer: string }>,
  pageUrl: string,
): Record<string, unknown> | null {
  if (!faqs.length) return null;
  return {
    '@type': 'FAQPage',
    '@id': `${pageUrl}#faq`,
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/** Extract FAQ pairs from HTML: h2/h3 headings → first following paragraph */
export function extractFaqFromHtml(html: string): Array<{ question: string; answer: string }> {
  if (!html || html.length < 100) return [];
  const pairs: Array<{ question: string; answer: string }> = [];

  const stripTags = (s: string) =>
    s
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/\s+/g, ' ')
      .trim();

  const re = /<h[23][^>]*>([\s\S]{4,200}?)<\/h[23]>[\s\S]{0,400}?<p[^>]*>([\s\S]{20,600}?)<\/p>/gi;
  let m: RegExpExecArray | null;

  while ((m = re.exec(html)) !== null && pairs.length < 5) {
    const q = stripTags(m[1])
      .replace(/^[\u{1F300}-\u{1FFFF}\u2600-\u27BF✅✓☑♦•·-]+\s*/u, '')
      .trim();
    const rawA = stripTags(m[2]);
    const a = rawA.length > 350 ? rawA.slice(0, 347) + '…' : rawA;

    if (q.length >= 5 && a.length >= 15 && !/^\d+$/.test(q)) {
      pairs.push({ question: q, answer: a });
    }
  }

  return pairs;
}

/** Predefined FAQ for pages without heading structure (AEO/GEO fallback) */
export function buildGenericFaq(
  pageType: string,
  h1: string,
  _metaDesc: string,
): Array<{ question: string; answer: string }> {
  if (pageType === 'homepage') {
    return [
      {
        question: 'รับซื้อกล้องมือสองยี่ห้ออะไรบ้าง?',
        answer: `รับซื้อกล้องมือสองทุกยี่ห้อ ทั้ง Canon, Sony, Nikon, Fujifilm, Leica, Olympus, Panasonic, DJI และอื่นๆ ทั้ง DSLR, Mirrorless, Compact รวมถึงเลนส์ทุกประเภท`,
      },
      {
        question: 'ขั้นตอนการขายกล้องมือสองทำอย่างไร?',
        answer: `เพียง 3 ขั้นตอน: (1) ส่งรูปกล้องพร้อมข้อมูลรุ่นและสภาพผ่าน Line ${LINE_ID} (2) รับราคาประเมินภายใน 10–30 นาที (3) นัดรับหรือส่ง EMS ได้รับเงินทันที`,
      },
      {
        question: 'รับซื้อกล้องมือสองราคาดีไหม?',
        answer: `ให้ราคาตามสภาพจริงและข้อมูลตลาด ไม่กดราคา โอนเงินทันทีหลังตรวจสอบ รับซื้อทั่วประเทศ ไม่ต้องออกจากบ้าน`,
      },
      {
        question: 'ส่งกล้องทางไปรษณีย์ได้ไหม?',
        answer: `ได้ รับซื้อทั่วประเทศ ส่ง EMS ได้ และรับซื้อถึงบ้านในพื้นที่กรุงเทพและปริมณฑล`,
      },
    ];
  }
  if (pageType === 'location') {
    const province = h1.replace(/ร้านรับซื้อกล้อง|รับซื้อกล้อง\s*/gi, '').trim() || '';
    return [
      {
        question: `ขายกล้องมือสอง${province ? ` ${province}` : ''} ได้ที่ไหน?`,
        answer: `ขายกล้องมือสองได้ผ่าน Line ${LINE_ID} ไม่ต้องเดินทาง ส่งรูปกล้องแล้วรับราคาภายใน 30 นาที โอนเงินทันที รับซื้อถึงบ้านหรือส่งพัสดุ EMS ก็ได้`,
      },
      {
        question: 'ขายกล้องออนไลน์ได้เงินทันทีไหม?',
        answer: `ได้ หลังตรวจสอบสภาพกล้องและตกลงราคากัน เราโอนเงินทันทีผ่านบัญชีธนาคาร ไม่มีหักค่าธรรมเนียม`,
      },
      {
        question: 'รับซื้อกล้องสภาพไม่ดีด้วยไหม?',
        answer: `รับซื้อทุกสภาพ พิจารณาราคาตามสภาพจริง ส่งรูปมาแล้วจะได้รับราคาที่ยุติธรรม`,
      },
    ];
  }
  return [];
}
