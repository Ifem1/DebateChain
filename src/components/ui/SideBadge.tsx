import type { DebateSide } from '@/types/debate';

interface Props {
  side: DebateSide;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function SideBadge({ side, label, size = 'md' }: Props) {
  const isA = side === 'SIDE_A';
  const color = isA ? '#22D3EE' : '#F5C542';
  const bg = isA ? 'rgba(34,211,238,0.12)' : 'rgba(245,197,66,0.12)';
  const border = isA ? 'rgba(34,211,238,0.3)' : 'rgba(245,197,66,0.3)';
  const sizes = { sm: '11px', md: '12px', lg: '14px' };
  const pads = { sm: '2px 8px', md: '3px 12px', lg: '5px 16px' };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: pads[size],
        borderRadius: 9999,
        fontSize: sizes[size],
        fontWeight: 700,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        background: bg,
        color,
        border: `1px solid ${border}`,
      }}
    >
      <span
        style={{
          width: size === 'lg' ? 8 : 6,
          height: size === 'lg' ? 8 : 6,
          borderRadius: '50%',
          background: color,
          flexShrink: 0,
        }}
      />
      {label || (isA ? 'Side A' : 'Side B')}
    </span>
  );
}
