import type { PortfolioSnapshot } from "@/lib/analysis/types";

export interface ConcentrationInfo {
  /** Share (0-1) of deployed value in the single largest position. Null if nothing is deployed. */
  largestPositionShare: number | null;
  largestPositionProtocol: string | null;
  distinctProtocolCount: number;
}

export function calculateConcentration(snapshot: PortfolioSnapshot): ConcentrationInfo {
  const { positions, totalDeployedUsd } = snapshot;
  const distinctProtocolCount = new Set(positions.map((p) => p.opportunityId)).size;

  if (totalDeployedUsd <= 0 || positions.length === 0) {
    return { largestPositionShare: null, largestPositionProtocol: null, distinctProtocolCount };
  }

  const largest = positions.reduce((max, p) => (p.currentUsdValue > max.currentUsdValue ? p : max));
  return {
    largestPositionShare: largest.currentUsdValue / totalDeployedUsd,
    largestPositionProtocol: largest.protocolName,
    distinctProtocolCount,
  };
}

/** Value-weighted average APY across deployed positions only (idle capital earns 0). */
export function calculateEffectiveApy(snapshot: PortfolioSnapshot): number {
  const { positions, totalDeployedUsd } = snapshot;
  if (totalDeployedUsd <= 0) return 0;
  return positions.reduce((sum, p) => sum + p.apyValue * p.currentUsdValue, 0) / totalDeployedUsd;
}

/** Value-weighted average APY across the whole portfolio, idle capital counted as earning 0%. */
export function calculateBlendedApy(snapshot: PortfolioSnapshot): number {
  if (snapshot.totalUsd <= 0) return 0;
  const weightedDeployed = snapshot.positions.reduce(
    (sum, p) => sum + p.apyValue * p.currentUsdValue,
    0,
  );
  return weightedDeployed / snapshot.totalUsd;
}
