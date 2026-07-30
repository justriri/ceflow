import type { StablecoinSymbol } from "@/config/tokens";
import type { ScoredOpportunity } from "@/lib/scoring/types";
import type { PortfolioSnapshot } from "@/lib/analysis/types";
import { YIELD_OPPORTUNITIES } from "@/lib/protocols";

/** Ranked opportunities for one specific asset — never falls back to a different asset's ranking. */
export function getRankedFor(snapshot: PortfolioSnapshot, symbol: StablecoinSymbol): ScoredOpportunity[] {
  return snapshot.rankedBySymbol[symbol] ?? [];
}

/** Static protocol facts (trust, withdrawal terms) that don't depend on which asset is selected in the UI. */
export function getOpportunityFacts(opportunityId: string) {
  return YIELD_OPPORTUNITIES.find((o) => o.id === opportunityId) ?? null;
}
