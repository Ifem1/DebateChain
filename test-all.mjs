#!/usr/bin/env node
/**
 * DebateChain — End-to-End Test Runner
 *
 * Usage:
 *   node test-all.mjs              — run all three suites in sequence
 *   node test-all.mjs 1            — run only suite 1 (happy path)
 *   node test-all.mjs 2            — run only suite 2 (revert cases)
 *   node test-all.mjs 3            — run only suite 3 (non-deterministic)
 *   node test-all.mjs 1,2          — run suites 1 and 2
 *
 * Required env vars (set before running — NEVER hardcoded):
 *   PK_CREATOR_1  — 64-hex private key for debate creator wallet 1
 *   PK_JOINER_1   — 64-hex private key for joiner wallet 1
 *   PK_JOINER_2   — 64-hex private key for joiner wallet 2
 *
 * Contract: 0xfC8840bF2B5B4eBdc884B8EE700Cc8C77714d3a7
 * Chain   : GenLayer Studionet (chainId 61999)
 */

import { checkEnvVars } from './tests/helpers.mjs';
import { run as run1 } from './tests/suite1-happy-path.mjs';
import { run as run2 } from './tests/suite2-reverts.mjs';
import { run as run3 } from './tests/suite3-nondet.mjs';

checkEnvVars();

const SUITES = {
  '1': { name: 'Suite 1 — Happy Path (deterministic)', fn: run1 },
  '2': { name: 'Suite 2 — Revert Cases (deterministic)', fn: run2 },
  '3': { name: 'Suite 3 — Non-Deterministic (judge + dispute + finalize)', fn: run3 },
};

const filter = process.argv[2];
let toRun;

if (!filter) {
  toRun = ['1', '2', '3'];
} else {
  toRun = filter.split(',').map(s => s.trim()).filter(s => SUITES[s]);
  if (toRun.length === 0) {
    console.error(`Unknown suite(s): ${filter}. Valid: 1, 2, 3`);
    process.exit(1);
  }
}

console.log('\n╔══════════════════════════════════════════════════════════════╗');
console.log('║           DebateChain — End-to-End Test Runner               ║');
console.log('╚══════════════════════════════════════════════════════════════╝');
console.log(`Running suites: ${toRun.join(', ')}\n`);

const results = [];

for (const id of toRun) {
  const suite = SUITES[id];
  console.log(`\n▶ Starting ${suite.name}`);
  const start = Date.now();
  try {
    await suite.fn();
    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    results.push({ id, name: suite.name, passed: true, elapsed });
    console.log(`\n✅ ${suite.name} — PASSED (${elapsed}s)`);
  } catch (err) {
    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    results.push({ id, name: suite.name, passed: false, elapsed, error: err.message });
    console.error(`\n❌ ${suite.name} — FAILED (${elapsed}s)`);
    console.error(`   ${err.message}`);
    // Exit immediately on first failure
    printSummary(results);
    process.exit(1);
  }
}

printSummary(results);

function printSummary(results) {
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║                        TEST SUMMARY                         ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  for (const r of results) {
    const icon = r.passed ? '✅' : '❌';
    console.log(`  ${icon} Suite ${r.id} — ${r.elapsed}s${r.error ? `\n     Error: ${r.error}` : ''}`);
  }
  const allPassed = results.every(r => r.passed);
  console.log(`\n${allPassed ? '✅ ALL SUITES PASSED' : '❌ SOME SUITES FAILED'}\n`);
}
