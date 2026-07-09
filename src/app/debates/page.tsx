'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { getUserDebates, getProtocolState } from '@/lib/genlayer';
import { listDebatesCached } from '@/lib/supabase';
import { useWallet } from '@/providers/WalletProvider';
import type { Debate, DebateStatus } from '@/types/debate';
import { DebateCard } from '@/components/debate/DebateCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { WalletConnectButton } from '@/components/ui/WalletConnectButton';

const FILTER_OPTIONS: { value: DebateStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'CREATED', label: 'Open' },
  { value: 'ACCEPTED', label: 'Active' },
  { value: 'OPENING_SUBMITTED', label: 'Round 1' },
  { value: 'REBUTTAL_SUBMITTED', label: 'Round 2' },
  { value: 'READY_FOR_JUDGEMENT', label: 'Awaiting Judgement' },
  { value: 'JUDGED', label: 'Judged' },
  { value: 'FINALIZED', label: 'Finalized' },
];

type ViewMode = 'all' | 'mine';

export default function DebatesPage() {
  const { address, isConnected } = useWallet();
  const [allDebates, setAllDebates] = useState<Debate[]>([]);
  const [myDebates, setMyDebates] = useState<Debate[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<DebateStatus | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const [view, setView] = useState<ViewMode>('all');
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [lookupId, setLookupId] = useState('');

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [cached, onChain, state] = await Promise.all([
        listDebatesCached(100),
        address ? getUserDebates(address) : Promise.resolve([] as Debate[]),
        getProtocolState(),
      ]);

      const merged = new Map<string, Debate>();
      cached.forEach((d) => merged.set(d.debate_id, d));
      onChain.forEach((d) => merged.set(d.debate_id, d));
      setAllDebates(Array.from(merged.values()).sort((a, b) => b.created_at - a.created_at));
      setMyDebates(onChain);
      if (state) setTotalCount(state.debate_count);
    } catch (err) {
      console.error('[DebateChain] loadAll error:', err);
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    void Promise.resolve().then(() => loadAll());
  }, [loadAll]);

  const debates = view === 'all' ? allDebates : myDebates;

  const filtered = debates.filter((d) => {
    const matchStatus = filter === 'ALL' || d.status === filter;
    const matchSearch =
      !search ||
      d.topic.toLowerCase().includes(search.toLowerCase()) ||
      d.side_a_label.toLowerCase().includes(search.toLowerCase()) ||
      d.side_b_label.toLowerCase().includes(search.toLowerCase()) ||
      d.debate_id.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupId.trim()) return;
    window.location.href = `/debates/${lookupId.trim()}`;
  };

  const handleRefresh = () => { loadAll(); };

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '48px 24px' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: 32,
          gap: 24,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h1 style={{ fontSize: 36, fontWeight: 800, color: '#fff', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
            Debates
          </h1>
          <p style={{ fontSize: 15, color: '#64748b', margin: 0 }}>
            {totalCount !== null
              ? `${totalCount} debate${totalCount !== 1 ? 's' : ''} on GenLayer`
              : 'AI-judged, on-chain debates'}
            {allDebates.length > 0 && totalCount !== null && allDebates.length < totalCount
              ? ` · ${allDebates.length} indexed`
              : ''}
            {!isConnected && totalCount !== null && allDebates.length < totalCount && (
              <span style={{ fontSize: 12, color: '#475569', marginLeft: 8 }}>
                · connect wallet or paste a debate ID below to access all
              </span>
            )}
          </p>
        </div>
        <Link
          href="/debates/new"
          style={{
            padding: '12px 28px',
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 700,
            color: '#fff',
            background: 'linear-gradient(135deg, #2563EB, #1d4ed8)',
            textDecoration: 'none',
            boxShadow: '0 0 20px rgba(37,99,235,0.3)',
            whiteSpace: 'nowrap',
          }}
        >
          + New Debate
        </Link>
      </div>

      {/* Jump to debate by ID */}
      <form onSubmit={handleLookup} style={{ marginBottom: 24, display: 'flex', gap: 10 }}>
        <input
          type="text"
          placeholder="Jump to debate by ID…"
          value={lookupId}
          onChange={(e) => setLookupId(e.target.value)}
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
          style={{
            padding: '10px 20px',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            color: '#fff',
            background: 'rgba(37,99,235,0.2)',
            border: '1px solid rgba(37,99,235,0.4)',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          Go →
        </button>
      </form>

      {/* View toggle + search + filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* All / Mine toggle */}
        <div
          style={{
            display: 'flex',
            borderRadius: 8,
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.1)',
            flexShrink: 0,
          }}
        >
          {(['all', 'mine'] as ViewMode[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              style={{
                padding: '8px 18px',
                fontSize: 13,
                fontWeight: 600,
                color: view === v ? '#fff' : '#64748b',
                background: view === v ? 'rgba(37,99,235,0.25)' : 'transparent',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {v === 'all' ? 'All Debates' : 'My Debates'}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Search…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            minWidth: 160,
            padding: '9px 14px',
            borderRadius: 8,
            fontSize: 14,
            color: '#e2e8f0',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)',
            outline: 'none',
          }}
        />

        <button
          onClick={handleRefresh}
          style={{
            padding: '9px 14px',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            color: '#22D3EE',
            background: 'rgba(34,211,238,0.08)',
            border: '1px solid rgba(34,211,238,0.25)',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          ↻ Refresh
        </button>

        {/* Status filters */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {FILTER_OPTIONS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              style={{
                padding: '7px 12px',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 600,
                color: filter === f.value ? '#fff' : '#64748b',
                background: filter === f.value ? 'rgba(37,99,235,0.2)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${filter === f.value ? 'rgba(37,99,235,0.4)' : 'rgba(255,255,255,0.08)'}`,
                cursor: 'pointer',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* "My Debates" requires wallet */}
      {view === 'mine' && !isConnected && (
        <div
          className="card"
          style={{
            padding: '48px 32px',
            textAlign: 'center',
            borderColor: 'rgba(37,99,235,0.2)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16,
            marginBottom: 24,
          }}
        >
          <div style={{ fontSize: 36 }}>🔐</div>
          <h3 style={{ fontSize: 18, fontWeight: 600, color: '#e2e8f0', margin: 0 }}>
            Connect wallet to see your debates
          </h3>
          <WalletConnectButton />
        </div>
      )}

      {/* Results grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card shimmer" style={{ height: 160 }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title={
            view === 'mine' && myDebates.length === 0
              ? 'No debates yet'
              : 'No matches'
          }
          description={
            view === 'mine' && myDebates.length === 0
              ? 'You have not created or joined any debates.'
              : view === 'all' && allDebates.length === 0
              ? 'No debates have been indexed yet. Create the first one!'
              : 'Try adjusting your filters or search.'
          }
          action={
            <Link
              href="/debates/new"
              style={{
                padding: '10px 24px',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                color: '#fff',
                background: 'linear-gradient(135deg, #2563EB, #1d4ed8)',
                textDecoration: 'none',
              }}
            >
              Create a Debate
            </Link>
          }
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
          {filtered.map((d) => <DebateCard key={d.debate_id} debate={d} />)}
        </div>
      )}
    </div>
  );
}
