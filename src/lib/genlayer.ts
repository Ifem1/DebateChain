'use client';

import { createClient } from 'genlayer-js';
import { studionet } from 'genlayer-js/chains';
import { getAddress } from 'viem';
import { CONTRACT_ADDRESS } from './constants';
import { cacheDebate, cacheProfile, cacheSubmission, cacheVerdict } from './supabase';
import type {
  Debate,
  Submission,
  Verdict,
  UserReputation,
  ProtocolState,
  CreateDebateInput,
  DebateSide,
  DebateRound,
  EvidenceItem,
} from '@/types/debate';

const RPC_ENDPOINT = (process.env.NEXT_PUBLIC_GENLAYER_RPC || 'https://studio.genlayer.com/api') as `http://${string}` | `https://${string}`;

export function getReadClient() {
  return createClient({ chain: studionet, endpoint: RPC_ENDPOINT });
}

export function getWriteClient(account: `0x${string}`) {
  return createClient({ chain: studionet, endpoint: RPC_ENDPOINT, account });
}

// ─── Read Methods ─────────────────────────────────────────────────────────────

export async function getDebate(debateId: string): Promise<Debate | null> {
  try {
    const client = getReadClient();
    const result = await client.readContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      functionName: 'get_debate',
      args: [debateId],
    });
    if (!result) return null;
    const raw = typeof result === 'string' ? JSON.parse(result) : result;
    const debate = raw as Debate;
    // Sync to Supabase cache in the background — non-blocking
    cacheDebate(debate).catch(() => {});
    return debate;
  } catch (err) {
    console.error('getDebate error:', err);
    return null;
  }
}

export async function getSubmission(submissionId: string): Promise<Submission | null> {
  try {
    const client = getReadClient();
    const result = await client.readContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      functionName: 'get_submission',
      args: [submissionId],
    });
    if (!result) return null;
    const raw = typeof result === 'string' ? JSON.parse(result) : result;
    return raw as Submission;
  } catch (err) {
    console.error('getSubmission error:', err);
    return null;
  }
}

export async function getDebateSubmissions(debateId: string): Promise<Submission[]> {
  try {
    const client = getReadClient();
    const result = await client.readContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      functionName: 'get_debate_submissions',
      args: [debateId],
    });
    if (!result) return [];
    const raw = typeof result === 'string' ? JSON.parse(result) : result;
    const subs: Submission[] = Array.isArray(raw) ? raw : [];
    // Cache each submission in background
    subs.forEach((s) => cacheSubmission(s).catch(() => {}));
    return subs;
  } catch (err) {
    console.error('getDebateSubmissions error:', err);
    return [];
  }
}

export async function getVerdict(debateId: string): Promise<Verdict | null> {
  try {
    const client = getReadClient();
    const result = await client.readContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      functionName: 'get_verdict',
      args: [debateId],
    });
    if (!result) return null;
    const raw = typeof result === 'string' ? JSON.parse(result) : result;
    const verdict = raw as Verdict;
    // Sync verdict to Supabase cache in background
    cacheVerdict(verdict).catch(() => {});
    return verdict;
  } catch (err) {
    console.error('getVerdict error:', err);
    return null;
  }
}

export async function getUserDebates(address: string): Promise<Debate[]> {
  // GenLayer Studionet stores addresses in checksummed EIP-55 format.
  // MetaMask may return lowercase — compute checksum and try both.
  let checksummed = address;
  try { checksummed = getAddress(address); } catch { /* not a valid address */ }
  const variants = Array.from(new Set([checksummed, address, address.toLowerCase()]));
  for (const addr of variants) {
    try {
      const client = getReadClient();
      const result = await client.readContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        functionName: 'get_user_debates',
        args: [addr],
      });
      if (!result) continue;
      const raw = typeof result === 'string' ? JSON.parse(result) : result;
      const debates: Debate[] = Array.isArray(raw) ? raw : [];
      if (debates.length > 0) {
        debates.forEach((d) => cacheDebate(d).catch(() => {}));
        return debates;
      }
    } catch (err) {
      console.error(`[getUserDebates] error for addr=${addr}:`, err);
    }
  }
  return [];
}

export async function getReputation(address: string): Promise<UserReputation | null> {
  try {
    const client = getReadClient();
    const result = await client.readContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      functionName: 'get_reputation',
      args: [address],
    });
    if (!result) return null;
    const raw = typeof result === 'string' ? JSON.parse(result) : result;
    const reputation = raw as UserReputation;
    cacheProfile(reputation).catch(() => {});
    return reputation;
  } catch (err) {
    console.error('getReputation error:', err);
    return null;
  }
}

export async function getProtocolState(): Promise<ProtocolState | null> {
  try {
    const client = getReadClient();
    const result = await client.readContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      functionName: 'get_protocol_state',
      args: [],
    });
    if (!result) return null;
    const raw = typeof result === 'string' ? JSON.parse(result) : result;
    return raw as ProtocolState;
  } catch (err) {
    console.error('getProtocolState error:', err);
    return null;
  }
}

// ─── Write Methods ────────────────────────────────────────────────────────────

