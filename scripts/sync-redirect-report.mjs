#!/usr/bin/env node
/**
 * Compare _redirects, vercel.json, redirect-map.csv — write redirect-sync-report.md
 * Run: node scripts/sync-redirect-report.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve('.');

function parseRedirectsFile(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
  const rules = [];
  for (const line of lines) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const parts = t.split(/\s+/);
    if (parts.length >= 3) {
      rules.push({ source: parts[0], destination: parts[1], status: parts[2] });
    }
  }
  return rules;
}

function parseRedirectMapCsv(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
  const rules = [];
  for (const line of lines) {
    const t = line.trim();
    if (!t || t.startsWith('#') || t.startsWith('old_path')) continue;
    const cols = t.split(',');
    if (cols.length < 3) continue;
    const [oldPath, action, target] = cols;
    if (action === '301' && oldPath && target) {
      rules.push({ source: oldPath, destination: target, status: '301', reason: cols[3] || '' });
    }
  }
  return rules;
}

function parseVercelJson(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const j = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  return (j.redirects || []).map((r) => ({
    source: r.source,
    destination: r.destination,
    status: String(r.permanent ? 301 : 302),
  }));
}

function norm(p) {
  if (!p) return '/';
  let s = p.trim();
  if (!s.startsWith('/')) s = `/${s}`;
  if (s !== '/' && !s.endsWith('/')) s += '/';
  return s;
}

function main() {
  const redirectsFile = parseRedirectsFile(path.join(ROOT, 'public', '_redirects'));
  const vercelRules = parseVercelJson(path.join(ROOT, 'vercel.json'));
  const mapRules = parseRedirectMapCsv(path.join(ROOT, 'redirect-map.csv'));

  const redirectsSet = new Set(redirectsFile.map((r) => norm(r.source)));
  const mapSet = new Set(mapRules.map((r) => norm(r.source)));
  const vercelSet = new Set(vercelRules.map((r) => r.source));

  const inMapNotRedirects = mapRules.filter((r) => !redirectsSet.has(norm(r.source)));
  const inRedirectsNotMap = redirectsFile.filter((r) => !mapSet.has(norm(r.source)));
  const inRedirectsNotVercel = redirectsFile.filter(
    (r) => !vercelSet.has(r.source) && r.source !== '/sitemap_index.xml',
  );

  const criticalPrefixes = [
    '/tag/',
    '/กล้อง/',
    '/sitemap_index.xml',
    '/รับซื้อกล้อง/',
    '/article/',
  ];

  const criticalInRedirects = redirectsFile.filter((r) =>
    criticalPrefixes.some((p) => r.source.startsWith(p) || r.source === p.replace(/\/$/, '')),
  );

  const trailingSlashIssues = redirectsFile.filter((r) => {
    const s = r.source;
    return s !== '/sitemap_index.xml' && !s.endsWith('/') && !s.includes(':');
  });

  const report = `# Redirect Sync Report

Generated: ${new Date().toISOString()}

## Summary

| Source | Rule count |
|--------|------------|
| \`public/_redirects\` | **${redirectsFile.length}** |
| \`redirect-map.csv\` (301 actions) | **${mapRules.length}** |
| \`vercel.json\` redirects | **${vercelRules.length}** |

## Platform notes

- **Astro** uses \`trailingSlash: 'always'\` — canonical URLs end with \`/\`.
- **Vercel** reads \`vercel.json\` redirects natively. The Netlify-style \`public/_redirects\` is copied to \`dist/\` but **Vercel does not apply Netlify _redirects format** unless using a compatible adapter.
- **Before DNS cutover:** sync high-priority rules from \`_redirects\` into \`vercel.json\` OR confirm hosting reads \`_redirects\` (Cloudflare Pages / Netlify yes; Vercel needs \`vercel.json\`).

## Critical WordPress → Astro redirects in _redirects

| Category | Count |
|----------|-------|
| TAG 301 | ${redirectsFile.filter((r) => r.source.startsWith('/tag/')).length} |
| /กล้อง/ 301 | ${redirectsFile.filter((r) => r.source.startsWith('/กล้อง/')).length} |
| /รับซื้อกล้อง/ canonical | ${redirectsFile.filter((r) => r.source.startsWith('/รับซื้อกล้อง/')).length} |
| Infrastructure (sitemap) | ${redirectsFile.filter((r) => r.source.includes('sitemap')).length} |
| **Total critical** | **${criticalInRedirects.length}** |

## Gap analysis

### In redirect-map.csv (301) but NOT in _redirects

**${inMapNotRedirects.length}** rules planned in CSV but missing from deployed \`_redirects\`.

${inMapNotRedirects.length ? inMapNotRedirects.slice(0, 20).map((r) => `- \`${r.source}\` → \`${r.destination}\``).join('\n') + (inMapNotRedirects.length > 20 ? `\n- … and ${inMapNotRedirects.length - 20} more` : '') : '_None — all CSV 301 rules are in _redirects._'}

### In _redirects but NOT in redirect-map.csv

**${inRedirectsNotMap.length}** rules (may be manually added or newer than CSV).

${inRedirectsNotMap.slice(0, 15).map((r) => `- \`${r.source}\` → \`${r.destination}\``).join('\n') || '_None_'}

### In _redirects but NOT in vercel.json

**${inRedirectsNotVercel.length}** rules — **must sync before Vercel cutover**.

${inRedirectsNotVercel.slice(0, 15).map((r) => `- \`${r.source}\` → \`${r.destination}\``).join('\n')}
${inRedirectsNotVercel.length > 15 ? `\n- … and ${inRedirectsNotVercel.length - 15} more` : ''}

## Trailing slash

${trailingSlashIssues.length ? `⚠️ ${trailingSlashIssues.length} _redirects sources without trailing slash:\n${trailingSlashIssues.map((r) => `- \`${r.source}\``).join('\n')}` : '✓ All _redirects sources use trailing slash (except sitemap).'}

## Encoded Thai URLs

WordPress may serve percent-encoded paths (e.g. \`%e0%b8%a3%e0%b8%b1%e0%b8%9a...\`). Astro content uses Unicode paths in \`src/data/content/*.json\`. GSC may still index encoded URLs — add encoded variants to redirects if 404s appear post-cutover.

## Verdict

| Check | Status |
|-------|--------|
| _redirects has TAG + /กล้อง/ rules | ${redirectsFile.some((r) => r.source.startsWith('/tag/')) && redirectsFile.some((r) => r.source.startsWith('/กล้อง/')) ? '✓ PASS' : '✗ FAIL'} |
| Sitemap redirect | ${redirectsFile.some((r) => r.source.includes('sitemap_index')) ? '✓ PASS' : '✗ FAIL'} |
| vercel.json covers _redirects | ${inRedirectsNotVercel.length === 0 ? '✓ PASS' : `✗ GAP (${inRedirectsNotVercel.length} rules)`} |
| redirect-map.csv fully deployed | ${inMapNotRedirects.length === 0 ? '✓ PASS' : `⚠ PARTIAL (${inMapNotRedirects.length} missing)`} |

## Recommended next step

1. Run \`node scripts/generate-vercel-redirects.mjs\` (Phase 2b) to merge \`_redirects\` → \`vercel.json\`.
2. Test top 20 GSC URLs on Vercel preview before DNS cutover.
3. See \`dns-cutover-checklist.md\`.
`;

  fs.writeFileSync(path.join(ROOT, 'redirect-sync-report.md'), report, 'utf8');
  console.log(`redirect-sync-report.md written`);
  console.log(`  _redirects: ${redirectsFile.length}`);
  console.log(`  redirect-map 301: ${mapRules.length}`);
  console.log(`  vercel.json: ${vercelRules.length}`);
  console.log(`  gap vercel: ${inRedirectsNotVercel.length}`);
}

main();
