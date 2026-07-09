'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

interface WalletContextType {
  address: `0x${string}` | null;
  isConnected: boolean;
  isConnecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  error: string | null;
}

const WalletContext = createContext<WalletContextType>({
  address: null,
  isConnected: false,
  isConnecting: false,
  connect: async () => {},
  disconnect: () => {},
  error: null,
});

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<`0x${string}` | null>(() => {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem('dc_wallet') as `0x${string}` | null;
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);
    try {
      // Use MetaMask / injected wallet
      if (typeof window === 'undefined' || !window.ethereum) {
        throw new Error('No wallet detected. Install MetaMask or a compatible wallet.');
      }
      const accounts = (await window.ethereum.request({
        method: 'eth_requestAccounts',
      })) as string[];
      if (!accounts[0]) throw new Error('No account selected.');
      const addr = accounts[0] as `0x${string}`;
      setAddress(addr);
      sessionStorage.setItem('dc_wallet', addr);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Wallet connection failed.');
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
    sessionStorage.removeItem('dc_wallet');
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (typeof window === 'undefined' || !window.ethereum) return;
    const handler = (...args: unknown[]) => {
      const accounts = args[0] as string[];
      if (!accounts || accounts.length === 0) disconnect();
      else setAddress(accounts[0] as `0x${string}`);
    };
    window.ethereum.on('accountsChanged', handler);
    return () => window.ethereum?.removeListener?.('accountsChanged', handler);
  }, [disconnect]);

  return (
    <WalletContext.Provider
      value={{ address, isConnected: !!address, isConnecting, connect, disconnect, error }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export const useWallet = () => useContext(WalletContext);
