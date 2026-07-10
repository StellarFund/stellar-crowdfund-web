import Image from "next/image";
import { campaignStatusBadgeClasses, formatCampaignStatus, formatDate, truncateAddress } from "@/lib/format";
import { stellarExpertAccountUrl } from "@/lib/stellar";
import { CopyButton } from "@/components/ui/CopyButton";
import type { Campaign } from "@/types";

interface CampaignHeaderProps {
  campaign: Campaign;
}

export function CampaignHeader({ campaign }: CampaignHeaderProps) {
  return (
    <div>
      <div className="relative aspect-[21/9] w-full overflow-hidden rounded-2xl border border-border bg-surface-raised">
        {campaign.imageUrl && (
          <Image
            src={campaign.imageUrl}
            alt={campaign.title}
            fill
            priority
            sizes="(min-width: 1024px) 66vw, 100vw"
            className="object-cover"
          />
        )}
        <span
          className={`absolute left-4 top-4 rounded-full border px-3 py-1 text-xs font-medium backdrop-blur ${campaignStatusBadgeClasses(
            campaign.status
          )}`}
        >
          {formatCampaignStatus(campaign.status)}
        </span>
      </div>

      <div className="mt-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-brand-400">{campaign.category}</p>
          <h1 className="mt-1 text-2xl font-bold text-foreground sm:text-3xl">{campaign.title}</h1>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted">
        <span className="flex items-center gap-1.5">
          Created by
          <a
            href={stellarExpertAccountUrl(campaign.creator)}
            target="_blank"
            rel="noreferrer"
            className="font-mono text-foreground underline-offset-2 hover:underline"
          >
            {truncateAddress(campaign.creator)}
          </a>
          <CopyButton value={campaign.creator} label="Copy creator address" />
        </span>
        <span>Launched {formatDate(campaign.createdAt)}</span>
        {campaign.websiteUrl && (
          <a
            href={campaign.websiteUrl}
            target="_blank"
            rel="noreferrer"
            className="text-brand-300 underline-offset-2 hover:underline"
          >
            Website ↗
          </a>
        )}
      </div>
    </div>
  );
}
