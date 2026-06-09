/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './constants';
import type { Debate, Submission, Verdict, UserReputation } from '@/types/debate';

// Supabase is cache/index only — GenLayer is the source of truth for all debate data and verdicts.

let supabaseClient: SupabaseClient<any, 'public', any> | null = null;

function getSupabase(): SupabaseClient<any, 'public', any> | null {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  if (!supabaseClient) {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return supabaseClient;
}

// ─── Write (cache after reading from GenLayer) ────────────────────────────────

export async function cacheDebate(debate: Debate): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  try {
    await (sb.from('debates_cache') as any).upsert({
      debate_id: debate.debate_id,
      topic: debate.topic,
      creator: debate.creator.toLowerCase(),
      opponent: debate.opponent ? debate.opponent.toLowerCase() : null,
      status: debate.status,
      side_a_label: debate.side_a_label,
      side_b_label: debate.side_b_label,
      debate_type: debate.debate_type,
      created_at: debate.created_at,
      debate_json: JSON.stringify(debate),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'debate_id' });
  } catch (e) {
    console.warn('cacheDebate failed (non-critical):', e);
  }
}

export async function cacheSubmission(sub: Submission): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  try {
    await (sb.from('submissions_cache') as any).upsert({
      submission_id: sub.submission_id,
      debate_id: sub.debate_id,
      side: sub.side,
      round: sub.round,
      submitted_by: sub.submitted_by.toLowerCase(),
      submission_json: JSON.stringify(sub),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'submission_id' });
  } catch (e) {
    console.warn('cacheSubmission failed (non-critical):', e);
  }
}

export async function cacheVerdict(verdict: Verdict): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  try {
    await (sb.from('verdicts_cache') as any).upsert({
      debate_id: verdict.debate_id,
      winner: verdict.winner,
      side_a_score: verdict.side_a_score,
      side_b_score: verdict.side_b_score,
      verdict_json: JSON.stringify(verdict),
      cached_at: new Date().toISOString(),
    }, { onConflict: 'debate_id' });
  } catch (e) {
    console.warn('cacheVerdict failed (non-critical):', e);
  }
}

export async function cacheProfile(rep: UserReputation): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  try {
    await (sb.from('profiles_cache') as any).upsert({
      address: rep.address.toLowerCase(),
      debates_total: rep.debates_total,
      wins: rep.wins,
      losses: rep.losses,
      draws: rep.draws,
      win_rate: rep.win_rate,
      fallacy_count: rep.fallacy_count,
      profile_json: JSON.stringify(rep),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'address' });
  } catch (e) {
    console.warn('cacheProfile failed (non-critical):', e);
  }
}

// ─── Read (cache as public index) ─────────────────────────────────────────────

export async function listDebatesCached(limit = 50, offset = 0): Promise<Debate[]> {
  const sb = getSupabase();
  if (!sb) return [];
  try {
    const { data, error } = await (sb.from('debates_cache') as any)
      .select('debate_json')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    if (error || !data) return [];
    return (data as { debate_json: string }[]).map((row) => JSON.parse(row.debate_json) as Debate);
  } catch {
    return [];
  }
}

export async function listDebatesByAddress(address: string): Promise<Debate[]> {
  const sb = getSupabase();
  if (!sb) return [];
  // Query both checksummed and lowercase since cache may contain either format
  const addrs = Array.from(new Set([address, address.toLowerCase()]));
  const filter = addrs.flatMap((a) => [`creator.eq.${a}`, `opponent.eq.${a}`]).join(',');
  try {
    const { data, error } = await (sb.from('debates_cache') as any)
      .select('debate_json')
      .or(filter)
      .order('created_at', { ascending: false });
    if (error || !data) return [];
    return (data as { debate_json: string }[]).map((row) => JSON.parse(row.debate_json) as Debate);
  } catch {
    return [];
  }
}

export async function getCachedVerdict(debateId: string): Promise<Verdict | null> {
  const sb = getSupabase();
  if (!sb) return null;
  try {
    const { data, error } = await (sb.from('verdicts_cache') as any)
      .select('verdict_json')
      .eq('debate_id', debateId)
      .single();
    if (error || !data) return null;
    return JSON.parse((data as { verdict_json: string }).verdict_json) as Verdict;
  } catch {
    return null;
  }
}

export async function getLeaderboard(limit = 50): Promise<UserReputation[]> {
  const sb = getSupabase();
  if (!sb) return [];
  try {
    const { data, error } = await (sb.from('profiles_cache') as any)
      .select('profile_json')
      .order('wins', { ascending: false })
      .limit(limit);
    if (error || !data) return [];
    return (data as { profile_json: string }[]).map((row) => JSON.parse(row.profile_json) as UserReputation);
  } catch {
    return [];
  }
}

export async function searchDebates(query: string): Promise<Debate[]> {
  const sb = getSupabase();
  if (!sb) return [];
  try {
    const { data, error } = await (sb.from('debates_cache') as any)
      .select('debate_json')
      .ilike('topic', `%${query}%`)
      .order('created_at', { ascending: false })
      .limit(20);
    if (error || !data) return [];
    return (data as { debate_json: string }[]).map((row) => JSON.parse(row.debate_json) as Debate);
  } catch {
    return [];
  }
}
