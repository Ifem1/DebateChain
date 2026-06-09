'use client';

import { useState, useEffect, useRef } from 'react';
import { useWallet } from '@/providers/WalletProvider';
import { judgeDebate, getDebate } from '@/lib/genlayer';

interface Props {
  debateId: string;
  onJudged: () => void;
}

type Phase =
  | 'idle'
  | 'submitting'   // waiting for writeContract to return tx hash
  | 'polling'      // tx submitted — polling for JUDGED status
  | 'error';

const POLL_INTERVAL_MS = 5000;
const MAX_POLL_SECONDS = 300; // stop polling after 5 minutes, show manual check

export function JudgeDebateButton({ debateId, onJudged }: Props) {
  const { address, isConnected } = useWallet();
  const [phase, setPhase] = useState<Phase>('idle');
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedAt = useRef<number>(0);

  const stopTimers = () => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  };

  // Clean up on unmount
  useEffect(() => () => stopTimers(), []);

  const startPolling = () => {
    setPhase('polling');
    startedAt.current = Date.now();

    // Elapsed time ticker
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt.current) / 1000));
    }, 1000);

    // Poll GenLayer every 5s for JUDGED status
    pollRef.current = setInterval(async () => {
      const secondsElapsed = Math.floor((Date.now() - startedAt.current) / 1000);
      if (secondsElapsed >= MAX_POLL_SECONDS) {
        stopTimers();
        setPhase('error');
        setError(`Judgement is taking longer than ${MAX_POLL_SECONDS}s. The transaction may still be processing — check the GenLayer explorer, then refresh this page.`);
        return;
      }
      try {
        const debate = await getDebate(debateId);
        if (debate?.status === 'JUDGED' || debate?.status === 'FINALIZED') {
          stopTimers();
          onJudged();
        }
      } catch {
        // network blip — keep polling
      }
    }, POLL_INTERVAL_MS);
  };

  const handleJudge = async () => {
    if (!address) return;
    setError(null);
    setPhase('submitting');

    try {
      // Fire the tx — for LLM transactions GenLayer may block here for up to 180s.
      // We race it against a 20s timeout: if writeContract returns first we start
      // polling; if the timeout fires first we also start polling (the tx is still
      // on its way through GenLayer validators).
      await Promise.race([
        judgeDebate(address, debateId),
        new Promise<void>((_, reject) =>
          setTimeout(() => reject(new Error('__timeout__')), 20000)
        ),
      ]);
      // writeContract returned — tx submitted successfully
      startPolling();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg === '__timeout__') {
        // Tx is still in flight inside GenLayer — start polling anyway
        startPolling();
      } else {
        setPhase('error');
        setError(msg || 'Failed to submit judgement transaction.');
      }
    }
  };

  // ─── Polling / loading state ───────────────────────────────────────────────
  if (phase === 'submitting' || phase === 'polling') {
    return (
      <div
        className="card"
        style={{
          padding: 32,
          borderColor: 'rgba(245,197,66,0.4)',
          background: 'rgba(245,197,66,0.03)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 20,
          textAlign: 'center',
        }}
      >
        {/* Spinning scales */}
        <div style={{ fontSize: 48, animation: 'spin 3s linear infinite' }}>⚖️</div>

        <div>
          <h3 style={{ fontSize: 20, fontWeight: 700, color: '#F5C542', margin: '0 0 8px' }}>
            {phase === 'submitting' ? 'Submitting to GenLayer…' : 'AI Judges Are Deliberating'}
          </h3>
          <p style={{ fontSize: 14, color: '#94a3b8', margin: 0, maxWidth: 400 }}>
            {phase === 'submitting'
              ? 'Sending the judge_debate transaction to GenLayer validators…'
              : 'Multiple validators are running the AI prompt independently and reaching consensus. This typically takes 60–180 seconds.'}
          </p>
        </div>

        {phase === 'polling' && (
          <>
            {/* Progress bar */}
            <div style={{ width: '100%', maxWidth: 360 }}>
              <div
                style={{
                  height: 4,
                  borderRadius: 2,
                  background: 'rgba(245,197,66,0.15)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    borderRadius: 2,
                    background: 'linear-gradient(90deg, #F5C542, #d4a017)',
                    width: `${Math.min((elapsed / MAX_POLL_SECONDS) * 100, 100)}%`,
                    transition: 'width 1s linear',
                  }}
                />
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: 6,
                  fontSize: 12,
                  color: '#475569',
                }}
              >
                <span>{elapsed}s elapsed</span>
                <span>Checking every 5s…</span>
              </div>
            </div>

            {/* Stage indicators */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
              {[
                { label: 'Tx submitted', done: elapsed >= 0 },
                { label: 'Validators proposing', done: elapsed >= 15 },
                { label: 'Committing', done: elapsed >= 45 },
                { label: 'Revealing', done: elapsed >= 90 },
                { label: 'Finalizing', done: elapsed >= 130 },
              ].map(({ label, done }) => (
                <div
                  key={label}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 600,
                    color: done ? '#F5C542' : '#475569',
                    background: done ? 'rgba(245,197,66,0.1)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${done ? 'rgba(245,197,66,0.3)' : 'rgba(255,255,255,0.07)'}`,
                    transition: 'all 0.5s',
                  }}
                >
                  {done ? '✓ ' : ''}{label}
                </div>
              ))}
            </div>

            <p style={{ fontSize: 11, color: '#475569', margin: 0 }}>
              Do not close this tab — judgement will complete automatically
            </p>
          </>
        )}

        <style>{`
          @keyframes spin {
            from { transform: rotate(-8deg); }
            50%  { transform: rotate(8deg); }
            to   { transform: rotate(-8deg); }
          }
        `}</style>
      </div>
    );
  }

  // ─── Error state ───────────────────────────────────────────────────────────
  if (phase === 'error') {
    return (
      <div
        className="card"
        style={{
          padding: 24,
          borderColor: 'rgba(225,29,72,0.25)',
          background: 'rgba(225,29,72,0.03)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 14,
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 32 }}>⚠️</div>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f43f5e', margin: '0 0 6px' }}>
            Judgement Timed Out
          </h3>
          <p style={{ fontSize: 13, color: '#94a3b8', margin: 0, maxWidth: 420 }}>{error}</p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            onClick={() => { setPhase('idle'); setError(null); setElapsed(0); }}
            style={{
              padding: '9px 20px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              color: '#e2e8f0',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              cursor: 'pointer',
            }}
          >
            Try Again
          </button>
          <button
            onClick={() => { setError(null); startPolling(); }}
            style={{
              padding: '9px 20px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              color: '#22D3EE',
              background: 'rgba(34,211,238,0.08)',
              border: '1px solid rgba(34,211,238,0.25)',
              cursor: 'pointer',
            }}
          >
            Keep Polling
          </button>
        </div>
      </div>
    );
  }

  // ─── Idle state ────────────────────────────────────────────────────────────
  return (
    <div
      className="card"
      style={{
        padding: 28,
        borderColor: 'rgba(245,197,66,0.3)',
        background: 'rgba(245,197,66,0.03)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 16,
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: 40 }}>⚖️</div>
      <div>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: '#F5C542', margin: '0 0 8px' }}>
          Debate Ready for Judgement
        </h3>
        <p style={{ fontSize: 14, color: '#94a3b8', margin: 0 }}>
          All rounds complete. GenLayer AI validators will evaluate argument quality, detect fallacies, assess evidence, and determine a winner via consensus.
        </p>
      </div>

      <div
        style={{
          padding: '10px 16px',
          borderRadius: 8,
          background: 'rgba(34,211,238,0.06)',
          border: '1px solid rgba(34,211,238,0.15)',
          fontSize: 12,
          color: '#94a3b8',
          textAlign: 'left',
          width: '100%',
          maxWidth: 480,
        }}
      >
        <strong style={{ color: '#22D3EE' }}>Expect 60–180 seconds</strong> — multiple validators
        run the AI prompt independently and must reach consensus before the verdict is stored on-chain.
        The UI will update automatically when done.
      </div>

      <button
        onClick={handleJudge}
        disabled={!isConnected}
        style={{
          padding: '14px 40px',
          borderRadius: 10,
          fontSize: 16,
          fontWeight: 800,
          color: '#090B2D',
          background: !isConnected ? 'rgba(245,197,66,0.3)' : 'linear-gradient(135deg, #F5C542, #d4a017)',
          border: 'none',
          cursor: !isConnected ? 'not-allowed' : 'pointer',
          letterSpacing: '0.02em',
          boxShadow: isConnected ? '0 0 24px rgba(245,197,66,0.3)' : 'none',
        }}
      >
        Judge This Debate
      </button>
      <p style={{ fontSize: 11, color: '#475569', margin: 0 }}>
        Calls judge_debate() on GenLayer — not a token transfer
      </p>
    </div>
  );
}
