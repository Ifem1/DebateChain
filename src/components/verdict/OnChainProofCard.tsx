import type { Verdict } from '@/types/debate';
import { GENLAYER_EXPLORER } from '@/lib/constants';

interface Props {
  debateId: string;
  verdict: Verdict;
}

export function OnChainProofCard({ debateId, verdict }: Props) {
  const explorerUrl = GENLAYER_EXPLORER;

  return (
    <div
      className="card reveal stagger-5"
      style={{
        padding: 24,
        borderColor: 'rgba(34,211,238,0.2)',
        background: 'rgba(34,211,238,0.03)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'rgba(34,211,238,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
          }}
        >
          🔗
        </div>
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#22D3EE', margin: 0 }}>
            On-Chain Proof
          </h3>
          <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>
            This verdict is stored on GenLayer Studionet
          </p>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 10,
          marginBottom: 16,
        }}
      >
        {[
          { label: 'Network', value: 'GenLayer Studionet' },
          { label: 'Contract Method', value: 'judge_debate' },
          { label: 'Debate ID', value: debateId },
          { label: 'Type', value: 'Call (not Send)' },
          { label: 'Winner', value: verdict.winner },
          { label: 'Confidence', value: `${Math.round(verdict.confidence * 100)}%` },
        ].map(({ label, value }) => (
          <div
            key={label}
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              background: 'rgba(9,11,45,0.5)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <div style={{ fontSize: 10, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 2 }}>
              {label}
            </div>
            <div style={{ fontSize: 13, color: '#e2e8f0', fontFamily: 'monospace', wordBreak: 'break-all' }}>
              {value}
            </div>
          </div>
        ))}
      </div>

      <a
        href={explorerUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '8px 16px',
          borderRadius: 8,
          fontSize: 13,
          fontWeight: 600,
          color: '#22D3EE',
          background: 'rgba(34,211,238,0.08)',
          border: '1px solid rgba(34,211,238,0.25)',
          textDecoration: 'none',
          transition: 'background 0.15s',
        }}
      >
        View on GenLayer Explorer ↗
      </a>
    </div>
  );
}
