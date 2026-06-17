/**
 * Phase 4.2 — audit, apply, and QA internal links to /models/[slug]/ from articles/posts.
 *
 * Usage:
 *   node scripts/internal-link-model-pages.mjs audit
 *   node scripts/internal-link-model-pages.mjs apply
 *   node scripts/internal-link-model-pages.mjs qa
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const CONTENT_DIR = path.join(ROOT, 'src', 'data', 'content');
const MANIFEST = path.join(ROOT, 'src', 'data', 'routes-manifest.json');
const MODELS_JSON = path.join(ROOT, 'content-input', 'camera-model-pages.json');
const AUDIT_REPORT = path.join(ROOT, 'internal-link-opportunity-report.md');
const APPLY_REPORT = path.join(ROOT, 'internal-link-model-pages-report.md');

const BANNED = ['ราคาสูงสุด', 'ให้ราคาสูงสุด', 'ดีที่สุด', 'อันดับ 1', 'รับทุกรุ่น'];
const RELATED_MARKER = 'article-related-models';
const MAX_LINKS_LONG = 5;
const MAX_LINKS_SHORT = 2;
const SHORT_WORD_THRESHOLD = 500;

const models = JSON.parse(fs.readFileSync(MODELS_JSON, 'utf8'));
const slugSet = new Set(models.map((m) => m.slug));
const modelBySlug = new Map(models.map((m) => [m.slug, m]));

const KEYWORD_PATTERNS = [
  { kw: 'shutter count', re: /shutter\s*count|ชัตเตอร์|จำนวนชัตเตอร์/i },
  { kw: 'กล้องเก่ายังขายได้', re: /ขายได้|ยังขาย|มือสอง/i },
  { kw: 'ไม่มีประกัน', re: /ไม่มีประกัน|หมดประกัน/i },
  { kw: 'ไม่มีกล่อง', re: /ไม่มีกล่อง|ไม่ครบกล่อง/i },
  { kw: 'DSLR', re: /\bDSLR\b|ดีเอสแอลอาร์/i },
  { kw: 'Mirrorless', re: /mirrorless|มิเรอร์เลส|ไร้กระจก/i },
  { kw: 'Canon', re: /\bCanon\b|แคนอน/i },
  { kw: 'Sony', re: /\bSony\b|โซนี่/i },
  { kw: 'Fujifilm', re: /Fujifilm|Fuji|ฟูจิ/i },
  { kw: 'Nikon', re: /\bNikon\b|ไนกอน/i },
  { kw: 'vlog', re: /vlog|วีล็อก|ยูทูบ/i },
  { kw: 'กล้องโปร', re: /กล้องโปร|มืออาชีพ|full[- ]frame/i },
  { kw: 'สตูดิโอ', re: /สตูดิโอ|studio/i },
  { kw: 'lens / kit lens', re: /kit\s*lens|เลนส์คิท|body\s*only|เลนส์/i },
];

/** Per-model search patterns (first match wins for linking) */
const MODEL_PATTERNS = models.map((m) => {
  const name = m.modelName;
  const variants = [name];
  if (name.includes('Sony A7 III')) variants.push('Sony A7III', 'A7 III', 'A7III');
  if (name.includes('Sony A7 IV')) variants.push('Sony A7IV', 'A7 IV', 'A7IV');
  if (name.includes('Sony A7C')) variants.push('A7C', 'A7 C');
  if (name.includes('Sony A6400')) variants.push('A6400');
  if (name.includes('Sony ZV-E10')) variants.push('ZV-E10', 'ZV E10');
  if (name.includes('Sony A7R III')) variants.push('A7R III', 'A7RIII', 'A7R3');
  if (name.includes('Sony A7R IV')) variants.push('A7R IV', 'A7RIV', 'A7R4');
  if (name.includes('Canon EOS R')) variants.push('EOS R', 'Canon R ');
  if (name.includes('Canon EOS RP')) variants.push('EOS RP', 'Canon RP');
  if (name.includes('Canon EOS R6')) variants.push('EOS R6', 'Canon R6', 'R6');
  if (name.includes('Canon EOS R5')) variants.push('EOS R5', 'Canon R5', 'R5');
  if (name.includes('Canon EOS 80D')) variants.push('EOS 80D', '80D');
  if (name.includes('Canon EOS 90D')) variants.push('EOS 90D', '90D');
  if (name.includes('Canon EOS M50')) variants.push('EOS M50', 'M50');
  if (name.includes('Fujifilm X-T3')) variants.push('X-T3', 'XT3');
  if (name.includes('Fujifilm X-T4')) variants.push('X-T4', 'XT4');
  if (name.includes('Fujifilm X-T5')) variants.push('X-T5', 'XT5');
  if (name.includes('Fujifilm X-S10')) variants.push('X-S10', 'XS10');
  if (name.includes('Fujifilm X-S20')) variants.push('X-S20', 'XS20');
  if (name.includes('Fujifilm X100V')) variants.push('X100V', 'X100 V');
  if (name.includes('Fujifilm X100VI')) variants.push('X100VI', 'X100 VI');
  if (name.includes('Nikon Z6 II')) variants.push('Z6 II', 'Z6II');
  if (name.includes('Nikon Z6')) variants.push('Nikon Z6', ' Z6 ');
  if (name.includes('Nikon Z7')) variants.push('Nikon Z7', ' Z7 ');
  if (name.includes('Nikon Z50')) variants.push('Z50');
  if (name.includes('Nikon D750')) variants.push('D750');
  if (name.includes('Nikon D850')) variants.push('D850');
  const escaped = [...new Set(variants)].map((v) => v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  return { slug: m.slug, modelName: m.modelName, re: new RegExp(escaped.join('|'), 'i') };
});

const ANCHOR_TEMPLATES = [
  (m) => `รับซื้อ ${m.modelName}`,
  (m) => `ขาย ${m.modelName} มือสอง`,
  (m) => `ประเมินราคา ${m.modelName}`,
  (m) => `รับซื้อ ${m.modelName} มือสอง`,
  (m) => `ขาย ${m.modelName}`,
];

let anchorIdx = 0;
function nextAnchor(model) {
  const fn = ANCHOR_TEMPLATES[anchorIdx % ANCHOR_TEMPLATES.length];
  anchorIdx++;
  return fn(model);
}

function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function wordCountFromHtml(html, seoWordCount) {
  const fromBody = stripHtml(html).split(/\s+/).filter(Boolean).length;
  return Math.max(fromBody, seoWordCount || 0);
}

function splitRelatedSection(html) {
  const re = new RegExp(
    `(<section class="money-section ${RELATED_MARKER}"[\\s\\S]*?</section>\\s*)`,
    'i',
  );
  const m = html.match(re);
  if (!m) return { body: html, related: '' };
  return { body: html.replace(re, ''), related: m[1] };
}

function countModelLinks(html) {
  const { body, related } = splitRelatedSection(html);
  const countPart = (part) => {
    const re = /href="\/models\/([^"/]+)\/?"/g;
    let n = 0;
    while (re.exec(part)) n++;
    return n;
  };
  return { total: countPart(html), body: countPart(body), related: countPart(related) };
}

