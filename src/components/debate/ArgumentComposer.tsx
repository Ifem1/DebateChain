'use client';

import { useState } from 'react';
import type { EvidenceItem, DebateSide, DebateRound } from '@/types/debate';
import { EvidenceInput } from './EvidenceInput';
import { SideBadge } from '@/components/ui/SideBadge';

interface Props {
  side: DebateSide;
  sideLabel: string;
  round: DebateRound;
  wordLimit: number;
  onSubmit: (text: string, evidence: EvidenceItem[]) => Promise<void>;
  disabled?: boolean;
}

const ROUND_LABELS: Record<DebateRound, string> = {
  opening: 'Opening Argument',
  rebuttal: 'Rebuttal',
  final: 'Final Statement',
};

const ROUND_HINTS: Record<DebateRound, string> = {
  opening: 'Present your position clearly. Support it with logic and evidence.',
  rebuttal: 'Directly address your opponent\'s strongest claims. Avoid strawman arguments.',
  final: 'Summarise your case and explain why your arguments prevailed.',
};

export function ArgumentComposer({ side, sideLabel, round, wordLimit, onSubmit, disabled }: Props) {
  const [text, setText] = useState('');
  const [evidence, setEvidence] = useState<EvidenceItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const overLimit = wordCount > wordLimit;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) { setError('Argument cannot be empty.'); return; }
    if (overLimit) { setError(`Exceeds word limit of ${wordLimit}.`); return; }
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit(text.trim(), evidence);
      setText('');
      setEvidence([]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Submission failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const isA = side === 'SIDE_A';
  const accentColor = isA ? '#22D3EE' : '#F5C542';

  return (
    <form onSubmit={handleSubmit}>
      <div
        className="card"
        style={{
          padding: 24,
          borderColor: isA ? 'rgba(34,211,238,0.2)' : 'rgba(245,197,66,0.2)',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <SideBadge side={side} label={sideLabel} size="md" />
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#e2e8f0' }}>
              {ROUND_LABELS[round]}
            </div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
              {ROUND_HINTS[round]}
            </div>
          </div>
        </div>

        {/* Textarea */}
        <div style={{ position: 'relative' }}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`Write your ${ROUND_LABELS[round].toLowerCase()} here…`}
            disabled={disabled || submitting}
            rows={10}
            style={{
              width: '100%',
              padding: '14px 16px',
              borderRadius: 10,
              fontSize: 14,
              lineHeight: 1.7,
              color: '#e2e8f0',
              background: 'rgba(255,255,255,0.03)',
              border: `1px solid ${overLimit ? '#E11D48' : 'rgba(255,255,255,0.08)'}`,
              outline: 'none',
              resize: 'vertical',
              minHeight: 200,
              fontFamily: 'inherit',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: 10,
              right: 14,
              fontSize: 12,
              color: overLimit ? '#E11D48' : '#475569',
              fontWeight: overLimit ? 600 : 400,
            }}
          >
            {wordCount} / {wordLimit} words
          </div>
        </div>

        {/* Evidence */}
        <EvidenceInput value={evidence} onChange={setEvidence} />

        {/* Fallacy warning */}
        <div
          style={{
            padding: '8px 12px',
            borderRadius: 8,
            background: 'rgba(245,197,66,0.05)',
            border: '1px solid rgba(245,197,66,0.12)',
            fontSize: 12,
            color: '#94a3b8',
          }}
        >
          ⚖️ GenLayer will evaluate argument quality, flag logical fallacies, and assess evidence details with contract-side fetches when available. Your argument is stored on-chain.
        </div>

        {error && (
          <div
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              background: 'rgba(225,29,72,0.1)',
              border: '1px solid rgba(225,29,72,0.3)',
              fontSize: 13,
              color: '#f43f5e',
            }}
          >
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={disabled || submitting || overLimit || !text.trim()}
          style={{
            padding: '12px 28px',
            borderRadius: 10,
            fontSize: 15,
            fontWeight: 700,
            color: '#fff',
            background: disabled || submitting || overLimit || !text.trim()
              ? 'rgba(37,99,235,0.3)'
              : `linear-gradient(135deg, ${accentColor === '#22D3EE' ? '#2563EB, #22D3EE' : '#d4a017, #F5C542'})`,
            border: 'none',
            cursor: disabled || submitting || overLimit || !text.trim() ? 'not-allowed' : 'pointer',
            alignSelf: 'flex-end',
            minWidth: 180,
            transition: 'opacity 0.2s',
          }}
        >
          {submitting ? 'Submitting to GenLayer…' : `Submit ${ROUND_LABELS[round]}`}
        </button>
      </div>
    </form>
  );
}
