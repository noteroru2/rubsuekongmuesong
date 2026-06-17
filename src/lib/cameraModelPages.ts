import modelPagesJson from '../../content-input/camera-model-pages.json';

export interface CameraModelPageLink {
  brand: string;
  modelName: string;
  slug: string;
}

export const CAMERA_MODEL_PAGES = modelPagesJson as CameraModelPageLink[];

const BRAND_ID_TO_NAME: Record<string, string> = {
  sony: 'Sony',
  canon: 'Canon',
  fujifilm: 'Fujifilm',
  nikon: 'Nikon',
};

const POPULAR_BRAND_ORDER = ['Sony', 'Canon', 'Fujifilm', 'Nikon'] as const;

export function modelPageHref(slug: string): string {
  return `/models/${slug}/`;
}

export function modelPageAnchor(model: Pick<CameraModelPageLink, 'modelName'>): string {
  return `รับซื้อ ${model.modelName}`;
}

export function getCameraModelPagesForBrandId(brandId: string): CameraModelPageLink[] {
  const brandName = BRAND_ID_TO_NAME[brandId];
  if (!brandName) return [];
  return CAMERA_MODEL_PAGES.filter((p) => p.brand === brandName);
}

export const POPULAR_MODEL_BRANDS = POPULAR_BRAND_ORDER.map((brand) => ({
  id: brand.toLowerCase(),
  name: brand,
  models: CAMERA_MODEL_PAGES.filter((p) => p.brand === brand),
}));
