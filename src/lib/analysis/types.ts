import type { StablecoinSymbol } from "@/config/tokens";
import type { Position } from "@/lib/positions/types";
import type { ScoredOpportunity } from "@/lib/scoring/types";
import type { RiskLevel } from "@/types/yield";

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

/**
 * One proposed reallocation within an OptimizationPlan. `fromOpportunityId`
 * is null when the source is idle wallet capital (nothing to withdraw —
 * only a deposit needs preparing); otherwise the move requires withdrawing
 * from the current position before depositing into the proposed one.
 */
export interface AllocationMove {
  id: string;
  fromOpportunityId: string | null;
  fromProtocolName: string | null;
  toOpportunityId: string;
  toProtocolName: string;
  stablecoinSymbol: StablecoinSymbol;
  amount: number;
  amountUsd: number;
  reasoning: string;
  currentApy: number;
  projectedApy: number;
  estimatedAnnualImprovement: number;
}

export interface OptimizationPlan {
  hasChanges: boolean;
  summary: string;
  currentEffectiveApy: number;
  projectedEffectiveApy: number;
  estimatedAnnualImprovement: number;
  moves: AllocationMove[];
}

export interface RiskBreakdownEntry {
  level: RiskLevel;
  usdValue: number;
  /** Share (0-1) of deployed value at this risk level. */
  share: number;
  protocols: string[];
}

export interface RiskAnalysis {
  /** 0-100, higher = safer. Value-weighted across deployed positions only. */
  safetyScore: number;
  narrative: string;
  breakdown: RiskBreakdownEntry[];
  warnings: string[];
}

export interface YieldForecastPoint {
  days: number;
  label: string;
  projectedEarnings: number;
  projectedPortfolioValue: number;
}

export interface YieldForecast {
  currentEffectiveApy: number;
  assumptionNote: string;
  points: YieldForecastPoint[];
}

export interface ScenarioResult {
  symbol: StablecoinSymbol;
  amount: number;
  amountUsd: number;
  targetOpportunityId: string;
  targetProtocolName: string;
  projectedApy: number;
  currentEffectiveApy: number;
  projectedEffectiveApyAfterMove: number;
  additionalAnnualEarnings: number;
  reasoning: string;
}
