import { celo } from "wagmi/chains";
import type { Address } from "viem";
import type {
  ContractCall,
  DepositParams,
  ProtocolAdapter,
  WithdrawParams,
} from "@/lib/transactions/types";

// Verified 2026-07-29: LendingPool proxy address from Moola's own genesis
// deployment log (github.com/moolamarket/moola), confirmed still active via
// Blockscout (has_token_transfers/has_logs). Moola is an Aave V1-architecture
// fork, NOT V3 — its LendingPool.redeemUnderlying has an onlyOverlyingAToken
// guard (confirmed by reading LendingPool.sol directly), meaning withdrawals
// cannot be called on the pool. They go through AToken.redeem(uint256)
// instead. aToken addresses were read live on-chain via
// LendingPoolCore.getReserveATokenAddress, not assumed from the old deploy log.
//
// No Celo Sepolia entry: Moola's README documents only an "Alfajores
// deployment and testing log" (github.com/moolamarket/moola/blob/main/README.md)
// — Alfajores itself is dead (deprecated Sept 2025, RPC unreachable — see
// wagmi.ts). Moola never deployed to Celo Sepolia. Add the entry here if
// that changes.
const LENDING_POOL_BY_CHAIN: Record<number, Address> = {
  [celo.id]: "0xc1548F5AA1D76CDcAB7385FA6B5cEA70f941e535",
};

// Keyed by the underlying reserve's on-chain address, not its display
// symbol — so the USDM rename (same address as the old cUSD) required no
// change here at all, only to the inline labels below.
const A_TOKEN_BY_CHAIN_AND_RESERVE: Record<number, Record<string, Address>> = {
  [celo.id]: {
    "0x765de816845861e75a25fca122bb6898b8b1282a": "0x64dEFa3544c695db8c535D289d843a189aa26b98", // USDM (formerly cUSD) -> mCUSD
    "0xd8763cba276a3738e6de85b4b3bf5fded6d6ca73": "0xa8d0E6799FF3Fd19c6459bf02689aE09c4d78Ba7", // cEUR -> mCEUR
  },
};

const lendingPoolAbi = [
  {
    name: "deposit",
    type: "function",
    stateMutability: "payable",
    inputs: [
      { name: "_reserve", type: "address" },
      { name: "_amount", type: "uint256" },
      { name: "_referralCode", type: "uint16" },
    ],
    outputs: [],
  },
] as const;

const aTokenAbi = [
  {
    name: "redeem",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "_amount", type: "uint256" }],
    outputs: [],
  },
] as const;

function getLendingPoolAddress(chainId: number): Address {
  const address = LENDING_POOL_BY_CHAIN[chainId];
  if (!address) {
    throw new Error(`Moola Market has no known deployment on chain ${chainId}`);
  }
  return address;
}

function getATokenAddress(chainId: number, tokenAddress: Address): Address {
  const aToken = A_TOKEN_BY_CHAIN_AND_RESERVE[chainId]?.[tokenAddress.toLowerCase()];
  if (!aToken) {
    throw new Error(`Moola adapter: no known aToken for reserve ${tokenAddress} on chain ${chainId}`);
  }
  return aToken;
}

export const moolaAdapter: ProtocolAdapter = {
  id: "moola-market-celo",

  isSupportedOnChain: (chainId) => chainId in LENDING_POOL_BY_CHAIN,

  // Moola has no incentives/rewards contract in its source at all (unlike
  // Aave V3's RewardsController) — this is a permanent "no", not chain-specific.
  supportsClaimRewards: () => false,

  getSpenderAddress: ({ chainId }: DepositParams) => getLendingPoolAddress(chainId),

  buildDepositCall: ({ chainId, tokenAddress, amount }: DepositParams): ContractCall => ({
    address: getLendingPoolAddress(chainId),
    abi: lendingPoolAbi,
    functionName: "deposit",
    args: [tokenAddress, amount, 0],
  }),

  buildWithdrawCall: ({ chainId, tokenAddress, amount }: WithdrawParams): ContractCall => ({
    address: getATokenAddress(chainId, tokenAddress),
    abi: aTokenAbi,
    functionName: "redeem",
    args: [amount],
  }),

  // Moola has no separate incentives/rewards contract in its source (unlike
  // Aave V3's RewardsController) — interest accrues directly into the
  // aToken balance, nothing to claim separately.
  buildClaimRewardsCall: (): ContractCall | null => null,

  getReceiptTokenAddress: (chainId, reserveTokenAddress) =>
    A_TOKEN_BY_CHAIN_AND_RESERVE[chainId]?.[reserveTokenAddress.toLowerCase()] ?? null,
};
