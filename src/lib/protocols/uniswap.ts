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
