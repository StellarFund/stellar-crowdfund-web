"use client";

import { useWallet } from "@/hooks/useWallet";
import { NETWORK } from "@/lib/stellar";

export function NetworkSelector() {
  const { isConnected, network } = useWallet();

  const label = NETWORK === "public" ? "Public Network" : "Testnet";
  const mismatched = isConnected && network && network !== NETWORK;

  return (
    <div
      title={mismatched ? `Freighter is set to ${network}, but this app targets ${NETWORK}. Switch networks in Freighter.` : undefined}
      className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${
        mismatched
          ? "border-warning/40 bg-warning/10 text-warning"
          : "border-border bg-surface text-muted"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${mismatched ? "bg-warning" : "bg-brand-400"}`} />
      {mismatched ? `Switch to ${label}` : label}
    </div>
  );
}
