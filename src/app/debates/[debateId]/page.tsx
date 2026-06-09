'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  getDebate,
  getDebateSubmissions,
  finalizeDebate,
} from '@/lib/genlayer';
import { useWallet } from '@/providers/WalletProvider';
import type { Debate, Submission } from '@/types/debate';
import { DebateStatusBadge } from '@/components/ui/DebateStatusBadge';
import { SideBadge } from '@/components/ui/SideBadge';
import { RoundIndicator } from '@/components/debate/RoundIndicator';
import { DebateTimeline } from '@/components/debate/DebateTimeline';
import { JoinDebatePanel } from '@/components/debate/JoinDebatePanel';
import { JudgeDebateButton } from '@/components/debate/JudgeDebateButton';
import { ErrorState } from '@/components/ui/ErrorState';

// Active statuses where we want to auto-poll for updates
const ACTIVE_STATUSES = new Set([
  'CREATED',
  'ACCEPTED',
  'OPENING_SUBMITTED',
  'REBUTTAL_SUBMITTED',
  'READY_FOR_JUDGEMENT',
]);

// What status means for the user in plain language
function getStatusMessage(
  debate: Debate,
  isCreator: boolean,
  isOpponent: boolean,
  submissionCount: number
): { text: string; color: string } {
  const { status } = debate;
  const isParticipant = isCreator || isOpponent;

  if (status === 'CREATED') {
    if (isCreator) return { text: 'Waiting for an opponent to join', color: '#3b82f6' };
    return { text: 'Join this debate to take the opposing side', color: '#3b82f6' };
  }
  if (status === 'ACCEPTED') {
    if (!isParticipant) return { text: 'Debate is active — both sides need to submit their opening', color: '#22D3EE' };
    return { text: 'Both sides need to submit their opening argument', color: '#22D3EE' };
  }
  if (status === 'OPENING_SUBMITTED') {
    const oneSubmitted = submissionCount === 1;
    if (!isParticipant) return { text: oneSubmitted ? 'One opening submitted — waiting for the other side' : 'Both openings in — waiting for rebuttals', color: '#22D3EE' };
    if (isCreator && oneSubmitted) return { text: 'Your opening is in — waiting for opponent\'s opening', color: '#22D3EE' };
    if (isOpponent && oneSubmitted) return { text: 'Submit your opening argument', color: '#22D3EE' };
    return { text: 'Both openings in — submit your rebuttal', color: '#22D3EE' };
  }
  if (status === 'REBUTTAL_SUBMITTED') {
    const rebuttalCount = submissionCount - 2;
    if (rebuttalCount < 2) return { text: 'Submit your rebuttal', color: '#F5C542' };
    return { text: 'Both rebuttals in — ready for judgement', color: '#F5C542' };
  }
  if (status === 'READY_FOR_JUDGEMENT') {
    return { text: 'All rounds complete — either participant can trigger AI judgement', color: '#F5C542' };
  }
  if (status === 'JUDGED') {
    return { text: 'AI has judged this debate — view the verdict or finalize it on-chain', color: '#22c55e' };
  }
  if (status === 'FINALIZED') {
    return { text: 'Debate finalized on-chain', color: '#22c55e' };
  }
  return { text: status, color: '#64748b' };
}

