export type StellarNetwork = "testnet" | "public";

export type CampaignStatus = "active" | "funded" | "completed" | "expired" | "cancelled";

export type MilestoneStatus = "pending" | "submitted" | "approved" | "rejected" | "released";

export interface Token {
  /** "native" for XLM, otherwise the SAC/asset contract address */
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  isNative: boolean;
}

export interface Milestone {
  id: string;
  campaignId: string;
  index: number;
  title: string;
  description: string;
  /** percentage of the total funding goal, 0-100 */
  percentage: number;
  amount: number;
  deadline: string;
  status: MilestoneStatus;
  proofUrl?: string;
  proofSubmittedAt?: string;
  releasedAt?: string;
}

export interface Contribution {
  id: string;
  campaignId: string;
  backer: string;
  amount: number;
  txHash: string;
  createdAt: string;
}

export interface Campaign {
  id: string;
  contractAddress: string;
  title: string;
  description: string;
  imageUrl?: string;
  websiteUrl?: string;
  category: string;
  creator: string;
  token: Token;
  goal: number;
  raised: number;
  backerCount: number;
  deadline: string;
  createdAt: string;
  status: CampaignStatus;
  milestones: Milestone[];
}

export interface PlatformStats {
  totalCampaigns: number;
  totalRaised: number;
  totalBackers: number;
}

export type SortOption = "newest" | "most-funded" | "ending-soon";

export interface CampaignFilters {
  status?: CampaignStatus | "all";
  search?: string;
  sort?: SortOption;
}

export interface WalletState {
  isConnected: boolean;
  isConnecting: boolean;
  publicKey: string | null;
  network: StellarNetwork | null;
  error: string | null;
}

export interface TransactionProgress {
  stage: "idle" | "building" | "signing" | "submitting" | "success" | "error";
  message?: string;
  txHash?: string;
  error?: string;
}
