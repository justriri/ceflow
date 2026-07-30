import type { AgentAction, PortfolioSnapshot } from "@/lib/analysis/types";
import { calculateConcentration } from "@/lib/analysis/diversification";
import { getRankedFor } from "@/lib/analysis/snapshot-helpers";
import { formatUsd } from "@/lib/analysis/format";

/** How much higher a competing score needs to be before "switch" is worth suggesting — avoids churn over marginal differences. */
const SWITCH_SCORE_MARGIN = 1.15;

export function generateActions(snapshot: PortfolioSnapshot): AgentAction[] {
  const actions: AgentAction[] = [];
  const { positions, idleBalances } = snapshot;
  const concentration = calculateConcentration(snapshot);

  // Deposit idle funds — ranked using that specific idle asset, not
  // whichever asset happens to be selected in the Recommendations tab.
  for (const idle of idleBalances) {
    const ranked = getRankedFor(snapshot, idle.symbol);
    const best = ranked[0];
    if (!best) continue;
    const annualReturn = (idle.amount * best.opportunity.apy.value) / 100;
    actions.push({
      id: `deposit-idle-${idle.symbol}`,
      type: "deposit-idle",
      title: `Deposit idle ${idle.symbol} into ${best.opportunity.protocolName}`,
      explanation: `You're holding ${idle.amount.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${idle.symbol} that isn't earning anything. ${best.opportunity.protocolName} is the top-ranked option for ${idle.symbol} at your current risk tolerance.`,
      confidence: 85,
      expectedImpact: `+${formatUsd(annualReturn)}/yr`,
      estimatedAnnualReturn: annualReturn,
      relatedOpportunityId: best.opportunity.id,
      relatedStablecoin: idle.symbol,
    });
  }

  // Switch to a materially better-scored opportunity, per position — each
  // compared only against the ranking for that position's own asset.
  let suggestedSwitch = false;
  for (const position of positions) {
    const ranked = getRankedFor(snapshot, position.stablecoinSymbol);
    const currentScored = ranked.find((r) => r.opportunity.id === position.opportunityId);
    if (!currentScored) continue;
    const betterOption = ranked.find(
      (r) => r.opportunity.id !== position.opportunityId && r.score > currentScored.score * SWITCH_SCORE_MARGIN,
    );
    if (!betterOption) continue;
    suggestedSwitch = true;
    const currentAnnual = (position.currentAmount * position.apyValue) / 100;
    const newAnnual = (position.currentAmount * betterOption.opportunity.apy.value) / 100;
    actions.push({
      id: `switch-${position.opportunityId}-to-${betterOption.opportunity.id}`,
      type: "switch",
      title: `Move ${position.stablecoinSymbol} from ${position.protocolName} to ${betterOption.opportunity.protocolName}`,
      explanation: `${betterOption.opportunity.protocolName} currently scores meaningfully higher on risk-adjusted return for ${position.stablecoinSymbol} than your position in ${position.protocolName}.`,
      confidence: 65,
      expectedImpact: `${newAnnual >= currentAnnual ? "+" : ""}${formatUsd(newAnnual - currentAnnual)}/yr`,
      estimatedAnnualReturn: newAnnual,
      relatedOpportunityId: betterOption.opportunity.id,
      relatedStablecoin: position.stablecoinSymbol,
    });
  }

  // Reduce concentration / diversify
  if (
    concentration.largestPositionShare !== null &&
    concentration.distinctProtocolCount === 1 &&
    concentration.largestPositionShare >= 0.85
  ) {
    const largestPosition = [...positions].sort((a, b) => b.currentUsdValue - a.currentUsdValue)[0];
    const ranked = getRankedFor(snapshot, largestPosition.stablecoinSymbol);
    const alternative = ranked.find((r) => r.opportunity.protocolName !== concentration.largestPositionProtocol);
    if (alternative) {
      actions.push({
        id: "diversify",
        type: "diversify",
        title: `Diversify away from ${concentration.largestPositionProtocol}`,
        explanation: `100% of your deployed capital is with a single protocol. Spreading part of it into ${alternative.opportunity.protocolName} would reduce exposure to any one protocol's risk without meaningfully changing your blended yield.`,
        confidence: 55,
        expectedImpact: "Lower concentration risk",
        estimatedAnnualReturn: null,
        relatedOpportunityId: alternative.opportunity.id,
        relatedStablecoin: null,
      });
    }
  }

  // Hold — only when nothing more actionable was found, so this reads as a genuine confirmation, not noise
  if (!suggestedSwitch && positions.length > 0) {
    const top = [...positions].sort((a, b) => b.currentUsdValue - a.currentUsdValue)[0];
    actions.push({
      id: "hold",
      type: "hold",
      title: `Stay in ${top.protocolName}`,
      explanation:
        "No opportunity currently beats your existing position by a meaningful margin after adjusting for risk. Holding is the recommended action.",
      confidence: 80,
      expectedImpact: "No change recommended",
      estimatedAnnualReturn: top.yearlyEarningsEstimate,
      relatedOpportunityId: null,
      relatedStablecoin: null,
    });
  }

  if (positions.length === 0 && idleBalances.length === 0) {
    actions.push({
      id: "wait",
      type: "wait",
      title: "Fund your wallet to get started",
      explanation: "No stablecoin balance detected yet — deposit funds to receive a personalized strategy.",
      confidence: 100,
      expectedImpact: "N/A",
      estimatedAnnualReturn: null,
      relatedOpportunityId: null,
      relatedStablecoin: null,
    });
  }

  return actions;
}
