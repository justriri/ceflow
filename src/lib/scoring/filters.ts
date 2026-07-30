import type { YieldOpportunity } from "@/types/yield";
import type { UserPreferences } from "@/types/preferences";
import type { EligibilityResult } from "@/lib/scoring/types";

/**
 * Hard filters — an opportunity that fails any of these is dropped from
 * results entirely, regardless of how well it scores otherwise.
 */
export function checkEligibility(
  opportunity: YieldOpportunity,
  preferences: UserPreferences,
): EligibilityResult {
  const exclusionReasons: string[] = [];

  if (!opportunity.supportedStablecoins.includes(preferences.selectedStablecoin)) {
    exclusionReasons.push(
      `Doesn't support ${preferences.selectedStablecoin}`,
    );
  }

  if (opportunity.apy.value < preferences.minApy) {
    exclusionReasons.push(
      `APY (${opportunity.apy.value}%) is below your ${preferences.minApy}% minimum`,
    );
  }

  if (preferences.requireInstantWithdrawal && !opportunity.withdrawal.isInstant) {
    exclusionReasons.push("Doesn't support instant withdrawals");
  }

  if (!preferences.allowLpPositions && opportunity.protocolType === "lp") {
    exclusionReasons.push("Is an LP position, which you've excluded");
  }

  return { eligible: exclusionReasons.length === 0, exclusionReasons };
}
