// Camera C3 — dependency-free imported-content hygiene helpers.

/**
 * The Astro template owns the page H1. Preserve imported heading content but
 * demote every embedded H1 to H2 so rendered pages cannot contain competing H1s.
 */
export function sanitizeImportedHeadings(html = '') {
  if (!html) return html;
  return String(html)
    .replace(/<h1\b([^>]*)>/gi, '<h2$1>')
    .replace(/<\/h1>/gi, '</h2>');
}

export function countH1(html = '') {
  return (String(html).match(/<h1\b/gi) || []).length;
}
