import type { PortfolioSnapshot, RiskAnalysis, RiskBreakdownEntry } from "@/lib/analysis/types";
import type { RiskLevel } from "@/types/yield";
import { getOpportunityFacts } from "@/lib/analysis/snapshot-helpers";

const SAFETY_POINTS: Record<RiskLevel, number> = { low: 100, medium: 60, high: 25 };
const LEVEL_LABEL: Record<RiskLevel, string> = { low: "low risk", medium: "medium risk", high: "high risk" };
const LEVEL_ORDER: RiskLevel[] = ["low", "medium", "high"];

/**
 * Deeper risk breakdown than the health score's single "protocol safety"
 * factor — per-risk-level exposure, protocol trust scores, and explicit
 * warnings. Deployed positions only: idle wallet capital carries no
 * protocol risk since it isn't in any contract.
 */
export function analyzeRisk(snapshot: PortfolioSnapshot): RiskAnalysis {
  const { positions, totalDeployedUsd } = snapshot;

  const byLevel = new Map<RiskLevel, { usdValue: number; protocols: Set<string> }>();
  for (const position of positions) {
    const entry = byLevel.get(position.riskLevel) ?? { usdValue: 0, protocols: new Set<string>() };
    entry.usdValue += position.currentUsdValue;
    entry.protocols.add(position.protocolName);
    byLevel.set(position.riskLevel, entry);
  }

  const breakdown: RiskBreakdownEntry[] = LEVEL_ORDER.filter((level) => byLevel.has(level)).map((level) => {
    const entry = byLevel.get(level)!;
    return {
      level,
      usdValue: entry.usdValue,
      share: totalDeployedUsd > 0 ? entry.usdValue / totalDeployedUsd : 0,
      protocols: [...entry.protocols],
    };
  });

  const safetyScore =
    totalDeployedUsd > 0
      ? positions.reduce((sum, p) => sum + SAFETY_POINTS[p.riskLevel] * p.currentUsdValue, 0) / totalDeployedUsd
      : 100;

  const warnings: string[] = [];
  const highRiskShare = breakdown.find((b) => b.level === "high")?.share ?? 0;
  if (highRiskShare > 0) {
    warnings.push(
      `${Math.round(highRiskShare * 100)}% of deployed capital is in high-risk protocols${
        highRiskShare >= 0.5 ? " — consider reducing this exposure" : ""
      }.`,
    );
  }

  const lowTrustPositions = positions.filter((p) => {
    const facts = getOpportunityFacts(p.opportunityId);
    return facts !== null && facts.trustScore <= 2;
  });
  if (lowTrustPositions.length > 0) {
    const names = [...new Set(lowTrustPositions.map((p) => p.protocolName))];
    warnings.push(
      `${names.join(", ")} ${names.length === 1 ? "has" : "have"} a lower trust score (less established or audited) — worth reviewing periodically.`,
    );
  }

  const narrative =
    positions.length === 0
      ? "No deployed positions yet, so there's no protocol risk to evaluate."
      : `Your deployed capital carries an overall safety score of ${Math.round(safetyScore)}/100. ${
          breakdown.length === 1
            ? `Everything is in ${LEVEL_LABEL[breakdown[0].level]} protocols.`
            : `It's split across ${breakdown
                .map((b) => `${Math.round(b.share * 100)}% ${LEVEL_LABEL[b.level]}`)
                .join(", ")}.`
        }`;

  return { safetyScore, narrative, breakdown, warnings };
}
