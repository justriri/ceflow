import type { StablecoinSymbol } from "@/config/tokens";

export interface PriceContext {
  /** Live CELO/USD price, null if the live fetch failed. */
  celoUsdPrice: number | null;
  /** Live EUR/USD, BRL/USD, and NGN/USD rates, null if the live fetch failed. */
  forexRates: { eurUsd: number; brlUsd: number; ngnUsd: number } | null;
}

// Used only when the live fetch is unavailable — rough reference points,
// not meant to be precise. USDM/USDC/USAT are excluded since they're pegged
// 1:1 to USD by definition, not an estimate.
const FALLBACK_CELO_USD = 0.06;
const FALLBACK_EUR_USD = 1.08;
const FALLBACK_BRL_USD = 0.18;
// ~1,364 NGN/USD per open.er-api.com, 2026-08-09 — Naira is materially more
// volatile than EUR/BRL, so treat this fallback as a rougher approximation.
const FALLBACK_NGN_USD = 1 / 1364;

export function getStablecoinUsdPrice(
  symbol: StablecoinSymbol,
  prices: PriceContext,
): number {
  switch (symbol) {
    case "USDM":
    case "USDC":
    // USAT ("USA₮") is Tether/Anchorage's GENIUS Act-compliant dollar
    // stablecoin — pegged 1:1 to USD by its reserve requirements, same as
    // USDM/USDC, not an estimate.
    case "USAT":
      return 1;
    case "cEUR":
      return prices.forexRates?.eurUsd ?? FALLBACK_EUR_USD;
    case "cREAL":
      return prices.forexRates?.brlUsd ?? FALLBACK_BRL_USD;
    case "cNGN":
      return prices.forexRates?.ngnUsd ?? FALLBACK_NGN_USD;
  }
}

export function getCeloUsdPrice(prices: PriceContext): number {
  return prices.celoUsdPrice ?? FALLBACK_CELO_USD;
}