export default function DebateRoomPage() {
  const { debateId } = useParams<{ debateId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { address } = useWallet();
  const [txPending, setTxPending] = useState(searchParams.get('submitted') === 'true');

  const [debate, setDebate] = useState<Debate | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [finalizing, setFinalizing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setError(null);
    try {
      const [d, subs] = await Promise.all([
        getDebate(debateId),
        getDebateSubmissions(debateId),
      ]);
      if (!d) { setError('Debate not found on GenLayer.'); return; }
      setDebate(d);
      setSubmissions(subs);
      setLastUpdated(new Date());
    } catch {
      if (!silent) setError('Failed to load debate from GenLayer.');
    } finally {
      if (!silent) setLoading(false);
      else setRefreshing(false);
    }
  }, [debateId]);

  // Initial load
  useEffect(() => { load(); }, [load]);

  // Auto-dismiss tx pending banner after 90s
  useEffect(() => {
    if (!txPending) return;
    const t = setTimeout(() => setTxPending(false), 90000);
    return () => clearTimeout(t);
  }, [txPending]);

  // Auto-poll while debate is active
  useEffect(() => {
    if (!debate) return;
    if (!ACTIVE_STATUSES.has(debate.status)) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => load(true), 8000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [debate?.status, load]);

  const isCreator = address?.toLowerCase() === debate?.creator.toLowerCase();
  const isOpponent = address?.toLowerCase() === debate?.opponent.toLowerCase();
  const isParticipant = isCreator || isOpponent;

  const mySide = isCreator ? 'SIDE_A' : isOpponent ? 'SIDE_B' : null;

  const canSubmit =
    isParticipant &&
    debate &&
    ['ACCEPTED', 'OPENING_SUBMITTED', 'REBUTTAL_SUBMITTED'].includes(debate.status);

  // BOTH participants (and observers) can see and trigger judgement
  const canJudge = debate?.status === 'READY_FOR_JUDGEMENT';

  const canFinalize = isParticipant && debate?.status === 'JUDGED';

  const handleFinalize = async () => {
    if (!address || !debate) return;
    setFinalizing(true);
    try {
      await finalizeDebate(address, debate.debate_id);
      await load();
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setFinalizing(false);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="shimmer card" style={{ height: 120 }} />
          <div className="shimmer card" style={{ height: 60 }} />
          <div className="shimmer card" style={{ height: 300 }} />
        </div>
      </div>
    );
  }

  if (error || !debate) {
    return (
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '48px 24px' }}>
        <ErrorState message={error || 'Debate not found.'} onRetry={load} />
      </div>
    );
  }

  const statusMsg = getStatusMessage(debate, isCreator, isOpponent, submissions.length);
  const isActive = ACTIVE_STATUSES.has(debate.status);

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '48px 24px' }}>
      {/* Breadcrumb + refresh */}
      <div
        style={{
          marginBottom: 24,
          fontSize: 13,
          color: '#64748b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <div>
          <Link href="/debates" style={{ color: '#3b82f6', textDecoration: 'none' }}>Debates</Link>
          {' → '}
          <span style={{ color: '#94a3b8', fontFamily: 'monospace', fontSize: 12 }}>{debate.debate_id}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {isActive && (
            <span style={{ fontSize: 11, color: '#475569' }}>
              {refreshing ? 'Refreshing…' : lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString()}` : ''}
              {' · Auto-refreshes every 8s'}
            </span>
          )}
          <button
            onClick={() => load(true)}
            disabled={refreshing}
            style={{
              padding: '6px 14px',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 600,
              color: '#22D3EE',
              background: 'rgba(34,211,238,0.08)',
              border: '1px solid rgba(34,211,238,0.25)',
              cursor: refreshing ? 'not-allowed' : 'pointer',
              opacity: refreshing ? 0.5 : 1,
            }}
          >
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* Tx pending banner */}
      {txPending && (
        <div
          style={{
            marginBottom: 20,
            padding: '14px 20px',
            borderRadius: 10,
            background: 'rgba(34,211,238,0.06)',
            border: '1px solid rgba(34,211,238,0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span
              style={{
                display: 'inline-block',
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#22D3EE',
                animation: 'pulse 1.5s ease-in-out infinite',
              }}
            />
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#22D3EE' }}>
                Argument submitted — GenLayer is processing
              </div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                Transactions on GenLayer take 30–90 seconds to finalize. This page auto-refreshes every 8s.
              </div>
            </div>
          </div>
          <button
            onClick={() => setTxPending(false)}
            style={{
              background: 'none',
              border: 'none',
              color: '#475569',
              cursor: 'pointer',
              fontSize: 18,
              lineHeight: 1,
              padding: '0 4px',
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* Header card */}
      <div
        className="card"
        style={{
          padding: '28px 32px',
          marginBottom: 24,
          borderColor: 'rgba(37,99,235,0.2)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 20,
            flexWrap: 'wrap',
            marginBottom: 20,
          }}
        >
          <div style={{ flex: 1 }}>
            <DebateStatusBadge status={debate.status} />
            <h1
              style={{
                fontSize: 26,
                fontWeight: 800,
                color: '#fff',
                margin: '12px 0 8px',
                lineHeight: 1.3,
                letterSpacing: '-0.02em',
              }}
            >
              {debate.topic}
            </h1>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <SideBadge side="SIDE_A" label={debate.side_a_label} size="md" />
              <span style={{ fontSize: 14, color: '#475569', fontWeight: 700 }}>vs</span>
              <SideBadge side="SIDE_B" label={debate.side_b_label} size="md" />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-end' }}>
            {/* Share / invite link */}
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href).then(() => {
                  setLinkCopied(true);
                  setTimeout(() => setLinkCopied(false), 2000);
                });
              }}
              style={{
                padding: '7px 14px',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
                color: linkCopied ? '#22c55e' : '#64748b',
                background: linkCopied ? 'rgba(34,197,94,0.08)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${linkCopied ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.1)'}`,
                cursor: 'pointer',
              }}
            >
              {linkCopied ? '✓ Copied!' : '🔗 Share'}
            </button>
            {(debate.status === 'JUDGED' || debate.status === 'FINALIZED') && (
              <Link
                href={`/debates/${debateId}/verdict`}
                style={{
                  padding: '10px 20px',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 700,
                  color: '#090B2D',
                  background: 'linear-gradient(135deg, #F5C542, #d4a017)',
                  textDecoration: 'none',
                  boxShadow: '0 0 16px rgba(245,197,66,0.3)',
                }}
              >
                ⚖️ View Verdict
              </Link>
            )}
            {canSubmit && mySide && (
              <Link
                href={`/debates/${debateId}/argue`}
                style={{
                  padding: '10px 20px',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 700,
                  color: '#fff',
                  background: 'linear-gradient(135deg, #2563EB, #1d4ed8)',
                  textDecoration: 'none',
                  boxShadow: '0 0 12px rgba(37,99,235,0.3)',
                }}
              >
                Submit Argument →
              </Link>
            )}
          </div>
        </div>

        {/* Status message banner */}
        <div
          style={{
            padding: '12px 16px',
            borderRadius: 8,
            background: `${statusMsg.color}15`,
            border: `1px solid ${statusMsg.color}30`,
            fontSize: 13,
            color: statusMsg.color,
            fontWeight: 500,
            marginBottom: 16,
          }}
        >
          {isActive && (
            <span
              style={{
                display: 'inline-block',
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: statusMsg.color,
                marginRight: 8,
                verticalAlign: 'middle',
                animation: 'pulse 2s ease-in-out infinite',
              }}
            />
          )}
          {statusMsg.text}
        </div>

        {/* Round indicator */}
        <RoundIndicator status={debate.status} />

        {/* My role badge */}
        {isParticipant && mySide && (
          <div
            style={{
              marginTop: 16,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 12px',
              borderRadius: 6,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
              fontSize: 12,
              color: '#94a3b8',
            }}
          >
            You are playing as{' '}
            <SideBadge
              side={mySide}
              label={mySide === 'SIDE_A' ? debate.side_a_label : debate.side_b_label}
              size="sm"
            />
          </div>
        )}

        {/* Meta row */}
        <div
          style={{
            display: 'flex',
            gap: 20,
            marginTop: 16,
            paddingTop: 16,
            borderTop: '1px solid rgba(255,255,255,0.06)',
            fontSize: 13,
            color: '#64748b',
            flexWrap: 'wrap',
          }}
        >
          <span>Rounds: {debate.rounds_required.join(', ')}</span>
          <span>Word limit: {debate.word_limit}</span>
          <span>Evidence: {debate.evidence_required ? 'Required' : 'Optional'}</span>
          <span>Submissions: {submissions.length}</span>
          {debate.finalized && (
            <span style={{ color: '#22c55e', fontWeight: 600 }}>✓ Finalized On-Chain</span>
          )}
        </div>
      </div>

      {/* Join panel — only for non-participants when status is CREATED */}
      {debate.status === 'CREATED' && !isCreator && (
        <div style={{ marginBottom: 24 }}>
          <JoinDebatePanel debate={debate} onJoined={load} />
        </div>
      )}

      {/* Judge button — visible to BOTH participants (and anyone) when ready */}
      {canJudge && (
        <div style={{ marginBottom: 24 }}>
          <JudgeDebateButton
            debateId={debateId}
            onJudged={() => { load(); router.push(`/debates/${debateId}/verdict`); }}
          />
        </div>
      )}

      {/* Finalize button */}
      {canFinalize && (
        <div
          className="card"
          style={{
            padding: 20,
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            borderColor: 'rgba(34,197,94,0.25)',
          }}
        >
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#22c55e' }}>Verdict Ready to Finalize</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
              Finalizing locks the result permanently on-chain. Either participant can do this.
            </div>
          </div>
          <button
            onClick={handleFinalize}
            disabled={finalizing}
            style={{
              padding: '10px 24px',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 700,
              color: '#fff',
              background: finalizing ? 'rgba(34,197,94,0.3)' : 'rgba(34,197,94,0.2)',
              border: '1px solid rgba(34,197,94,0.4)',
              cursor: finalizing ? 'not-allowed' : 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {finalizing ? 'Finalizing…' : 'Finalize Debate'}
          </button>
        </div>
      )}

      {/* Timeline */}
      <div className="card" style={{ padding: '28px 32px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 24,
          }}
        >
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#e2e8f0', margin: 0 }}>
            Debate Arguments
          </h2>
          <span style={{ fontSize: 13, color: '#475569' }}>
            {submissions.length} submission{submissions.length !== 1 ? 's' : ''}
          </span>
        </div>
        {submissions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#475569', fontSize: 14 }}>
            No arguments submitted yet.
            {canSubmit && (
              <div style={{ marginTop: 12 }}>
                <Link
                  href={`/debates/${debateId}/argue`}
                  style={{
                    color: '#2563EB',
                    textDecoration: 'none',
                    fontWeight: 600,
                  }}
                >
                  Submit the first argument →
                </Link>
              </div>
            )}
          </div>
        ) : (
          <DebateTimeline
            submissions={submissions}
            sideALabel={debate.side_a_label}
            sideBLabel={debate.side_b_label}
            roundsRequired={debate.rounds_required}
            debateStatus={debate.status}
          />
        )}
      </div>

      {/* Debate rules */}
      {debate.rules_json && (
        <div
          className="card"
          style={{ padding: '20px 24px', marginTop: 16 }}
        >
          <h3
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: '#475569',
              margin: '0 0 8px',
              textTransform: 'uppercase',
              letterSpacing: '0.07em',
            }}
          >
            Debate Rules
          </h3>
          <p style={{ fontSize: 14, color: '#94a3b8', margin: 0, lineHeight: 1.6 }}>
            {debate.rules_json}
          </p>
        </div>
      )}

      {/* Pulse animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
