import { getBlogPosts, type ArticleSummary } from './articles';

/** Related posts sharing the first URL segment, then fill from latest. */
export function getRelatedPosts(path: string, limit = 3): ArticleSummary[] {
  const posts = getBlogPosts().filter((p) => p.path !== path);
  if (!posts.length) return [];

  const segment = path.split('/').filter(Boolean)[0];
  const sameSection = posts.filter((p) => p.path.startsWith(`/${segment}/`));
  const pool = [...sameSection, ...posts.filter((p) => !sameSection.includes(p))];
  const seen = new Set<string>();

  return pool.filter((p) => {
    if (seen.has(p.path)) return false;
    seen.add(p.path);
    return true;
  }).slice(0, limit);
}
