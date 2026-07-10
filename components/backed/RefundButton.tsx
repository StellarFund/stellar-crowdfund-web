"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@/hooks/useWallet";
import { claimRefund, getRefundableAmount, hasClaimedRefund } from "@/lib/contracts";
import { formatTokenAmount, isDeadlinePassed } from "@/lib/format";
import { stellarExpertTxUrl } from "@/lib/stellar";
import { Spinner } from "@/components/ui/Spinner";
import type { Campaign, TransactionProgress } from "@/types";

interface RefundButtonProps {
  campaign: Campaign;
  onRefunded?: () => void;
}

function isEligible(campaign: Campaign): boolean {
  if (campaign.status === "cancelled" || campaign.status === "expired") return true;
  return campaign.status === "active" && isDeadlinePassed(campaign.deadline) && campaign.raised < campaign.goal;
}

export function RefundButton({ campaign, onRefunded }: RefundButtonProps) {
  const { isConnected, publicKey, connect } = useWallet();
  const [refundableAmount, setRefundableAmount] = useState<number | null>(null);
  const [alreadyClaimed, setAlreadyClaimed] = useState(false);
  const [progress, setProgress] = useState<TransactionProgress>({ stage: "idle" });

  const eligible = isEligible(campaign);

  useEffect(() => {
    if (!eligible || !isConnected || !publicKey) {
      setRefundableAmount(null);
      return;
    }
    let cancelled = false;
    Promise.all([
      getRefundableAmount(campaign.contractAddress, campaign.id, publicKey),
      hasClaimedRefund(campaign.contractAddress, campaign.id, publicKey),
    ]).then(([amount, claimed]) => {
      if (cancelled) return;
      setRefundableAmount(amount);
      setAlreadyClaimed(claimed);
    });
    return () => {
      cancelled = true;
    };
  }, [eligible, isConnected, publicKey, campaign.contractAddress, campaign.id]);

  if (!eligible) return null;

  async function handleClaim() {
    if (!publicKey) {
      await connect();
      return;
    }

    setProgress({ stage: "building" });
    try {
      const txHash = await claimRefund({
        campaignId: campaign.id,
        contractAddress: campaign.contractAddress,
        backer: publicKey,
        onStage: (stage) => setProgress({ stage }),
      });
      setProgress({ stage: "success", txHash });
      setAlreadyClaimed(true);
      onRefunded?.();
    } catch (err) {
      setProgress({
        stage: "error",
        error: err instanceof Error ? err.message : "Failed to claim refund.",
      });
    }
  }

  const isBusy = progress.stage === "building" || progress.stage === "signing" || progress.stage === "submitting";

  return (
    <div className="rounded-xl border border-warning/30 bg-warning/5 p-4">
      <p className="text-sm font-medium text-foreground">This campaign is eligible for refunds.</p>
      {isConnected && refundableAmount !== null && refundableAmount > 0 && !alreadyClaimed && (
        <p className="mt-1 text-sm text-muted">
          You can reclaim {formatTokenAmount(refundableAmount, campaign.token.symbol)}.
        </p>
      )}

      {progress.stage === "success" ? (
        <div className="mt-3 text-sm text-success">
          Refund claimed.{" "}
          {progress.txHash && (
            <a
              href={stellarExpertTxUrl(progress.txHash)}
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-2"
            >
              View transaction
            </a>
          )}
        </div>
      ) : alreadyClaimed ? (
        <p className="mt-3 text-sm text-muted">You&apos;ve already claimed your refund.</p>
      ) : (
        <button
          type="button"
          onClick={handleClaim}
          disabled={isBusy || (isConnected && refundableAmount === 0)}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-warning px-4 py-2 text-sm font-semibold text-black transition hover:bg-warning/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isBusy && <Spinner size="sm" className="border-black/30 border-t-black" />}
          {!isConnected
            ? "Connect wallet to claim refund"
            : isBusy
              ? progress.stage === "signing"
                ? "Awaiting signature…"
                : progress.stage === "submitting"
                  ? "Submitting…"
                  : "Preparing…"
              : "Claim refund"}
        </button>
      )}

      {progress.stage === "error" && <p className="mt-2 text-sm text-danger">{progress.error}</p>}
    </div>
  );
}
