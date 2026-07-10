import { demoCampaigns, demoContributions } from "@/lib/demoData";
import { isDeadlinePassed } from "@/lib/format";
import type { Campaign, Contribution, PlatformStats } from "@/types";

/**
 * Mutable, in-memory clone of the demo dataset. Backs write paths
 * (backing a campaign, submitting milestone proof, claiming a refund)
 * when NEXT_PUBLIC_REGISTRY_CONTRACT_ID isn't set, so the UI is fully
 * interactive during local development.
 */

let campaigns: Campaign[] = demoCampaigns.map((c) => ({ ...c, milestones: c.milestones.map((m) => ({ ...m })) }));
let contributions: Record<string, Contribution[]> = Object.fromEntries(
  Object.entries(demoContributions).map(([id, list]) => [id, [...list]])
);
const refundedBackers = new Set<string>();

function fakeTxHash(): string {
  return Array.from({ length: 64 })
    .map(() => "0123456789abcdef"[Math.floor(Math.random() * 16)])
    .join("");
}

export function listDemoCampaigns(): Campaign[] {
  return campaigns;
}

export function getDemoCampaign(id: string): Campaign | null {
  return campaigns.find((c) => c.id === id) ?? null;
}

export function getDemoContributions(campaignId: string): Contribution[] {
  return contributions[campaignId] ?? [];
}

export function getDemoStats(): PlatformStats {
  return {
    totalCampaigns: campaigns.length,
    totalRaised: campaigns.reduce((sum, c) => sum + c.raised, 0),
    totalBackers: campaigns.reduce((sum, c) => sum + c.backerCount, 0),
  };
}

export async function demoBackCampaign(campaignId: string, backer: string, amount: number): Promise<string> {
  const campaign = campaigns.find((c) => c.id === campaignId);
  if (!campaign) throw new Error("Campaign not found.");
  if (campaign.status !== "active") throw new Error("This campaign is no longer accepting contributions.");
  if (isDeadlinePassed(campaign.deadline)) throw new Error("This campaign's deadline has passed.");

  const txHash = fakeTxHash();
  const existing = contributions[campaignId] ?? [];
  const hasBackedBefore = existing.some((c) => c.backer === backer);

  contributions[campaignId] = [
    {
      id: `${campaignId}-contribution-${existing.length}`,
      campaignId,
      backer,
      amount,
      txHash,
      createdAt: new Date().toISOString(),
    },
    ...existing,
  ];

  campaign.raised += amount;
  if (!hasBackedBefore) campaign.backerCount += 1;
  if (campaign.raised >= campaign.goal) campaign.status = "funded";

  return txHash;
}

export async function demoSubmitMilestoneProof(
  campaignId: string,
  milestoneId: string,
  proofUrl: string
): Promise<string> {
  const campaign = campaigns.find((c) => c.id === campaignId);
  const milestone = campaign?.milestones.find((m) => m.id === milestoneId);
  if (!campaign || !milestone) throw new Error("Milestone not found.");

  milestone.status = "submitted";
  milestone.proofUrl = proofUrl;
  milestone.proofSubmittedAt = new Date().toISOString();

  return fakeTxHash();
}

export async function demoClaimRefund(campaignId: string, backer: string): Promise<string> {
  const campaign = campaigns.find((c) => c.id === campaignId);
  if (!campaign) throw new Error("Campaign not found.");

  const isRefundEligible =
    campaign.status === "cancelled" ||
    (campaign.status === "expired") ||
    (campaign.status === "active" && isDeadlinePassed(campaign.deadline) && campaign.raised < campaign.goal);
  if (!isRefundEligible) throw new Error("This campaign is not eligible for refunds.");

  const key = `${campaignId}:${backer}`;
  if (refundedBackers.has(key)) throw new Error("You've already claimed a refund for this campaign.");

  const backerContributions = (contributions[campaignId] ?? []).filter((c) => c.backer === backer);
  if (backerContributions.length === 0) throw new Error("No contribution found for this wallet.");

  refundedBackers.add(key);
  return fakeTxHash();
}

export function getDemoBackerRefundAmount(campaignId: string, backer: string): number {
  return (contributions[campaignId] ?? [])
    .filter((c) => c.backer === backer)
    .reduce((sum, c) => sum + c.amount, 0);
}

export function isDemoRefundClaimed(campaignId: string, backer: string): boolean {
  return refundedBackers.has(`${campaignId}:${backer}`);
}

export function resetDemoStore(): void {
  campaigns = demoCampaigns.map((c) => ({ ...c, milestones: c.milestones.map((m) => ({ ...m })) }));
  contributions = Object.fromEntries(
    Object.entries(demoContributions).map(([id, list]) => [id, [...list]])
  );
  refundedBackers.clear();
}
