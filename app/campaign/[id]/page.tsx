"use client";

import Link from "next/link";
import { useCampaign } from "@/hooks/useCampaign";
import { useContributions } from "@/hooks/useContributions";
import { useWallet } from "@/hooks/useWallet";
import { formatDate, formatDistanceLabel, formatTokenAmount, truncateAddress } from "@/lib/format";
import { stellarExpertAccountUrl, stellarExpertTxUrl } from "@/lib/stellar";
import { CampaignHeader } from "@/components/campaign/CampaignHeader";
import { CampaignStats } from "@/components/campaign/CampaignStats";
import { MilestoneList } from "@/components/milestone/MilestoneList";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";

export default function CampaignDetailPage({ params }: { params: { id: string } }) {
  const { campaign, isLoading, error, refetch } = useCampaign(params.id);
  const { contributions, isLoading: contributionsLoading, refetch: refetchContributions } = useContributions(
    params.id
  );
  const { publicKey } = useWallet();

  function handleChanged() {
    refetch();
    refetchContributions();
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <ErrorState message={error} onRetry={refetch} />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <EmptyState
          title="Campaign not found"
          description="It may have been removed, or the link is incorrect."
          action={
            <Link
              href="/explore"
              className="rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-400"
            >
              Explore campaigns
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <CampaignHeader campaign={campaign} />

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="flex flex-col gap-10 lg:col-span-2">
          <section>
            <h2 className="mb-3 text-lg font-semibold text-foreground">About this campaign</h2>
            <p className="whitespace-pre-line text-sm leading-relaxed text-muted">{campaign.description}</p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-foreground">Milestones</h2>
            <MilestoneList campaign={campaign} viewerAddress={publicKey} onChanged={handleChanged} />
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-foreground">
              Backers <span className="text-muted">({campaign.backerCount})</span>
            </h2>
            {contributionsLoading ? (
              <div className="flex justify-center py-8">
                <Spinner />
              </div>
            ) : contributions.length === 0 ? (
              <EmptyState title="No contributions yet" description="Be the first to back this campaign." />
            ) : (
              <div className="scrollbar-thin max-h-96 divide-y divide-border overflow-y-auto rounded-xl border border-border bg-surface">
                {contributions.map((contribution) => (
                  <div
                    key={contribution.id}
                    className="flex items-center justify-between px-4 py-3 text-sm transition hover:bg-white/5"
                  >
                    <div className="flex items-center gap-2">
                      <a
                        href={stellarExpertAccountUrl(contribution.backer)}
                        target="_blank"
                        rel="noreferrer"
                        className="font-mono text-foreground underline-offset-2 hover:underline"
                      >
                        {truncateAddress(contribution.backer)}
                      </a>
                      <span className="text-xs text-muted">{formatDistanceLabel(contribution.createdAt)}</span>
                    </div>
                    <a
                      href={stellarExpertTxUrl(contribution.txHash)}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-foreground underline-offset-2 hover:underline"
                    >
                      {formatTokenAmount(contribution.amount, campaign.token.symbol)}
                    </a>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-20">
            <CampaignStats campaign={campaign} onChanged={handleChanged} />
          </div>
        </div>
      </div>

      <p className="mt-10 text-center text-xs text-muted">
        Campaign launched {formatDate(campaign.createdAt)}
      </p>
    </div>
  );
}
