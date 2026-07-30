import type { YieldOpportunity } from "@/types/yield";
import type { UserPreferences } from "@/types/preferences";

/** Human-readable explanations for why an eligible opportunity was recommended. */
export function buildReasons(
  opportunity: YieldOpportunity,
  preferences: UserPreferences,
): string[] {
  const reasons: string[] = [];

  reasons.push(`Supports ${preferences.selectedStablecoin}`);

  if (opportunity.apy.value >= preferences.minApy) {
    reasons.push(
      `Currently around ${opportunity.apy.value}% APY, meeting your ${preferences.minApy}% minimum`,
    );
  }

  if (opportunity.riskLevel === preferences.riskTolerance) {
    reasons.push(`Risk level matches your ${preferences.riskTolerance} tolerance`);
  } else if (
    (preferences.riskTolerance === "high" && opportunity.riskLevel !== "high") ||
    (preferences.riskTolerance === "medium" && opportunity.riskLevel === "low")
  ) {
    reasons.push(`Lower risk (${opportunity.riskLevel}) than your ${preferences.riskTolerance} tolerance`);
  }

  if (opportunity.trustScore >= 4) {
    reasons.push("Well-established, widely used protocol");
  }

  if (opportunity.withdrawal.isInstant) {
    reasons.push("Instant withdrawals, no lockup");
  }

  if (opportunity.impermanentLossRisk === "none") {
    reasons.push("No impermanent loss risk (not an LP position)");
  } else if (opportunity.impermanentLossRisk === "low") {
    reasons.push("Low impermanent loss risk (correlated stable pairs)");
  }

  return reasons;
}
