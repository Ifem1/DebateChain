'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { getDebates, getProtocolState, getUserDebates } from '@/lib/genlayer';
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

export default function DebatesPage() {
  const { address, isConnected } = useWallet();
  const [allDebates, setAllDebates] = useState<Debate[]>([]);
  const [myDebates, setMyDebates] = useState<Debate[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<DebateStatus | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [lookupId, setLookupId] = useState('');
  const [view, setView] = useState<'all' | 'mine'>('all');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [publicDebates, walletDebates, state] = await Promise.all([
        getDebates(0, 100),
        address ? getUserDebates(address) : Promise.resolve([] as Debate[]),
        getProtocolState(),
      ]);
      setAllDebates(publicDebates.sort((a, b) => b.created_at - a.created_at));
      setMyDebates(walletDebates.sort((a, b) => b.created_at - a.created_at));
      setTotalCount(state?.debate_count ?? null);
    } catch (err) {
      console.error('[DebateChain] load error:', err);
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    void Promise.resolve().then(() => load());
  }, [load]);

  const debates = view === 'all' ? allDebates : myDebates;

  const filtered = debates.filter((d) => {
    const matchStatus = filter === 'ALL' || d.status === filter;
    const query = search.toLowerCase();
    const matchSearch =
      !query ||
      d.topic.toLowerCase().includes(query) ||
      d.side_a_label.toLowerCase().includes(query) ||
      d.side_b_label.toLowerCase().includes(query) ||
      d.debate_id.toLowerCase().includes(query);
    return matchStatus && matchSearch;
  });

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    const id = lookupId.trim();
    if (id) window.location.href = `/debates/${id}`;
  };

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '48px 24px' }}>
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
              ? `${totalCount} debate${totalCount !== 1 ? 's' : ''} on the active GenLayer contract`
              : 'AI-judged, on-chain debates'}
            {view === 'mine' && isConnected ? (
              <span style={{ fontSize: 12, color: '#475569', marginLeft: 8 }}>
                - showing debates for your connected wallet
              </span>
            ) : view === 'all' ? (
              <span style={{ fontSize: 12, color: '#475569', marginLeft: 8 }}>
                - showing public contract records
              </span>
            ) : (
              <span style={{ fontSize: 12, color: '#475569', marginLeft: 8 }}>
                - connect wallet or paste a debate ID to load contract records
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

      <form onSubmit={handleLookup} style={{ marginBottom: 24, display: 'flex', gap: 10 }}>
        <input
          type="text"
          placeholder="Jump to debate by ID..."
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
          Go
        </button>
      </form>

      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        <div
          style={{
            display: 'flex',
            borderRadius: 8,
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.1)',
            flexShrink: 0,
          }}
        >
          {[
            { value: 'all' as const, label: 'All Debates' },
            { value: 'mine' as const, label: 'My Debates' },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setView(option.value)}
              style={{
                padding: '8px 18px',
                fontSize: 13,
                fontWeight: 600,
                color: view === option.value ? '#fff' : '#64748b',
                background: view === option.value ? 'rgba(37,99,235,0.25)' : 'transparent',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {option.label}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder={view === 'all' ? 'Search all debates...' : 'Search your wallet debates...'}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            minWidth: 220,
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
          onClick={load}
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
          Refresh
        </button>

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
          <div style={{ fontSize: 36 }}>Lock</div>
          <h3 style={{ fontSize: 18, fontWeight: 600, color: '#e2e8f0', margin: 0 }}>
            Connect wallet to load your on-chain debates
          </h3>
          <p style={{ fontSize: 13, color: '#64748b', margin: 0, maxWidth: 520 }}>
            DebateChain no longer uses an off-chain public index. Known debates can still be opened directly by ID.
          </p>
          <WalletConnectButton />
        </div>
      )}

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card shimmer" style={{ height: 160 }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title={debates.length === 0 ? (view === 'all' ? 'No debates found' : 'No wallet debates found') : 'No matches'}
          description={
            debates.length === 0
              ? view === 'all'
                ? 'Create the first debate on this contract, or refresh after a new deployment finishes indexing on-chain state.'
                : 'Create or join a debate with this wallet, or paste a known debate ID above.'
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
