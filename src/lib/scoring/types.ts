import type { YieldOpportunity } from "@/types/yield";

export interface ScoredOpportunity {
  opportunity: YieldOpportunity;
  score: number;
  eligible: boolean;
  reasons: string[];
  /** Null when the user has no readable balance for the selected stablecoin. */
  estimatedYearlyEarnings: number | null;
}

export interface EligibilityResult {
  eligible: boolean;
  exclusionReasons: string[];
}
