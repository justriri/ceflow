import type { YieldOpportunity } from "@/types/yield";
import { aaveV3 } from "@/lib/protocols/aave";
import { moolaMarket } from "@/lib/protocols/moola";
import { uniswapV3 } from "@/lib/protocols/uniswap";
import { mentoV3 } from "@/lib/protocols/mento";
import { curveDex } from "@/lib/protocols/curve";
import { ubeswap } from "@/lib/protocols/ubeswap";

/**
 * Registry of Celo stablecoin yield opportunities.
 *
 * Every entry here was verified as actually deployed and holding real TVL
 * on Celo (cross-checked against DefiLlama, not just docs or memory) before
 * being added. Protocols that couldn't be verified as currently live and
 * supporting USDM/cEUR/cREAL specifically — Stargate, Valora "Earn", Morpho
 * Blue, Beefy — were deliberately left out rather than guessed at. See the
 * project notes for why.
 *
 * USDM note: "USDM" is Celo's cUSD renamed per MGP-12 (Dec 2025) — same
 * contract, same address, no migration. See the `formerSymbol` field on the
 * USDM entry in src/config/tokens.ts for the verification trail.
 */
export const YIELD_OPPORTUNITIES: YieldOpportunity[] = [
  aaveV3,
  moolaMarket,
  uniswapV3,
  mentoV3,
  curveDex,
  ubeswap,
];
