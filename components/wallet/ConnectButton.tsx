"use client";

import { useEffect, useRef, useState } from "react";
import { useWallet } from "@/hooks/useWallet";
import { truncateAddress } from "@/lib/format";
import { stellarExpertAccountUrl } from "@/lib/stellar";
import { CopyButton } from "@/components/ui/CopyButton";
import { Spinner } from "@/components/ui/Spinner";

export function ConnectButton() {
  const { isConnected, isConnecting, publicKey, error, connect, disconnect } = useWallet();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  if (isConnected && publicKey) {
    return (
      <div className="relative" ref={menuRef}>
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          className="flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-sm font-medium text-foreground transition hover:border-brand-400"
        >
          <span className="h-2 w-2 rounded-full bg-success" />
          {truncateAddress(publicKey)}
        </button>
        {menuOpen && (
          <div className="absolute right-0 z-20 mt-2 w-56 rounded-xl border border-border bg-surface-raised p-2 shadow-xl animate-fade-in">
            <div className="flex items-center justify-between rounded-lg px-2 py-1.5 text-xs text-muted">
              <span className="font-mono">{truncateAddress(publicKey, 6)}</span>
              <CopyButton value={publicKey} label="Copy address" />
            </div>
            <a
              href={stellarExpertAccountUrl(publicKey)}
              target="_blank"
              rel="noreferrer"
              className="block rounded-lg px-2 py-1.5 text-sm text-foreground transition hover:bg-white/5"
            >
              View on Stellar Expert
            </a>
            <button
              type="button"
              onClick={() => {
                disconnect();
                setMenuOpen(false);
              }}
              className="mt-1 block w-full rounded-lg px-2 py-1.5 text-left text-sm text-danger transition hover:bg-danger/10"
            >
              Disconnect
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={connect}
        disabled={isConnecting}
        className="flex items-center gap-2 rounded-full bg-brand-500 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isConnecting && <Spinner size="sm" />}
        {isConnecting ? "Connecting…" : "Connect Wallet"}
      </button>
      {error && <span className="max-w-[220px] text-right text-xs text-danger">{error}</span>}
    </div>
  );
}
