import type { YieldOpportunity } from "@/types/yield";
import { aaveV3 } from "@/lib/protocols/aave";
import { moolaMarket } from "@/lib/protocols/moola";
import { uniswapV3, uniswapV3UsdtUsat } from "@/lib/protocols/uniswap";
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
 *
 * cNGN note: cNGN (Africa Stablecoin Consortium's regulated Naira
 * stablecoin) launched on Celo 2026-08-07 but has zero DeFi liquidity
 * anywhere on Celo as of 2026-08-09 (7 token holders total, none of them a
 * DEX or lending contract) — deliberately has no entry here. It is still
 * listed in src/config/tokens.ts so balances display correctly; add a
 * protocol entry once a real, verifiable opportunity exists.
 *
 * USAT note: USAT ("USA₮", Tether/Anchorage Digital Bank's GENIUS
 * Act-compliant dollar stablecoin) launched on Celo 2026-07-29. The only
 * verified liquidity is a Uniswap V3 USD₮/USAT 0.05% pool (~$80k TVL,
 * ~$10/week volume) — see uniswapV3UsdtUsat below. Its APY is realistically
 * ~0% and is kept as a separate entry from the main uniswapV3 opportunity so
 * USAT never inherits that pool's (unrelated) USDM-pool APY.
 */
export const YIELD_OPPORTUNITIES: YieldOpportunity[] = [
  aaveV3,
  moolaMarket,
  uniswapV3,
  uniswapV3UsdtUsat,
  mentoV3,
  curveDex,
  ubeswap,
];
