#!/usr/bin/env node
/**
 * Generate redirect-backlog.md from redirect-map.csv (medium/low 301 not in _redirects).
 * Run: node scripts/generate-redirect-backlog.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve('.');

function parseRedirects(filePath) {
  const set = new Set();
  for (const line of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const parts = t.split(/\s+/);
    if (parts[0]) set.add(parts[0]);
  }
  return set;
}

function norm(p) {
  if (p === '/sitemap_index.xml') return p;
  if (p === '/') return p;
  return p.endsWith('/') ? p : `${p}/`;
}

const inRedirects = parseRedirects(path.join(ROOT, 'public', '_redirects'));
const lines = fs.readFileSync(path.join(ROOT, 'redirect-map.csv'), 'utf8').split(/\r?\n/);
const rules = [];

for (const line of lines) {
  const t = line.trim();
  if (!t || t.startsWith('#') || t.startsWith('old_path')) continue;
  const cols = t.split(',');
  if (cols[1] !== '301' || !cols[0] || !cols[2]) continue;
  const pri = (cols[4] || 'medium').toLowerCase();
  if (pri === 'high') continue;
  const src = norm(cols[0]);
  if (inRedirects.has(src) || inRedirects.has(cols[0])) continue;
  rules.push({ src, dest: cols[2], pri, reason: cols[3] || '' });
}

const medium = rules.filter((r) => r.pri === 'medium');
const low = rules.filter((r) => r.pri === 'low');

const fmtTable = (rows) =>
  `| Old path | Redirect to | CSV priority | Reason |\n|----------|-------------|--------------|--------|\n${rows
    .map((r) => `| \`${r.src}\` | \`${r.dest}\` | ${r.pri} | ${r.reason.replace(/\|/g, '/')} |`)
    .join('\n')}`;

const md = `# Redirect Backlog

**Generated:** ${new Date().toISOString().slice(0, 10)}  
**Production commit:** e19264e  
**Synced in vercel.json:** 115 rules (58 \`_redirects\` + 57 encoded variants)  
**Backlog (not synced):** **${rules.length}** rules — medium: ${medium.length}, low: ${low.length}

> **กฎ:** ห้ามเพิ่ม redirect ทั้ง ${rules.length} rules พร้อมกัน  
> เพิ่มเป็น **batch** เฉพาะ URL ที่ GSC พบ 404 จริงเท่านั้น

---

## GSC 404 triage priority

เมื่อพบ URL ใน GSC Coverage / Crawl stats:

| Priority | เงื่อนไข | Action |
|----------|---------|--------|
| **HIGH** | มี impression/click ใน GSC หรือเป็น money page (\`/รับซื้อกล้อง/\`, \`/article/\` top traffic) | เพิ่ม redirect ใน batch ถัดไปภายใน 24 ชม. |
| **MEDIUM** | Google crawl แล้ว แต่ไม่มี impression | รอ batch สัปดาห์ที่ 2 หรือรวมกับ HIGH batch |
| **LOW** | ไม่มีข้อมูล performance | เก็บใน backlog จนกว่า GSC จะรายงาน |

---

## Batch workflow

1. Export 404 จาก GSC → บันทึกใน \`post-cutover-monitoring.md\` ตารางรายวัน
2. จับคู่กับตาราง backlog ด้านล่าง
3. ถ้ามีใน backlog → \`npm run redirects:sync\` หลังเพิ่มใน \`public/_redirects\` แล้วรัน sync script
4. Deploy → curl ทดสอบ → บันทึก action ในตาราง monitoring
5. **Batch size แนะนำ:** ≤10 URLs ต่อ deploy

### GSC-discovered 404 (เพิ่มที่นี่)

| Date found | URL | GSC priority | In backlog? | Action | Deployed |
|------------|-----|--------------|-------------|--------|----------|
| | | | | | |

---

## Medium priority backlog (${medium.length} rules)

${fmtTable(medium)}

---

## Low priority backlog (${low.length} rules)

${low.length > 30 ? `${fmtTable(low.slice(0, 30))}\n\n_… and ${low.length - 30} more low-priority rules in redirect-map.csv SECTION 7–9_\n` : fmtTable(low)}

---

## Quick reference — top medium rules

${medium
  .slice(0, 15)
  .map((r) => `- \`${r.src}\` → \`${r.dest}\``)
  .join('\n')}
`;

fs.writeFileSync(path.join(ROOT, 'redirect-backlog.md'), md, 'utf8');
console.log(`redirect-backlog.md: ${rules.length} rules (medium ${medium.length}, low ${low.length})`);