export async function createDebate(
  account: `0x${string}`,
  debateId: string,
  input: CreateDebateInput
): Promise<`0x${string}`> {
  const client = getWriteClient(account);
  const debateJson = JSON.stringify({
    debate_id: debateId,
    creator: account,
    opponent: '0x0000000000000000000000000000000000000000',
    topic: input.topic,
    side_a_label: input.side_a_label,
    side_b_label: input.side_b_label,
    debate_type: input.debate_type,
    status: 'CREATED',
    rounds_required: input.rounds_required,
    word_limit: input.word_limit,
    evidence_required: input.evidence_required,
    rules_json: input.rules,
    created_at: Date.now(),
    finalized: false,
  });

  const hash = await client.writeContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    functionName: 'create_debate',
    args: [debateId, debateJson],
    value: 0n,
  });

  // Immediately cache an optimistic entry so it appears in the public list
  const optimisticDebate: Debate = {
    debate_id: debateId,
    creator: account,
    opponent: '0x0000000000000000000000000000000000000000',
    topic: input.topic,
    side_a_label: input.side_a_label,
    side_b_label: input.side_b_label,
    debate_type: input.debate_type,
    status: 'CREATED',
    rounds_required: input.rounds_required,
    word_limit: input.word_limit,
    evidence_required: input.evidence_required,
    rules_json: input.rules,
    created_at: Date.now(),
    finalized: false,
  };
  cacheDebate(optimisticDebate).catch(() => {});

  return hash as `0x${string}`;
}

export async function acceptDebate(
  account: `0x${string}`,
  debateId: string
): Promise<`0x${string}`> {
  const client = getWriteClient(account);
  const hash = await client.writeContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    functionName: 'accept_debate',
    args: [debateId],
    value: 0n,
  });
  return hash as `0x${string}`;
}

export async function submitOpening(
  account: `0x${string}`,
  debateId: string,
  side: DebateSide,
  submissionId: string,
  argumentText: string,
  evidence: EvidenceItem[]
): Promise<`0x${string}`> {
  const client = getWriteClient(account);
  const contentJson = JSON.stringify({
    submission_id: submissionId,
    debate_id: debateId,
    side,
    round: 'opening' as DebateRound,
    argument_text: argumentText,
    evidence,
    submitted_by: account,
    submitted_at: Date.now(),
    word_count: argumentText.split(/\s+/).filter(Boolean).length,
  });

  const hash = await client.writeContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    functionName: 'submit_opening',
    args: [debateId, side, submissionId, contentJson],
    value: 0n,
  });
  return hash as `0x${string}`;
}

export async function submitRebuttal(
  account: `0x${string}`,
  debateId: string,
  side: DebateSide,
  submissionId: string,
  argumentText: string,
  evidence: EvidenceItem[]
): Promise<`0x${string}`> {
  const client = getWriteClient(account);
  const contentJson = JSON.stringify({
    submission_id: submissionId,
    debate_id: debateId,
    side,
    round: 'rebuttal' as DebateRound,
    argument_text: argumentText,
    evidence,
    submitted_by: account,
    submitted_at: Date.now(),
    word_count: argumentText.split(/\s+/).filter(Boolean).length,
  });

  const hash = await client.writeContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    functionName: 'submit_rebuttal',
    args: [debateId, side, submissionId, contentJson],
    value: 0n,
  });
  return hash as `0x${string}`;
}

export async function submitFinalStatement(
  account: `0x${string}`,
  debateId: string,
  side: DebateSide,
  submissionId: string,
  argumentText: string,
  evidence: EvidenceItem[]
): Promise<`0x${string}`> {
  const client = getWriteClient(account);
  const contentJson = JSON.stringify({
    submission_id: submissionId,
    debate_id: debateId,
    side,
    round: 'final' as DebateRound,
    argument_text: argumentText,
    evidence,
    submitted_by: account,
    submitted_at: Date.now(),
    word_count: argumentText.split(/\s+/).filter(Boolean).length,
  });

  const hash = await client.writeContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    functionName: 'submit_final_statement',
    args: [debateId, side, submissionId, contentJson],
    value: 0n,
  });
  return hash as `0x${string}`;
}

export async function judgeDebate(
  account: `0x${string}`,
  debateId: string
): Promise<`0x${string}`> {
  const client = getWriteClient(account);
  const hash = await client.writeContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    functionName: 'judge_debate',
    args: [debateId],
    value: 0n,
  });
  return hash as `0x${string}`;
}

export async function disputeVerdict(
  account: `0x${string}`,
  debateId: string,
  disputeId: string,
  reason: string
): Promise<`0x${string}`> {
  const client = getWriteClient(account);
  const disputeJson = JSON.stringify({
    dispute_id: disputeId,
    debate_id: debateId,
    challenger: account,
    reason,
    created_at: Date.now(),
  });
  const hash = await client.writeContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    functionName: 'dispute_verdict',
    args: [debateId, disputeId, disputeJson],
    value: 0n,
  });
  return hash as `0x${string}`;
}

export async function finalizeDebate(
  account: `0x${string}`,
  debateId: string
): Promise<`0x${string}`> {
  const client = getWriteClient(account);
  const hash = await client.writeContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    functionName: 'finalize_debate',
    args: [debateId],
    value: 0n,
  });
  return hash as `0x${string}`;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function getExplorerTxUrl(txHash: string): string {
  return `${process.env.NEXT_PUBLIC_GENLAYER_EXPLORER || 'https://explorer-studio.genlayer.com'}/tx/${txHash}`;
}
