'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useWallet } from '@/providers/WalletProvider';
import { WalletConnectButton } from '@/components/ui/WalletConnectButton';
import { OnChainStatusBadge } from '@/components/ui/OnChainStatusBadge';

const NAV_LINKS = [
  { href: '/debates', label: 'Debates' },
  { href: '/leaderboard', label: 'Leaderboard' },
  { href: '/about', label: 'About' },
];

export function Navbar() {
  const pathname = usePathname();
  const { address } = useWallet();

  return (
    <header
      style={{
        background: 'rgba(9,11,45,0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: '0 24px',
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 24,
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #2563EB, #22D3EE)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16,
              fontWeight: 800,
              color: '#fff',
            }}
          >
            D
          </div>
          <span
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: '#fff',
              letterSpacing: '-0.02em',
            }}
          >
            DebateChain
          </span>
        </Link>

        {/* Nav links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href || pathname.startsWith(link.href + '/');
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  padding: '6px 14px',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 500,
                  color: active ? '#fff' : '#94a3b8',
                  background: active ? 'rgba(37,99,235,0.15)' : 'transparent',
                  textDecoration: 'none',
                  transition: 'color 0.15s, background 0.15s',
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <OnChainStatusBadge />
          {address && (
            <Link
              href={`/profile/${address}`}
              style={{
                padding: '6px 12px',
                borderRadius: 8,
                fontSize: 13,
                color: '#94a3b8',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                textDecoration: 'none',
                fontFamily: 'monospace',
              }}
            >
              {address.slice(0, 6)}…{address.slice(-4)}
            </Link>
          )}
          <WalletConnectButton />
          <Link
            href="/debates/new"
            style={{
              padding: '8px 18px',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              color: '#fff',
              background: 'linear-gradient(135deg, #2563EB, #1d4ed8)',
              textDecoration: 'none',
              boxShadow: '0 0 16px rgba(37,99,235,0.3)',
              transition: 'box-shadow 0.2s',
            }}
          >
            + New Debate
          </Link>
        </div>
      </div>
    </header>
  );
}