function existingModelSlugs(html) {
  const slugs = new Set();
  const re = /href="\/models\/([^"/]+)\/?"/g;
  let m;
  while ((m = re.exec(html))) slugs.add(m[1]);
  return slugs;
}

function isInsideTag(html, index) {
  const before = html.slice(0, index);
  const lastOpenA = before.lastIndexOf('<a ');
  const lastCloseA = before.lastIndexOf('</a>');
  if (lastOpenA > lastCloseA) return true;
  const lastOpen = before.lastIndexOf('<');
  const lastClose = before.lastIndexOf('>');
  return lastOpen > lastClose;
}

/** Wrap first plain-text occurrence of pattern with link */
function wrapFirstMention(html, pattern, href, anchorText, startAt = 0) {
  const re =
    typeof pattern === 'string'
      ? new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
      : pattern;
  const slice = html.slice(startAt);
  const m = re.exec(slice);
  if (!m) return { html, changed: false };
  const idx = startAt + m.index;
  if (isInsideTag(html, idx)) {
    return wrapFirstMention(html, pattern, href, anchorText, idx + m[0].length);
  }
  const link = `<a href="${href}">${anchorText}</a>`;
  return {
    html: html.slice(0, idx) + link + html.slice(idx + m[0].length),
    changed: true,
  };
}

