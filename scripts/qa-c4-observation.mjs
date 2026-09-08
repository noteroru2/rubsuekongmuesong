#!/usr/bin/env node
import { readFileSync } from 'node:fs';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const baseline = JSON.parse(readFileSync(new URL('../observations/camera-c4-baseline.json', import.meta.url), 'utf8'));
const fingerprint = JSON.parse(readFileSync(new URL('../public/camera-recovery-gate.json', import.meta.url), 'utf8'));
const verifySource = readFileSync(new URL('./verify-c4-production.mjs', import.meta.url), 'utf8');
const packageJson = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));

assert(baseline.batch === 'CAMERA_C4', 'C4 baseline batch mismatch');
assert(baseline.sourceThroughBatch === 'C3', 'C4 must observe recovery through C3');
assert(baseline.sourceSha === '34d15b7fe694840cda14bc89c73c8deabdb0c589', 'C4 source SHA must freeze C3');
assert(baseline.latestFinalizedGscDate === '2026-09-06', 'C4 finalized GSC baseline date changed unexpectedly');
assert(baseline.preCollapseReference.clicks === 216, 'Pre-collapse clicks baseline changed');
assert(baseline.preCollapseReference.impressions === 3007, 'Pre-collapse impressions baseline changed');
assert(baseline.recoveryBaseline.clicks === 39, 'Recovery clicks baseline changed');
assert(baseline.recoveryBaseline.impressions === 353, 'Recovery impressions baseline changed');
assert(baseline.observation.clock === 'INACTIVE', 'Observation clock must remain inactive until production PASS');
assert(baseline.observation.firstDecisionAfterNewFinalizedDays === 7, 'First decision window must be 7 finalized days');
assert(baseline.observation.primaryRecoveryWindowDays === 14, 'Primary recovery window must be 14 days');
assert(baseline.observation.initialVerdict === 'WAIT_FOR_DEPLOY_OR_RECRAWL', 'Initial C4 verdict must wait for deploy/recrawl');

assert(fingerprint.gate === 'CAMERA_C4', 'Fingerprint gate mismatch');
assert(fingerprint.includesThrough === 'C3', 'Fingerprint must identify C3 recovery source');
assert(fingerprint.sourceSha === baseline.sourceSha, 'Fingerprint source SHA must match frozen baseline');
assert(fingerprint.gscBaselineFinalizedDate === baseline.latestFinalizedGscDate, 'Fingerprint GSC date mismatch');

for (const token of [
  'WAIT_FOR_DEPLOY_OR_RECRAWL',
  'CAMERA_C4_PRODUCTION_GATE',
  'camera-recovery-gate.json',
  'FAQPage',
  'sitemap-index.xml',
  'HOLD legacy route',
]) {
  assert(verifySource.includes(token), `Production verifier missing ${token}`);
}
assert(packageJson.scripts['verify:c4-production'] === 'node scripts/verify-c4-production.mjs', 'Missing verify:c4-production script');
assert(packageJson.scripts['audit:c4-observation'] === 'node scripts/qa-c4-observation.mjs', 'Missing audit:c4-observation script');
assert(packageJson.scripts['qa:c4']?.includes('audit:c3-template-schema'), 'qa:c4 must preserve C3 gate');
assert(packageJson.scripts['qa:c4']?.includes('audit:c4-observation'), 'qa:c4 must include C4 observation gate');

console.log(JSON.stringify({
  latestFinalizedGscDate: baseline.latestFinalizedGscDate,
  preCollapseReference: baseline.preCollapseReference,
  recoveryBaseline: baseline.recoveryBaseline,
  observation: baseline.observation,
  protectedWinnerCount: baseline.protectedWinnerBaseline.length,
}, null, 2));
console.log('CAMERA_C4_OBSERVATION_GATE=PASS');
