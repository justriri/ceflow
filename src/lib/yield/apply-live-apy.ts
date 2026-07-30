import type { YieldOpportunity } from "@/types/yield";

/**
 * Returns a new opportunities array with `apy` overridden by live rates
 * where a matching DefiLlama pool was found. Opportunities without a
 * `defiLlamaPoolId`, or whose pool didn't resolve, keep their static
 * placeholder untouched. Pure function — the scoring engine never needs to
 * know whether a rate is live or static.
 */
export function applyLiveApy(
  opportunities: YieldOpportunity[],
  poolApys: Record<string, number>,
): YieldOpportunity[] {
  return opportunities.map((opportunity) => {
    if (!opportunity.defiLlamaPoolId) return opportunity;
    const liveApy = poolApys[opportunity.defiLlamaPoolId];
    if (liveApy === undefined) return opportunity;

    return {
      ...opportunity,
      apy: {
        value: liveApy,
        isEstimate: false,
        note: `Live rate from DefiLlama, fetched just now.`,
      },
    };
  });
}
