import type { DebateSide } from '@/types/debate';

interface Props {
  side: DebateSide;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function SideBadge({ side, label, size = 'md' }: Props) {
  const isA = side === 'SIDE_A';
  const color  = isA ? '#ef8aff' : '#bf5af2';
  const bg     = isA ? 'rgba(239,138,255,0.1)' : 'rgba(191,90,242,0.1)';
  const border = isA ? 'rgba(239,138,255,0.28)' : 'rgba(191,90,242,0.28)';
  const sizes = { sm: '11px', md: '12px', lg: '14px' };
  const pads  = { sm: '2px 8px', md: '4px 12px', lg: '5px 16px' };

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: pads[size], borderRadius: 999,
      fontSize: sizes[size], fontWeight: 700,
      letterSpacing: '0.06em', textTransform: 'uppercase',
      background: bg, color, border: `1px solid ${border}`,
    }}>
      <span style={{
        width: size === 'lg' ? 8 : 6, height: size === 'lg' ? 8 : 6,
        borderRadius: '50%', background: color, flexShrink: 0,
      }} />
      {label || (isA ? 'Side A' : 'Side B')}
    </span>
  );
}
