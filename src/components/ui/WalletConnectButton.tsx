'use client';

import { useWallet } from '@/providers/WalletProvider';

export function WalletConnectButton() {
  const { address, isConnected, isConnecting, connect, disconnect } = useWallet();

  if (isConnected && address) {
    return (
      <button
        onClick={disconnect}
        style={{
          padding: '7px 14px',
          borderRadius: 8,
          fontSize: 13,
          fontWeight: 500,
          color: '#94a3b8',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.08)',
          cursor: 'pointer',
          transition: 'border-color 0.15s',
        }}
      >
        Disconnect
      </button>
    );
  }

  return (
    <button
      onClick={connect}
      disabled={isConnecting}
      style={{
        padding: '7px 16px',
        borderRadius: 8,
        fontSize: 14,
        fontWeight: 600,
        color: '#fff',
        background: isConnecting
          ? 'rgba(37,99,235,0.4)'
          : 'rgba(37,99,235,0.15)',
        border: '1px solid rgba(37,99,235,0.4)',
        cursor: isConnecting ? 'not-allowed' : 'pointer',
        transition: 'background 0.15s, box-shadow 0.15s',
      }}
    >
      {isConnecting ? 'Connecting…' : 'Connect Wallet'}
    </button>
  );
}
