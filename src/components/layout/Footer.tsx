import Link from 'next/link';

export function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid rgba(239,138,255,0.08)',
      background: 'rgba(7,7,15,0.9)',
      padding: '40px 28px 28px',
      marginTop: 'auto',
    }}>
      <div style={{
        maxWidth: 1320,
        margin: '0 auto',
      }}>
        {/* Top row */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 32,
          marginBottom: 32,
        }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{
                width: 30, height: 30,
                borderRadius: 8,
                background: 'linear-gradient(135deg, #ef8aff, #bf5af2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 900, color: '#07070f',
              }}>⚔</div>
              <span style={{ fontSize: 16, fontWeight: 800, color: '#f5eeff' }}>DebateChain</span>
            </div>
            <p style={{ fontSize: 13, color: '#4a3d60', margin: 0, maxWidth: 240, lineHeight: 1.6 }}>
              Intellectual combat protocol. Logic is your only weapon.
            </p>
          </div>

          {/* Links */}
          <div style={{ display: 'flex', gap: 48, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#ef8aff', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
                Protocol
              </div>
              {[
                { href: '/debates', label: 'Arena' },
                { href: '/debates/new', label: 'Start Debate' },
                { href: '/leaderboard', label: 'Reputation' },
              ].map(l => (
                <div key={l.href} style={{ marginBottom: 8 }}>
                  <Link href={l.href} style={{ fontSize: 13, color: '#7a6490', textDecoration: 'none' }}>{l.label}</Link>
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#ef8aff', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
                Info
              </div>
              {[
                { href: '/about', label: 'About' },
                { href: 'https://github.com/Ifem1/DebateChain', label: 'GitHub' },
                { href: 'https://studio.genlayer.com', label: 'GenLayer' },
              ].map(l => (
                <div key={l.href} style={{ marginBottom: 8 }}>
                  <a href={l.href} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: '#7a6490', textDecoration: 'none' }}>{l.label}</a>
                </div>
              ))}
            </div>
          </div>

          {/* Chain stat */}
          <div style={{
            padding: '16px 20px',
            borderRadius: 12,
            background: 'rgba(239,138,255,0.05)',
            border: '1px solid rgba(239,138,255,0.12)',
            minWidth: 180,
          }}>
            <div style={{ fontSize: 11, color: '#7a6490', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Network</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#ef8aff', marginBottom: 4 }}>GenLayer Studionet</div>
            <div style={{ fontSize: 11, color: '#4a3d60' }}>Verdicts stored on-chain · No fake scores</div>
          </div>
        </div>

        {/* Bottom row */}
        <div style={{
          paddingTop: 20,
          borderTop: '1px solid rgba(239,138,255,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}>
          <p style={{ fontSize: 12, color: '#4a3d60', margin: 0 }}>
            © 2025 DebateChain · Intellectual Combat Protocol Active
          </p>
          <p style={{ fontSize: 12, color: '#4a3d60', margin: 0 }}>
            Powered by <span style={{ color: '#ef8aff' }}>GenLayer</span> Intelligent Contracts
          </p>
        </div>
      </div>
    </footer>
  );
}
