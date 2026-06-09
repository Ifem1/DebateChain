'use client';

import { useState } from 'react';
import { useWallet } from '@/providers/WalletProvider';
import { acceptDebate } from '@/lib/genlayer';
import type { Debate } from '@/types/debate';
import { SideBadge } from '@/components/ui/SideBadge';

interface Props {
  debate: Debate;
  onJoined: () => void;
}

export function JoinDebatePanel({ debate, onJoined }: Props) {
  const { address, isConnected, connect } = useWallet();
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const isCreator = address?.toLowerCase() === debate.creator.toLowerCase();

  const handleJoin = async () => {
    if (!address) { connect(); return; }
    if (isCreator) { setError("You can't join your own debate."); return; }

    setError(null);
    setJoining(true);
    try {
      const hash = await acceptDebate(address, debate.debate_id);
      setTxHash(hash);
      setTimeout(onJoined, 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to join debate.');
    } finally {
      setJoining(false);
    }
  };

  if (txHash) {
    return (
      <div
        className="card"
        style={{
          padding: 20,
          borderColor: 'rgba(34,197,94,0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <span style={{ fontSize: 20 }}>✓</span>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#22c55e' }}>Joined Successfully</div>
          <div style={{ fontSize: 12, color: '#64748b' }}>You are now Side B. Submit your opening argument.</div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="card"
      style={{
        padding: 24,
        borderColor: 'rgba(245,197,66,0.2)',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      <h3 style={{ fontSize: 16, fontWeight: 700, color: '#F5C542', margin: 0 }}>
        Join This Debate
      </h3>
      <p style={{ fontSize: 14, color: '#94a3b8', margin: 0 }}>
        By joining, you accept <SideBadge side="SIDE_B" label={debate.side_b_label} size="sm" /> and agree to argue this position through all rounds.
      </p>

      <div style={{ display: 'flex', gap: 12 }}>
        <div
          style={{
            flex: 1,
            padding: '10px 14px',
            borderRadius: 8,
            background: 'rgba(34,211,238,0.06)',
            border: '1px solid rgba(34,211,238,0.15)',
          }}
        >
          <div style={{ fontSize: 10, color: '#22D3EE', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 2 }}>Creator (Side A)</div>
          <div style={{ fontSize: 12, color: '#94a3b8', fontFamily: 'monospace' }}>
            {debate.creator.slice(0, 10)}…
          </div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#22D3EE', marginTop: 4 }}>{debate.side_a_label}</div>
        </div>
        <div
          style={{
            flex: 1,
            padding: '10px 14px',
            borderRadius: 8,
            background: 'rgba(245,197,66,0.06)',
            border: '1px solid rgba(245,197,66,0.15)',
          }}
        >
          <div style={{ fontSize: 10, color: '#F5C542', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 2 }}>You (Side B)</div>
          <div style={{ fontSize: 12, color: '#94a3b8', fontFamily: 'monospace' }}>
            {address ? address.slice(0, 10) + '…' : 'Not connected'}
          </div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#F5C542', marginTop: 4 }}>{debate.side_b_label}</div>
        </div>
      </div>

      {error && (
        <div
          style={{
            padding: '8px 12px',
            borderRadius: 8,
            background: 'rgba(225,29,72,0.1)',
            border: '1px solid rgba(225,29,72,0.3)',
            fontSize: 13,
            color: '#f43f5e',
          }}
        >
          {error}
        </div>
      )}

      <button
        onClick={handleJoin}
        disabled={joining || isCreator}
        style={{
          padding: '12px 24px',
          borderRadius: 10,
          fontSize: 14,
          fontWeight: 700,
          color: '#fff',
          background: joining || isCreator
            ? 'rgba(245,197,66,0.3)'
            : 'linear-gradient(135deg, #d4a017, #F5C542)',
          border: 'none',
          cursor: joining || isCreator ? 'not-allowed' : 'pointer',
          alignSelf: 'flex-start',
        }}
      >
        {joining ? 'Joining on GenLayer…' : isCreator ? 'You created this debate' : 'Accept & Join Debate'}
      </button>
    </div>
  );
}
