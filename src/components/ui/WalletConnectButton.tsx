'use client';

import { useWallet } from '@/providers/WalletProvider';

export function WalletConnectButton() {
  const { address, isConnected, isConnecting, connect, disconnect } = useWallet();

  if (isConnected && address) {
    return (
      <button onClick={disconnect} style={{
        padding: '6px 14px',
        borderRadius: 8,
        fontSize: 12,
        fontWeight: 600,
        color: '#7a6490',
        background: 'rgba(239,138,255,0.04)',
        border: '1px solid rgba(239,138,255,0.12)',
        cursor: 'pointer',
        transition: 'all 0.15s',
      }}>
        Disconnect
      </button>
    );
  }

  return (
    <button onClick={connect} disabled={isConnecting} style={{
      padding: '7px 16px',
      borderRadius: 8,
      fontSize: 13,
      fontWeight: 700,
      color: '#ef8aff',
      background: 'rgba(239,138,255,0.08)',
      border: '1px solid rgba(239,138,255,0.25)',
      cursor: isConnecting ? 'not-allowed' : 'pointer',
      opacity: isConnecting ? 0.6 : 1,
      transition: 'all 0.15s',
    }}>
      {isConnecting ? 'Connecting…' : 'Connect Wallet'}
    </button>
  );
}
