import type { ScoredOpportunity } from "@/lib/scoring/types";

/**
 * One comparative sentence for a single opportunity card, contrasting it
 * against the top pick when it isn't the top pick itself. Same "yes, but"
 * pattern as the portfolio narrative, scoped to just this one comparison.
 */
export function generateCardReasoning(scored: ScoredOpportunity, topPick: ScoredOpportunity): string | null {
  if (scored.opportunity.id === topPick.opportunity.id) {
    return null;
  }

  if (scored.opportunity.apy.value > topPick.opportunity.apy.value) {
    return `${scored.opportunity.protocolName} offers a higher APY than ${topPick.opportunity.protocolName}, but its ${scored.opportunity.riskLevel} risk level reduces its overall attractiveness for your selected risk profile.`;
  }

  return `${topPick.opportunity.protocolName} currently ranks higher on risk-adjusted return than ${scored.opportunity.protocolName} for this asset.`;
}
