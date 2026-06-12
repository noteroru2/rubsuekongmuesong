import { absoluteAsset, COMPANY, CONTACT, LOGO_URL, OG_DEFAULT_IMAGE, SITE_NAME, SITE_URL } from '../config/site';
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
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: CONTACT.phone,
        contactType: 'customer service',
        availableLanguage: 'Thai',
      },
      address: {
        '@type': 'PostalAddress',
        streetAddress: COMPANY.address,
        addressCountry: 'TH',
      },
      sameAs: [CONTACT.facebook, CONTACT.googleReviews, CONTACT.line],
    },
    {
      '@type': 'LocalBusiness',
      '@id': `${SITE_URL}/#localbusiness`,
      name: SITE_NAME,
      image: absoluteAsset(OG_DEFAULT_IMAGE),
      url: SITE_URL,
      telephone: CONTACT.phone,
      address: {
        '@type': 'PostalAddress',
        streetAddress: COMPANY.address,
        addressLocality: 'อุบลราชธานี',
        addressCountry: 'TH',
      },
      parentOrganization: { '@id': ORG_ID },
    },
    {
      '@type': 'WebSite',
      '@id': WEBSITE_ID,
      url: SITE_URL,
      name: SITE_NAME,
      publisher: { '@id': ORG_ID },
      inLanguage: 'th',
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
  };

  if (page.datePublished) webPage.datePublished = page.datePublished;
  if (page.dateModified) webPage.dateModified = page.dateModified;

  graph.push(webPage);

  if (page.pageType === 'article' || page.pageType === 'post') {
    graph.push({
      '@type': 'Article',
      '@id': `${pageUrl}#article`,
      headline: page.seo.h1 || page.seo.title,
      description: page.seo.metaDescription,
      datePublished: page.datePublished,
      dateModified: page.dateModified,
      author: { '@type': 'Organization', name: SITE_NAME },
      publisher: { '@id': ORG_ID },
      mainEntityOfPage: { '@id': `${pageUrl}#webpage` },
      inLanguage: 'th',
    });
  }

  const breadcrumbItems = [{ name: 'Home', item: SITE_URL }];
  if (page.path !== '/') {
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
