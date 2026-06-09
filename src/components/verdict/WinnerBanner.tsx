import type { WinnerType } from '@/types/debate';

interface Props {
  winner: WinnerType;
  sideALabel: string;
  sideBLabel: string;
  confidence: number;
}

export function WinnerBanner({ winner, sideALabel, sideBLabel, confidence }: Props) {
  const isA = winner === 'SIDE_A';
  const isB = winner === 'SIDE_B';
  const isDraw = winner === 'DRAW' || winner === 'AMBIGUOUS';
  const isInsufficient = winner === 'INSUFFICIENT_ARGUMENTS';

  const winnerLabel = isA ? sideALabel : isB ? sideBLabel : isDraw ? 'DRAW' : 'Insufficient Arguments';
  const accentColor = isA ? '#22D3EE' : isB ? '#F5C542' : isDraw ? '#94a3b8' : '#E11D48';

  return (
    <div
      className="reveal"
      style={{
        padding: '32px 40px',
        borderRadius: 16,
        background: `linear-gradient(135deg, rgba(9,11,45,0.95), rgba(15,18,69,0.95))`,
        border: `2px solid ${accentColor}55`,
        boxShadow: `0 0 40px ${accentColor}22`,
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: '#F5C542',
          marginBottom: 4,
        }}
      >
        ⚖️ GenLayer AI Verdict
      </div>

      <div
        style={{
          fontSize: 13,
          color: '#64748b',
          fontWeight: 500,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
        }}
      >
        {isDraw ? '' : isInsufficient ? '' : 'Winner'}
      </div>

      <div
        style={{
          fontSize: 40,
          fontWeight: 800,
          color: accentColor,
          letterSpacing: '-0.02em',
          lineHeight: 1.1,
          textShadow: `0 0 24px ${accentColor}66`,
        }}
      >
        {winnerLabel}
      </div>

      {!isDraw && !isInsufficient && (
        <div
          style={{
            padding: '4px 16px',
            borderRadius: 9999,
            fontSize: 12,
            fontWeight: 600,
            color: accentColor,
            background: `${accentColor}18`,
            border: `1px solid ${accentColor}40`,
          }}
        >
          Confidence: {Math.round(confidence * 100)}%
        </div>
      )}

      {isDraw && (
        <p style={{ fontSize: 14, color: '#94a3b8', margin: 0 }}>
          Both sides argued equivalently. No clear winner determined.
        </p>
      )}
      {isInsufficient && (
        <p style={{ fontSize: 14, color: '#E11D48', margin: 0 }}>
          Arguments were insufficient for a meaningful verdict.
        </p>
      )}

      <div
        style={{
          marginTop: 8,
          padding: '6px 16px',
          borderRadius: 8,
          fontSize: 11,
          color: '#475569',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
          letterSpacing: '0.05em',
        }}
      >
        ✓ Stored On-Chain · GenLayer Studionet
      </div>
    </div>
  );
}
