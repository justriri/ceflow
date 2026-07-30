import { celo } from "wagmi/chains";
import type { YieldOpportunity } from "@/types/yield";

export const aaveV3: YieldOpportunity = {
  id: "aave-v3-celo",
  protocolName: "Aave V3",
  protocolType: "lending",
  description:
    "Supply USDM (formerly cUSD), cEUR, or USDC to Aave's Celo money market to earn variable interest paid by borrowers. Aave is one of the most established and audited lending protocols in DeFi. DefiLlama already tracks this pool under the new \"USDM\" symbol.",
  supportedStablecoins: ["USDM", "cEUR", "USDC"],
  apy: {
    value: 2.97,
    isEstimate: true,
    note: "Static fallback snapshot from DefiLlama, 2026-07-29 (USDM pool; cEUR ~3.75%, USDC ~2.57% at the same snapshot). Overridden with a live rate when the app can reach DefiLlama.",
  },
  riskLevel: "low",
  impermanentLossRisk: "none",
  lockup: { hasLockup: false, description: "No lockup period." },
  withdrawal: {
    isInstant: true,
    description:
      "Withdraw anytime, subject to available liquidity in the pool.",
  },
  trustScore: 5,
  protocolUrl: "https://app.aave.com",
  chainIds: [celo.id],
  defiLlamaPoolId: "4bbdb2ff-3237-44a5-bb86-6562f9814ad9",
};
