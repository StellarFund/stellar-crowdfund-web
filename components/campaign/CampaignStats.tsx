import { formatTokenAmount } from "@/lib/format";
import { FundingProgress } from "@/components/campaign/FundingProgress";
import { BackCampaignForm } from "@/components/campaign/BackCampaignForm";
import { RefundButton } from "@/components/backed/RefundButton";
import { CountdownTimer } from "@/components/ui/CountdownTimer";
import type { Campaign } from "@/types";

interface CampaignStatsProps {
  campaign: Campaign;
  onChanged?: () => void;
}

export function CampaignStats({ campaign, onChanged }: CampaignStatsProps) {
  return (
    <aside className="flex flex-col gap-5 rounded-2xl border border-border bg-surface p-5">
      <FundingProgress raised={campaign.raised} goal={campaign.goal} />

      <div className="flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold text-foreground">
            {formatTokenAmount(campaign.raised, campaign.token.symbol)}
          </p>
          <p className="text-sm text-muted">
            raised of {formatTokenAmount(campaign.goal, campaign.token.symbol)} goal
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-foreground">{campaign.backerCount}</p>
          <p className="text-sm text-muted">backers</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface-raised p-3">
        <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted">Time remaining</p>
        <CountdownTimer deadline={campaign.deadline} />
      </div>

      <BackCampaignForm campaign={campaign} onBacked={onChanged} />
      <RefundButton campaign={campaign} onRefunded={onChanged} />
    </aside>
  );
}
