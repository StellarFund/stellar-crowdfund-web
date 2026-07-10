import {
  REGISTRY_CONTRACT_ID,
  addressToScVal,
  amountToScVal,
  invokeContract,
  readContract,
  stringToScVal,
} from "@/lib/stellar";
import {
  demoBackCampaign,
  demoClaimRefund,
  demoSubmitMilestoneProof,
  getDemoBackerRefundAmount,
  getDemoCampaign,
  getDemoContributions,
  getDemoStats,
  isDemoRefundClaimed,
  listDemoCampaigns,
} from "@/lib/demoStore";
import type { Campaign, CampaignFilters, Contribution, PlatformStats } from "@/types";

/**
 * Contract interaction layer. When NEXT_PUBLIC_REGISTRY_CONTRACT_ID is
 * configured, every function talks to the deployed registry/campaign
 * contracts over Soroban RPC. Otherwise it transparently falls back to
 * the local in-memory demo store so the UI stays fully functional
 * before the contracts repo has a live deployment. Callers (hooks)
 * never need to know which source served the data.
 */

const usingLiveContracts = () => Boolean(REGISTRY_CONTRACT_ID);

function applyFilters(campaigns: Campaign[], filters?: CampaignFilters): Campaign[] {
  let result = campaigns;

  if (filters?.status && filters.status !== "all") {
    result = result.filter((c) => c.status === filters.status);
  }

  if (filters?.search) {
    const query = filters.search.toLowerCase();
    result = result.filter((c) => c.title.toLowerCase().includes(query));
  }

  switch (filters?.sort) {
    case "most-funded":
      result = [...result].sort((a, b) => b.raised - a.raised);
      break;
    case "ending-soon":
      result = [...result].sort(
        (a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
      );
      break;
    case "newest":
    default:
      result = [...result].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }

  return result;
}

export async function listCampaigns(filters?: CampaignFilters): Promise<Campaign[]> {
  if (usingLiveContracts()) {
    const campaigns = await readContract<Campaign[]>(REGISTRY_CONTRACT_ID, "list_campaigns");
    return applyFilters(campaigns, filters);
  }
  return applyFilters(listDemoCampaigns(), filters);
}

export async function getCampaign(id: string): Promise<Campaign | null> {
  if (usingLiveContracts()) {
    return readContract<Campaign | null>(REGISTRY_CONTRACT_ID, "get_campaign", [stringToScVal(id)]);
  }
  return getDemoCampaign(id);
}

export async function getContributions(campaignId: string): Promise<Contribution[]> {
  if (usingLiveContracts()) {
    return readContract<Contribution[]>(REGISTRY_CONTRACT_ID, "get_contributions", [
      stringToScVal(campaignId),
    ]);
  }
  return getDemoContributions(campaignId);
}

export async function getPlatformStats(): Promise<PlatformStats> {
  if (usingLiveContracts()) {
    return readContract<PlatformStats>(REGISTRY_CONTRACT_ID, "platform_stats");
  }
  return getDemoStats();
}

export async function backCampaign(params: {
  campaignId: string;
  contractAddress: string;
  amount: number;
  backer: string;
  onStage?: (stage: "building" | "signing" | "submitting") => void;
}): Promise<string> {
  const { campaignId, contractAddress, amount, backer, onStage } = params;

  if (usingLiveContracts()) {
    return invokeContract(
      contractAddress,
      "back",
      [addressToScVal(backer), amountToScVal(amount)],
      backer,
      onStage
    );
  }

  onStage?.("building");
  onStage?.("signing");
  onStage?.("submitting");
  return demoBackCampaign(campaignId, backer, amount);
}

export async function claimRefund(params: {
  campaignId: string;
  contractAddress: string;
  backer: string;
  onStage?: (stage: "building" | "signing" | "submitting") => void;
}): Promise<string> {
  const { campaignId, contractAddress, backer, onStage } = params;

  if (usingLiveContracts()) {
    return invokeContract(contractAddress, "claim_refund", [addressToScVal(backer)], backer, onStage);
  }

  onStage?.("building");
  onStage?.("signing");
  onStage?.("submitting");
  return demoClaimRefund(campaignId, backer);
}

export async function submitMilestoneProof(params: {
  campaignId: string;
  contractAddress: string;
  milestoneId: string;
  proofUrl: string;
  creator: string;
  onStage?: (stage: "building" | "signing" | "submitting") => void;
}): Promise<string> {
  const { campaignId, contractAddress, milestoneId, proofUrl, creator, onStage } = params;

  if (usingLiveContracts()) {
    return invokeContract(
      contractAddress,
      "submit_proof",
      [stringToScVal(milestoneId), stringToScVal(proofUrl)],
      creator,
      onStage
    );
  }

  onStage?.("building");
  onStage?.("signing");
  onStage?.("submitting");
  return demoSubmitMilestoneProof(campaignId, milestoneId, proofUrl);
}

export async function getRefundableAmount(contractAddress: string, campaignId: string, backer: string): Promise<number> {
  if (usingLiveContracts()) {
    return readContract<number>(contractAddress, "refundable_amount", [addressToScVal(backer)]);
  }
  return getDemoBackerRefundAmount(campaignId, backer);
}

export async function hasClaimedRefund(contractAddress: string, campaignId: string, backer: string): Promise<boolean> {
  if (usingLiveContracts()) {
    return readContract<boolean>(contractAddress, "has_claimed_refund", [addressToScVal(backer)]);
  }
  return isDemoRefundClaimed(campaignId, backer);
}
