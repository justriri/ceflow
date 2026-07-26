import { celo, celoSepolia } from "wagmi/chains";
import type { Address } from "viem";

export type StablecoinSymbol = "cUSD" | "cEUR" | "cREAL";

interface StablecoinConfig {
  symbol: StablecoinSymbol;
  name: string;
  decimals: 18;
  addresses: Record<number, Address>;
}

// Addresses verified against on-chain token metadata (name/symbol/decimals)
// via Blockscout, not just docs, since Celo's docs table has mismatched
// labels for the Sepolia testnet tokens.
export const STABLECOINS: StablecoinConfig[] = [
  {
    symbol: "cUSD",
    name: "Celo Dollar",
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
];

export const SUPPORTED_CHAIN_IDS: number[] = [celo.id, celoSepolia.id];