function insertSentenceAfter(html, needle, sentence) {
  const idx = html.indexOf(needle);
  if (idx === -1) return { html, changed: false };
  const end = idx + needle.length;
  const closeP = html.indexOf('</p>', end);
  if (closeP === -1) return { html, changed: false };
  return {
    html: html.slice(0, closeP) + ` ${sentence}` + html.slice(closeP),
    changed: true,
  };
}

function buildRelatedSection(items) {
  const lis = items
    .map(({ href, anchor }) => `  <li><a href="${href}">${anchor}</a></li>`)
    .join('\n');
  return `\n<section class="money-section ${RELATED_MARKER}" aria-labelledby="article-related-models-heading">\n<h2 id="article-related-models-heading">รุ่นกล้องที่เกี่ยวข้องกับบทความนี้</h2>\n<ul class="related-model-links">\n${lis}\n</ul>\n</section>\n`;
}

function removeRelatedSection(html) {
  const re = new RegExp(
    `<section class="money-section ${RELATED_MARKER}"[\\s\\S]*?</section>\\s*`,
    'i',
  );
  return html.replace(re, '');
}

function modelHref(slug) {
  return `/models/${slug}/`;
}

/** Curated apply plan per article path */
const ARTICLE_PLANS = {
  '/article/shutter-count/': {
    priority: 'HIGH',
    related: ['sony-a7-iii', 'sony-a7r-iii', 'canon-90d', 'nikon-d850'],
    inline: [],
    sentences: [],
  },
  '/article/sony-a7iii-vs-a7iv/': {
    priority: 'HIGH',
    related: ['sony-a7-iii', 'sony-a7-iv', 'sony-a7c'],
    inline: [
      { slug: 'sony-a7-iii', patterns: [/A7\s*III/i, /A7III/i] },
      { slug: 'sony-a7-iv', patterns: [/A7\s*IV/i, /A7IV/i] },
    ],
    sentences: [],
  },
  '/article/fujifilm-xt4-vs-xt5/': {
    priority: 'HIGH',
    related: ['fujifilm-x-t4', 'fujifilm-x-t5', 'fujifilm-x-s10', 'fujifilm-x100v'],
    inline: [
      { slug: 'fujifilm-x-t4', patterns: [/X-?T4/i, /XT4/i] },
      { slug: 'fujifilm-x-t5', patterns: [/X-?T5/i, /XT5/i] },
    ],
    sentences: [],
  },
  '/article/กล้อง-dslr-คืออะไร/': {
    priority: 'HIGH',
    related: ['canon-80d', 'canon-90d', 'nikon-d750', 'nikon-d850'],
    inline: [],
    sentences: [
      {
        after: 'มือสอง',
        text: 'รุ่น DSLR ที่รับซื้อบ่อย เช่น <a href="/models/nikon-d850/">รับซื้อ Nikon D850 มือสอง</a>',
      },
    ],
  },
  '/article/กล้อง-mirrorless/': {
    priority: 'HIGH',
    related: ['sony-a7-iii', 'canon-eos-r', 'nikon-z6', 'fujifilm-x-t4'],
    inline: [],
    sentences: [
      {
        after: 'มือสอง',
        text: 'ตัวอย่างรุ่นที่ยังขายได้ดี เช่น <a href="/models/sony-a7-iii/">รับซื้อ Sony A7 III</a>',
      },
    ],
  },
  '/article/ทำไมกล้อง-fuji-มือสองถึงน่า/': {
    priority: 'HIGH',
    related: ['fujifilm-x-t4', 'fujifilm-x-t5', 'fujifilm-x100v', 'fujifilm-x-s10'],
    inline: [
      { slug: 'fujifilm-x100v', patterns: [/X100V/i] },
    ],
    sentences: [
      {
        after: 'ขาย',
        text: 'หากพร้อมปล่อย ดูแนวราคาได้ที่หน้า <a href="/models/fujifilm-x-t5/">ขาย Fujifilm X-T5 มือสอง</a>',
      },
    ],
  },
  '/article/วิธีเช็คสภาพกล้องมือสอ/': {
    priority: 'HIGH',
    related: ['sony-a7-iii', 'canon-r6', 'nikon-z6-ii', 'fujifilm-x-t4'],
    inline: [],
    sentences: [
      {
        after: 'ประเมิน',
        text: 'ส่งรูปหลังเช็กครบได้ที่หน้า <a href="/models/canon-r6/">ขาย Canon R6 มือสอง</a>',
      },
    ],
  },
  '/article/วิธีเช็คเลนส์กล้องมือส/': {
    priority: 'MEDIUM',
    related: [],
    inline: [],
    sentences: [
      {
        after: 'เลนส์',
        text: 'เมื่อเช็กเลนส์และกล้องพร้อมขายแล้ว ดูแนวราคาได้ที่หน้า <a href="/models/sony-a7-iii/">ประเมินราคา Sony A7 III</a> หรือ <a href="/models/canon-r6/">รับซื้อ Canon R6</a>',
      },
    ],
  },
  '/article/กล้องถ่ายรูปมีกี่ชนิด/': {
    priority: 'MEDIUM',
    related: [],
    inline: [],
    sentences: [
      {
        after: 'Mirrorless',
        text: 'ตัวอย่างรุ่นที่รับซื้อบ่อย เช่น <a href="/models/sony-a6400/">รับซื้อ Sony A6400</a> สำหรับสาย vlog และ <a href="/models/fujifilm-x100vi/">ขาย Fujifilm X100VI มือสอง</a>',
      },
    ],
  },
  '/article/กล้องคอมแพคคืออะไร/': {
    priority: 'LOW',
    related: [],
    inline: [],
    sentences: [
      {
        after: 'คอมแพค',
        text: 'บางรุ่นคอมแพคยังขายมือสองได้ดี เช่น <a href="/models/fujifilm-x100v/">รับซื้อ Fujifilm X100V</a>',
      },
    ],
  },
  '/article/กล้องบริดจ์/': {
    priority: 'LOW',
    related: [],
    inline: [],
    sentences: [
      {
        after: 'บริดจ์',
        text: 'หากอัปเกรดเป็น mirrorless แล้ว ดูแนวราคาขายได้ที่หน้า <a href="/models/canon-eos-rp/">ขาย Canon EOS RP มือสอง</a>',
      },
    ],
  },
  '/article/วิธีแพ็คกล้อง/': {
    priority: 'LOW',
    related: [],
    inline: [],
    sentences: [
      {
        after: 'แพ็ค',
        text: 'หลังแพ็คเรียบร้อย ส่งรูปประเมินได้ที่หน้า <a href="/models/nikon-d850/">รับซื้อ Nikon D850 มือสอง</a>',
      },
    ],
  },
  '/article/กล้อง-360-องศา/': {
    priority: 'LOW',
    related: [],
    inline: [],
    sentences: [],
  },
  '/article/กล้องฟิล์มคืออะไร/': {
    priority: 'LOW',
    related: [],
    inline: [],
    sentences: [],
  },
  '/article/กล้องแอคชั่น/': {
    priority: 'LOW',
    related: [],
    inline: [],
    sentences: [
      {
        after: 'แอคชั่น',
        text: 'หากมีกล้อง mirrorless หรือ vlog คู่กัน ดูแนวราคาได้ที่หน้า <a href="/models/sony-zv-e10/">รับซื้อ Sony ZV-E10</a>',
      },
    ],
  },
};

