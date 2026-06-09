'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { getReputation, getUserDebates } from '@/lib/genlayer';
import type { UserReputation, Debate } from '@/types/debate';
import { UserDebateHistory } from '@/components/profile/UserDebateHistory';
import { ErrorState } from '@/components/ui/ErrorState';

function StatCard({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <div
      className="card"
      style={{ padding: '16px 20px', textAlign: 'center' }}
    >
      <div
        style={{
          fontSize: 28,
          fontWeight: 800,
          color: color || '#e2e8f0',
          marginBottom: 4,
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600 }}>
        {label}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { address } = useParams<{ address: string }>();
  const [rep, setRep] = useState<UserReputation | null>(null);
  const [debates, setDebates] = useState<Debate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [r, d] = await Promise.all([
        getReputation(address),
        getUserDebates(address),
      ]);
      setRep(r);
      setDebates(d);
    } catch {
      setError('Failed to load profile from GenLayer.');
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '48px 24px' }}>
        <div className="shimmer card" style={{ height: 200, marginBottom: 20 }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }}>
          {[...Array(4)].map((_, i) => <div key={i} className="shimmer card" style={{ height: 80 }} />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '48px 24px' }}>
        <ErrorState message={error} onRetry={load} />
      </div>
    );
  }

  const shortAddr = address.slice(0, 6) + '…' + address.slice(-4);
  const winRate = rep ? Math.round(rep.win_rate * 100) : 0;

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '48px 24px' }}>
      {/* Profile header */}
      <div
        className="card"
        style={{
          padding: '32px',
          marginBottom: 24,
          borderColor: 'rgba(37,99,235,0.2)',
          background: 'radial-gradient(ellipse at top left, rgba(37,99,235,0.06), transparent)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #2563EB, #22D3EE)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
              fontWeight: 800,
              color: '#fff',
              flexShrink: 0,
            }}
          >
            {address.slice(2, 4).toUpperCase()}
          </div>
          <div>
            <h1
              style={{
                fontSize: 24,
                fontWeight: 800,
                color: '#fff',
                margin: '0 0 4px',
                fontFamily: 'monospace',
              }}
            >
              {shortAddr}
            </h1>
            <div style={{ fontSize: 12, color: '#475569', fontFamily: 'monospace', wordBreak: 'break-all' }}>
              {address}
            </div>
            {rep && (
              <div
                style={{
                  marginTop: 8,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '3px 12px',
                  borderRadius: 9999,
                  background: 'rgba(245,197,66,0.1)',
                  border: '1px solid rgba(245,197,66,0.3)',
                  fontSize: 12,
                  color: '#F5C542',
                  fontWeight: 600,
                }}
              >
                ⭐ {winRate}% Win Rate
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      {rep && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: 16,
            marginBottom: 32,
          }}
        >
          <StatCard label="Debates" value={rep.debates_total} color="#e2e8f0" />
          <StatCard label="Wins" value={rep.wins} color="#22c55e" />
          <StatCard label="Losses" value={rep.losses} color="#E11D48" />
          <StatCard label="Draws" value={rep.draws} color="#64748b" />
          <StatCard label="Win Rate" value={`${winRate}%`} color="#F5C542" />
          <StatCard label="Fallacies" value={rep.fallacy_count} color="#E11D48" />
          {rep.argument_strength_avg > 0 && (
            <StatCard label="Avg Arg. Score" value={Math.round(rep.argument_strength_avg)} color="#22D3EE" />
          )}
          {rep.evidence_quality_avg > 0 && (
            <StatCard label="Avg Evidence" value={Math.round(rep.evidence_quality_avg)} color="#22D3EE" />
          )}
        </div>
      )}

      {/* Debate history */}
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#e2e8f0', margin: '0 0 20px' }}>
          Debate History
        </h2>
        <UserDebateHistory debates={debates} address={address} />
      </div>
    </div>
  );
}
