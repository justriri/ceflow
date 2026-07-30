"use client";

import { useMemo } from "react";
import { useCeloBalances } from "@/hooks/use-celo-balances";
import { usePositions } from "@/hooks/use-positions";
import { useLiveMarketData } from "@/hooks/use-live-market-data";
import { YIELD_OPPORTUNITIES } from "@/lib/protocols";
import { applyLiveApy } from "@/lib/yield/apply-live-apy";
import { buildPortfolioSnapshot } from "@/lib/analysis/build-snapshot";
import { analyzePortfolio } from "@/lib/analysis/analyze-portfolio";
import type { UserPreferences } from "@/types/preferences";
import type { PortfolioAnalysis } from "@/lib/analysis/types";

/**
 * Recomputes the full portfolio analysis whenever wallet balances, active
 * positions, or live APY data change — all three are already reactive
 * (wagmi/React Query), so this is a pure useMemo over their outputs, the
 * same pattern useRecommendations uses. No separate polling or effects.
 */
export function usePortfolioAnalysis(preferences: UserPreferences): PortfolioAnalysis {
  const { stablecoins } = useCeloBalances();
  const { positions } = usePositions();
  const { data: liveData } = useLiveMarketData();

  const priceContext = useMemo(
    () => ({
      celoUsdPrice: liveData?.celoUsdPrice ?? null,
      forexRates: liveData?.forexRates ?? null,
    }),
    [liveData],
  );

  // Same live-APY merge useRecommendations performs — Position.apyValue
  // (from usePositions) is already computed against this same merge, so
  // the snapshot's opportunity rankings stay at the same freshness.
  const opportunities = useMemo(
    () => applyLiveApy(YIELD_OPPORTUNITIES, liveData?.poolApys ?? {}),
    [liveData],
  );

  return useMemo(() => {
    const snapshot = buildPortfolioSnapshot(
      stablecoins,
      positions,
      preferences,
      priceContext,
      opportunities,
    );
    return analyzePortfolio(snapshot);
  }, [stablecoins, positions, preferences, priceContext, opportunities]);
}
