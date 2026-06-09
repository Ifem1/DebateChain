'use client';

import { useEffect, useState } from 'react';
import { getProtocolState } from '@/lib/genlayer';
import { GENLAYER_RPC } from '@/lib/constants';

export function OnChainStatusBadge() {
  const [online, setOnline] = useState<boolean | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    getProtocolState()
      .then((s) => setOnline(s !== null))
      .catch(() => setOnline(false));
  }, []);

  if (online === null) return null;

  return (
    <div style={{ position: 'relative' }}>
      <div
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '4px 10px', borderRadius: 999,
          background: online ? 'rgba(74,222,128,0.08)' : 'rgba(248,113,113,0.08)',
          border: `1px solid ${online ? 'rgba(74,222,128,0.25)' : 'rgba(248,113,113,0.25)'}`,
          fontSize: 11, fontWeight: 700, letterSpacing: '0.05em',
          color: online ? '#4ade80' : '#f87171',
          cursor: 'default',
          textTransform: 'uppercase',
        }}
      >
        <span style={{
          width: 6, height: 6, borderRadius: '50%',
          background: online ? '#4ade80' : '#f87171',
          flexShrink: 0,
          animation: online ? 'pulse-dot 1.8s ease-in-out infinite' : 'none',
        }} />
        {online ? 'Chain Live' : 'Offline'}
      </div>

      {showTooltip && (
        <div style={{
          position: 'absolute', top: '100%', right: 0, marginTop: 8,
          padding: '12px 16px', borderRadius: 10,
          background: '#0d0d1a',
          border: `1px solid ${online ? 'rgba(74,222,128,0.2)' : 'rgba(248,113,113,0.2)'}`,
          fontSize: 12, color: '#c4a8e0', whiteSpace: 'nowrap',
          zIndex: 100, boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
          minWidth: 220,
        }}>
          {online ? (
            <>
              <div style={{ color: '#4ade80', fontWeight: 700, marginBottom: 4 }}>GenLayer Studionet Connected</div>
              <div style={{ color: '#7a6490' }}>RPC: <code style={{ color: '#ef8aff', fontSize: 11 }}>{GENLAYER_RPC}</code></div>
            </>
          ) : (
            <>
              <div style={{ color: '#f87171', fontWeight: 700, marginBottom: 4 }}>Cannot reach GenLayer node</div>
              <div style={{ color: '#7a6490' }}>RPC: <code style={{ color: '#ef8aff', fontSize: 11 }}>{GENLAYER_RPC}</code></div>
              <div style={{ marginTop: 4, color: '#4a3d60' }}>Check env vars and network</div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