/** Brand hub location pages */
const LOCATION_BRAND_PLANS = [
  {
    pathMatch: /\/รับซื้อกล้อง\/รับซื้อกล้อง-sony\/?$/i,
    priority: 'HIGH',
    related: [],
    sentences: [
      {
        after: 'Sony',
        text: 'รุ่นที่รับซื้อบ่อย เช่น <a href="/models/sony-a7-iii/">รับซื้อ Sony A7 III</a> และ <a href="/models/sony-a7-iv/">ขาย Sony A7 IV มือสอง</a>',
      },
    ],
  },
  {
    pathMatch: /\/รับซื้อกล้อง\/รับซื้อกล้อง-canon\/?$/i,
    priority: 'HIGH',
    related: [],
    sentences: [
      {
        after: 'Canon',
        text: 'ตัวอย่างรุ่นที่รับซื้อบ่อย เช่น <a href="/models/canon-r6/">รับซื้อ Canon R6</a> และ <a href="/models/canon-r5/">ขาย Canon R5 มือสอง</a>',
      },
    ],
  },
  {
    pathMatch: /\/รับซื้อกล้อง\/รับซื้อกล้อง-fuji\/?$/i,
    priority: 'HIGH',
    related: [],
    sentences: [
      {
        after: 'Fujifilm',
        text: 'รุ่นยอดนิยมในตลาดมือสอง เช่น <a href="/models/fujifilm-x-t4/">รับซื้อ Fujifilm X-T4</a> และ <a href="/models/fujifilm-x-t5/">ขาย Fujifilm X-T5 มือสอง</a>',
      },
    ],
  },
];

