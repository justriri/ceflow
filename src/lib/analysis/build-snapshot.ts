import type { StablecoinBalance } from "@/hooks/use-celo-balances";
import type { Position } from "@/lib/positions/types";
import type { PriceContext } from "@/lib/yield/prices";
import { getStablecoinUsdPrice } from "@/lib/yield/prices";
import type { UserPreferences } from "@/types/preferences";
import type { StablecoinSymbol } from "@/config/tokens";
import type { YieldOpportunity } from "@/types/yield";
import { rankOpportunities } from "@/lib/scoring/engine";
import type { PortfolioSnapshot, IdleBalance } from "@/lib/analysis/types";

/**
 * Idle = sitting in the wallet, not deployed into any protocol. Computed
 * straight from wallet balances — a user can hold idle USDM in their wallet
 * *and* have a separate USDM position in Aave at the same time, so this is
 * never netted against `positions`.
 *
 * Ranks opportunities separately for every asset actually held (not just
 * `preferences.selectedStablecoin`) — the scoring engine itself is called
 * unmodified, once per distinct asset, so a portfolio holding both USDM and
 * cEUR gets a correct ranking for each rather than one asset's ranking
 * being silently applied to the other.
 */
export function buildPortfolioSnapshot(
  stablecoinBalances: StablecoinBalance[],
  positions: Position[],
  preferences: UserPreferences,
  priceContext: PriceContext,
  /** Already live-APY-merged (via applyLiveApy) — same freshness as what Position.apyValue reflects. */
  opportunities: YieldOpportunity[],
): PortfolioSnapshot {
  const idleBalances: IdleBalance[] = [];
  for (const balance of stablecoinBalances) {
    if (balance.formatted === undefined) continue;
    const amount = Number(balance.formatted);
    if (!Number.isFinite(amount) || amount <= 0) continue;
    const usdValue = amount * getStablecoinUsdPrice(balance.symbol, priceContext);
    idleBalances.push({ symbol: balance.symbol, amount, usdValue });
  }

  const heldSymbols = new Set<StablecoinSymbol>([
    ...positions.map((p) => p.stablecoinSymbol),
    ...idleBalances.map((b) => b.symbol),
    preferences.selectedStablecoin,
  ]);

  const rankedBySymbol: PortfolioSnapshot["rankedBySymbol"] = {};
  for (const symbol of heldSymbols) {
    const walletBalance = stablecoinBalances.find((b) => b.symbol === symbol);
    const balance = walletBalance?.formatted !== undefined ? Number(walletBalance.formatted) : null;
    rankedBySymbol[symbol] = rankOpportunities(
      opportunities,
      { ...preferences, selectedStablecoin: symbol },
      Number.isFinite(balance) ? balance : null,
    );
  }

  const totalDeployedUsd = positions.reduce((sum, p) => sum + p.currentUsdValue, 0);
  const totalIdleUsd = idleBalances.reduce((sum, b) => sum + b.usdValue, 0);

  return {
    positions,
    idleBalances,
    totalDeployedUsd,
    totalIdleUsd,
    totalUsd: totalDeployedUsd + totalIdleUsd,
    rankedBySymbol,
    selectedSymbol: preferences.selectedStablecoin,
  };
}
