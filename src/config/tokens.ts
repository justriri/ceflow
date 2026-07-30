import { celo, celoSepolia } from "wagmi/chains";
import type { Address } from "viem";

export type StablecoinSymbol = "USDM" | "cEUR" | "cREAL" | "USDC";

interface StablecoinConfig {
  symbol: StablecoinSymbol;
  name: string;
  decimals: number;
  addresses: Record<number, Address>;
  /** Prior symbol this token traded/was known under, if it was renamed. */
  formerSymbol?: string;
}

// Addresses verified against on-chain token metadata (name/symbol/decimals)
// via Blockscout, not just docs, since Celo's docs table has mismatched
// labels for the Sepolia testnet tokens.
export const STABLECOINS: StablecoinConfig[] = [
  {
    // Renamed from cUSD to USDM ("Mento Dollar") per MGP-12 (Mento
    // Governance Proposal 12, live for vote 2025-12-05). This is a display
    // rename only, NOT a contract migration: verified 2026-07-29 that this
    // exact address's own symbol()/name() getters still return "CUSD"/
    // "Celo Dollar" on-chain — Celo's docs, CeloScan, and CoinGecko now
    // *label* it "Mento Dollar (USDm)", but the contract itself is
    // unchanged and unmigrated. No address change on either network.
    symbol: "USDM",
    name: "Mento Dollar",
    formerSymbol: "cUSD",
    decimals: 18,
    addresses: {
      [celo.id]: "0x765DE816845861e75A25fCA122bb6898B8B1282a",
      [celoSepolia.id]: "0xEF4d55D6dE8e8d73232827Cd1e9b2F2dBb45bC80",
    },
  },
  {
    symbol: "cEUR",
    name: "Celo Euro",
    decimals: 18,
    addresses: {
      [celo.id]: "0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73",
      [celoSepolia.id]: "0x6B172e333e2978484261D7eCC3DE491E79764BbC",
    },
  },
  {
    symbol: "cREAL",
    name: "Celo Brazilian Real",
    decimals: 18,
    addresses: {
      [celo.id]: "0xe8537a3d056DA446677B9E9d6c5dB704EaAb4787",
      [celoSepolia.id]: "0x13d68A1Bf4a8cB7d9feF54EF70401871b666269c",
    },
  },
  {
    // USDC uses 6 decimals, unlike Celo's native stablecoins (18) — verified
    // via Blockscout token metadata on both networks, not assumed.
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    addresses: {
      [celo.id]: "0xcebA9300f2b948710d2653dD7B07f33A8B32118C",
      [celoSepolia.id]: "0x01C5C0122039549AD1493B8220cABEdD739BC44E",
    },
  },
];

export const SUPPORTED_CHAIN_IDS: number[] = [celo.id, celoSepolia.id];
