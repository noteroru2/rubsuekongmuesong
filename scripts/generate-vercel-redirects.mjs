#!/usr/bin/env node
/**
 * Camera C2 redirect sync.
 * Only exact-intent owners are emitted. Homepage fallbacks are forbidden.
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
    if (parts.length < 3 || parts[2] !== '301') continue;
    if (!parts[0] || !parts[1] || parts[1] === '/') continue;
    rules.push({ source: parts[0], destination: parts[1] });
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
    if (cols[2] === '/') continue;
    const priority = (cols[4] || '').toLowerCase();
    if (!['high', 'medium'].includes(priority)) continue;
    rules.push({ source: cols[0], destination: cols[2], reason: cols[3] || '' });
  }
  return rules;
}

function encodePathSegments(p) {
  if (!p || p === '/') return p;
  return p.split('/').map((seg) => (seg ? encodeURIComponent(seg) : '')).join('/');
}

function hasNonAscii(s) {
  return /[^\x00-\x7F]/.test(s);
}

function normSource(s) {
  if (s === '/sitemap_index.xml' || s === '/') return s;
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
      if (!raw.destination || raw.destination === '/') continue;
      const base = toVercelRule(raw);
      const variants = [base];
      if (hasNonAscii(base.source)) {
        const encoded = encodePathSegments(base.source);
        if (encoded !== base.source) variants.push({ ...base, source: encoded });
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
  const fromCsv = parseRedirectMapCsv(path.join(ROOT, 'redirect-map.csv'));
  const redirectSources = new Set(fromRedirects.map((r) => normSource(r.source)));
  const csvOnly = fromCsv.filter((r) => !redirectSources.has(normSource(r.source)));

  const redirects = mergeRules(
    [{ source: '/sitemap_index.xml', destination: '/sitemap-index.xml' }],
    fromRedirects,
    csvOnly,
  );

  redirects.sort((a, b) => {
    if (a.source === '/sitemap_index.xml') return -1;
    if (b.source === '/sitemap_index.xml') return 1;
    if (a.source.startsWith('/tag/') && !b.source.startsWith('/tag/')) return -1;
    if (b.source.startsWith('/tag/') && !a.source.startsWith('/tag/')) return 1;
    return a.source.localeCompare(b.source);
  });

  if (redirects.some((r) => r.destination === '/')) {
    throw new Error('C2 gate: homepage fallback redirect is forbidden');
  }

  vercel.redirects = redirects;
  fs.writeFileSync(vercelPath, `${JSON.stringify(vercel, null, 2)}\n`, 'utf8');

  const report = `# Vercel Redirect Sync Report\n\nGenerated: ${new Date().toISOString()}\n\n## Camera C2 ownership policy\n\n- Exact-intent permanent redirects only\n- High/medium CSV mappings may sync only when destination is not homepage\n- Generic/unclear legacy URLs remain HOLD_NOINDEX\n- Homepage fallback redirects: **0**\n\n## Summary\n\n| Source | Rules |\n|--------|------:|\n| \`public/_redirects\` exact owners | ${fromRedirects.length} |\n| \`redirect-map.csv\` high/medium exact-owner extras | ${csvOnly.length} |\n| **\`vercel.json\` total including encoded variants** | **${redirects.length}** |\n\n## QA\n\n\`\`\`bash\nnpm run redirects:sync\nnpm run audit:c2-ownership\nnpm run build\nnpm run qa:redirects\n\`\`\`\n`;

  fs.writeFileSync(path.join(ROOT, 'vercel-redirect-sync-report.md'), report, 'utf8');
  console.log(`vercel.json updated: ${redirects.length} redirect rules`);
}

main();