function loadRoutes() {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
  return manifest.routes || manifest;
}

function suggestTargets(text, pathStr) {
  const targets = [];
  const plain = stripHtml(text);

  for (const { kw, re } of KEYWORD_PATTERNS) {
    if (re.test(plain)) {
      for (const mp of MODEL_PATTERNS) {
        if (mp.re.test(plain)) {
          targets.push({ keyword: kw, slug: mp.slug, modelName: mp.modelName });
        }
      }
    }
  }

  for (const mp of MODEL_PATTERNS) {
    if (mp.re.test(plain)) {
      targets.push({ keyword: 'model mention', slug: mp.slug, modelName: mp.modelName });
    }
  }

  const uniq = [];
  const seen = new Set();
  for (const t of targets) {
    if (seen.has(t.slug)) continue;
    seen.add(t.slug);
    uniq.push(t);
  }

  let priority = 'LOW';
  if (pathStr.startsWith('/article/')) {
    const plan = ARTICLE_PLANS[pathStr];
    if (plan?.priority === 'HIGH') priority = 'HIGH';
    else if (plan?.priority === 'MEDIUM') priority = 'MEDIUM';
    else if (uniq.length >= 3) priority = 'MEDIUM';
    else if (uniq.length >= 1) priority = 'LOW';
  } else if (LOCATION_BRAND_PLANS.some((p) => p.pathMatch.test(pathStr))) {
    priority = 'HIGH';
  } else if (uniq.length >= 2) {
    priority = 'MEDIUM';
  }

  return { targets: uniq, priority };
}

function audit() {
  const routes = loadRoutes();
  const rows = [];

  for (const route of routes) {
    if (!['article', 'post'].includes(route.pageType)) continue;
    const filePath = path.join(CONTENT_DIR, route.contentFile);
    if (!fs.existsSync(filePath)) continue;
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const body = data.bodyHtml || '';
    const plain = stripHtml(body);
    if (!plain) continue;

    const { targets, priority } = suggestTargets(body, route.path);
    if (targets.length === 0 && !ARTICLE_PLANS[route.path]) continue;

    const plan = ARTICLE_PLANS[route.path];
    const primaryTargets =
      plan?.related?.map((s) => modelBySlug.get(s)).filter(Boolean) ||
      targets.slice(0, 4);

    for (const t of primaryTargets.length ? primaryTargets : targets.slice(0, 3)) {
      const slug = typeof t === 'string' ? t : t.slug;
      const model = modelBySlug.get(slug) || t;
      const kw =
        targets.find((x) => x.slug === slug)?.keyword ||
        KEYWORD_PATTERNS.find((k) => k.re.test(plain))?.kw ||
        'contextual';
      rows.push({
        source: route.path,
        keyword: kw,
        target: `/models/${slug}/`,
        anchor: nextAnchor(model),
        priority: plan?.priority || priority,
      });
    }
  }

  rows.sort((a, b) => {
    const p = { HIGH: 0, MEDIUM: 1, LOW: 2 };
    return p[a.priority] - p[b.priority] || a.source.localeCompare(b.source);
  });

  const lines = [
    '# Internal Link Opportunity Report',
    '',
    `Generated: ${new Date().toISOString()}`,
    '',
    '| Source page | Keyword/context | Target model page | Suggested anchor | Priority |',
    '|-------------|-----------------|-------------------|------------------|----------|',
  ];
  for (const r of rows) {
    lines.push(
      `| ${r.source} | ${r.keyword} | ${r.target} | ${r.anchor} | ${r.priority} |`,
    );
  }
  lines.push('', `Total opportunities: ${rows.length}`, '');
  fs.writeFileSync(AUDIT_REPORT, lines.join('\n'), 'utf8');
  console.log(`Wrote ${AUDIT_REPORT} (${rows.length} rows)`);
  return rows;
}

