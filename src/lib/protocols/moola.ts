import { celo } from "wagmi/chains";
import type { YieldOpportunity } from "@/types/yield";

export const moolaMarket: YieldOpportunity = {
  id: "moola-market-celo",
  protocolName: "Moola Market",
  protocolType: "lending",
  description:
    "Celo-native lending market for USDM (formerly cUSD) and cEUR. Moola suffered a governance-key exploit in February 2023; the protocol has continued operating since, but with much lower TVL and activity than before. Moola's own contracts and site still refer to this asset only as \"cUSD\" — the underlying token is identical, just an older, unmaintained interface that predates the USDM rename.",
  supportedStablecoins: ["USDM", "cEUR"],
  apy: {
    value: 0,
    isEstimate: true,
    note: "Static fallback snapshot from DefiLlama, 2026-07-29 (USDM pool; cEUR ~0.99% at the same snapshot). Overridden with a live rate when the app can reach DefiLlama.",
  },
  riskLevel: "high",
  impermanentLossRisk: "none",
  lockup: { hasLockup: false, description: "No lockup period." },
  withdrawal: {
    isInstant: true,
    description:
      "Withdraw anytime, subject to available liquidity in the pool.",
  },
  trustScore: 2,
  protocolUrl: "https://moola.market",
  chainIds: [celo.id],
  defiLlamaPoolId: "905730f7-04b6-4deb-8e59-707d3d457f6b",
};
