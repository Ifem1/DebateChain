'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { getReputation } from '@/lib/genlayer';
import { useWallet } from '@/providers/WalletProvider';
import type { UserReputation } from '@/types/debate';
import { EmptyState } from '@/components/ui/EmptyState';
import { WalletConnectButton } from '@/components/ui/WalletConnectButton';

function StatCard({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="card" style={{ padding: '16px 20px', textAlign: 'center' }}>
      <div style={{ fontSize: 26, fontWeight: 800, color: color || '#e2e8f0', marginBottom: 4 }}>
        {value}
      </div>
      <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600 }}>
        {label}
      </div>
    </div>
  );
}

export default function LeaderboardPage() {
  const { address, isConnected } = useWallet();
  const [lookup, setLookup] = useState('');
  const [profileAddress, setProfileAddress] = useState<string | null>(null);
  const [rep, setRep] = useState<UserReputation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async (target: string) => {
    const trimmed = target.trim();
    if (!trimmed) return;
    setLoading(true);
    setError(null);
    try {
      const result = await getReputation(trimmed);
      setProfileAddress(trimmed);
      setRep(result);
    } catch {
      setError('Failed to load reputation from GenLayer.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (address) void Promise.resolve().then(() => loadProfile(address));
  }, [address, loadProfile]);

  const submitLookup = (e: React.FormEvent) => {
    e.preventDefault();
    void loadProfile(lookup);
  };

  const winRate = rep ? Math.round(rep.win_rate * 100) : 0;
  const shortAddr = profileAddress ? `${profileAddress.slice(0, 8)}...${profileAddress.slice(-4)}` : '';

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 24px' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 36, fontWeight: 800, color: '#fff', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
          Reputation
        </h1>
        <p style={{ fontSize: 15, color: '#64748b', margin: 0, lineHeight: 1.6 }}>
          Contract-only mode shows reputation directly from GenLayer. A global leaderboard requires an on-chain ranking method.
        </p>
      </div>

      <form onSubmit={submitLookup} className="card" style={{ padding: 18, display: 'flex', gap: 10, marginBottom: 24 }}>
        <input
          value={lookup}
          onChange={(e) => setLookup(e.target.value)}
          placeholder="Lookup wallet address..."
          style={{
            flex: 1,
            padding: '10px 14px',
            borderRadius: 8,
            fontSize: 14,
            color: '#e2e8f0',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)',
            outline: 'none',
          }}
        />
        <button
          type="submit"
          disabled={!lookup.trim() || loading}
          style={{
            padding: '10px 20px',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 700,
            color: '#fff',
            background: 'rgba(37,99,235,0.2)',
            border: '1px solid rgba(37,99,235,0.4)',
            cursor: !lookup.trim() || loading ? 'not-allowed' : 'pointer',
            opacity: !lookup.trim() || loading ? 0.6 : 1,
            whiteSpace: 'nowrap',
          }}
        >
          Lookup
        </button>
      </form>

      {!isConnected && !profileAddress && (
        <div className="card" style={{ padding: 28, marginBottom: 24, display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#e2e8f0', marginBottom: 4 }}>
              Connect to view your reputation
            </div>
            <div style={{ fontSize: 13, color: '#64748b' }}>
              You can also paste any wallet address above.
            </div>
          </div>
          <WalletConnectButton />
        </div>
      )}

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16 }}>
          {[...Array(6)].map((_, i) => <div key={i} className="shimmer card" style={{ height: 86 }} />)}
        </div>
      ) : error ? (
        <EmptyState title="Could not load reputation" description={error} />
      ) : rep && profileAddress ? (
        <>
          <div className="card" style={{ padding: 24, marginBottom: 20 }}>
            <div style={{ fontSize: 12, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
              On-chain profile
            </div>
            <Link href={`/profile/${profileAddress}`} style={{ color: '#e2e8f0', fontSize: 20, fontWeight: 800, fontFamily: 'monospace', textDecoration: 'none' }}>
              {shortAddr}
            </Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16 }}>
            <StatCard label="Debates" value={rep.debates_total} />
            <StatCard label="Wins" value={rep.wins} color="#22c55e" />
            <StatCard label="Losses" value={rep.losses} color="#E11D48" />
            <StatCard label="Draws" value={rep.draws} color="#64748b" />
            <StatCard label="Win Rate" value={`${winRate}%`} color="#F5C542" />
            <StatCard label="Fallacies" value={rep.fallacy_count} color="#E11D48" />
          </div>
        </>
      ) : (
        <EmptyState
          title="No profile selected"
          description="Connect a wallet or paste an address to read reputation directly from the active contract."
          action={<WalletConnectButton />}
          icon="Score"
        />
      )}
    </div>
  );
}