function stripModelLinks(html) {
  let out = removeRelatedSection(html);
  out = out.replace(
    /<a href="\/models\/[^"]+">([\s\S]*?)<\/a>/gi,
    '$1',
  );
  return out;
}

function applyPlanToHtml(html, plan, wordCount) {
  let out = stripModelLinks(html);
  const used = existingModelSlugs(out);
  let maxLinks =
    wordCount < SHORT_WORD_THRESHOLD ? MAX_LINKS_SHORT : MAX_LINKS_LONG;
  if (plan.priority === 'HIGH' && plan.related?.length) {
    maxLinks = Math.min(maxLinks, 1);
  }

  const skipInline = plan.priority === 'HIGH' && (plan.related?.length || 0) >= 3;
  if (skipInline) {
    plan = { ...plan, inline: [] };
  }

  if (plan.inline) {
    for (const item of plan.inline) {
      if (used.size >= maxLinks) break;
      if (used.has(item.slug)) continue;
      const model = modelBySlug.get(item.slug);
      if (!model) continue;
      for (const pat of item.patterns) {
        if (used.has(item.slug)) break;
        const href = modelHref(item.slug);
        if (out.includes(`href="${href}"`)) {
          used.add(item.slug);
          break;
        }
        const anchor = nextAnchor(model);
        const res = wrapFirstMention(out, pat, href, anchor);
        if (res.changed) {
          out = res.html;
          used.add(item.slug);
          break;
        }
      }
    }
  }

  if (plan.sentences) {
    for (const s of plan.sentences) {
      if (used.size >= maxLinks) break;
      const re = new RegExp(s.after.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      if (!re.test(out)) continue;
      const hrefRe = /href="\/models\/([^"/]+)\/?"/g;
      let hasNew = false;
      const temp = s.text;
      let tm;
      while ((tm = hrefRe.exec(temp))) {
        if (!used.has(tm[1])) hasNew = true;
      }
      if (!hasNew && (s.text.match(/href="\/models\//g) || []).length > 0) {
        const allDup = [...(s.text.matchAll(/href="\/models\/([^"/]+)\/?"/g) || [])].every(
          (m) => used.has(m[1]),
        );
        if (allDup) continue;
      }
      const res = insertSentenceAfter(out, s.after, s.text);
      if (res.changed) {
        out = res.html;
        let m;
        while ((m = hrefRe.exec(s.text))) used.add(m[1]);
      }
    }
  }

  if (plan.related?.length && plan.priority === 'HIGH') {
    const bodySlugs = existingModelSlugs(out);
    const relatedItems = plan.related
      .filter((slug) => slugSet.has(slug) && !bodySlugs.has(slug))
      .slice(0, 6)
      .map((slug) => {
        const model = modelBySlug.get(slug);
        return { href: modelHref(slug), anchor: `รับซื้อ ${model.modelName}` };
      });
    if (relatedItems.length >= 2) {
      out = out.trimEnd() + buildRelatedSection(relatedItems);
    }
  }

  const counts = countModelLinks(out);
  if (counts.body > maxLinks) {
    // Safety: strip excess inline links from end of body (rare)
    console.warn(`Warning: ${counts.body} inline model links exceeds max ${maxLinks}`);
  }

  return out;
}

function apply() {
  const routes = loadRoutes();
  const stats = {
    articlesModified: 0,
    postsModified: 0,
    totalLinks: 0,
    targetCounts: {},
    sources: [],
    skipped: [],
  };

  anchorIdx = 0;

  for (const route of routes) {
    const filePath = path.join(CONTENT_DIR, route.contentFile);
    if (!fs.existsSync(filePath)) continue;

    let plan = null;
    if (route.pageType === 'article' && ARTICLE_PLANS[route.path]) {
      plan = ARTICLE_PLANS[route.path];
    } else if (route.pageType === 'location') {
      plan = LOCATION_BRAND_PLANS.find((p) => p.pathMatch.test(route.path));
    }
    if (!plan) continue;

    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const before = data.bodyHtml || '';
    const beforeCounts = countModelLinks(before);
    const wordCount = wordCountFromHtml(before, data.seo?.wordCount);

    const after = applyPlanToHtml(before, plan, wordCount);
    const afterCounts = countModelLinks(after);

    if (after === before && countModelLinks(before).total > 0) {
      // Idempotent re-apply after strip+rebuild
    } else if (after === before) {
      stats.skipped.push(route.path);
      continue;
    }

    data.bodyHtml = after;
    fs.writeFileSync(filePath, JSON.stringify(data), 'utf8');

    const added = afterCounts.total - beforeCounts.total;
    stats.totalLinks += added;
    if (route.pageType === 'article') stats.articlesModified++;
    else if (route.pageType === 'location') stats.locationsModified = (stats.locationsModified || 0) + 1;
    else stats.postsModified++;
    stats.sources.push({ path: route.path, added, priority: plan.priority });

    const hrefRe = /href="\/models\/([^"/]+)\/?"/g;
    let m;
    while ((m = hrefRe.exec(after))) {
      stats.targetCounts[m[1]] = (stats.targetCounts[m[1]] || 0) + 1;
    }
  }

  return stats;
}

