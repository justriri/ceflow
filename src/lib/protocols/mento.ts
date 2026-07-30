import { celo } from "wagmi/chains";
import type { YieldOpportunity } from "@/types/yield";

export const mentoV3: YieldOpportunity = {
  id: "mento-v3-celo",
  protocolName: "Mento V3",
  protocolType: "lp",
  description:
    "Provide liquidity to Mento's oracle-priced FX pools (e.g. USDM/cEUR) at app.mento.org. Pools are Chainlink oracle-priced rather than constant-product, which reduces slippage and impermanent loss between correlated fiat-pegged stables. Mento Labs authored the USDM rename (MGP-12) itself, so its own app and DefiLlama pool listings already use \"USDM\" natively — this is the one integration with no legacy-naming gap.",
  supportedStablecoins: ["USDM", "cEUR", "USDC"],
  apy: {
    value: 0,
    isEstimate: true,
    note: "Static fallback snapshot from DefiLlama, 2026-07-29, for the USDM/cEUR pool (essentially 0% at snapshot time; other Mento pairs ranged 0-1.25%). Overridden with a live rate when the app can reach DefiLlama.",
  },
  riskLevel: "medium",
  impermanentLossRisk: "low",
  lockup: { hasLockup: false, description: "No lockup period." },
  withdrawal: {
    isInstant: true,
    description:
      "Remove liquidity anytime, subject to pool liquidity.",
  },
  trustScore: 4,
  protocolUrl: "https://app.mento.org",
  chainIds: [celo.id],
  defiLlamaPoolId: "dcf2f352-5100-44af-b11f-c2cbc0845b10",
};
