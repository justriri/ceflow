import type { StablecoinSymbol } from "@/config/tokens";
import type { PriceContext } from "@/lib/yield/prices";
import { getStablecoinUsdPrice } from "@/lib/yield/prices";
import type { PortfolioSnapshot, ScenarioResult } from "@/lib/analysis/types";
import { getRankedFor } from "@/lib/analysis/snapshot-helpers";
import { calculateBlendedApy } from "@/lib/analysis/diversification";

/**
 * Hypothetical: what happens if `amount` of `symbol` were deposited into
 * the top-ranked opportunity for that asset. Purely a read-only projection
 * — it never touches positions or prepares a transaction; that only
 * happens through the real Optimize Portfolio / AI Actions flows, so a
 * user exploring "what if" scenarios can never accidentally trigger one.
 */
export function simulateScenario(
  snapshot: PortfolioSnapshot,
  priceContext: PriceContext,
  symbol: StablecoinSymbol,
  amount: number,
): ScenarioResult | null {
  if (!Number.isFinite(amount) || amount <= 0) return null;

  const ranked = getRankedFor(snapshot, symbol);
  const best = ranked[0];
  if (!best) return null;

  const amountUsd = amount * getStablecoinUsdPrice(symbol, priceContext);
  const additionalAnnualEarnings = (amount * best.opportunity.apy.value) / 100;

  const currentEffectiveApy = calculateBlendedApy(snapshot);
  const currentTotalAnnual = (currentEffectiveApy / 100) * snapshot.totalUsd;
  const newTotalUsd = snapshot.totalUsd + amountUsd;
  const projectedEffectiveApyAfterMove =
    newTotalUsd > 0 ? ((currentTotalAnnual + additionalAnnualEarnings) / newTotalUsd) * 100 : 0;

  return {
    symbol,
    amount,
    amountUsd,
    targetOpportunityId: best.opportunity.id,
    targetProtocolName: best.opportunity.protocolName,
    projectedApy: best.opportunity.apy.value,
    currentEffectiveApy,
    projectedEffectiveApyAfterMove,
    additionalAnnualEarnings,
    reasoning: `${best.opportunity.protocolName} is the top-ranked option for ${symbol} at your current risk tolerance. Depositing ${amount.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${symbol} (≈$${amountUsd.toLocaleString(undefined, { maximumFractionDigits: 2 })}) there would add an estimated $${additionalAnnualEarnings.toLocaleString(undefined, { maximumFractionDigits: 2 })}/year.`,
  };
}