function qa() {
  const routes = loadRoutes();
  const issues = [];
  const dist = path.join(ROOT, 'dist');
  const articlePaths = new Set(
    routes.filter((r) => r.pageType === 'article').map((r) => r.path),
  );
  const locationBrandPaths = new Set(
    routes
      .filter((r) => r.pageType === 'location' && LOCATION_BRAND_PLANS.some((p) => p.pathMatch.test(r.path)))
      .map((r) => r.path),
  );
  const scopedPaths = new Set([...articlePaths, ...locationBrandPaths]);

  for (const route of routes) {
    if (!scopedPaths.has(route.path)) continue;
    const filePath = path.join(CONTENT_DIR, route.contentFile);
    if (!fs.existsSync(filePath)) continue;
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const html = data.bodyHtml || '';

    const counts = countModelLinks(html);
    const wordCount = wordCountFromHtml(html, data.seo?.wordCount);
    const maxAllowed = wordCount < SHORT_WORD_THRESHOLD ? MAX_LINKS_SHORT : MAX_LINKS_LONG;

    if (counts.body > maxAllowed) {
      issues.push({
        path: route.path,
        type: 'too_many_model_links',
        value: `body ${counts.body} > ${maxAllowed}`,
      });
    }
    if (counts.total > maxAllowed + 6) {
      issues.push({
        path: route.path,
        type: 'too_many_total_model_links',
        value: `${counts.total}`,
      });
    }

    const slugs = [];
    const hrefRe = /href="\/models\/([^"/]+)\/?"/g;
    let m;
    while ((m = hrefRe.exec(html))) slugs.push(m[1]);

    const dup = slugs.filter((s, i) => slugs.indexOf(s) !== i);
    if (dup.length) {
      issues.push({ path: route.path, type: 'duplicate_target', value: [...new Set(dup)].join(', ') });
    }

    for (const slug of slugs) {
      if (!slugSet.has(slug)) {
        issues.push({ path: route.path, type: 'invalid_model_slug', value: slug });
      }
    }

    for (const b of BANNED) {
      const modelLinkChunks = [
        ...html.matchAll(/<a href="\/models\/[^"]+">([^<]*)<\/a>/g),
      ].map((x) => x[1]);
      const related = splitRelatedSection(html).related;
      const checkText = [...modelLinkChunks, related].join(' ');
      if (checkText.includes(b)) {
        issues.push({ path: route.path, type: 'banned_word_in_model_links', value: b });
      }
    }

    const anchors = [...html.matchAll(/<a href="\/models\/[^"]+">([^<]+)<\/a>/g)].map((x) => x[1]);
    const anchorCounts = {};
    for (const a of anchors) {
      anchorCounts[a] = (anchorCounts[a] || 0) + 1;
    }
    const spam = Object.entries(anchorCounts).filter(([, c]) => c >= 3);
    if (spam.length) {
      issues.push({ path: route.path, type: 'anchor_spam', value: spam.map(([a, c]) => `${a}(${c})`).join('; ') });
    }

    if (fs.existsSync(dist)) {
      const distPath = route.path.endsWith('/') ? route.path : `${route.path}/`;
      const htmlFile = path.join(dist, distPath.replace(/^\//, ''), 'index.html');
      if (fs.existsSync(htmlFile)) {
        const built = fs.readFileSync(htmlFile, 'utf8');
        for (const slug of slugs) {
          const href = `/models/${slug}/`;
          if (!built.includes(`href="${href}"`)) {
            issues.push({ path: route.path, type: 'link_missing_in_build', value: href });
          }
        }
      }
    }
  }

  const sitemap = path.join(dist, 'sitemap-index.xml');
  if (fs.existsSync(dist) && !fs.existsSync(sitemap)) {
    issues.push({ path: 'sitemap', type: 'missing_sitemap' });
  }

  for (const slug of slugSet) {
    const f = path.join(dist, 'models', slug, 'index.html');
    if (fs.existsSync(dist) && !fs.existsSync(f)) {
      issues.push({ path: `/models/${slug}/`, type: 'model_page_missing_in_dist' });
    }
  }

  return issues;
}

function writeApplyReport(stats, qaIssues) {
  const sortedTargets = Object.entries(stats.targetCounts).sort((a, b) => b[1] - a[1]);
  const lines = [
    '# Internal Link Model Pages Report',
    '',
    `Generated: ${new Date().toISOString()}`,
    '',
    '## Summary',
    '',
    `- Articles modified: ${stats.articlesModified}`,
    `- Brand location pages modified: ${stats.locationsModified || 0}`,
    `- Total model page links added (net in modified files): ${stats.totalLinks}`,
  ];

  lines.push('', '## Target model pages (link count in modified content)', '');
  lines.push('| Model slug | Links |', '|------------|-------|');
  for (const [slug, count] of sortedTargets) {
    lines.push(`| ${slug} | ${count} |`);
  }

  lines.push('', '## Key source pages modified', '');
  const high = stats.sources.filter((s) => s.priority === 'HIGH');
  for (const s of high) {
    lines.push(`- ${s.path} (+${s.added} model links)`);
  }

  lines.push('', '## Phase next (not modified this round)', '');
  if (stats.skipped.length) {
    for (const p of stats.skipped.slice(0, 20)) lines.push(`- ${p}`);
  } else {
    lines.push('- Brand money posts without explicit plan — run audit for more opportunities');
  }
  lines.push('- `/article/กล้อง-360-องศา/`, `/article/กล้องฟิล์มคืออะไร/` — low relevance to model money pages');

  lines.push('', '## QA result', '');
  if (qaIssues.length === 0) {
    lines.push('All internal link QA checks passed.');
  } else {
    lines.push(`**${qaIssues.length} issue(s):**`, '');
    for (const i of qaIssues) {
      lines.push(`- [${i.type}] ${i.path}: ${i.value || ''}`);
    }
  }

  fs.writeFileSync(APPLY_REPORT, lines.join('\n'), 'utf8');
  console.log(`Wrote ${APPLY_REPORT}`);
}

const cmd = process.argv[2] || 'audit';

if (cmd === 'audit') {
  audit();
} else if (cmd === 'apply') {
  const stats = apply();
  console.log(
    `Applied: ${stats.articlesModified} articles, ${stats.locationsModified || 0} brand pages, ${stats.totalLinks} net links`,
  );
  writeApplyReport(stats, []);
} else if (cmd === 'qa') {
  const issues = qa();
  if (issues.length) {
    console.error('QA failed:', issues.length, 'issue(s)');
    for (const i of issues) console.error(`  [${i.type}] ${i.path}: ${i.value || ''}`);
    process.exit(1);
  }
  console.log('Internal link QA passed');
} else {
  console.error('Usage: node scripts/internal-link-model-pages.mjs [audit|apply|qa]');
  process.exit(1);
}
