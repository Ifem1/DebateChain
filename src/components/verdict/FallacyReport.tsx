import type { FallacyDetection } from '@/types/debate';
import { FALLACY_DESCRIPTIONS } from '@/lib/constants';

interface Props {
  fallaciesA: FallacyDetection[];
  fallaciesB: FallacyDetection[];
  sideALabel: string;
  sideBLabel: string;
}

function FallacyItem({ f }: { f: FallacyDetection }) {
  const key = f.type.toLowerCase().replace(/\s+/g, '_');
  const desc = FALLACY_DESCRIPTIONS[key];
  return (
    <div
      style={{
        padding: '10px 14px',
        borderRadius: 8,
        background: 'rgba(225,29,72,0.06)',
        border: '1px solid rgba(225,29,72,0.2)',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
      }}
    >
      <span style={{ fontSize: 12, fontWeight: 700, color: '#E11D48', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {f.type.replace(/_/g, ' ')}
      </span>
      {f.description && (
        <span style={{ fontSize: 13, color: '#94a3b8' }}>{f.description}</span>
      )}
      {f.excerpt && (
        <span
          style={{
            fontSize: 12,
            color: '#64748b',
            fontStyle: 'italic',
            borderLeft: '2px solid rgba(225,29,72,0.3)',
            paddingLeft: 8,
            marginTop: 2,
          }}
        >
          "{f.excerpt}"
        </span>
      )}
      {desc && !f.description && (
        <span style={{ fontSize: 12, color: '#64748b' }}>{desc}</span>
      )}
    </div>
  );
}

export function FallacyReport({ fallaciesA, fallaciesB, sideALabel, sideBLabel }: Props) {
  const total = fallaciesA.length + fallaciesB.length;

  if (total === 0) {
    return (
      <div
        className="card reveal stagger-3"
        style={{
          padding: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          borderColor: 'rgba(34,197,94,0.2)',
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'rgba(34,197,94,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
          }}
        >
          ✓
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#22c55e' }}>No Fallacies Detected</div>
          <div style={{ fontSize: 12, color: '#64748b' }}>Both sides maintained logical integrity.</div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="card reveal stagger-3"
      style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: 'rgba(225,29,72,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 16,
          }}
        >
          ⚠
        </div>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#E11D48', margin: 0 }}>
            Logical Fallacies Detected
          </h3>
          <span style={{ fontSize: 12, color: '#64748b' }}>{total} total</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: '#22D3EE',
              textTransform: 'uppercase',
              letterSpacing: '0.07em',
              marginBottom: 10,
            }}
          >
            {sideALabel} · {fallaciesA.length} fallac{fallaciesA.length === 1 ? 'y' : 'ies'}
          </div>
          {fallaciesA.length === 0 ? (
            <p style={{ fontSize: 13, color: '#475569', fontStyle: 'italic' }}>None detected.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {fallaciesA.map((f, i) => <FallacyItem key={i} f={f} />)}
            </div>
          )}
        </div>
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: '#F5C542',
              textTransform: 'uppercase',
              letterSpacing: '0.07em',
              marginBottom: 10,
            }}
          >
            {sideBLabel} · {fallaciesB.length} fallac{fallaciesB.length === 1 ? 'y' : 'ies'}
          </div>
          {fallaciesB.length === 0 ? (
            <p style={{ fontSize: 13, color: '#475569', fontStyle: 'italic' }}>None detected.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {fallaciesB.map((f, i) => <FallacyItem key={i} f={f} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
