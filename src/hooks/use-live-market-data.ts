"use client";

import { useQuery } from "@tanstack/react-query";
import type { LiveDataResponse } from "@/app/api/live-data/route";

const REFETCH_INTERVAL_MS = 5 * 60 * 1000;

async function fetchLiveData(): Promise<LiveDataResponse> {
  const res = await fetch("/api/live-data");
  if (!res.ok) throw new Error(`Live data fetch failed: ${res.status}`);
  return res.json();
}

export function useLiveMarketData() {
  return useQuery({
    queryKey: ["live-market-data"],
    queryFn: fetchLiveData,
    refetchInterval: REFETCH_INTERVAL_MS,
    staleTime: REFETCH_INTERVAL_MS,
  });
}
