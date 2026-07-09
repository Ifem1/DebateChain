'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getVerdict, getDebate, disputeVerdict, generateId } from '@/lib/genlayer';
import { useWallet } from '@/providers/WalletProvider';
import type { Verdict, Debate } from '@/types/debate';
import { VerdictPanel } from '@/components/verdict/VerdictPanel';
import { ErrorState } from '@/components/ui/ErrorState';

export default function VerdictPage() {
  const { debateId } = useParams<{ debateId: string }>();
  const { address } = useWallet();
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [debate, setDebate] = useState<Debate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showDispute, setShowDispute] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [disputing, setDisputing] = useState(false);
  const [disputeError, setDisputeError] = useState<string | null>(null);
  const [disputeSuccess, setDisputeSuccess] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDispute = async () => {
    if (!address || !debate) return;
    const isParticipant =
      address.toLowerCase() === debate.creator.toLowerCase() ||
      address.toLowerCase() === debate.opponent.toLowerCase();
    if (!isParticipant) { setDisputeError('Only participants can dispute a verdict.'); return; }
    if (!disputeReason.trim()) { setDisputeError('Please provide a reason for the dispute.'); return; }

    setDisputing(true);
    setDisputeError(null);
    try {
      await disputeVerdict(address, debateId, generateId('disp'), disputeReason.trim());
      setDisputeSuccess(true);
      setShowDispute(false);
    } catch (err: unknown) {
      setDisputeError(err instanceof Error ? err.message : 'Failed to dispute verdict.');
    } finally {
      setDisputing(false);
    }
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Always read from GenLayer — never from local state or Supabase cache for display
      const [v, d] = await Promise.all([
        getVerdict(debateId),
        getDebate(debateId),
      ]);
      if (!v) { setError('No verdict found. The debate may not have been judged yet.'); return; }
      if (!d) { setError('Debate not found.'); return; }
      setVerdict(v);
      setDebate(d);
    } catch {
      setError('Failed to load verdict from GenLayer.');
    } finally {
      setLoading(false);
    }
  }, [debateId]);

  useEffect(() => {
    void Promise.resolve().then(() => load());
  }, [load]);

  if (loading) {
    return (
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {[200, 300, 160, 200].map((h, i) => (
            <div key={i} className="shimmer card" style={{ height: h }} />
          ))}
        </div>
      </div>
    );
  }

  if (error || !verdict || !debate) {
    return (
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '48px 24px' }}>
        <ErrorState message={error || 'Verdict not available.'} onRetry={load} />
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Link
            href={`/debates/${debateId}`}
            style={{ color: '#3b82f6', textDecoration: 'none', fontSize: 14 }}
          >
            ← Back to Debate Room
          </Link>
        </div>
      </div>
    );
  }

  const isParticipant = address && debate && (
    address.toLowerCase() === debate.creator.toLowerCase() ||
    address.toLowerCase() === debate.opponent.toLowerCase()
  );

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '48px 24px' }}>
      {/* Breadcrumb */}
      <div style={{ marginBottom: 24, fontSize: 13, color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <Link href="/debates" style={{ color: '#3b82f6', textDecoration: 'none' }}>Debates</Link>
          {' → '}
          <Link href={`/debates/${debateId}`} style={{ color: '#3b82f6', textDecoration: 'none' }}>
            {debateId}
          </Link>
          {' → '}
          <span style={{ color: '#94a3b8' }}>Verdict</span>
        </div>
        <button
          onClick={handleCopyLink}
          style={{
            padding: '6px 14px',
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 600,
            color: copied ? '#22c55e' : '#22D3EE',
            background: copied ? 'rgba(34,197,94,0.08)' : 'rgba(34,211,238,0.08)',
            border: `1px solid ${copied ? 'rgba(34,197,94,0.25)' : 'rgba(34,211,238,0.25)'}`,
            cursor: 'pointer',
          }}
        >
          {copied ? '✓ Link Copied!' : '🔗 Share Verdict'}
        </button>
      </div>

      {/* Debate topic */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#64748b', marginBottom: 8 }}>
          On-Chain Verdict
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#fff', margin: 0, lineHeight: 1.3, letterSpacing: '-0.02em' }}>
          {debate.topic}
        </h1>
      </div>

      <VerdictPanel
        verdict={verdict}
        sideALabel={debate.side_a_label}
        sideBLabel={debate.side_b_label}
        debateId={debateId}
      />

      {/* Dispute verdict — participants only, JUDGED status */}
      {isParticipant && debate.status === 'JUDGED' && !disputeSuccess && (
        <div className="card" style={{ padding: 20, marginTop: 24, borderColor: 'rgba(225,29,72,0.2)' }}>
          {!showDispute ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0' }}>Dispute This Verdict</div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                  If you believe the AI judgement was unfair, submit a dispute on-chain.
                </div>
              </div>
              <button
                onClick={() => setShowDispute(true)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#f43f5e',
                  background: 'rgba(225,29,72,0.08)',
                  border: '1px solid rgba(225,29,72,0.3)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                Dispute →
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#f43f5e' }}>Dispute Verdict</div>
              <textarea
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                placeholder="Explain why you believe the AI judgement was incorrect or unfair…"
                rows={4}
                style={{
                  padding: '10px 12px',
                  borderRadius: 8,
                  fontSize: 13,
                  color: '#e2e8f0',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  resize: 'vertical',
                  outline: 'none',
                  fontFamily: 'inherit',
                }}
              />
              {disputeError && (
                <div style={{ fontSize: 12, color: '#f43f5e', padding: '6px 10px', borderRadius: 6, background: 'rgba(225,29,72,0.08)', border: '1px solid rgba(225,29,72,0.2)' }}>
                  {disputeError}
                </div>
              )}
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={handleDispute}
                  disabled={disputing || !disputeReason.trim()}
                  style={{
                    padding: '9px 20px',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 700,
                    color: '#fff',
                    background: disputing ? 'rgba(225,29,72,0.3)' : 'rgba(225,29,72,0.2)',
                    border: '1px solid rgba(225,29,72,0.4)',
                    cursor: disputing || !disputeReason.trim() ? 'not-allowed' : 'pointer',
                  }}
                >
                  {disputing ? 'Submitting…' : 'Submit Dispute On-Chain'}
                </button>
                <button
                  onClick={() => { setShowDispute(false); setDisputeError(null); }}
                  style={{
                    padding: '9px 16px',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#64748b',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {disputeSuccess && (
        <div className="card" style={{ padding: 16, marginTop: 24, borderColor: 'rgba(245,197,66,0.25)', display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ fontSize: 20 }}>✓</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#F5C542' }}>Dispute Submitted</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Your dispute has been recorded on-chain.</div>
          </div>
        </div>
      )}

      <div style={{ marginTop: 32, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <Link href={`/debates/${debateId}`} style={{ color: '#64748b', textDecoration: 'none', fontSize: 14 }}>
          ← Back to Debate Room
        </Link>
        <Link href="/debates" style={{ color: '#3b82f6', textDecoration: 'none', fontSize: 14 }}>
          Browse All Debates →
        </Link>
      </div>
    </div>
  );
}
