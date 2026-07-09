'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  getDebate,
  getDebateSubmissions,
  submitOpening,
  submitRebuttal,
  submitFinalStatement,
  generateId,
} from '@/lib/genlayer';
import { useWallet } from '@/providers/WalletProvider';
import type { Debate, Submission, DebateRound, EvidenceItem } from '@/types/debate';
import { ArgumentComposer } from '@/components/debate/ArgumentComposer';
import { DebateStatusBadge } from '@/components/ui/DebateStatusBadge';
import { SideBadge } from '@/components/ui/SideBadge';
import { ErrorState } from '@/components/ui/ErrorState';

function getCurrentRound(debate: Debate, submissions: Submission[], mySide: 'SIDE_A' | 'SIDE_B'): DebateRound | null {
  const hasRound = (round: DebateRound, side: 'SIDE_A' | 'SIDE_B') =>
    submissions.some((s) => s.round === round && s.side === side);

  for (const round of debate.rounds_required) {
    if (!hasRound(round, mySide)) return round;
  }
  return null;
}

export default function ArguePage() {
  const { debateId } = useParams<{ debateId: string }>();
  const router = useRouter();
  const { address, isConnected, connect } = useWallet();

  const [debate, setDebate] = useState<Debate | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [d, subs] = await Promise.all([
        getDebate(debateId),
        getDebateSubmissions(debateId),
      ]);
      if (!d) { setError('Debate not found.'); return; }
      setDebate(d);
      setSubmissions(subs);
    } catch {
      setError('Failed to load from GenLayer.');
    } finally {
      setLoading(false);
    }
  }, [debateId]);

  useEffect(() => {
    void Promise.resolve().then(() => load());
  }, [load]);

  if (!isConnected) {
    return (
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
        <h2 style={{ color: '#e2e8f0', marginBottom: 16 }}>Connect Your Wallet</h2>
        <button
          onClick={connect}
          style={{
            padding: '12px 32px', borderRadius: 10, fontSize: 15, fontWeight: 700,
            color: '#fff', background: 'linear-gradient(135deg, #2563EB, #1d4ed8)',
            border: 'none', cursor: 'pointer',
          }}
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px' }}>
        <div className="shimmer card" style={{ height: 300 }} />
      </div>
    );
  }

  if (error || !debate) {
    return (
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px' }}>
        <ErrorState message={error || 'Debate not found.'} onRetry={load} />
      </div>
    );
  }

  const isCreator = address?.toLowerCase() === debate.creator.toLowerCase();
  const isOpponent = address?.toLowerCase() === debate.opponent.toLowerCase();
  const isParticipant = isCreator || isOpponent;

  if (!isParticipant) {
    return (
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
        <h2 style={{ color: '#E11D48', marginBottom: 8 }}>Not a Participant</h2>
        <p style={{ color: '#64748b' }}>Only the creator and opponent can submit arguments.</p>
        <Link
          href={`/debates/${debateId}`}
          style={{ color: '#3b82f6', textDecoration: 'none', fontSize: 14 }}
        >
          ← Back to debate
        </Link>
      </div>
    );
  }

  const mySide = isCreator ? 'SIDE_A' : 'SIDE_B';
  const myLabel = mySide === 'SIDE_A' ? debate.side_a_label : debate.side_b_label;
  const currentRound = getCurrentRound(debate, submissions, mySide);

  if (!currentRound) {
    return (
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>✓</div>
        <h2 style={{ color: '#22c55e', marginBottom: 8 }}>All Rounds Submitted</h2>
        <p style={{ color: '#64748b', marginBottom: 24 }}>You have submitted all your arguments.</p>
        <Link
          href={`/debates/${debateId}`}
          style={{
            padding: '10px 24px',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            color: '#fff',
            background: 'rgba(37,99,235,0.2)',
            border: '1px solid rgba(37,99,235,0.4)',
            textDecoration: 'none',
          }}
        >
          ← Back to Debate Room
        </Link>
      </div>
    );
  }

  const handleSubmit = async (text: string, evidence: EvidenceItem[]) => {
    if (!address) return;
    const subId = generateId('sub');
    if (currentRound === 'opening') {
      await submitOpening(address, debateId, mySide, subId, text, evidence);
    } else if (currentRound === 'rebuttal') {
      await submitRebuttal(address, debateId, mySide, subId, text, evidence);
    } else {
      await submitFinalStatement(address, debateId, mySide, subId, text, evidence);
    }
    // Redirect immediately — the debate room auto-polls and will pick up the new submission
    // Pass ?submitted=true so the debate room shows a "tx pending" notice
    router.push(`/debates/${debateId}?submitted=true`);
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Link
          href={`/debates/${debateId}`}
          style={{ fontSize: 13, color: '#64748b', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 16 }}
        >
          ← Back to Debate
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <DebateStatusBadge status={debate.status} />
          <SideBadge side={mySide} label={myLabel || mySide} size="md" />
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#fff', margin: '0 0 8px', lineHeight: 1.3 }}>
          {debate.topic}
        </h1>
      </div>

      {/* Opponent's latest argument for context */}
      {currentRound !== 'opening' && (() => {
        const opponentSide = mySide === 'SIDE_A' ? 'SIDE_B' : 'SIDE_A';
        const prevRound = currentRound === 'rebuttal' ? 'opening' : 'rebuttal';
        const oppSub = submissions.find((s) => s.side === opponentSide && s.round === prevRound);
        if (!oppSub) return null;
        return (
          <div
            className="card"
            style={{
              padding: 20,
              marginBottom: 24,
              borderColor: opponentSide === 'SIDE_A' ? 'rgba(34,211,238,0.15)' : 'rgba(245,197,66,0.15)',
            }}
          >
            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600 }}>
              Opponent&apos;s {prevRound} argument — address carefully
            </div>
            <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.7, margin: 0 }}>
              {oppSub.argument_text}
            </p>
          </div>
        );
      })()}

      <ArgumentComposer
        side={mySide}
        sideLabel={myLabel || mySide}
        round={currentRound}
        wordLimit={debate.word_limit}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
