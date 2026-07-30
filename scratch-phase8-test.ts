import { buildPortfolioSnapshot } from "./src/lib/analysis/build-snapshot";
import { analyzePortfolio } from "./src/lib/analysis/analyze-portfolio";
import { applyLiveApy } from "./src/lib/yield/apply-live-apy";
import { YIELD_OPPORTUNITIES } from "./src/lib/protocols";
import type { StablecoinBalance } from "./src/hooks/use-celo-balances";
import type { Position } from "./src/lib/positions/types";
import type { UserPreferences } from "./src/types/preferences";

const prefs: UserPreferences = {
  selectedStablecoin: "USDM",
  riskTolerance: "medium",
  minApy: 0,
  requireInstantWithdrawal: false,
  allowLpPositions: true,
};
const priceContext = { celoUsdPrice: 0.06, forexRates: { eurUsd: 1.13, brlUsd: 0.19 } };

const noBalances: StablecoinBalance[] = [];
const idleUsdmOnly: StablecoinBalance[] = [
  { symbol: "USDM", name: "Mento Dollar", formatted: "500", isLoading: false, isError: false, error: null },
];
const concentratedPosition: Position[] = [
  {
    opportunityId: "aave-v3-celo",
    protocolName: "Aave V3",
    protocolUrl: "https://app.aave.com",
    stablecoinSymbol: "USDM",
    currentAmount: 1000,
    currentUsdValue: 1000,
    apyValue: 2.97,
    apyIsEstimate: false,
    riskLevel: "low",
    trackedPrincipal: 950,
    earningsSinceDeposit: 50,
    dailyEarningsEstimate: 0.08,
    monthlyEarningsEstimate: 2.47,
    yearlyEarningsEstimate: 29.7,
    firstDepositAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
  },
];

console.log("=== 1. AI recommendations/analysis update when PORTFOLIO changes ===");
const opps = applyLiveApy(YIELD_OPPORTUNITIES, {});

const emptySnapshot = buildPortfolioSnapshot(noBalances, [], prefs, priceContext, opps);
const emptyAnalysis = analyzePortfolio(emptySnapshot);
console.log("Empty portfolio narrative:", emptyAnalysis.narrative);
console.log("Empty portfolio health score:", emptyAnalysis.healthScore.score);

const idleSnapshot = buildPortfolioSnapshot(idleUsdmOnly, [], prefs, priceContext, opps);
const idleAnalysis = analyzePortfolio(idleSnapshot);
console.log("\nIdle-only narrative:", idleAnalysis.narrative);
console.log("Idle-only actions:", idleAnalysis.actions.map((a) => a.type));
console.log("PASS: narrative changed when portfolio changed:", emptyAnalysis.narrative !== idleAnalysis.narrative);
console.log("PASS: deposit-idle action appeared:", idleAnalysis.actions.some((a) => a.type === "deposit-idle"));

const positionSnapshot = buildPortfolioSnapshot(idleUsdmOnly, concentratedPosition, prefs, priceContext, opps);
const positionAnalysis = analyzePortfolio(positionSnapshot);
console.log("\nWith position + idle narrative:", positionAnalysis.narrative);
console.log("With position health score:", positionAnalysis.healthScore.score, "(should be lower than idle-only due to concentration)");
console.log("PASS: health score reflects concentration risk:", positionAnalysis.healthScore.score < 100);
console.log(
  "PASS: 'concentrated in a single protocol' insight fires:",
  positionAnalysis.insights.some((i) => i.id === "diversification" && i.headline.includes("one protocol")),
);

console.log("\n=== 2. AI recommendations update when LIVE APY changes ===");
const beforeLiveApy = analyzePortfolio(buildPortfolioSnapshot(idleUsdmOnly, concentratedPosition, prefs, priceContext, opps));
// Simulate a live APY refresh: Aave's real pool crashes to near-zero
const aavePoolId = YIELD_OPPORTUNITIES.find((o) => o.id === "aave-v3-celo")!.defiLlamaPoolId!;
const oppsAfterLiveApy = applyLiveApy(YIELD_OPPORTUNITIES, { [aavePoolId]: 0.01 });
const afterLiveApy = analyzePortfolio(
  buildPortfolioSnapshot(idleUsdmOnly, concentratedPosition, prefs, priceContext, oppsAfterLiveApy),
);
console.log("Narrative before Aave APY crash:", beforeLiveApy.narrative);
console.log("Narrative after Aave APY crash:", afterLiveApy.narrative);
console.log("PASS: narrative changed in response to live APY:", beforeLiveApy.narrative !== afterLiveApy.narrative);
console.log(
  "PASS: AI Actions recalculated too:",
  JSON.stringify(beforeLiveApy.actions.map((a) => a.id)) !== JSON.stringify(afterLiveApy.actions.map((a) => a.id)),
);

console.log("\n=== 3. Portfolio Health recalculates correctly (diversified case) ===");
const diversifiedPositions: Position[] = [
  ...concentratedPosition,
  {
    opportunityId: "curve-celo",
    protocolName: "Curve",
    protocolUrl: "https://curve.finance",
    stablecoinSymbol: "USDM",
    currentAmount: 1000,
    currentUsdValue: 1000,
    apyValue: 2,
    apyIsEstimate: true,
    riskLevel: "low",
    trackedPrincipal: 1000,
    earningsSinceDeposit: 0,
    dailyEarningsEstimate: 0.05,
    monthlyEarningsEstimate: 1.67,
    yearlyEarningsEstimate: 20,
    firstDepositAt: Date.now(),
  },
];
const diversifiedAnalysis = analyzePortfolio(
  buildPortfolioSnapshot([], diversifiedPositions, prefs, priceContext, opps),
);
console.log("Diversified (2 protocols) health score:", diversifiedAnalysis.healthScore.score);
console.log("Concentrated (1 protocol) health score:", positionAnalysis.healthScore.score);
console.log(
  "PASS: diversified portfolio scores higher than concentrated one:",
  diversifiedAnalysis.healthScore.score > positionAnalysis.healthScore.score,
);
console.log("Health score breakdown:", JSON.stringify(diversifiedAnalysis.healthScore.breakdown, null, 2));
