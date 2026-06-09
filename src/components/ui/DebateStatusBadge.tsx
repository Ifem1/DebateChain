import type { DebateStatus } from '@/types/debate';
import { DEBATE_STATUS_LABELS, DEBATE_STATUS_COLORS, DEBATE_STATUS_TEXT } from '@/lib/constants';

interface Props {
  status: DebateStatus;
  size?: 'sm' | 'md';
}

export function DebateStatusBadge({ status, size = 'md' }: Props) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: size === 'sm' ? '2px 8px' : '3px 12px',
        borderRadius: 9999,
        fontSize: size === 'sm' ? 11 : 12,
        fontWeight: 600,
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        background: DEBATE_STATUS_COLORS[status] || 'rgba(100,116,139,0.15)',
        color: DEBATE_STATUS_TEXT[status] || '#64748b',
        border: `1px solid ${DEBATE_STATUS_TEXT[status] || '#64748b'}33`,
      }}
    >
      {DEBATE_STATUS_LABELS[status] || status}
    </span>
  );
}
