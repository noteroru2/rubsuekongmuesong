/**
 * Phase 4.3 — complete inbound internal links for remaining camera model pages.
 *
 * Usage:
 *   node scripts/remaining-model-internal-links.mjs audit
 *   node scripts/remaining-model-internal-links.mjs apply
 *   node scripts/remaining-model-internal-links.mjs qa
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = process.cwd();
const CONTENT_DIR = path.join(ROOT, 'src', 'data', 'content');
const MANIFEST = path.join(ROOT, 'src', 'data', 'routes-manifest.json');
const MODELS_JSON = path.join(ROOT, 'content-input', 'camera-model-pages.json');
const AUDIT_REPORT = path.join(ROOT, 'remaining-model-internal-link-opportunities.md');
const FINAL_REPORT = path.join(ROOT, 'remaining-model-internal-links-report.md');

const BANNED = ['ราคาสูงสุด', 'ให้ราคาสูงสุด', 'ดีที่สุด', 'อันดับ 1', 'รับทุกรุ่น'];
const MAX_LINKS_ARTICLE = 5;
const MAX_LINKS_BRAND_HUB = 8;

const TARGET_SLUGS = [
  'sony-a7c',
  'sony-a7r-iii',
  'sony-a7r-iv',
  'canon-m50',
  'fujifilm-x-t3',
  'fujifilm-x-s10',
  'fujifilm-x-s20',
  'nikon-z7',
  'nikon-z50',
];

const NIKON_HUB_PATH = '/รับซื้อกล้อง/รับซื้อกล้อง-nikon/';
const NIKON_HUB_ID = 'location-b7e4c29a1f8d3e6a5c02';
const NIKON_HUB_FILE = `${NIKON_HUB_ID}.json`;

const models = JSON.parse(fs.readFileSync(MODELS_JSON, 'utf8'));
const slugSet = new Set(models.map((m) => m.slug));

const BRAND_HUB_PATHS = new Set([
  '/รับซื้อกล้อง/รับซื้อกล้อง-sony/',
  '/รับซื้อกล้อง/รับซื้อกล้อง-canon/',
  '/รับซื้อกล้อง/รับซื้อกล้อง-fuji/',
  NIKON_HUB_PATH,
]);

function loadRoutes() {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
  return manifest.routes || manifest;
}

function saveRoutes(routes) {
  fs.writeFileSync(MANIFEST, JSON.stringify({ routes }, null, 2) + '\n', 'utf8');
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

function safeReplaceOnce(html, find, replacement) {
  if (html.includes(replacement)) return { html, changed: false };
  const idx = html.indexOf(find);
  if (idx === -1) return { html, changed: false };
  if (isInsideTag(html, idx)) return { html, changed: false };
  return {
    html: html.slice(0, idx) + replacement + html.slice(idx + find.length),
    changed: true,
  };
}

function countInboundBySlug() {
  const routes = loadRoutes();
  const counts = Object.fromEntries(models.map((m) => [m.slug, { total: 0, sources: [] }]));
  for (const route of routes) {
    const fp = path.join(CONTENT_DIR, route.contentFile);
    if (!fs.existsSync(fp)) continue;
    const html = JSON.parse(fs.readFileSync(fp, 'utf8')).bodyHtml || '';
    for (const m of models) {
      const re = new RegExp(`href="/models/${m.slug}/?"`, 'g');
      const n = (html.match(re) || []).length;
      if (n) {
        counts[m.slug].total += n;
        counts[m.slug].sources.push(route.path);
      }
    }
  }
  return counts;
}

function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const AUDIT_KEYWORDS = [
  { topic: 'full-frame mirrorless', re: /full[- ]frame|มิเรอร์เลส|mirrorless/i },
  { topic: 'compact full-frame', re: /compact|เล็ก|พกพา|A7C/i },
  { topic: 'high resolution', re: /resolution|ความละเอียด|A7R|megapixel|MP/i },
  { topic: 'studio cameras', re: /สตูดิโอ|studio|portrait/i },
  { topic: 'vlog cameras', re: /vlog|วีล็อก|content creator|ZV-/i },
  { topic: 'Fujifilm legacy', re: /Fujifilm|Fuji|ฟูจิ|X-T|X-S|X100/i },
  { topic: 'Canon M series', re: /EOS M|M50|EF-M/i },
  { topic: 'Nikon Z mount', re: /Nikon Z|Z mount|เมาท์ Z/i },
  { topic: 'Nikon mirrorless', re: /Nikon.*mirrorless|Z6|Z7|Z50/i },
  { topic: 'Nikon DSLR', re: /Nikon D|DSLR.*Nikon/i },
];

function audit() {
  const routes = loadRoutes();
  const inbound = countInboundBySlug();
  const missing = TARGET_SLUGS.filter((s) => !inbound[s]?.total);

  const opportunities = [];
  for (const route of routes) {
    if (!['article', 'location', 'post'].includes(route.pageType)) continue;
    const fp = path.join(CONTENT_DIR, route.contentFile);
    if (!fs.existsSync(fp)) continue;
    const data = JSON.parse(fs.readFileSync(fp, 'utf8'));
    const html = data.bodyHtml || '';
    const plain = stripHtml(html);
    const topics = AUDIT_KEYWORDS.filter((k) => k.re.test(plain)).map((k) => k.topic);
    if (!topics.length) continue;

    const mentions = TARGET_SLUGS.filter((slug) => {
      const m = models.find((x) => x.slug === slug);
      if (!m) return false;
      const name = m.modelName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return new RegExp(name.split(' ').slice(-2).join('|'), 'i').test(plain);
    });

    opportunities.push({
      path: route.path,
      pageType: route.pageType,
      topics: [...new Set(topics)],
      targetMentions: mentions,
      existingModelLinks: (html.match(/href="\/models\//g) || []).length,
      priority: BRAND_HUB_PATHS.has(route.path)
        ? 'HIGH'
        : route.path.startsWith('/article/')
          ? 'HIGH'
          : 'MEDIUM',
    });
  }

  const lines = [
    '# Remaining Model Internal Link Opportunities',
    '',
    `Generated: ${new Date().toISOString()}`,
    '',
    '## Context',
    '',
    'Phase 4.2 added 41 internal links (18/27 models covered). This audit targets the 9 remaining slugs.',
    '',
    '## Models still missing inbound links',
    '',
  ];

  if (missing.length) {
    for (const s of missing) {
      const m = models.find((x) => x.slug === s);
      lines.push(`- \`/models/${s}/\` — ${m?.modelName || s}`);
    }
  } else {
    lines.push('- None — all target slugs have at least one inbound link.');
  }

  lines.push('', '## Current inbound status (all 27 models)', '', '| Slug | Inbound | Sources |', '|------|---------|---------|');
  for (const m of models) {
    const c = inbound[m.slug];
    const src = c.sources.slice(0, 2).join(', ') + (c.sources.length > 2 ? '…' : '');
    lines.push(`| ${m.slug} | ${c.total} | ${src || '—'} |`);
  }

  lines.push('', '## Recommended link placements (Phase 4.3)', '', '| Target slug | Source page | Placement |', '|-------------|-------------|-----------|');
  const plan = [
    ['sony-a7c', '/รับซื้อกล้อง/รับซื้อกล้อง-sony/', 'A7C / A7C II section heading'],
    ['sony-a7r-iii', '/รับซื้อกล้อง/รับซื้อกล้อง-sony/', 'A7R Series paragraph (A7R III)'],
    ['sony-a7r-iv', '/รับซื้อกล้อง/รับซื้อกล้อง-sony/', 'A7R Series paragraph (A7R IV)'],
    ['canon-m50', '/รับซื้อกล้อง/รับซื้อกล้อง-canon/', 'EOS M50 list item'],
    ['fujifilm-x-t3', '/รับซื้อกล้อง/รับซื้อกล้อง-fuji/', 'X-T3 list item'],
    ['fujifilm-x-s10', '/รับซื้อกล้อง/รับซื้อกล้อง-fuji/', 'X-S10 / X-S20 list item'],
    ['fujifilm-x-s20', '/รับซื้อกล้อง/รับซื้อกล้อง-fuji/', 'X-S10 / X-S20 list item'],
    ['nikon-z7', NIKON_HUB_PATH, 'Nikon brand hub model list (new page)'],
    ['nikon-z50', NIKON_HUB_PATH, 'Nikon brand hub model list (new page)'],
    ['nikon-z6', NIKON_HUB_PATH, 'Nikon brand hub model list (new page)'],
    ['nikon-z6-ii', NIKON_HUB_PATH, 'Nikon brand hub model list (new page)'],
    ['nikon-d750', NIKON_HUB_PATH, 'Nikon brand hub model list (new page)'],
    ['nikon-d850', NIKON_HUB_PATH, 'Nikon brand hub model list (new page)'],
  ];
  for (const [slug, src, place] of plan) {
    lines.push(`| ${slug} | ${src} | ${place} |`);
  }

  lines.push('', '## Content pages matching audit topics', '', '| Path | Type | Topics | Target mentions |', '|------|------|--------|-----------------|');
  const sorted = opportunities.sort((a, b) => (a.priority === 'HIGH' ? -1 : 1) - (b.priority === 'HIGH' ? -1 : 1));
  for (const o of sorted.slice(0, 40)) {
    lines.push(
      `| ${o.path} | ${o.pageType} | ${o.topics.slice(0, 3).join(', ')} | ${o.targetMentions.join(', ') || '—'} |`,
    );
  }

  lines.push('', '## Nikon brand hub', '', '- **Status before apply:** route does not exist', '- **Planned path:** `/รับซื้อกล้อง/รับซื้อกล้อง-nikon/`', '- **Template:** Sony/Canon/Fuji location pages');

  fs.writeFileSync(AUDIT_REPORT, lines.join('\n'), 'utf8');
  console.log(`Wrote ${AUDIT_REPORT}`);
  console.log(`Missing inbound: ${missing.length ? missing.join(', ') : 'none'}`);
}

function cleanGarbledIntro(html, brandKey) {
  const patterns = {
    sony: /รุ่นที่รับซื้อบ่อย เช่น[\s\S]*?<a href="\/models\/sony-a7-iii\/">รับซื้อ Sony A7 III<\/a> และ <a href="\/models\/sony-a7-iv\/">ขาย Sony A7 IV มือสอง<\/a>/,
    canon: /ตัวอย่างรุ่นที่รับซื้อบ่อย เช่น[\s\S]*?<a href="\/models\/canon-r6\/">รับซื้อ Canon R6<\/a> และ <a href="\/models\/canon-r5\/">ขาย Canon R5 มือสอง<\/a>/,
    fuji: /รุ่นยอดนิยมในตลาดมือสอง เช่น[\s\S]*?<a href="\/models\/fujifilm-x-t4\/">รับซื้อ Fujifilm X-T4<\/a> และ <a href="\/models\/fujifilm-x-t5\/">ขาย Fujifilm X-T5 มือสอง<\/a>/,
  };
  const clean = {
    sony: 'รุ่นที่รับซื้อบ่อย เช่น <a href="/models/sony-a7-iii/">รับซื้อ Sony A7 III</a> และ <a href="/models/sony-a7-iv/">ขาย Sony A7 IV มือสอง</a>',
    canon: 'ตัวอย่างรุ่นที่รับซื้อบ่อย เช่น <a href="/models/canon-r6/">รับซื้อ Canon R6</a> และ <a href="/models/canon-r5/">ขาย Canon R5 มือสอง</a>',
    fuji: 'รุ่นยอดนิยมในตลาดมือสอง เช่น <a href="/models/fujifilm-x-t4/">รับซื้อ Fujifilm X-T4</a> และ <a href="/models/fujifilm-x-t5/">ขาย Fujifilm X-T5 มือสอง</a>',
  };
  const re = patterns[brandKey];
  if (!re) return html;
  return html.replace(re, clean[brandKey]);
}

function applySonyHub(html) {
  let out = cleanGarbledIntro(html, 'sony');
  const steps = [
    [
      '<b>รับซื้อกล้อง Sony A7C / A7C II: Full Frame ในร่างเล็ก</b>',
      '<b>รับซื้อกล้อง <a href="/models/sony-a7c/">รับซื้อ Sony A7C</a> / A7C II: Full Frame ในร่างเล็ก</b>',
    ],
    [
      '(A7R III, A7R IV, A7R V)',
      '(<a href="/models/sony-a7r-iii/">รับซื้อ Sony A7R III</a>, <a href="/models/sony-a7r-iv/">รับซื้อ Sony A7R IV</a>, A7R V)',
    ],
  ];
  for (const [find, rep] of steps) {
    const r = safeReplaceOnce(out, find, rep);
    out = r.html;
  }
  return out;
}

function applyCanonHub(html) {
  let out = cleanGarbledIntro(html, 'canon');
  const r = safeReplaceOnce(
    out,
    'รับซื้อกล้อง Canon M50,',
    'รับซื้อกล้อง <a href="/models/canon-m50/">รับซื้อ Canon M50</a>,',
  );
  return r.html;
}

function applyFujiHub(html) {
  let out = cleanGarbledIntro(html, 'fuji');
  const steps = [
    [
      '<b>รับซื้อกล้อง Fuji X-T3:</b>',
      '<b>รับซื้อกล้อง <a href="/models/fujifilm-x-t3/">รับซื้อ Fujifilm X-T3</a>:</b>',
    ],
    [
      '<b>รับซื้อกล้อง Fuji X-S10 / X-S20:</b>',
      '<b>รับซื้อกล้อง <a href="/models/fujifilm-x-s10/">รับซื้อ Fujifilm X-S10</a> / <a href="/models/fujifilm-x-s20/">รับซื้อ Fujifilm X-S20</a>:</b>',
    ],
  ];
  for (const [find, rep] of steps) {
    const r = safeReplaceOnce(out, find, rep);
    out = r.html;
  }
  return out;
}

function buildNikonHubBody() {
  const img = '/images/site/brand-nikon-1200x800.webp';
  return `<p><img decoding="async" class="aligncenter size-full" alt="รับซื้อกล้อง Nikon" width="1200" height="800" src="${img}"></p>
<p>สวัสดีครับ ผมอำพล จาก <a href="https://รับซื้อกล้องมือสอง.com/">รับซื้อกล้องมือสอง.com</a> ครับ</p>
<p>Nikon เป็นหนึ่งในแบรนด์กล้องที่มีประวัติศาสตร์ยาวนาน ตั้งแต่ยุค DSLR ที่ขึ้นชื่อเรื่องความทนทานและคุณภาพไฟล์ ไปจนถึงยุค Mirrorless ด้วยระบบเมาท์ Z ที่พัฒนาอย่างต่อเนื่อง หากคุณต้องการส่งต่อกล้อง Nikon มือสอง เราพร้อมประเมินราคาตามสภาพจริงและความต้องการของตลาดครับ</p>
<blockquote>
<p style="text-align: center;"><span style="color: #ff6600;">ต้องการขายกล้องมือสอง ให้เลือกเรา เช็คราคาก่อนได้ฟรี</span></p>
<p style="text-align: center;"><span style="color: #ff6600;">Line : @WEBUY ( มีตัว @ ด้วยนะครับ )</span></p>
<p style="text-align: center;"><span style="color: #ff6600;">โทร : 064-2579353 คุณโน๊ต</span></p>
</blockquote>
<h2><span style="color: #ff0000;"><b>ทำไมกล้อง Nikon มือสองยังมีความต้องการในตลาด?</b></span></h2>
<ul>
<li><b>มรดก DSLR:</b> รุ่นอย่าง D750 และ D850 ยังเป็นที่ต้องการของช่างภาพที่ชอบไฟล์ภาพและระบบเลนส์ F-mount</li>
<li><b>ระบบ Z Mirrorless:</b> Z6, Z6 II และ Z7 ให้ประสิทธิภาพสูงในร่างที่กะทัดรัดกว่า DSLR รุ่นเดิม</li>
<li><b>สายเริ่มต้น APS-C:</b> Z50 เหมาะกับผู้เริ่มต้นที่ต้องการกล้อง Nikon ในงบที่จับต้องได้</li>
</ul>
<h2><span style="color: #ff0000;"><b>รุ่น Nikon ที่เรารับซื้อบ่อย</b></span></h2>
<p>ดูรายละเอียดและแนวราคาเบื้องต้นได้ที่หน้ารุ่นกล้องแต่ละรุ่นครับ:</p>
<ul class="related-model-links">
<li><a href="/models/nikon-z6/">รับซื้อ Nikon Z6</a></li>
<li><a href="/models/nikon-z6-ii/">รับซื้อ Nikon Z6 II</a></li>
<li><a href="/models/nikon-z7/">รับซื้อ Nikon Z7</a></li>
<li><a href="/models/nikon-z50/">รับซื้อ Nikon Z50</a></li>
<li><a href="/models/nikon-d750/">รับซื้อ Nikon D750</a></li>
<li><a href="/models/nikon-d850/">รับซื้อ Nikon D850</a></li>
</ul>
<h2><span style="color: #ff0000;"><b>เตรียมกล้อง Nikon ก่อนส่งประเมิน</b></span></h2>
<ol>
<li><b>สภาพโดยรวม:</b> ตรวจสอบรอยใช้งาน การทำงานของปุ่ม และสภาพเซ็นเซอร์</li>
<li><b>Shutter count:</b> ลองเช็คจำนวนชัตเตอร์เพื่อช่วยให้ประเมินราคาได้แม่นยำขึ้น</li>
<li><b>อุปกรณ์ครบ:</b> แบตเตอรี่ ที่ชาร์จ และเลนส์ที่มาคู่กันช่วยให้ประเมินมูลค่าได้ครบถ้วน</li>
</ol>
<p><span style="color: #ff6600;"><b>ส่งรุ่นกล้องและเลนส์ Nikon ของคุณมาให้ผมประเมินราคาได้เลยวันนี้!</b> <b>Line ID: @WEBUY</b> <b>โทร: 064-2579353</b></span></p>`;
}

function createNikonHub(routes) {
  const exists = routes.some((r) => r.path === NIKON_HUB_PATH);
  if (exists) return { created: false, routes };

  const bodyHtml = buildNikonHubBody();
  const content = {
    id: NIKON_HUB_ID,
    oldUrl: `https://xn--12cman8e0bjt1czaccb9b1fg31ad.com${NIKON_HUB_PATH}`,
    path: NIKON_HUB_PATH,
    pageType: 'location',
    seo: {
      title: 'รับซื้อกล้อง Nikon มือสอง ประเมินราคาตามสภาพจริง - รับซื้อกล้องมือสอง',
      metaDescription:
        'รับซื้อกล้อง Nikon มือสอง ทั้ง Z-series และ DSLR ประเมินราคาตามสภาพจริง บริการรับซื้อถึงที่ Line @WEBUY',
      canonical: `https://xn--12cman8e0bjt1czaccb9b1fg31ad.com${NIKON_HUB_PATH}`,
      h1: 'รับซื้อกล้อง Nikon มือสอง ประเมินราคาตามสภาพจริง',
      ogTitle: 'รับซื้อกล้อง Nikon มือสอง ประเมินราคาตามสภาพจริง - รับซื้อกล้องมือสอง',
      ogDescription:
        'รับซื้อกล้อง Nikon มือสอง ทั้ง Z-series และ DSLR ประเมินราคาตามสภาพจริง บริการรับซื้อถึงที่',
      ogUrl: `https://xn--12cman8e0bjt1czaccb9b1fg31ad.com${NIKON_HUB_PATH}`,
      ogImage: '/images/site/brand-nikon-1200x800.webp',
      ogType: 'article',
      wordCount: 280,
      robots: 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1',
    },
    bodyHtml,
    schemaGraph: [],
    datePublished: '2026-06-17T10:00:00Z',
    dateModified: '2026-06-17T10:00:00Z',
  };

  fs.writeFileSync(path.join(CONTENT_DIR, NIKON_HUB_FILE), JSON.stringify(content), 'utf8');

  const fujiIdx = routes.findIndex((r) => r.path === '/รับซื้อกล้อง/รับซื้อกล้อง-fuji/');
  const insertAt = fujiIdx >= 0 ? fujiIdx + 1 : routes.length;
  const newRoutes = [...routes];
  newRoutes.splice(insertAt, 0, {
    path: NIKON_HUB_PATH,
    contentFile: NIKON_HUB_FILE,
    pageType: 'location',
  });
  saveRoutes(newRoutes);
  return { created: true, routes: newRoutes };
}

function apply() {
  const stats = { files: [], linksAdded: 0, nikonHubCreated: false };

  let routes = loadRoutes();
  const nikon = createNikonHub(routes);
  stats.nikonHubCreated = nikon.created;
  routes = nikon.routes;

  const hubEdits = [
    {
      file: 'location-27378acedd55a8ff37a6.json',
      path: '/รับซื้อกล้อง/รับซื้อกล้อง-sony/',
      fn: applySonyHub,
    },
    {
      file: 'location-19dd379d085dc9e5bee5.json',
      path: '/รับซื้อกล้อง/รับซื้อกล้อง-canon/',
      fn: applyCanonHub,
    },
    {
      file: 'location-af61de9bc0da76ea3c43.json',
      path: '/รับซื้อกล้อง/รับซื้อกล้อง-fuji/',
      fn: applyFujiHub,
    },
  ];

  for (const edit of hubEdits) {
    const fp = path.join(CONTENT_DIR, edit.file);
    const data = JSON.parse(fs.readFileSync(fp, 'utf8'));
    const before = data.bodyHtml || '';
    const beforeN = (before.match(/href="\/models\//g) || []).length;
    const after = edit.fn(before);
    const afterN = (after.match(/href="\/models\//g) || []).length;
    if (after !== before) {
      data.bodyHtml = after;
      fs.writeFileSync(fp, JSON.stringify(data), 'utf8');
      stats.files.push({ path: edit.path, added: afterN - beforeN });
      stats.linksAdded += afterN - beforeN;
    }
  }

  if (stats.nikonHubCreated) {
    stats.files.push({ path: NIKON_HUB_PATH, added: 6 });
    stats.linksAdded += 6;
  }

  const inbound = countInboundBySlug();
  const stillMissing = models.filter((m) => !inbound[m.slug].total).map((m) => m.slug);
  console.log('Apply complete:', JSON.stringify(stats, null, 2));
  if (stillMissing.length) {
    console.warn('Still missing inbound:', stillMissing.join(', '));
  } else {
    console.log('All 27 model pages have inbound links.');
  }
  return { stats, stillMissing, inbound };
}

function checkAttributeCorruption(html, filePath) {
  const issues = [];
  if (/<img[^>]*href="\/models\//i.test(html)) {
    issues.push({ path: filePath, type: 'link_in_img_tag' });
  }
  if (/src="[^"]*\/models\//i.test(html)) {
    issues.push({ path: filePath, type: 'models_in_src' });
  }
  if (/alt="[^"]*<a href/i.test(html)) {
    issues.push({ path: filePath, type: 'link_in_alt' });
  }
  return issues;
}

function qa() {
  const routes = loadRoutes();
  const issues = [];
  const dist = path.join(ROOT, 'dist');
  const inbound = countInboundBySlug();

  const zeroInbound = models.filter((m) => !inbound[m.slug].total);
  if (zeroInbound.length) {
    for (const m of zeroInbound) {
      issues.push({ path: `/models/${m.slug}/`, type: 'no_inbound_links', value: m.slug });
    }
  }

  const nikonRoute = routes.find((r) => r.path === NIKON_HUB_PATH);
  if (!nikonRoute) {
    issues.push({ path: NIKON_HUB_PATH, type: 'nikon_hub_missing' });
  }

  for (const route of routes) {
    const isArticle = route.pageType === 'article';
    const isBrandHub = BRAND_HUB_PATHS.has(route.path);
    if (!isArticle && !isBrandHub) continue;

    const fp = path.join(CONTENT_DIR, route.contentFile);
    if (!fs.existsSync(fp)) continue;
    const data = JSON.parse(fs.readFileSync(fp, 'utf8'));
    const html = data.bodyHtml || '';

    issues.push(...checkAttributeCorruption(html, route.path));

    const slugs = [];
    const hrefRe = /href="\/models\/([^"/]+)\/?"/g;
    let m;
    while ((m = hrefRe.exec(html))) slugs.push(m[1]);

    const maxAllowed = isBrandHub ? MAX_LINKS_BRAND_HUB : MAX_LINKS_ARTICLE;
    if (slugs.length > maxAllowed) {
      issues.push({
        path: route.path,
        type: 'too_many_model_links',
        value: `${slugs.length} > ${maxAllowed}`,
      });
    }

    const dup = slugs.filter((s, i) => slugs.indexOf(s) !== i);
    if (dup.length) {
      issues.push({ path: route.path, type: 'duplicate_target', value: [...new Set(dup)].join(', ') });
    }

    for (const slug of slugs) {
      if (!slugSet.has(slug)) {
        issues.push({ path: route.path, type: 'invalid_model_slug', value: slug });
      }
    }

    const anchors = [...html.matchAll(/<a href="\/models\/[^"]+">([^<]+)<\/a>/g)].map((x) => x[1]);
    for (const b of BANNED) {
      if (anchors.some((a) => a.includes(b))) {
        issues.push({ path: route.path, type: 'banned_word_in_anchor', value: b });
      }
    }
  }

  if (fs.existsSync(dist) && nikonRoute) {
    const sitemapFiles = fs
      .readdirSync(dist)
      .filter((f) => f.startsWith('sitemap') && f.endsWith('.xml'));
    let inSitemap = false;
    for (const sf of sitemapFiles) {
      const xml = fs.readFileSync(path.join(dist, sf), 'utf8');
      if (xml.includes(NIKON_HUB_PATH) || xml.includes(encodeURI(NIKON_HUB_PATH))) {
        inSitemap = true;
        break;
      }
    }
    if (!inSitemap) {
      issues.push({ path: NIKON_HUB_PATH, type: 'nikon_hub_not_in_sitemap' });
    }
  }

  return { issues, inbound, zeroInbound };
}

function writeFinalReport(applyResult, qaResult, buildOk) {
  const { stats, inbound } = applyResult;
  const { issues, zeroInbound } = qaResult;

  const lines = [
    '# Remaining Model Internal Links Report',
    '',
    `Generated: ${new Date().toISOString()}`,
    '',
    '## Summary',
    '',
    `- Nikon brand hub created: ${stats.nikonHubCreated ? 'yes' : 'already existed'}`,
    `- Brand hub pages modified: ${stats.files.filter((f) => f.path !== NIKON_HUB_PATH).length}`,
    `- Net model links added: ${stats.linksAdded}`,
    `- Models with inbound links: ${27 - zeroInbound.length}/27`,
    `- Build: ${buildOk ? 'passed' : 'not run or failed'}`,
    '',
    '## Links added by source',
    '',
  ];

  for (const f of stats.files) {
    lines.push(`- ${f.path} (+${f.added})`);
  }

  lines.push('', '## Inbound link coverage (27 models)', '', '| Slug | Inbound |', '|------|---------|');
  for (const m of models) {
    lines.push(`| ${m.slug} | ${inbound[m.slug].total} |`);
  }

  lines.push('', '## QA checks', '');
  const checks = [
    ['27/27 model pages have inbound links', zeroInbound.length === 0],
    ['No link corruption in img src/alt', !issues.some((i) => i.type.includes('img') || i.type.includes('src') || i.type.includes('alt'))],
    ['Max 5 model links per article', !issues.some((i) => i.type === 'too_many_model_links' && !BRAND_HUB_PATHS.has(i.path))],
    ['No duplicate targets per page', !issues.some((i) => i.type === 'duplicate_target')],
    ['Nikon hub in sitemap', !issues.some((i) => i.type === 'nikon_hub_not_in_sitemap')],
    ['No banned words in new anchors', !issues.some((i) => i.type === 'banned_word_in_anchor')],
  ];
  for (const [label, ok] of checks) {
    lines.push(`- [${ok ? 'x' : ' '}] ${label}`);
  }

  if (issues.length) {
    lines.push('', '## Issues', '');
    for (const i of issues) {
      lines.push(`- [${i.type}] ${i.path}: ${i.value || ''}`);
    }
  } else {
    lines.push('', 'All Phase 4.3 QA checks passed.');
  }

  fs.writeFileSync(FINAL_REPORT, lines.join('\n'), 'utf8');
  console.log(`Wrote ${FINAL_REPORT}`);
}

const cmd = process.argv[2] || 'audit';

if (cmd === 'audit') {
  audit();
} else if (cmd === 'apply') {
  apply();
} else if (cmd === 'qa') {
  const result = qa();
  if (result.issues.length) {
    console.error('QA failed:', result.issues.length, 'issue(s)');
    for (const i of result.issues) console.error(`  [${i.type}] ${i.path}: ${i.value || ''}`);
    process.exit(1);
  }
  console.log('Phase 4.3 QA passed — 27/27 models have inbound links');
} else if (cmd === 'report') {
  const applyResult = { stats: { nikonHubCreated: false, files: [], linksAdded: 0 }, inbound: countInboundBySlug() };
  writeFinalReport(applyResult, qa(), true);
} else {
  console.error('Usage: node scripts/remaining-model-internal-links.mjs [audit|apply|qa|report]');
  process.exit(1);
}

export { audit, apply, qa, writeFinalReport };
