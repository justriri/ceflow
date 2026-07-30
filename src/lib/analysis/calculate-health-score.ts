import type { HealthScoreFactor, PortfolioHealthScore, PortfolioSnapshot } from "@/lib/analysis/types";
import { calculateConcentration, calculateBlendedApy } from "@/lib/analysis/diversification";
import { getOpportunityFacts } from "@/lib/analysis/snapshot-helpers";

const WEIGHTS = {
  diversification: 20,
  protocolSafety: 20,
  liquidity: 15,
  apy: 20,
  concentrationRisk: 15,
  idleCapital: 10,
} as const;

/** APY at or above this is treated as a full-marks score — not a hard cap on real returns, just the scoring benchmark. */
const APY_BENCHMARK = 8;

function scoreDiversification(distinctProtocolCount: number): number {
  if (distinctProtocolCount <= 0) return 0;
  if (distinctProtocolCount === 1) return 40;
  if (distinctProtocolCount === 2) return 65;
  if (distinctProtocolCount === 3) return 85;
  return 100;
}

function scoreProtocolSafety(snapshot: PortfolioSnapshot): number {
  const { positions, totalDeployedUsd } = snapshot;
  if (totalDeployedUsd <= 0) return 100; // nothing deployed, nothing at protocol risk
  const weightedTrust = positions.reduce((sum, p) => {
    const facts = getOpportunityFacts(p.opportunityId);
    const trust = facts?.trustScore ?? 3;
    return sum + trust * p.currentUsdValue;
  }, 0);
  return ((weightedTrust / totalDeployedUsd) / 5) * 100;
}

function scoreLiquidity(snapshot: PortfolioSnapshot): number {
  const { positions, totalDeployedUsd } = snapshot;
  if (totalDeployedUsd <= 0) return 100;
  const instantValue = positions.reduce((sum, p) => {
    const facts = getOpportunityFacts(p.opportunityId);
    return facts?.withdrawal.isInstant ? sum + p.currentUsdValue : sum;
  }, 0);
  return (instantValue / totalDeployedUsd) * 100;
}

function scoreApy(snapshot: PortfolioSnapshot): number {
  const blended = calculateBlendedApy(snapshot);
  return Math.max(0, Math.min(100, (blended / APY_BENCHMARK) * 100));
}

function scoreConcentrationRisk(largestPositionShare: number | null): number {
  if (largestPositionShare === null) return 100;
  return Math.max(0, 100 - largestPositionShare * 100);
}

function scoreIdleCapital(snapshot: PortfolioSnapshot): number {
  if (snapshot.totalUsd <= 0) return 100;
  const idleShare = snapshot.totalIdleUsd / snapshot.totalUsd;
  return Math.max(0, 100 - idleShare * 100);
}

export function calculatePortfolioHealthScore(snapshot: PortfolioSnapshot): PortfolioHealthScore {
  const concentration = calculateConcentration(snapshot);

  const factors: { key: keyof typeof WEIGHTS; label: string; score: number; note: string }[] = [
    {
      key: "diversification",
      label: "Diversification",
      score: scoreDiversification(concentration.distinctProtocolCount),
      note: `${concentration.distinctProtocolCount} distinct protocol${concentration.distinctProtocolCount === 1 ? "" : "s"} in use.`,
    },
    {
      key: "protocolSafety",
      label: "Protocol safety",
      score: scoreProtocolSafety(snapshot),
      note: "Value-weighted trust score of the protocols you're deployed in.",
    },
    {
      key: "liquidity",
      label: "Liquidity",
      score: scoreLiquidity(snapshot),
      note: "Share of deployed capital that can be withdrawn instantly.",
    },
    {
      key: "apy",
      label: "APY",
      score: scoreApy(snapshot),
      note: `Blended portfolio APY vs a ${APY_BENCHMARK}% benchmark.`,
    },
    {
      key: "concentrationRisk",
      label: "Concentration risk",
      score: scoreConcentrationRisk(concentration.largestPositionShare),
      note:
        concentration.largestPositionShare !== null
          ? `${Math.round(concentration.largestPositionShare * 100)}% of deployed capital is in your largest single position.`
          : "No capital deployed yet.",
    },
    {
      key: "idleCapital",
      label: "Idle capital",
      score: scoreIdleCapital(snapshot),
      note:
        snapshot.totalUsd > 0
          ? `${Math.round((snapshot.totalIdleUsd / snapshot.totalUsd) * 100)}% of your total balance is undeployed.`
          : "No balance yet.",
    },
  ];

  const totalWeight = Object.values(WEIGHTS).reduce((a, b) => a + b, 0);
  const weightedScore =
    factors.reduce((sum, f) => sum + f.score * WEIGHTS[f.key], 0) / totalWeight;
  const score = Math.round(weightedScore);

  const breakdown: HealthScoreFactor[] = factors.map((f) => ({
    factor: f.label,
    score: Math.round(f.score),
    weight: WEIGHTS[f.key],
    note: f.note,
  }));

  const weakest = [...factors].sort((a, b) => a.score - b.score)[0];
  const improvements: string[] = [];
  if (weakest && weakest.score < 70) {
    improvements.push(`${weakest.label} is your weakest factor (${Math.round(weakest.score)}/100) — ${weakest.note}`);
  }
  if (snapshot.totalIdleUsd > 0) {
    improvements.push("Deploy idle capital to improve both APY and idle-capital scores.");
  }
  if (concentration.distinctProtocolCount <= 1 && snapshot.positions.length > 0) {
    improvements.push("Spreading capital across a second protocol would meaningfully reduce concentration risk.");
  }

  const summary =
    snapshot.positions.length === 0 && snapshot.idleBalances.length === 0
      ? "No balance yet — deposit funds to get a health score."
      : score >= 85
        ? "Strong overall position: well-diversified, low idle capital, and earning a competitive rate."
        : score >= 60
          ? "Reasonable position with room to improve — see the factors below."
          : "Your portfolio has meaningful room to improve — see the factors below.";

  return { score, breakdown, summary, improvements };
}
