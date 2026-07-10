"use client";

import { useState, type FormEvent } from "react";
import { submitMilestoneProof } from "@/lib/contracts";
import { Spinner } from "@/components/ui/Spinner";
import type { Campaign, Milestone, TransactionProgress } from "@/types";

interface SubmitProofFormProps {
  campaign: Campaign;
  milestone: Milestone;
  creatorAddress: string;
  onSubmitted?: () => void;
}

export function SubmitProofForm({ campaign, milestone, creatorAddress, onSubmitted }: SubmitProofFormProps) {
  const [proofUrl, setProofUrl] = useState("");
  const [progress, setProgress] = useState<TransactionProgress>({ stage: "idle" });

  const isBusy = ["building", "signing", "submitting"].includes(progress.stage);
  const isValidUrl = (() => {
    try {
      new URL(proofUrl);
      return true;
    } catch {
      return false;
    }
  })();

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!isValidUrl) return;

    setProgress({ stage: "building" });
    try {
      await submitMilestoneProof({
        campaignId: campaign.id,
        contractAddress: campaign.contractAddress,
        milestoneId: milestone.id,
        proofUrl,
        creator: creatorAddress,
        onStage: (stage) => setProgress({ stage }),
      });
      setProgress({ stage: "success" });
      setProofUrl("");
      onSubmitted?.();
    } catch (err) {
      setProgress({
        stage: "error",
        error: err instanceof Error ? err.message : "Failed to submit proof.",
      });
    }
  }

  if (progress.stage === "success") {
    return <p className="mt-2 text-sm text-success">Proof submitted for review.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-2 sm:flex-row">
      <input
        type="url"
        placeholder="https://link-to-proof-of-work.com"
        value={proofUrl}
        onChange={(e) => setProofUrl(e.target.value)}
        disabled={isBusy}
        className="flex-1 rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm text-foreground outline-none transition focus:border-brand-400 disabled:opacity-60"
      />
      <button
        type="submit"
        disabled={isBusy || !isValidUrl}
        className="flex items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isBusy && <Spinner size="sm" />}
        {isBusy ? "Submitting…" : "Submit proof"}
      </button>
      {progress.stage === "error" && <p className="text-sm text-danger sm:basis-full">{progress.error}</p>}
    </form>
  );
}
