import type { AllocationMove, OptimizationPlan, PortfolioSnapshot } from "@/lib/analysis/types";
import { getRankedFor } from "@/lib/analysis/snapshot-helpers";
import { calculateBlendedApy } from "@/lib/analysis/diversification";
import { formatPercent, formatUsd } from "@/lib/analysis/format";
import { SWITCH_SCORE_MARGIN } from "@/lib/analysis/generate-actions";

/**
 * Builds one coherent reallocation plan across the whole portfolio. Every
 * move here also appears, individually, as a "switch" or "deposit-idle" AI
 * Action — this reuses the same scoring comparison and margin
 * (SWITCH_SCORE_MARGIN) so the premium plan never recommends something the
 * free AI Actions card wouldn't also flag. What's new here is the
 * portfolio-level before/after projection and preparing the full
 * withdraw+deposit transaction pair per move (the free Actions card only
 * preps the deposit half of a switch).
 */
export function buildOptimizationPlan(snapshot: PortfolioSnapshot): OptimizationPlan {
  const moves: AllocationMove[] = [];
  const { positions, idleBalances } = snapshot;

  for (const position of positions) {
    const ranked = getRankedFor(snapshot, position.stablecoinSymbol);
    const currentScored = ranked.find((r) => r.opportunity.id === position.opportunityId);
    if (!currentScored) continue;
    const better = ranked.find(
      (r) => r.opportunity.id !== position.opportunityId && r.score > currentScored.score * SWITCH_SCORE_MARGIN,
    );
    if (!better) continue;

    const currentAnnual = (position.currentAmount * position.apyValue) / 100;
    const projectedAnnual = (position.currentAmount * better.opportunity.apy.value) / 100;

    moves.push({
      id: `move-${position.opportunityId}-to-${better.opportunity.id}`,
      fromOpportunityId: position.opportunityId,
      fromProtocolName: position.protocolName,
      toOpportunityId: better.opportunity.id,
      toProtocolName: better.opportunity.protocolName,
      stablecoinSymbol: position.stablecoinSymbol,
      amount: position.currentAmount,
      amountUsd: position.currentUsdValue,
      reasoning: `${better.opportunity.protocolName} currently scores meaningfully higher than ${position.protocolName} for ${position.stablecoinSymbol} on a risk-adjusted basis — moving would raise this position's APY from ${formatPercent(position.apyValue)} to ${formatPercent(better.opportunity.apy.value)}.`,
      currentApy: position.apyValue,
      projectedApy: better.opportunity.apy.value,
      estimatedAnnualImprovement: projectedAnnual - currentAnnual,
    });
  }

  for (const idle of idleBalances) {
    const ranked = getRankedFor(snapshot, idle.symbol);
    const best = ranked[0];
    if (!best) continue;

    const projectedAnnual = (idle.amount * best.opportunity.apy.value) / 100;

    moves.push({
      id: `move-idle-${idle.symbol}-to-${best.opportunity.id}`,
      fromOpportunityId: null,
      fromProtocolName: null,
      toOpportunityId: best.opportunity.id,
      toProtocolName: best.opportunity.protocolName,
      stablecoinSymbol: idle.symbol,
      amount: idle.amount,
      amountUsd: idle.usdValue,
      reasoning: `${idle.amount.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${idle.symbol} is sitting idle, earning nothing. ${best.opportunity.protocolName} is the top-ranked option for ${idle.symbol} at your current risk tolerance.`,
      currentApy: 0,
      projectedApy: best.opportunity.apy.value,
      estimatedAnnualImprovement: projectedAnnual,
    });
  }

  const currentEffectiveApy = calculateBlendedApy(snapshot);
  const estimatedAnnualImprovement = moves.reduce((sum, m) => sum + m.estimatedAnnualImprovement, 0);
  const currentTotalAnnual = (currentEffectiveApy / 100) * snapshot.totalUsd;
  const projectedEffectiveApy =
    snapshot.totalUsd > 0 ? ((currentTotalAnnual + estimatedAnnualImprovement) / snapshot.totalUsd) * 100 : 0;

  return {
    hasChanges: moves.length > 0,
    summary:
      moves.length === 0
        ? "Your current allocation already looks optimal — no reallocation is recommended right now."
        : `Reallocating as proposed would raise your effective portfolio APY from ${formatPercent(currentEffectiveApy)} to ${formatPercent(projectedEffectiveApy)}, an estimated ${formatUsd(estimatedAnnualImprovement)}/year improvement.`,
    currentEffectiveApy,
    projectedEffectiveApy,
    estimatedAnnualImprovement,
    moves,
  };
}
