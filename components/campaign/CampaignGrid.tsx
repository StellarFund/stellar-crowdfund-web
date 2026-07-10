import { CampaignCard } from "@/components/campaign/CampaignCard";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Campaign } from "@/types";

interface CampaignGridProps {
  campaigns: Campaign[];
  emptyTitle?: string;
  emptyDescription?: string;
}

export function CampaignGrid({
  campaigns,
  emptyTitle = "No campaigns found",
  emptyDescription = "Try adjusting your filters or check back later.",
}: CampaignGridProps) {
  if (campaigns.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {campaigns.map((campaign) => (
        <CampaignCard key={campaign.id} campaign={campaign} />
      ))}
    </div>
  );
}
