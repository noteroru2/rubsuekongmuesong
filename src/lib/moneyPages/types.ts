export interface FAQItem {
  question: string;
  answer: string;
}

export interface MoneyStep {
  title: string;
  description: string;
}

export interface PriceFactor {
  title: string;
  description: string;
}

export interface BrandModels {
  brand: string;
  slug: string;
  models: string[];
}

export interface ProvinceLink {
  name: string;
  path: string;
}

export interface ProvinceMoneyPage {
  path: string;
  provinceName: string;
  quickAnswer: string;
  introParagraphs: string[];
  brands: string[];
  popularModels: BrandModels[];
  districts: string[];
  steps: MoneyStep[];
  priceFactors: PriceFactor[];
  faqs: FAQItem[];
  nearbyProvinces: ProvinceLink[];
}

export interface BrandMoneyPage {
  id: string;
  name: string;
  quickAnswer: string;
  popularModels: string[];
  easySellModels: string[];
  priceFactors: PriceFactor[];
  photoChecklist: string[];
  faqs: FAQItem[];
  topProvinces: ProvinceLink[];
}

export interface RelatedContentLink {
  href: string;
  label: string;
}

export interface ShutterCountEnhancement {
  quickAnswer: string;
  brandSteps: Array<{ brand: string; steps: string[] }>;
  shutterLevels: Array<{ level: string; range: string; meaning: string }>;
  faqs: FAQItem[];
  relatedLinks?: RelatedContentLink[];
}

export interface ArticleMoneyEnhancement {
  quickAnswer: string;
  sections?: Array<{ title: string; items: string[] }>;
  faqs: FAQItem[];
  sellCtaTitle?: string;
  sellCtaDesc?: string;
  relatedLinks?: RelatedContentLink[];
}

export interface CategoryHubEnhancement {
  quickAnswer: string;
  intro: string;
  provinces: ProvinceLink[];
}
