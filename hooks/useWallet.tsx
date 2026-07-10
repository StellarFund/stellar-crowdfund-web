"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  connectFreighter,
  getFreighterAddress,
  getStellarNetwork,
} from "@/lib/freighter";
import type { WalletState } from "@/types";

const STORAGE_KEY = "stellar-crowdfund:wallet-connected";

const initialState: WalletState = {
  isConnected: false,
  isConnecting: false,
  publicKey: null,
  network: null,
  error: null,
};

interface WalletContextValue extends WalletState {
  connect: () => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextValue | null>(null);

export function useWalletState(): WalletContextValue {
  const [state, setState] = useState<WalletState>(initialState);

  const connect = useCallback(async () => {
    setState((s) => ({ ...s, isConnecting: true, error: null }));
    try {
      const { publicKey, network } = await connectFreighter();
      setState({
        isConnected: true,
        isConnecting: false,
        publicKey,
        network,
        error: null,
      });
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch (err) {
      setState({
        ...initialState,
        error: err instanceof Error ? err.message : "Failed to connect wallet.",
      });
    }
  }, []);

  const disconnect = useCallback(() => {
    setState(initialState);
    window.localStorage.removeItem(STORAGE_KEY);
  }, []);

  useEffect(() => {
    const wasConnected = window.localStorage.getItem(STORAGE_KEY) === "1";
    if (!wasConnected) return;

    let cancelled = false;
    (async () => {
      const address = await getFreighterAddress();
      if (cancelled || !address) return;
      const network = await getStellarNetwork().catch(() => null);
      if (cancelled) return;
      setState({
        isConnected: true,
        isConnecting: false,
        publicKey: address,
        network,
        error: null,
      });
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return useMemo(
    () => ({ ...state, connect, disconnect }),
    [state, connect, disconnect]
  );
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const value = useWalletState();
  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet(): WalletContextValue {
  const ctx = useContext(WalletContext);
  if (!ctx) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return ctx;
}
