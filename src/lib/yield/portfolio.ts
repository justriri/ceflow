import type { StablecoinSymbol } from "@/config/tokens";
import { getCeloUsdPrice, getStablecoinUsdPrice, type PriceContext } from "@/lib/yield/prices";

export interface PortfolioInput {
  celoBalance: number | null;
  stablecoinBalances: Partial<Record<StablecoinSymbol, number | null>>;
}

/** Total USD-equivalent value across CELO and all held stablecoins. */
export function calculatePortfolioValue(
  input: PortfolioInput,
  prices: PriceContext,
): number {
  let total = input.celoBalance !== null ? input.celoBalance * getCeloUsdPrice(prices) : 0;

  for (const [symbol, balance] of Object.entries(input.stablecoinBalances)) {
    if (balance === null || balance === undefined) continue;
    total += balance * getStablecoinUsdPrice(symbol as StablecoinSymbol, prices);
  }

  return total;
}
