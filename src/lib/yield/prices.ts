import type { StablecoinSymbol } from "@/config/tokens";

export interface PriceContext {
  /** Live CELO/USD price, null if the live fetch failed. */
  celoUsdPrice: number | null;
  /** Live EUR/USD and BRL/USD rates, null if the live fetch failed. */
  forexRates: { eurUsd: number; brlUsd: number } | null;
}

// Used only when the live fetch is unavailable — rough reference points,
// not meant to be precise. USDM/USDC are excluded since they're pegged 1:1
// by definition, not an estimate.
const FALLBACK_CELO_USD = 0.06;
const FALLBACK_EUR_USD = 1.08;
const FALLBACK_BRL_USD = 0.18;

export function getStablecoinUsdPrice(
  symbol: StablecoinSymbol,
  prices: PriceContext,
): number {
  switch (symbol) {
    case "USDM":
    case "USDC":
      return 1;
    case "cEUR":
      return prices.forexRates?.eurUsd ?? FALLBACK_EUR_USD;
    case "cREAL":
      return prices.forexRates?.brlUsd ?? FALLBACK_BRL_USD;
  }
}

export function getCeloUsdPrice(prices: PriceContext): number {
  return prices.celoUsdPrice ?? FALLBACK_CELO_USD;
}
