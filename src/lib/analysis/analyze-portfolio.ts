import type { PortfolioSnapshot, PortfolioAnalysis } from "@/lib/analysis/types";
import { generateNarrative } from "@/lib/analysis/generate-narrative";
import { generateInsights } from "@/lib/analysis/generate-insights";
import { generateActions } from "@/lib/analysis/generate-actions";
import { calculatePortfolioHealthScore } from "@/lib/analysis/calculate-health-score";

/** Pure composition of the whole analysis — no I/O, safe to call from a hook's useMemo. */
export function analyzePortfolio(snapshot: PortfolioSnapshot): PortfolioAnalysis {
  return {
    snapshot,
    narrative: generateNarrative(snapshot),
    insights: generateInsights(snapshot),
    actions: generateActions(snapshot),
    healthScore: calculatePortfolioHealthScore(snapshot),
  };
}
