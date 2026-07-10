import { formatDistanceToNowStrict, isPast } from "date-fns";

export function truncateAddress(address: string, chars = 4): string {
  if (address.length <= chars * 2 + 3) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function formatAmount(amount: number, decimals = 2): string {
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
}

export function formatTokenAmount(amount: number, symbol: string): string {
  return `${formatAmount(amount)} ${symbol}`;
}

export function formatUsd(amount: number): string {
  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export function formatPercentage(raised: number, goal: number): number {
  if (goal <= 0) return 0;
  return Math.min(100, Math.round((raised / goal) * 100));
}

export function formatDeadline(deadline: string): string {
  const date = new Date(deadline);
  if (isPast(date)) return "Ended";
  return `${formatDistanceToNowStrict(date)} left`;
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function isDeadlinePassed(deadline: string): boolean {
  return isPast(new Date(deadline));
}

export function daysRemaining(deadline: string): number {
  const diff = new Date(deadline).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

const CAMPAIGN_STATUS_LABEL: Record<string, string> = {
  active: "Active",
  funded: "Funded",
  completed: "Completed",
  expired: "Expired",
  cancelled: "Cancelled",
};

export function formatCampaignStatus(status: string): string {
  return CAMPAIGN_STATUS_LABEL[status] ?? status;
}

const MILESTONE_STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  submitted: "Proof Submitted",
  approved: "Approved",
  rejected: "Rejected",
  released: "Released",
};

export function formatMilestoneStatus(status: string): string {
  return MILESTONE_STATUS_LABEL[status] ?? status;
}
