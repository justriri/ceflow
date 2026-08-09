import { celo } from "wagmi/chains";
import type { YieldOpportunity } from "@/types/yield";

export const uniswapV3: YieldOpportunity = {
  id: "uniswap-v3-celo",
  protocolName: "Uniswap V3",
  protocolType: "lp",
  description:
    "Provide concentrated liquidity to stablecoin pools on Celo (e.g. USDM/USDT, USDM/USDC, USDM/cEUR, cEUR/cREAL) and earn a share of swap fees. Uniswap is the largest DEX by volume on Celo. Uniswap's interface reads the token's on-chain symbol directly, which is still \"cUSD\" (see USDM entry in the token registry), so pools will display as cUSD on app.uniswap.org regardless of the USDM rename.",
  supportedStablecoins: ["USDM", "cEUR", "cREAL", "USDC"],
  apy: {
    value: 0.75,
    isEstimate: true,
    note: "Static fallback snapshot from DefiLlama, 2026-07-29, for the largest USDM pool (USDM/USDT). Rate varies significantly by pool pair, fee tier, and any active Merkl incentive campaigns. Overridden with a live rate when the app can reach DefiLlama.",
  },
  riskLevel: "medium",
  impermanentLossRisk: "low",
  lockup: { hasLockup: false, description: "No lockup period." },
  withdrawal: {
    isInstant: true,
    description:
      "Remove liquidity anytime, subject to pool liquidity and price impact.",
  },
  trustScore: 5,
  protocolUrl: "https://app.uniswap.org",
  chainIds: [celo.id],
  defiLlamaPoolId: "ad10fdd6-8351-4d9b-8695-deb1bf2dc33a",
};

// Separate entry from the main uniswapV3 opportunity above: that entry's
// live rate tracks the USDM/USDT pool specifically and does not reflect
// USAT's own pool, so folding USAT into supportedStablecoins there would
// silently apply the wrong APY to it.
export const uniswapV3UsdtUsat: YieldOpportunity = {
  id: "uniswap-v3-usdt-usat-celo",
  protocolName: "Uniswap V3",
  protocolType: "lp",
  description:
    "Provide liquidity to the USD₮ (Tether)/USAT 0.05% pool on Celo — the only DeFi liquidity that exists for USAT (Tether's GENIUS Act-compliant, Anchorage Digital Bank-issued dollar stablecoin) on Celo as of 2026-08-09. Verified real pool with ~$80k TVL, but USAT only launched on Celo 2026-07-29 and trading volume has been minimal (~$10 over the past 7 days) — the swap-fee yield is effectively zero right now, not a meaningful income source. This is not listed on Aave, Moola, Mento, Curve, or Ubeswap.",
  supportedStablecoins: ["USAT"],
  apy: {
    value: 0,
    isEstimate: true,
    note: "Static fallback snapshot from DefiLlama, 2026-08-09. Effectively 0% due to extremely low trading volume since launch — do not treat this as an attractive yield opportunity. Overridden with a live rate when the app can reach DefiLlama, but expect it to stay near zero until volume picks up.",
  },
  riskLevel: "high",
  impermanentLossRisk: "low",
  lockup: { hasLockup: false, description: "No lockup period." },
  withdrawal: {
    isInstant: true,
    description:
      "Remove liquidity anytime, but ~$80k total pool depth means meaningful price impact on larger withdrawals.",
  },
  trustScore: 5,
  protocolUrl: "https://app.uniswap.org",
  chainIds: [celo.id],
  defiLlamaPoolId: "01204095-7253-42f8-a59b-e53b58e481a5",
};
