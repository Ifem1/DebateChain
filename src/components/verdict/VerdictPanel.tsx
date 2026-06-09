import type { Verdict } from '@/types/debate';
import { WinnerBanner } from './WinnerBanner';
import { ScoreBreakdown } from './ScoreBreakdown';
import { FallacyReport } from './FallacyReport';
import { OnChainProofCard } from './OnChainProofCard';

interface Props {
  verdict: Verdict;
  sideALabel: string;
  sideBLabel: string;
  debateId: string;
}

export function VerdictPanel({ verdict, sideALabel, sideBLabel, debateId }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Winner */}
      <WinnerBanner
        winner={verdict.winner}
        sideALabel={sideALabel}
        sideBLabel={sideBLabel}
        confidence={verdict.confidence}
      />

      {/* Scores */}
      <ScoreBreakdown verdict={verdict} sideALabel={sideALabel} sideBLabel={sideBLabel} />

      {/* Reasoning */}
      {verdict.key_reasoning && (
        <div
          className="card reveal stagger-3"
          style={{ padding: 24, borderColor: 'rgba(245,197,66,0.15)' }}
        >
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#F5C542', margin: '0 0 12px' }}>
            Judge&apos;s Reasoning
          </h3>
          <p style={{ fontSize: 14, lineHeight: 1.8, color: '#cbd5e1', margin: 0, whiteSpace: 'pre-wrap' }}>
            {verdict.key_reasoning}
          </p>
        </div>
      )}

      {/* Fallacies */}
      <FallacyReport
        fallaciesA={verdict.fallacies?.side_a ?? []}
        fallaciesB={verdict.fallacies?.side_b ?? []}
        sideALabel={sideALabel}
        sideBLabel={sideBLabel}
      />

      {/* Evidence Assessment */}
      {verdict.evidence_assessment && (
        <div
          className="card reveal stagger-4"
          style={{ padding: 24, borderColor: 'rgba(34,211,238,0.15)' }}
        >
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#22D3EE', margin: '0 0 12px' }}>
            Evidence Assessment
          </h3>
          <p style={{ fontSize: 14, lineHeight: 1.8, color: '#cbd5e1', margin: 0, whiteSpace: 'pre-wrap' }}>
            {verdict.evidence_assessment}
          </p>
        </div>
      )}

      {/* Improvement notes */}
      {(verdict.improvement_notes?.side_a?.length || verdict.improvement_notes?.side_b?.length) ? (
        <div
          className="card reveal stagger-4"
          style={{ padding: 24 }}
        >
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#e2e8f0', margin: '0 0 16px' }}>
            Improvement Notes
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {(['side_a', 'side_b'] as const).map((side) => {
              const notes = verdict.improvement_notes?.[side] ?? [];
              const label = side === 'side_a' ? sideALabel : sideBLabel;
              const color = side === 'side_a' ? '#22D3EE' : '#F5C542';
              return (
                <div key={side}>
                  <div style={{ fontSize: 12, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>
                    {label}
                  </div>
                  {notes.length === 0 ? (
                    <p style={{ fontSize: 13, color: '#475569', fontStyle: 'italic' }}>No notes.</p>
                  ) : (
                    <ul style={{ margin: 0, paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {notes.map((note, i) => (
                        <li key={i} style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.5 }}>{note}</li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* On-chain proof */}
      <OnChainProofCard debateId={debateId} verdict={verdict} />
    </div>
  );
}
