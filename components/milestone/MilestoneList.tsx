import { EmptyState } from "@/components/ui/EmptyState";
import { MilestoneCard } from "@/components/milestone/MilestoneCard";
import type { Campaign } from "@/types";

interface MilestoneListProps {
  campaign: Campaign;
  viewerAddress?: string | null;
  onChanged?: () => void;
}

export function MilestoneList({ campaign, viewerAddress, onChanged }: MilestoneListProps) {
  if (campaign.milestones.length === 0) {
    return <EmptyState title="No milestones defined" description="This campaign releases funds as a single payout." />;
  }

  const isCreatorViewing = Boolean(viewerAddress && viewerAddress === campaign.creator);

  return (
    <div className="flex flex-col gap-3">
      {campaign.milestones
        .slice()
        .sort((a, b) => a.index - b.index)
        .map((milestone) => (
          <MilestoneCard
            key={milestone.id}
            campaign={campaign}
            milestone={milestone}
            isCreatorViewing={isCreatorViewing}
            creatorAddress={viewerAddress ?? undefined}
            onChanged={onChanged}
          />
        ))}
    </div>
  );
}
