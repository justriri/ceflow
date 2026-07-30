import type { YieldOpportunity, RiskLevel } from "@/types/yield";
import type { UserPreferences } from "@/types/preferences";

const RISK_RANK: Record<RiskLevel, number> = { low: 1, medium: 2, high: 3 };

/** APY normalized to a 0-100 scale, capped at a 15% APY ceiling. */
export function scoreApy(opportunity: YieldOpportunity): number {
  const APY_CEILING = 15;
  return Math.max(0, Math.min(100, (opportunity.apy.value / APY_CEILING) * 100));
}

/**
 * Rewards opportunities at or below the user's risk tolerance; penalizes
 * opportunities riskier than what the user asked for, more steeply for
 * each risk tier above their preference.
 */
export function scoreRiskAlignment(
  opportunity: YieldOpportunity,
  preferences: UserPreferences,
): number {
  const diff = RISK_RANK[opportunity.riskLevel] - RISK_RANK[preferences.riskTolerance];
  if (diff <= 0) return 100 - Math.abs(diff) * 5;
  return Math.max(0, 100 - diff * 40);
}

/** How established/audited/battle-tested the protocol is, 0-100. */
export function scoreTrust(opportunity: YieldOpportunity): number {
  return (opportunity.trustScore / 5) * 100;
}

/** Rewards instant withdrawals; only relevant when not already a hard requirement. */
export function scoreWithdrawalFlexibility(opportunity: YieldOpportunity): number {
  return opportunity.withdrawal.isInstant ? 100 : 40;
}

export const SCORE_WEIGHTS = {
  apy: 0.4,
  risk: 0.25,
  trust: 0.25,
  withdrawal: 0.1,
} as const;
