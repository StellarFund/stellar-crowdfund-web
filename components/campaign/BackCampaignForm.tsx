"use client";

import { useState, type FormEvent } from "react";
import { useWallet } from "@/hooks/useWallet";
import { backCampaign } from "@/lib/contracts";
import { formatTokenAmount, isDeadlinePassed } from "@/lib/format";
import { stellarExpertTxUrl } from "@/lib/stellar";
import { Spinner } from "@/components/ui/Spinner";
import type { Campaign, TransactionProgress } from "@/types";

interface BackCampaignFormProps {
  campaign: Campaign;
  onBacked?: () => void;
}

const STAGE_LABEL: Record<TransactionProgress["stage"], string> = {
  idle: "",
  building: "Building transaction…",
  signing: "Awaiting signature in Freighter…",
  submitting: "Submitting to the network…",
  success: "Contribution confirmed",
  error: "Something went wrong",
};

export function BackCampaignForm({ campaign, onBacked }: BackCampaignFormProps) {
  const { isConnected, publicKey, connect, isConnecting } = useWallet();
  const [amount, setAmount] = useState("");
  const [progress, setProgress] = useState<TransactionProgress>({ stage: "idle" });

  const isClosed =
    campaign.status !== "active" || isDeadlinePassed(campaign.deadline);
  const isBusy = ["building", "signing", "submitting"].includes(progress.stage);
  const parsedAmount = Number(amount);
  const isValidAmount = amount.trim() !== "" && Number.isFinite(parsedAmount) && parsedAmount > 0;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!isValidAmount) return;

    if (!isConnected || !publicKey) {
      await connect();
      return;
    }

    setProgress({ stage: "building" });
    try {
      const txHash = await backCampaign({
        campaignId: campaign.id,
        contractAddress: campaign.contractAddress,
        amount: parsedAmount,
        backer: publicKey,
        onStage: (stage) => setProgress({ stage }),
      });
      setProgress({ stage: "success", txHash });
      setAmount("");
      onBacked?.();
    } catch (err) {
      setProgress({
        stage: "error",
        error: err instanceof Error ? err.message : "Failed to submit contribution.",
      });
    }
  }

  if (isClosed) {
    return (
      <div className="rounded-xl border border-border bg-surface-raised p-4 text-center text-sm text-muted">
        This campaign is no longer accepting contributions.
      </div>
    );
  }

  if (progress.stage === "success") {
    return (
      <div className="rounded-xl border border-success/30 bg-success/5 p-4 text-center">
        <p className="text-sm font-medium text-success">You backed this campaign 🎉</p>
        {progress.txHash && (
          <a
            href={stellarExpertTxUrl(progress.txHash)}
            target="_blank"
            rel="noreferrer"
            className="mt-1 inline-block text-xs text-muted underline underline-offset-2 hover:text-foreground"
          >
            View transaction
          </a>
        )}
        <button
          type="button"
          onClick={() => setProgress({ stage: "idle" })}
          className="mt-3 block w-full rounded-full border border-border py-2 text-sm font-medium text-foreground transition hover:border-brand-400"
        >
          Back again
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <label className="text-sm font-medium text-foreground" htmlFor="back-amount">
        Amount ({campaign.token.symbol})
      </label>
      <input
        id="back-amount"
        type="number"
        inputMode="decimal"
        min={0}
        step="any"
        placeholder="100"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        disabled={isBusy}
        className="w-full rounded-lg border border-border bg-surface-raised px-3 py-2.5 text-base text-foreground outline-none transition focus:border-brand-400 disabled:opacity-60"
      />

      <button
        type="submit"
        disabled={isBusy || isConnecting || (isConnected && !isValidAmount)}
        className="flex items-center justify-center gap-2 rounded-full bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {(isBusy || isConnecting) && <Spinner size="sm" />}
        {!isConnected
          ? "Connect wallet to back this campaign"
          : isBusy
            ? STAGE_LABEL[progress.stage]
            : isValidAmount
              ? `Back with ${formatTokenAmount(parsedAmount, campaign.token.symbol)}`
              : "Back this campaign"}
      </button>

      {progress.stage === "error" && <p className="text-sm text-danger">{progress.error}</p>}
    </form>
  );
}
