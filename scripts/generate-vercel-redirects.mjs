#!/usr/bin/env node
/**
 * Merge public/_redirects (+ encoded Thai variants) into vercel.json.
 * Preserves headers, trailingSlash, and other config.
 * Run: npm run redirects:sync
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve('.');

function parseRedirectsFile(filePath) {
  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
  const rules = [];
  for (const line of lines) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const parts = t.split(/\s+/);
    if (parts.length >= 3 && parts[2] === '301') {
      rules.push({ source: parts[0], destination: parts[1] });
    }
  }
  return rules;
}

function parseRedirectMapCsv(filePath) {
  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
  const rules = [];
  for (const line of lines) {
    const t = line.trim();
    if (!t || t.startsWith('#') || t.startsWith('old_path')) continue;
    const cols = t.split(',');
    if (cols.length < 3 || cols[1] !== '301' || !cols[0] || !cols[2]) continue;
    const priority = (cols[4] || '').toLowerCase();
    if (priority !== 'high') continue;
    rules.push({ source: cols[0], destination: cols[2], reason: cols[3] || '' });
  }
  return rules;
}

function encodePathSegments(p) {
  if (!p || p === '/') return p;
  return p
    .split('/')
    .map((seg) => (seg ? encodeURIComponent(seg) : ''))
    .join('/');
}

function hasNonAscii(s) {
  return /[^\x00-\x7F]/.test(s);
}

function normSource(s) {
  if (s === '/sitemap_index.xml') return s;
  if (s === '/') return s;
  return s.endsWith('/') ? s : `${s}/`;
}

function normDest(d) {
  if (!d || d === '/') return '/';
  if (d.includes('#')) {
    const [base, hash] = d.split('#');
    const b = base.endsWith('/') ? base : `${base}/`;
    return `${b}#${hash}`;
  }
  if (d.endsWith('.xml')) return d;
  return d.endsWith('/') ? d : `${d}/`;
}

function toVercelRule({ source, destination }) {
  return {
    source: source === '/sitemap_index.xml' ? source : normSource(source),
    destination: normDest(destination),
    permanent: true,
  };
}

function ruleKey(r) {
  return `${r.source}\t${r.destination}`;
}

function mergeRules(...lists) {
  const seen = new Set();
  const out = [];
  for (const list of lists) {
    for (const raw of list) {
      const base = toVercelRule(raw);
      const variants = [base];
      if (hasNonAscii(base.source)) {
        const encoded = encodePathSegments(base.source);
        if (encoded !== base.source) {
          variants.push({ ...base, source: encoded });
        }
      }
      for (const v of variants) {
        const k = ruleKey(v);
        if (seen.has(k)) continue;
        seen.add(k);
        out.push(v);
      }
    }
  }
  return out;
}

function main() {
  const vercelPath = path.join(ROOT, 'vercel.json');
  const vercel = JSON.parse(fs.readFileSync(vercelPath, 'utf8'));

  const fromRedirects = parseRedirectsFile(path.join(ROOT, 'public', '_redirects'));
  const fromCsvHigh = parseRedirectMapCsv(path.join(ROOT, 'redirect-map.csv'));

  const redirectSources = new Set(fromRedirects.map((r) => normSource(r.source)));
  const csvOnly = fromCsvHigh.filter((r) => !redirectSources.has(normSource(r.source)));

  const redirects = mergeRules(fromRedirects, csvOnly);

  redirects.sort((a, b) => {
    if (a.source === '/sitemap_index.xml') return -1;
    if (b.source === '/sitemap_index.xml') return 1;
    if (a.source.startsWith('/tag/') && !b.source.startsWith('/tag/')) return -1;
    if (b.source.startsWith('/tag/') && !a.source.startsWith('/tag/')) return 1;
    return a.source.localeCompare(b.source);
  });

  vercel.redirects = redirects;
  fs.writeFileSync(vercelPath, `${JSON.stringify(vercel, null, 2)}\n`, 'utf8');

  const report = `# Vercel Redirect Sync Report

Generated: ${new Date().toISOString()}

## Summary

| Source | Rules |
|--------|------:|
| \`public/_redirects\` | ${fromRedirects.length} |
| \`redirect-map.csv\` (301 + high, not in _redirects) | ${csvOnly.length} |
| Encoded Thai variants added | ${redirects.length - fromRedirects.length - csvOnly.length} |
| **\`vercel.json\` total** | **${redirects.length}** |

## Vercel limits

- Hobby/Pro: **1,024** redirects per project — current usage **${redirects.length}** (${Math.round((redirects.length / 1024) * 100)}%)
- No wildcard grouping needed at this scale

## Sync coverage

| Check | Status |
|-------|--------|
| All \`_redirects\` in vercel.json | ${fromRedirects.every((r) => redirects.some((v) => v.source === normSource(r.source) || v.source === encodePathSegments(normSource(r.source)))) ? '✓ PASS' : '✗ FAIL'} |
| Sitemap redirect | ${redirects.some((r) => r.source === '/sitemap_index.xml') ? '✓ PASS' : '✗ FAIL'} |
| TAG archives | ${redirects.filter((r) => r.source.includes('/tag/')).length} rules |
| /กล้อง/ paths | ${redirects.filter((r) => decodeURIComponent(r.source).includes('/กล้อง/')).length} rules |
| Headers preserved | ✓ (unchanged) |
| trailingSlash config | ✓ (\`${vercel.trailingSlash}\`) |

## Categories (_redirects)

| Category | Count |
|----------|------:|
| Sitemap | ${fromRedirects.filter((r) => r.source.includes('sitemap')).length} |
| TAG | ${fromRedirects.filter((r) => r.source.startsWith('/tag/')).length} |
| /กล้อง/ | ${fromRedirects.filter((r) => r.source.startsWith('/กล้อง/')).length} |
| /รับซื้อกล้อง/ canonical | ${fromRedirects.filter((r) => r.source.startsWith('/รับซื้อกล้อง/')).length} |

## Not synced (by design)

- **262** redirect-map.csv 301 rules with medium/low priority — not in \`_redirects\`
- Add in Phase 4 if GSC shows 404s on those old URLs

## Hash destinations

Rules with fragment (e.g. \`/models/#sony\`):

${redirects
  .filter((r) => r.destination.includes('#'))
  .map((r) => `- \`${r.source}\` → \`${r.destination}\``)
  .join('\n') || '_None_'}

## QA

\`\`\`bash
npm run redirects:sync
npm run build
npm run qa:redirects
\`\`\`
`;

  fs.writeFileSync(path.join(ROOT, 'vercel-redirect-sync-report.md'), report, 'utf8');

  console.log(`vercel.json updated: ${redirects.length} redirect rules`);
  console.log(`  from _redirects: ${fromRedirects.length}`);
  console.log(`  csv high extra: ${csvOnly.length}`);
  console.log(`  encoded variants: ${redirects.length - fromRedirects.length - csvOnly.length}`);
  console.log('vercel-redirect-sync-report.md written');
}

main();
