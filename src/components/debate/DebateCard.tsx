import Link from 'next/link';
import type { Debate } from '@/types/debate';
import { DebateStatusBadge } from '@/components/ui/DebateStatusBadge';

interface Props {
  debate: Debate;
}

function truncate(str: string, max: number) {
  return str.length > max ? str.slice(0, max) + '…' : str;
}

function formatDate(ts: number) {
  if (!ts) return '';
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function shortAddr(addr: string) {
  if (!addr || addr === '0x0000000000000000000000000000000000000000') return '—';
  return addr.slice(0, 6) + '…' + addr.slice(-4);
}

const STATUS_ICON: Record<string, string> = {
  CREATED: '🟣',
  ACCEPTED: '⚡',
  OPENING_SUBMITTED: '📝',
  REBUTTAL_SUBMITTED: '🔥',
  READY_FOR_JUDGEMENT: '⚖️',
  JUDGED: '✅',
  FINALIZED: '🏆',
  DISPUTED: '⚠️',
  CANCELLED: '✖️',
};

export function DebateCard({ debate }: Props) {
  const isActive = ['ACCEPTED', 'OPENING_SUBMITTED', 'REBUTTAL_SUBMITTED', 'READY_FOR_JUDGEMENT'].includes(debate.status);
  const isOpen = debate.status === 'CREATED';
  const isFinalized = debate.status === 'FINALIZED';

  return (
    <Link href={`/debates/${debate.debate_id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div style={{
        borderRadius: 14,
        background: 'var(--bg-1)',
        border: `1px solid ${isActive ? 'rgba(239,138,255,0.2)' : isOpen ? 'rgba(239,138,255,0.12)' : 'rgba(239,138,255,0.07)'}`,
        padding: '20px 22px',
        display: 'flex',
        flexDirection: 'column',
        gap: 13,
        cursor: 'pointer',
        transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.15s',
        boxShadow: isActive ? '0 0 24px rgba(239,138,255,0.06)' : 'none',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(239,138,255,0.35)';
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 32px rgba(239,138,255,0.12)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = isActive ? 'rgba(239,138,255,0.2)' : isOpen ? 'rgba(239,138,255,0.12)' : 'rgba(239,138,255,0.07)';
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = isActive ? '0 0 24px rgba(239,138,255,0.06)' : 'none';
      }}
      >
        {/* Active pulse bar */}
        {isActive && (
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 2,
            background: 'linear-gradient(90deg, transparent, #ef8aff, transparent)',
          }} />
        )}

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#f5eeff', margin: 0, lineHeight: 1.4, flex: 1 }}>
            {STATUS_ICON[debate.status] || '💬'} {truncate(debate.topic, 100)}
          </h3>
          <DebateStatusBadge status={debate.status} size="sm" />
        </div>

        {/* Sides */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            padding: '4px 10px', borderRadius: 6,
            background: 'rgba(239,138,255,0.08)', border: '1px solid rgba(239,138,255,0.18)',
            fontSize: 12, fontWeight: 600, color: '#ef8aff',
          }}>
            {truncate(debate.side_a_label, 22)}
          </div>
          <span style={{ fontSize: 11, color: '#4a3d60', fontWeight: 700 }}>vs</span>
          <div style={{
            padding: '4px 10px', borderRadius: 6,
            background: 'rgba(191,90,242,0.08)', border: '1px solid rgba(191,90,242,0.18)',
            fontSize: 12, fontWeight: 600, color: '#bf5af2',
          }}>
            {truncate(debate.side_b_label, 22)}
          </div>
        </div>

        {/* Meta */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 11, color: '#4a3d60' }}>
          <span title={debate.creator}>🧑 {shortAddr(debate.creator)}</span>
          {debate.opponent && debate.opponent !== '0x0000000000000000000000000000000000000000' && (
            <span title={debate.opponent}>⚔ {shortAddr(debate.opponent)}</span>
          )}
          {debate.created_at ? (
            <span style={{ marginLeft: 'auto' }}>{formatDate(debate.created_at)}</span>
          ) : null}
        </div>

        {/* Finalized */}
        {isFinalized && (
          <div style={{
            padding: '4px 10px', borderRadius: 6, alignSelf: 'flex-start',
            background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.18)',
            fontSize: 11, color: '#4ade80', fontWeight: 700, letterSpacing: '0.04em',
          }}>
            🏆 Verdict On-Chain
          </div>
        )}

        {/* Open challenge chip */}
        {isOpen && (
          <div style={{
            padding: '4px 10px', borderRadius: 6, alignSelf: 'flex-start',
            background: 'rgba(239,138,255,0.06)', border: '1px solid rgba(239,138,255,0.2)',
            fontSize: 11, color: '#ef8aff', fontWeight: 700,
          }}>
            Open — Join as Side B →
          </div>
        )}
      </div>
    </Link>
  );
}
