import Link from 'next/link';
import type { Debate } from '@/types/debate';
import { DebateStatusBadge } from '@/components/ui/DebateStatusBadge';
import { SideBadge } from '@/components/ui/SideBadge';

interface Props {
  debate: Debate;
}

function truncate(str: string, max: number) {
  return str.length > max ? str.slice(0, max) + '…' : str;
}

function formatDate(ts: number) {
  if (!ts) return '';
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function shortAddr(addr: string) {
  if (!addr || addr === '0x0000000000000000000000000000000000000000') return '—';
  return addr.slice(0, 6) + '…' + addr.slice(-4);
}

export function DebateCard({ debate }: Props) {
  return (
    <Link
      href={`/debates/${debate.debate_id}`}
      style={{ textDecoration: 'none' }}
    >
      <div
        className="card card-hover"
        style={{
          padding: '20px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          cursor: 'pointer',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <h3
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: '#e2e8f0',
              margin: 0,
              lineHeight: 1.4,
              flex: 1,
            }}
          >
            {truncate(debate.topic, 120)}
          </h3>
          <DebateStatusBadge status={debate.status} size="sm" />
        </div>

        {/* Sides */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <SideBadge side="SIDE_A" label={truncate(debate.side_a_label, 24)} size="sm" />
          <span style={{ fontSize: 12, color: '#475569', alignSelf: 'center' }}>vs</span>
          <SideBadge side="SIDE_B" label={truncate(debate.side_b_label, 24)} size="sm" />
        </div>

        {/* Meta */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            fontSize: 12,
            color: '#64748b',
          }}
        >
          <span title={debate.creator}>Creator: {shortAddr(debate.creator)}</span>
          {debate.opponent && debate.opponent !== '0x0000000000000000000000000000000000000000' && (
            <span title={debate.opponent}>vs {shortAddr(debate.opponent)}</span>
          )}
          {debate.created_at ? (
            <span style={{ marginLeft: 'auto' }}>{formatDate(debate.created_at)}</span>
          ) : null}
        </div>

        {/* Finalized indicator */}
        {debate.finalized && (
          <div
            style={{
              padding: '4px 10px',
              borderRadius: 6,
              background: 'rgba(34,197,94,0.08)',
              border: '1px solid rgba(34,197,94,0.2)',
              fontSize: 11,
              color: '#4ade80',
              fontWeight: 600,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              alignSelf: 'flex-start',
            }}
          >
            ✓ Verdict Finalized On-Chain
          </div>
        )}
      </div>
    </Link>
  );
}
