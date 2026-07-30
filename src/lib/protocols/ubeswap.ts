import { celo } from "wagmi/chains";
import type { YieldOpportunity } from "@/types/yield";

export const ubeswap: YieldOpportunity = {
  id: "ubeswap-celo",
  protocolName: "Ubeswap",
  protocolType: "lp",
  description:
    "Celo-native DEX supporting USDM (formerly cUSD), cEUR, and cREAL pools, with optional UBE token emissions on top of the base 0.25% trading fee for staked LP positions. Celo's original native DEX, but liquidity has declined substantially from its peak and its unmaintained interface still labels this asset \"cUSD\".",
  supportedStablecoins: ["USDM", "cEUR", "cREAL"],
  apy: {
    value: 4.0,
    isEstimate: true,
    note: "Rough estimate combining the ~0.25% base LP fee with typical UBE emission rewards — not a real observed snapshot (Ubeswap's stablecoin pools were not present in DefiLlama's tracked-yields dataset at research time, 2026-07-25). Confirm current rate on ubeswap.org before relying on it.",
  },
  riskLevel: "high",
  impermanentLossRisk: "medium",
  lockup: { hasLockup: false, description: "No lockup period." },
  withdrawal: {
    isInstant: true,
    description:
      "Remove liquidity anytime, but thinner pools mean higher price impact on larger withdrawals.",
  },
  trustScore: 3,
  protocolUrl: "https://ubeswap.org",
  chainIds: [celo.id],
};
