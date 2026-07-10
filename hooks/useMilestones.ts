"use client";

import { useMemo } from "react";
import { useCampaign } from "@/hooks/useCampaign";
import type { Milestone } from "@/types";

interface UseMilestonesResult {
  milestones: Milestone[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useMilestones(campaignId: string): UseMilestonesResult {
  const { campaign, isLoading, error, refetch } = useCampaign(campaignId);
  const milestones = useMemo(() => campaign?.milestones ?? [], [campaign]);

  return { milestones, isLoading, error, refetch };
}
