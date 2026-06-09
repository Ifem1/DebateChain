'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useWallet } from '@/providers/WalletProvider';
import { WalletConnectButton } from '@/components/ui/WalletConnectButton';
import { OnChainStatusBadge } from '@/components/ui/OnChainStatusBadge';

const NAV_LINKS = [
  { href: '/debates', label: 'Arena' },
  { href: '/leaderboard', label: 'Rankings' },
  { href: '/about', label: 'About' },
];

export function Navbar() {
  const pathname = usePathname();
  const { address } = useWallet();

  return (
    <header style={{
      background: 'rgba(7,7,15,0.85)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(239,138,255,0.1)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      <div style={{
        maxWidth: 1320,
        margin: '0 auto',
        padding: '0 28px',
        height: 62,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 20,
      }}>

        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
          <div style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #ef8aff, #bf5af2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 16,
            fontWeight: 900,
            color: '#07070f',
            boxShadow: '0 0 16px rgba(239,138,255,0.4)',
          }}>
            ⚔
          </div>
          <span style={{ fontSize: 17, fontWeight: 800, color: '#f5eeff', letterSpacing: '-0.02em' }}>
            DebateChain
          </span>
        </Link>

        {/* Nav links — center */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href || pathname.startsWith(link.href + '/');
            return (
              <Link key={link.href} href={link.href} style={{
                padding: '6px 16px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: active ? 700 : 500,
                color: active ? '#ef8aff' : '#7a6490',
                background: active ? 'rgba(239,138,255,0.1)' : 'transparent',
                textDecoration: 'none',
                transition: 'all 0.15s',
                borderBottom: active ? '1px solid rgba(239,138,255,0.4)' : '1px solid transparent',
                letterSpacing: '0.02em',
              }}>
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <OnChainStatusBadge />
          {address && (
            <Link href={`/profile/${address}`} style={{
              padding: '5px 12px',
              borderRadius: 8,
              fontSize: 12,
              color: '#c4a8e0',
              background: 'rgba(239,138,255,0.06)',
              border: '1px solid rgba(239,138,255,0.15)',
              textDecoration: 'none',
              fontFamily: 'monospace',
              letterSpacing: '0.03em',
            }}>
              {address.slice(0, 6)}…{address.slice(-4)}
            </Link>
          )}
          <WalletConnectButton />
          <Link href="/debates/new" className="btn-primary" style={{ fontSize: 13, padding: '8px 18px' }}>
            ⚡ Start Debate
          </Link>
        </div>
      </div>
    </header>
  );
}
