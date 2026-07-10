"use client";

import { useCallback, useEffect, useState } from "react";
import { getContributions } from "@/lib/contracts";
import type { Contribution } from "@/types";

interface UseContributionsResult {
  contributions: Contribution[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useContributions(campaignId: string): UseContributionsResult {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refetchToken, setRefetchToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    getContributions(campaignId)
      .then((result) => {
        if (!cancelled) setContributions(result);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load contributions.");
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [campaignId, refetchToken]);

  const refetch = useCallback(() => setRefetchToken((t) => t + 1), []);

  return { contributions, isLoading, error, refetch };
}
