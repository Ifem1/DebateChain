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
        onMouseEnter={() => !online && setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '4px 10px',
          borderRadius: 9999,
          background: online ? 'rgba(34,197,94,0.1)' : 'rgba(225,29,72,0.1)',
          border: `1px solid ${online ? 'rgba(34,197,94,0.3)' : 'rgba(225,29,72,0.3)'}`,
          fontSize: 12,
          color: online ? '#4ade80' : '#f43f5e',
          fontWeight: 500,
          cursor: online ? 'default' : 'help',
        }}
      >
        <span
          className={online ? 'pulse-dot' : undefined}
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: online ? '#4ade80' : '#f43f5e',
            flexShrink: 0,
          }}
        />
        {online ? 'GenLayer Live' : 'GenLayer Offline'}
      </div>

      {showTooltip && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: 8,
            padding: '10px 14px',
            borderRadius: 8,
            background: '#0f1245',
            border: '1px solid rgba(225,29,72,0.3)',
            fontSize: 12,
            color: '#94a3b8',
            whiteSpace: 'nowrap',
            zIndex: 100,
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          }}
        >
          <div style={{ color: '#f43f5e', fontWeight: 600, marginBottom: 4 }}>
            Cannot reach GenLayer node
          </div>
          <div>RPC: <code style={{ color: '#22D3EE' }}>{GENLAYER_RPC}</code></div>
          <div style={{ marginTop: 4, color: '#64748b' }}>
            Make sure GenLayer Studio is running
          </div>
        </div>
      )}
    </div>
  );
}
