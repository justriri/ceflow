import type { StablecoinSymbol } from "@/config/tokens";
import type { Position } from "@/lib/positions/types";
import type { ScoredOpportunity } from "@/lib/scoring/types";

export interface IdleBalance {
  symbol: StablecoinSymbol;
  amount: number;
  usdValue: number;
}

/** Everything the analysis layer needs, gathered from already-reactive sources. */
export interface PortfolioSnapshot {
  positions: Position[];
  idleBalances: IdleBalance[];
  totalDeployedUsd: number;
  totalIdleUsd: number;
  totalUsd: number;
  /**
   * Ranked opportunities per stablecoin the user actually holds (in a
   * position or idle in their wallet) — each ranked separately via the
   * untouched scoring engine, using the user's risk/withdrawal/LP
   * preferences applied to that specific asset. A portfolio spanning
   * multiple assets needs a correct ranking for each one; scoping
   * everything to a single "currently selected" asset would silently
   * misjudge idle capital or positions in any other asset.
   */
  rankedBySymbol: Partial<Record<StablecoinSymbol, ScoredOpportunity[]>>;
  /** The asset currently selected in the Recommendations tab — the primary focus for the narrative. */
  selectedSymbol: StablecoinSymbol;
}

export type InsightCategory =
  | "apy"
  | "earnings"
  | "idle-capital"
  | "risk"
  | "diversification"
  | "exposure"
  | "opportunity"
  | "market";

export type InsightSeverity = "info" | "positive" | "warning";

export interface Insight {
  id: string;
  category: InsightCategory;
  headline: string;
  detail: string;
  severity: InsightSeverity;
}

export type ActionType =
  | "deposit-idle"
  | "rebalance"
  | "hold"
  | "diversify"
  | "reduce-concentration"
  | "switch"
  | "wait";

export interface AgentAction {
  id: string;
  type: ActionType;
  title: string;
  explanation: string;
  /** 0-100. */
  confidence: number;
  expectedImpact: string;
  estimatedAnnualReturn: number | null;
  /** Present when this action maps to a concrete, executable opportunity. */
  relatedOpportunityId: string | null;
  relatedStablecoin: StablecoinSymbol | null;
}

export interface HealthScoreFactor {
  factor: string;
  score: number;
  weight: number;
  note: string;
}

export interface PortfolioHealthScore {
  score: number;
  breakdown: HealthScoreFactor[];
  summary: string;
  improvements: string[];
}

export interface PortfolioAnalysis {
  snapshot: PortfolioSnapshot;
  narrative: string;
  insights: Insight[];
  actions: AgentAction[];
  healthScore: PortfolioHealthScore;
}
