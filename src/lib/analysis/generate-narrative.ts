import type { PortfolioSnapshot } from "@/lib/analysis/types";
import { calculateConcentration, calculateEffectiveApy } from "@/lib/analysis/diversification";
import { getRankedFor } from "@/lib/analysis/snapshot-helpers";
import { formatUsd } from "@/lib/analysis/format";

/**
 * Deterministic, template-composed conversational summary — not a live LLM
 * call (see project notes). Every sentence is conditioned on real numbers
 * from the snapshot, so it changes exactly when the underlying data does.
 */
export function generateNarrative(snapshot: PortfolioSnapshot): string {
  const { positions, idleBalances, totalIdleUsd } = snapshot;

  if (positions.length === 0 && idleBalances.length === 0) {
    return "You don't have any stablecoin balance yet — deposit funds to get a personalized strategy.";
  }

  const sentences: string[] = [];
  const concentration = calculateConcentration(snapshot);
  const effectiveApy = calculateEffectiveApy(snapshot);

  if (positions.length === 0) {
    sentences.push(
      `You're holding ${formatUsd(totalIdleUsd)} in stablecoins that aren't deployed anywhere yet.`,
    );
  } else {
    sentences.push(
      `Your deployed positions are earning an effective ${effectiveApy.toFixed(2)}% APY across ${concentration.distinctProtocolCount} protocol${concentration.distinctProtocolCount === 1 ? "" : "s"}.`,
    );
  }

  if (
    concentration.largestPositionShare !== null &&
    concentration.distinctProtocolCount === 1 &&
    concentration.largestPositionShare >= 0.85
  ) {
    sentences.push(
      `Your portfolio is currently concentrated in a single protocol (${concentration.largestPositionProtocol}).`,
    );
  } else if (concentration.largestPositionShare !== null && concentration.largestPositionShare >= 0.6) {
    sentences.push(
      `Most of your deployed capital (${Math.round(concentration.largestPositionShare * 100)}%) sits in ${concentration.largestPositionProtocol}.`,
    );
  }

  if (idleBalances.length > 0) {
    const symbols = [...new Set(idleBalances.map((b) => b.symbol))].join(", ");
    sentences.push(`You currently have idle ${symbols} that could be earning yield.`);
  }

  // Compare the largest position against the ranking for ITS OWN asset —
  // never a different asset's ranking, even if that's the one currently
  // selected in the Recommendations tab.
  if (positions.length > 0) {
    const currentTopPosition = [...positions].sort((a, b) => b.currentUsdValue - a.currentUsdValue)[0];
    const rankedForAsset = getRankedFor(snapshot, currentTopPosition.stablecoinSymbol);
    const topRanked = rankedForAsset[0];
    const currentScored = rankedForAsset.find(
      (r) => r.opportunity.id === currentTopPosition.opportunityId,
    );

    if (topRanked && currentTopPosition.opportunityId === topRanked.opportunity.id) {
      sentences.push(`Remaining in ${currentTopPosition.protocolName} is currently the best risk-adjusted strategy.`);
    } else if (topRanked) {
      // A protocol with a higher raw APY than the user's current position,
      // but a lower overall (risk-adjusted) score — the interesting
      // "yes, but" comparison, not just "X is better."
      const higherApyButLowerRanked = rankedForAsset.find(
        (r) =>
          r.opportunity.apy.value > currentTopPosition.apyValue &&
          currentScored !== undefined &&
          r.score < currentScored.score,
      );
      if (higherApyButLowerRanked) {
        sentences.push(
          `${higherApyButLowerRanked.opportunity.protocolName} offers a higher APY, but the additional ${higherApyButLowerRanked.opportunity.riskLevel === "high" ? "protocol" : "liquidity"} risk reduces its overall attractiveness for your selected risk profile.`,
        );
      } else {
        sentences.push(
          `${topRanked.opportunity.protocolName} currently offers a better risk-adjusted return than your position in ${currentTopPosition.protocolName}.`,
        );
      }
    }
  }

  return sentences.join(" ");
}
