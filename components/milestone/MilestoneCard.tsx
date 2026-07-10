import { formatDate, formatTokenAmount } from "@/lib/format";
import { MilestoneStatus } from "@/components/milestone/MilestoneStatus";
import { SubmitProofForm } from "@/components/milestone/SubmitProofForm";
import type { Campaign, Milestone } from "@/types";

interface MilestoneCardProps {
  campaign: Campaign;
  milestone: Milestone;
  isCreatorViewing: boolean;
  creatorAddress?: string;
  onChanged?: () => void;
}

export function MilestoneCard({ campaign, milestone, isCreatorViewing, creatorAddress, onChanged }: MilestoneCardProps) {
  const canSubmitProof =
    isCreatorViewing &&
    creatorAddress &&
    (milestone.status === "pending" || milestone.status === "rejected");

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-muted">Milestone {milestone.index + 1}</p>
          <h4 className="mt-0.5 font-semibold text-foreground">{milestone.title}</h4>
        </div>
        <MilestoneStatus status={milestone.status} />
      </div>

      <p className="mt-2 text-sm text-muted">{milestone.description}</p>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
        <span className="font-medium text-foreground">
          {formatTokenAmount(milestone.amount, campaign.token.symbol)}
          <span className="ml-1 text-muted">({milestone.percentage}%)</span>
        </span>
        <span className="text-muted">Due {formatDate(milestone.deadline)}</span>
      </div>

      {milestone.proofUrl && (milestone.status === "submitted" || milestone.status === "approved" || milestone.status === "released") && (
        <a
          href={milestone.proofUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-block text-sm text-brand-300 underline-offset-2 hover:underline"
        >
          View submitted proof ↗
        </a>
      )}

      {canSubmitProof && (
        <SubmitProofForm
          campaign={campaign}
          milestone={milestone}
          creatorAddress={creatorAddress}
          onSubmitted={onChanged}
        />
      )}
    </div>
  );
}
