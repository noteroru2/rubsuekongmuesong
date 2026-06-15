/** Normalize WordPress lazy-load markup for static rendering. */
export function fixWordPressHtml(html: string): string {
  if (!html) return html;

  let out = html;

  // Promote Smush / native lazyload attributes before URL rewrites run at build time.
  out = out.replace(/<img\b([^>]*?)>/gi, (tag) => {
    let next = tag;
    const dataSrc = next.match(/\bdata-src=(["'])(.*?)\1/i);
    if (dataSrc && !dataSrc[2].startsWith('data:')) {
      next = next.replace(/\bsrc=(["'])data:image\/svg\+xml[^"']*\1/i, '');
      if (!/\bsrc=/i.test(next)) {
        next = next.replace('<img', `<img src="${dataSrc[2]}"`);
      } else {
        next = next.replace(/\bsrc=(["'])[^"']*\1/i, `src="${dataSrc[2]}"`);
      }
      next = next.replace(/\bdata-src=(["'])[^"']*\1/i, '');
    }

    const dataSrcset = next.match(/\bdata-srcset=(["'])(.*?)\1/i);
    if (dataSrcset) {
      if (!/\bsrcset=/i.test(next)) {
        next = next.replace('<img', `<img srcset="${dataSrcset[2]}"`);
      } else {
        next = next.replace(/\bsrcset=(["'])[^"']*\1/i, `srcset="${dataSrcset[2]}"`);
      }
      next = next.replace(/\bdata-srcset=(["'])[^"']*\1/i, '');
    }

    next = next.replace(/\bdata-sizes=(["'])[^"']*\1/i, '');
    next = next.replace(/\sclass=(["'])([^"']*)\1/i, (_, q, classes) => {
      const cleaned = classes.replace(/\blazyload\b/g, '').replace(/\s+/g, ' ').trim();
      return cleaned ? ` class="${cleaned}"` : '';
    });
    return next;
  });

  // Thai UI strings from WordPress theme
  out = out.replace(/Read More\s*→/gi, 'อ่านต่อ →');
  out = out.replace(/>\s*Read More\s*</gi, '>อ่านต่อ<');
  out = out.replace(/Continue Reading/gi, 'อ่านต่อ');

  return out;
}
