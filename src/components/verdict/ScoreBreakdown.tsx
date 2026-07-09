import type { Verdict } from '@/types/debate';

interface Props {
  verdict: Verdict;
  sideALabel: string;
  sideBLabel: string;
}

function ScoreBar({ value, max = 100, color }: { value: number; max?: number; color: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div
      style={{
        height: 6,
        borderRadius: 9999,
        background: 'rgba(255,255,255,0.06)',
        overflow: 'hidden',
        flex: 1,
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${pct}%`,
          background: color,
          borderRadius: 9999,
          transition: 'width 1s ease',
        }}
      />
    </div>
  );
}

export function ScoreBreakdown({ verdict, sideALabel, sideBLabel }: Props) {
  const categories = [
    {
      label: 'Argument Strength',
      weight: '30%',
      a: verdict.argument_strength?.side_a ?? 0,
      b: verdict.argument_strength?.side_b ?? 0,
    },
    {
      label: 'Evidence Quality',
      weight: '25%',
      a: verdict.evidence_quality?.side_a ?? 0,
      b: verdict.evidence_quality?.side_b ?? 0,
    },
    {
      label: 'Rebuttal Quality',
      weight: '20%',
      a: verdict.rebuttal_quality?.side_a ?? 0,
      b: verdict.rebuttal_quality?.side_b ?? 0,
    },
  ];

  return (
    <div
      className="card reveal stagger-2"
      style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}
    >
      <h3 style={{ fontSize: 16, fontWeight: 700, color: '#e2e8f0', margin: 0 }}>Score Breakdown</h3>

      {/* Total scores */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          gap: 16,
          alignItems: 'center',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: '#22D3EE', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>
            {sideALabel}
          </div>
          <div style={{ fontSize: 48, fontWeight: 800, color: '#22D3EE', lineHeight: 1 }}>
            {verdict.side_a_score}
          </div>
        </div>
        <div style={{ fontSize: 18, color: '#475569', fontWeight: 700 }}>vs</div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: '#F5C542', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>
            {sideBLabel}
          </div>
          <div style={{ fontSize: 48, fontWeight: 800, color: '#F5C542', lineHeight: 1 }}>
            {verdict.side_b_score}
          </div>
        </div>
      </div>

      <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />

      {/* Category breakdown */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {categories.map((cat) => (
          <div key={cat.label}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: 8,
                fontSize: 13,
              }}
            >
              <span style={{ color: '#94a3b8', fontWeight: 500 }}>{cat.label}</span>
              <span style={{ color: '#475569', fontSize: 11 }}>{cat.weight}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 8, alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexDirection: 'row-reverse' }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#22D3EE', minWidth: 28, textAlign: 'right' }}>
                  {cat.a}
                </span>
                <ScoreBar value={cat.a} color="#22D3EE" />
              </div>
              <span style={{ fontSize: 11, color: '#475569', minWidth: 16, textAlign: 'center' }}>/</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ScoreBar value={cat.b} color="#F5C542" />
                <span style={{ fontSize: 14, fontWeight: 700, color: '#F5C542', minWidth: 28 }}>
                  {cat.b}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
