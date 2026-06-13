/**
 * Shared test utilities for DebateChain e2e suite.
 * All private keys come exclusively from process.env — never hardcoded.
 */

import { createRequire } from 'module';
import { privateKeyToAccount } from 'viem/accounts';
import { getAddress } from 'viem';

const require = createRequire(import.meta.url);
const { createClient, chains } = require('genlayer-js');
const studionet = chains.studionet;

// ─── Contract ────────────────────────────────────────────────────────────────

export const CONTRACT = '0x0491076e147e51fDC75B16Bb3C63E46001faC07f';

// ─── Env-var guard ────────────────────────────────────────────────────────────

const REQUIRED_KEYS = ['PK_CREATOR_1', 'PK_CREATOR_2', 'PK_JOINER_1', 'PK_JOINER_2'];

export function checkEnvVars() {
  const missing = REQUIRED_KEYS.filter((k) => !process.env[k]);
  if (missing.length > 0) {
    console.error('\n[ABORT] Missing required environment variables:');
    missing.forEach((k) => console.error(`  - ${k}`));
    console.error('\nSet them before running tests. Example:');
    console.error('  $env:PK_CREATOR_1 = "0x<64-hex-chars>"');
    process.exit(1);
  }
}

// ─── Wallet helpers ───────────────────────────────────────────────────────────

function normalizeKey(raw) {
  const s = raw.trim();
  return s.startsWith('0x') ? s : `0x${s}`;
}

export function makeAccount(envKey) {
  const raw = process.env[envKey];
  if (!raw) throw new Error(`env var ${envKey} not set`);
  return privateKeyToAccount(normalizeKey(raw));
}

export function makeClient(account) {
  return createClient({
    chain: studionet,
    account,
  });
}

// Checksummed addresses for comparison
export function addr(account) {
  return getAddress(account.address);
}

// ─── Transaction helpers ──────────────────────────────────────────────────────

const RECEIPT_RETRIES = 200;
const RECEIPT_INTERVAL = 3000; // ms

export async function send(client, functionName, args) {
  const hash = await client.writeContract({
    address: CONTRACT,
    functionName,
    args,
    value: 0n,
  });
  const receipt = await client.waitForTransactionReceipt({
    hash,
    retries: RECEIPT_RETRIES,
    interval: RECEIPT_INTERVAL,
  });
  const execResult = receipt?.consensus_data?.leader_receipt?.[0]?.execution_result;
  return { hash, receipt, execResult };
}

export async function view(client, functionName, args = []) {
  const raw = await client.readContract({
    address: CONTRACT,
    functionName,
    args,
  });
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return raw; }
}

// ─── Assertion helpers ────────────────────────────────────────────────────────

export function assert(condition, message) {
  if (!condition) {
    throw new Error(`ASSERT FAILED: ${message}`);
  }
}

export function assertEqual(actual, expected, label) {
  if (actual !== expected) {
    throw new Error(`ASSERT FAILED [${label}]: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

export function assertOk(execResult, label) {
  const ok = execResult === 'SUCCESS' || execResult === 'ACCEPTED';
  if (!ok) {
    throw new Error(`ASSERT FAILED [${label}]: expected SUCCESS/ACCEPTED, got ${execResult}`);
  }
}

/**
 * Expect a transaction to revert. Returns the full tx for inspection.
 * Succeeds if execution_result is NOT SUCCESS/ACCEPTED.
 */
export async function assertReverts(client, functionName, args, label) {
  let hash, receipt, execResult;
  try {
    ({ hash, receipt, execResult } = await send(client, functionName, args));
  } catch (err) {
    // writeContract itself threw — counts as revert
    console.log(`    [revert via throw] ${label}: ${err.message?.slice(0, 120)}`);
    return { threw: true, error: err };
  }
  const reverted = execResult !== 'SUCCESS' && execResult !== 'ACCEPTED';
  if (!reverted) {
    throw new Error(`ASSERT FAILED [${label}]: expected revert but got ${execResult}`);
  }
  // Fetch full tx to get stderr for diagnostics
  let fullTx;
  try {
    fullTx = await client.getTransaction({ hash });
  } catch {
    // not critical
  }
  const stderr = fullTx?.consensus_data?.leader_receipt?.[0]?.stderr || '';
  console.log(`    [revert ok] ${label} — stderr: ${stderr.slice(0, 160)}`);
  return { hash, receipt, execResult, stderr };
}

// ─── Throttle (Studionet: 30 req/min) ─────────────────────────────────────

export function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// ─── ID generators ────────────────────────────────────────────────────────────

let _seq = 0;
export function uid(prefix = 'd') {
  return `${prefix}-test-${Date.now()}-${++_seq}`;
}

// ─── Logging ──────────────────────────────────────────────────────────────────

export function log(msg) {
  console.log(`  ${msg}`);
}

export function section(title) {
  console.log(`\n${'─'.repeat(60)}`);
  console.log(`  ${title}`);
  console.log('─'.repeat(60));
}

// ─── Debate fixture ───────────────────────────────────────────────────────────

export function debateJson(creatorAddr, opts = {}) {
  return JSON.stringify({
    topic: opts.topic ?? 'AI will be net positive for employment',
    side_a_label: opts.side_a_label ?? 'Agree',
    side_b_label: opts.side_b_label ?? 'Disagree',
    rules_json: opts.rules_json ?? 'Standard DebateChain rules',
    evidence_required: opts.evidence_required ?? false,
    rounds_required: opts.rounds_required ?? ['opening', 'rebuttal'],
    creator: creatorAddr,
  });
}

export function submissionJson(argumentText, evidence = []) {
  return JSON.stringify({
    argument_text: argumentText,
    evidence,
  });
}
