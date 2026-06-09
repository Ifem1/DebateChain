'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getLeaderboard } from '@/lib/supabase';
import type { UserReputation } from '@/types/debate';
import { EmptyState } from '@/components/ui/EmptyState';

function RankBadge({ rank }: { rank: number }) {
  const colors: Record<number, string> = { 1: '#F5C542', 2: '#94a3b8', 3: '#cd7f32' };
  const color = colors[rank] || '#475569';
  return (
    <div
      style={{
        width: 32,
        height: 32,
        borderRadius: '50%',
        background: `${color}20`,
        border: `2px solid ${color}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 13,
        fontWeight: 800,
        color,
        flexShrink: 0,
      }}
    >
      {rank}
    </div>
  );
}

export default function LeaderboardPage() {
  const [leaders, setLeaders] = useState<UserReputation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLeaderboard(50)
      .then(setLeaders)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 24px' }}>
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontSize: 36, fontWeight: 800, color: '#fff', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
          Leaderboard
        </h1>
        <p style={{ fontSize: 15, color: '#64748b', margin: 0 }}>
          Top debaters ranked by reasoning quality and win rate. Updated from on-chain data.
        </p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[...Array(10)].map((_, i) => (
            <div key={i} className="shimmer card" style={{ height: 64 }} />
          ))}
        </div>
      ) : leaders.length === 0 ? (
        <EmptyState
          title="No debaters yet"
          description="Complete debates to appear on the leaderboard."
          icon="🏆"
        />
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          {/* Header */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '48px 1fr 80px 80px 80px 80px 80px',
              gap: 8,
              padding: '12px 20px',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              fontSize: 11,
              fontWeight: 700,
              color: '#475569',
              textTransform: 'uppercase',
              letterSpacing: '0.07em',
            }}
          >
            <span>#</span>
            <span>Debater</span>
            <span style={{ textAlign: 'right' }}>Debates</span>
            <span style={{ textAlign: 'right' }}>Wins</span>
            <span style={{ textAlign: 'right' }}>Losses</span>
            <span style={{ textAlign: 'right' }}>Win %</span>
            <span style={{ textAlign: 'right' }}>Fallacies</span>
          </div>

          {leaders.map((rep, i) => {
            const shortAddr = rep.address.slice(0, 8) + '…' + rep.address.slice(-4);
            const winRate = Math.round((rep.win_rate || 0) * 100);
            return (
              <Link
                key={rep.address}
                href={`/profile/${rep.address}`}
                style={{ textDecoration: 'none' }}
              >
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '48px 1fr 80px 80px 80px 80px 80px',
                    gap: 8,
                    padding: '14px 20px',
                    borderBottom: i < leaders.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                    alignItems: 'center',
                    transition: 'background 0.15s',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.02)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
                >
                  <RankBadge rank={i + 1} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0', fontFamily: 'monospace' }}>
                      {shortAddr}
                    </div>
                  </div>
                  <div style={{ fontSize: 14, color: '#94a3b8', textAlign: 'right' }}>{rep.debates_total}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#22c55e', textAlign: 'right' }}>{rep.wins}</div>
                  <div style={{ fontSize: 14, color: '#E11D48', textAlign: 'right' }}>{rep.losses}</div>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: winRate >= 60 ? '#F5C542' : winRate >= 40 ? '#94a3b8' : '#E11D48',
                      textAlign: 'right',
                    }}
                  >
                    {winRate}%
                  </div>
                  <div
                    style={{
                      fontSize: 14,
                      color: rep.fallacy_count > 5 ? '#E11D48' : '#64748b',
                      textAlign: 'right',
                    }}
                  >
                    {rep.fallacy_count}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
