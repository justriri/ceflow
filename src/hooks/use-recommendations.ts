"use client";

import { useMemo } from "react";
import { useCeloBalances } from "@/hooks/use-celo-balances";
import { useLiveMarketData } from "@/hooks/use-live-market-data";
import { YIELD_OPPORTUNITIES } from "@/lib/protocols";
import { applyLiveApy } from "@/lib/yield/apply-live-apy";
import { rankOpportunities } from "@/lib/scoring/engine";
import type { UserPreferences } from "@/types/preferences";

export function useRecommendations(preferences: UserPreferences) {
  const { stablecoins } = useCeloBalances();
  const { data: liveData } = useLiveMarketData();

  const balance = useMemo(() => {
    const match = stablecoins.find((s) => s.symbol === preferences.selectedStablecoin);
    if (!match || match.formatted === undefined) return null;
    const parsed = Number(match.formatted);
    return Number.isFinite(parsed) ? parsed : null;
  }, [stablecoins, preferences.selectedStablecoin]);

  // Static registry with live APYs merged in where a DefiLlama pool was
  // found; the scoring engine (rankOpportunities) is unaware this happened
  // and unmodified — it just sees a YieldOpportunity[] with an apy field.
  const opportunities = useMemo(
    () => applyLiveApy(YIELD_OPPORTUNITIES, liveData?.poolApys ?? {}),
    [liveData],
  );

  const ranked = useMemo(
    () => rankOpportunities(opportunities, preferences, balance),
    [opportunities, preferences, balance],
  );

  return {
    top: ranked[0] ?? null,
    // Every other eligible opportunity, uncapped — all verified USDM yield
    // opportunities should be visible, not just executable ones or a fixed
    // top-4. Ranking (order) still comes entirely from the untouched
    // scoring engine; this just controls how much of that order we show.
    alternatives: ranked.slice(1),
    all: ranked,
    balance,
    liveDataFetchedAt: liveData?.fetchedAt ?? null,
  };
}
