import Link from 'next/link';

export function Footer() {
  return (
    <footer
      style={{
        borderTop: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(9,11,45,0.8)',
        padding: '32px 24px',
        marginTop: 'auto',
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: 6,
              background: 'linear-gradient(135deg, #2563EB, #22D3EE)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              fontWeight: 800,
              color: '#fff',
            }}
          >
            D
          </div>
          <span style={{ fontSize: 14, color: '#64748b' }}>
            DebateChain — Powered by{' '}
            <span style={{ color: '#22D3EE' }}>GenLayer</span>
          </span>
        </div>
        <div style={{ display: 'flex', gap: 24 }}>
          <Link href="/about" style={{ fontSize: 13, color: '#64748b', textDecoration: 'none' }}>
            About
          </Link>
          <Link href="/debates" style={{ fontSize: 13, color: '#64748b', textDecoration: 'none' }}>
            Debates
          </Link>
          <Link href="/leaderboard" style={{ fontSize: 13, color: '#64748b', textDecoration: 'none' }}>
            Leaderboard
          </Link>
        </div>
        <p style={{ fontSize: 12, color: '#475569', margin: 0 }}>
          All verdicts stored on-chain. GenLayer is the source of truth.
        </p>
      </div>
    </footer>
  );
}
