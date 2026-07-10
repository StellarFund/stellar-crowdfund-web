import Image from "next/image";
import Link from "next/link";
import {
  campaignStatusBadgeClasses,
  formatCampaignStatus,
  formatDeadline,
  formatTokenAmount,
  truncateAddress,
} from "@/lib/format";
import { FundingProgress } from "@/components/campaign/FundingProgress";
import type { Campaign } from "@/types";

interface CampaignCardProps {
  campaign: Campaign;
}

export function CampaignCard({ campaign }: CampaignCardProps) {
  return (
    <Link
      href={`/campaign/${campaign.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface transition hover:border-brand-500/50 hover:shadow-lg hover:shadow-brand-500/5"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-surface-raised">
        {campaign.imageUrl && (
          <Image
            src={campaign.imageUrl}
            alt={campaign.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        )}
        <span
          className={`absolute left-3 top-3 rounded-full border px-2.5 py-1 text-xs font-medium backdrop-blur ${campaignStatusBadgeClasses(
            campaign.status
          )}`}
        >
          {formatCampaignStatus(campaign.status)}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <p className="text-xs text-muted">{truncateAddress(campaign.creator)}</p>
          <h3 className="mt-0.5 line-clamp-2 text-base font-semibold text-foreground">{campaign.title}</h3>
        </div>

        <FundingProgress raised={campaign.raised} goal={campaign.goal} />

        <div className="mt-auto flex items-center justify-between text-sm">
          <div>
            <p className="font-semibold text-foreground">
              {formatTokenAmount(campaign.raised, campaign.token.symbol)}
            </p>
            <p className="text-xs text-muted">of {formatTokenAmount(campaign.goal, campaign.token.symbol)}</p>
          </div>
          <div className="text-right">
            <p className="font-semibold text-foreground">{campaign.backerCount}</p>
            <p className="text-xs text-muted">backers</p>
          </div>
          <div className="text-right">
            <p className="font-semibold text-foreground">{formatDeadline(campaign.deadline)}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
