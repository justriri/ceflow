import type { PortfolioSnapshot, YieldForecast, YieldForecastPoint } from "@/lib/analysis/types";
import { calculateBlendedApy } from "@/lib/analysis/diversification";

const HORIZONS: { days: number; label: string }[] = [
  { days: 30, label: "30 days" },
  { days: 90, label: "90 days" },
  { days: 365, label: "1 year" },
];

/**
 * Simple (non-compounding) projection at today's blended APY held flat —
 * the honest assumption to disclose, since real APYs move and this doesn't
 * account for each protocol's actual compounding frequency. A floor for
 * comparison, not a promise.
 */
export function forecastYield(snapshot: PortfolioSnapshot): YieldForecast {
  const currentEffectiveApy = calculateBlendedApy(snapshot);
  const dailyRate = currentEffectiveApy / 100 / 365;

  const points: YieldForecastPoint[] = HORIZONS.map(({ days, label }) => {
    const projectedEarnings = snapshot.totalUsd * dailyRate * days;
    return {
      days,
      label,
      projectedEarnings,
      projectedPortfolioValue: snapshot.totalUsd + projectedEarnings,
    };
  });

  return {
    currentEffectiveApy,
    assumptionNote:
      "Simple projection at today's blended APY held flat, with no compounding and no allowance for rates changing — a floor for comparison, not a guarantee.",
    points,
  };
}
