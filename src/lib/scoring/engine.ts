import type { YieldOpportunity } from "@/types/yield";
import type { UserPreferences } from "@/types/preferences";
import type { ScoredOpportunity } from "@/lib/scoring/types";
import { checkEligibility } from "@/lib/scoring/filters";
import {
  scoreApy,
  scoreRiskAlignment,
  scoreTrust,
  scoreWithdrawalFlexibility,
  SCORE_WEIGHTS,
} from "@/lib/scoring/weights";
import { buildReasons } from "@/lib/scoring/reasons";

/**
 * Scores a single opportunity against the user's preferences and wallet
 * balance. Ineligible opportunities always score 0 and carry no reasons —
 * callers should filter on `eligible` rather than relying on score alone.
 */
export function scoreOpportunity(
  opportunity: YieldOpportunity,
  preferences: UserPreferences,
  balance: number | null,
): ScoredOpportunity {
  const { eligible } = checkEligibility(opportunity, preferences);

  if (!eligible) {
    return { opportunity, score: 0, eligible: false, reasons: [], estimatedYearlyEarnings: null };
  }

  const score =
    scoreApy(opportunity) * SCORE_WEIGHTS.apy +
    scoreRiskAlignment(opportunity, preferences) * SCORE_WEIGHTS.risk +
    scoreTrust(opportunity) * SCORE_WEIGHTS.trust +
    scoreWithdrawalFlexibility(opportunity) * SCORE_WEIGHTS.withdrawal;

  const estimatedYearlyEarnings =
    balance !== null ? (balance * opportunity.apy.value) / 100 : null;

  return {
    opportunity,
    score,
    eligible: true,
    reasons: buildReasons(opportunity, preferences),
    estimatedYearlyEarnings,
  };
}

/** Ranks all opportunities, best first, dropping anything ineligible. */
export function rankOpportunities(
  opportunities: YieldOpportunity[],
  preferences: UserPreferences,
  balance: number | null,
): ScoredOpportunity[] {
  return opportunities
    .map((opportunity) => scoreOpportunity(opportunity, preferences, balance))
    .filter((result) => result.eligible)
    .sort((a, b) => b.score - a.score);
}
