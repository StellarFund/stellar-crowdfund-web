"use client";

import { useCallback, useEffect, useState } from "react";
import { getCampaign } from "@/lib/contracts";
import type { Campaign } from "@/types";

interface UseCampaignResult {
  campaign: Campaign | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useCampaign(id: string): UseCampaignResult {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refetchToken, setRefetchToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    getCampaign(id)
      .then((result) => {
        if (!cancelled) setCampaign(result);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load campaign.");
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, refetchToken]);

  const refetch = useCallback(() => setRefetchToken((t) => t + 1), []);

  return { campaign, isLoading, error, refetch };
}
