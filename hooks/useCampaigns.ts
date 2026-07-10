"use client";

import { useCallback, useEffect, useState } from "react";
import { listCampaigns } from "@/lib/contracts";
import type { Campaign, CampaignFilters } from "@/types";

interface UseCampaignsResult {
  campaigns: Campaign[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useCampaigns(filters?: CampaignFilters): UseCampaignsResult {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refetchToken, setRefetchToken] = useState(0);

  const status = filters?.status;
  const search = filters?.search;
  const sort = filters?.sort;

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    listCampaigns({ status, search, sort })
      .then((result) => {
        if (!cancelled) setCampaigns(result);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load campaigns.");
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [status, search, sort, refetchToken]);

  const refetch = useCallback(() => setRefetchToken((t) => t + 1), []);

  return { campaigns, isLoading, error, refetch };
}
