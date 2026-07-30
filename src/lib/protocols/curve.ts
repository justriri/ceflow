import { celo } from "wagmi/chains";
import type { YieldOpportunity } from "@/types/yield";

export const curveDex: YieldOpportunity = {
  id: "curve-celo",
  protocolName: "Curve",
  protocolType: "lp",
  description:
    "Curve's stable-asset pools on Celo cover USDM (formerly cUSD), cEUR, and cREAL alongside bridged USDC/USDT/DAI. Curve's bonding-curve design is specifically built to minimize impermanent loss between correlated stable assets. Curve's UI reads the token's on-chain symbol directly, which is still \"cUSD\", so expect that legacy label on curve.finance itself.",
  supportedStablecoins: ["USDM", "cEUR", "cREAL", "USDC"],
  apy: {
    value: 2.0,
    isEstimate: true,
    note: "Rough estimate — Curve's Celo pools were not present in DefiLlama's tracked-yields dataset at research time (2026-07-25), so this is not a real observed snapshot like the other entries. Confirm current rate on curve.finance before relying on it.",
  },
  riskLevel: "low",
  impermanentLossRisk: "low",
  lockup: { hasLockup: false, description: "No lockup period." },
  withdrawal: {
    isInstant: true,
    description:
      "Remove liquidity anytime, subject to pool liquidity.",
  },
  trustScore: 5,
  protocolUrl: "https://curve.finance",
  chainIds: [celo.id],
};
