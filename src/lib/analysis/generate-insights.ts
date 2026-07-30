import type { Insight, PortfolioSnapshot } from "@/lib/analysis/types";
import type { ScoredOpportunity } from "@/lib/scoring/types";
import { calculateConcentration, calculateEffectiveApy } from "@/lib/analysis/diversification";
import { getRankedFor } from "@/lib/analysis/snapshot-helpers";
import { detectApyChanges } from "@/lib/analysis/apy-change-tracker";
import { formatPercent, formatUsd } from "@/lib/analysis/format";

/** Every ranked opportunity across every held asset, deduplicated by id (apy.value doesn't vary by ranking context, only score does). */
function allRankedOpportunities(snapshot: PortfolioSnapshot): ScoredOpportunity[] {
  const seen = new Map<string, ScoredOpportunity>();
  for (const list of Object.values(snapshot.rankedBySymbol)) {
    for (const scored of list ?? []) {
      if (!seen.has(scored.opportunity.id)) seen.set(scored.opportunity.id, scored);
    }
  }
  return [...seen.values()];
}

export function generateInsights(snapshot: PortfolioSnapshot): Insight[] {
  const insights: Insight[] = [];
  const { positions, idleBalances, totalIdleUsd } = snapshot;
  const concentration = calculateConcentration(snapshot);

  // Current effective APY
  if (positions.length > 0) {
    const effectiveApy = calculateEffectiveApy(snapshot);
    insights.push({
      id: "effective-apy",
      category: "apy",
      headline: `Your funds are currently earning ${formatPercent(effectiveApy)} APY`,
      detail: `Value-weighted across ${positions.length} active position${positions.length === 1 ? "" : "s"}.`,
      severity: "info",
    });
  }

  // Estimated yearly earnings
  if (positions.length > 0) {
    const yearly = positions.reduce((sum, p) => sum + p.yearlyEarningsEstimate, 0);
    insights.push({
      id: "yearly-earnings",
      category: "earnings",
      headline: `Estimated ${formatUsd(yearly)}/year at current rates`,
      detail: "Projection from today's APY — will move as rates change.",
      severity: "info",
    });
  }

  // Idle capital
  if (idleBalances.length > 0) {
    insights.push({
      id: "idle-capital",
      category: "idle-capital",
      headline: `${formatUsd(totalIdleUsd)} sitting idle, earning nothing`,
      detail: `${idleBalances.map((b) => `${b.amount.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${b.symbol}`).join(", ")} in your wallet, undeployed.`,
      severity: "warning",
    });
  }

  // Risk warnings — any position in a high-risk protocol
  const highRiskPositions = positions.filter((p) => p.riskLevel === "high");
  if (highRiskPositions.length > 0) {
    insights.push({
      id: "risk-warning",
      category: "risk",
      headline: `${highRiskPositions.length} position${highRiskPositions.length === 1 ? " is" : "s are"} in a higher-risk protocol`,
      detail: `${highRiskPositions.map((p) => p.protocolName).join(", ")}. Review whether this still matches your risk tolerance.`,
      severity: "warning",
    });
  }

  // Diversification
  if (concentration.largestPositionShare !== null) {
    const pct = Math.round(concentration.largestPositionShare * 100);
    if (concentration.distinctProtocolCount === 1) {
      insights.push({
        id: "diversification",
        category: "diversification",
        headline: `100% of deployed capital is in one protocol`,
        detail: `All positions are with ${concentration.largestPositionProtocol}. Spreading across protocols reduces exposure to any single one failing.`,
        severity: "warning",
      });
    } else if (pct >= 60) {
      insights.push({
        id: "diversification",
        category: "diversification",
        headline: `${pct}% concentrated in ${concentration.largestPositionProtocol}`,
        detail: `Spread across ${concentration.distinctProtocolCount} protocols overall.`,
        severity: "info",
      });
    } else {
      insights.push({
        id: "diversification",
        category: "diversification",
        headline: `Reasonably diversified across ${concentration.distinctProtocolCount} protocols`,
        detail: `Largest single position is ${pct}% of deployed capital.`,
        severity: "positive",
      });
    }
  }

  // Protocol exposure breakdown
  if (positions.length > 0) {
    const byProtocol = new Map<string, number>();
    for (const p of positions) {
      byProtocol.set(p.protocolName, (byProtocol.get(p.protocolName) ?? 0) + p.currentUsdValue);
    }
    const breakdown = [...byProtocol.entries()]
      .map(([name, value]) => `${name} ${Math.round((value / snapshot.totalDeployedUsd) * 100)}%`)
      .join(", ");
    insights.push({
      id: "exposure",
      category: "exposure",
      headline: "Protocol exposure",
      detail: breakdown,
      severity: "info",
    });
  }

  // Better opportunities — checked per asset actually held, never a
  // different asset's ranking applied to the wrong position.
  const currentOpportunityIds = new Set(positions.map((p) => p.opportunityId));
  let foundBetter = false;
  for (const position of positions) {
    const ranked = getRankedFor(snapshot, position.stablecoinSymbol);
    const notCurrentlyHeld = ranked.find((r) => !currentOpportunityIds.has(r.opportunity.id));
    if (notCurrentlyHeld && notCurrentlyHeld.opportunity.apy.value > position.apyValue + 1) {
      foundBetter = true;
      insights.push({
        id: `better-opportunity-${position.opportunityId}`,
        category: "opportunity",
        headline: `${notCurrentlyHeld.opportunity.protocolName} may be worth a look for your ${position.stablecoinSymbol}`,
        detail: `Currently ${formatPercent(notCurrentlyHeld.opportunity.apy.value)} APY, more than 1 point above your ${position.protocolName} position.`,
        severity: "info",
      });
      break; // one is enough to surface — avoid flooding the panel
    }
  }
  if (!foundBetter && positions.length > 0) {
    insights.push({
      id: "no-better-opportunity",
      category: "opportunity",
      headline: "No better risk-adjusted opportunity found",
      detail: "Your current allocation still leads the ranked list for your risk profile.",
      severity: "positive",
    });
  }

  // Market / APY changes since last visit (client-side, per-device)
  const changes = detectApyChanges(allRankedOpportunities(snapshot).map((r) => r.opportunity));
  for (const change of changes) {
    insights.push({
      id: `apy-change-${change.opportunityId}`,
      category: "market",
      headline: `${change.protocolName}'s APY ${change.deltaPercentagePoints > 0 ? "rose" : "fell"} to ${formatPercent(change.currentApy)}`,
      detail: `Was ${formatPercent(change.previousApy)} at your last visit.`,
      severity: change.deltaPercentagePoints > 0 ? "positive" : "info",
    });
  }

  return insights;
}
