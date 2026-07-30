import { celo } from "wagmi/chains";
import type { Address } from "viem";
import type {
  ClaimRewardsParams,
  ContractCall,
  DepositParams,
  ProtocolAdapter,
  WithdrawParams,
} from "@/lib/transactions/types";

// Verified 2026-07-29 against the deployed contract's own ABI on Blockscout
// (celo.blockscout.com), and cross-checked against Aave's official
// aave-address-book (aave-dao/aave-address-book, AaveV3Celo.sol).
//
// No Celo Sepolia entry: checked aave-dao/aave-address-book's src/ listing
// directly — it has AaveV3*Sepolia.sol for Arbitrum, Base, Optimism, Scroll,
// Ink, and plain Ethereum, but no AaveV3CeloSepolia.sol. Aave V3 has not
// deployed a Celo Sepolia instance. Add the entry here if that changes.
const POOL_ADDRESS_BY_CHAIN: Record<number, Address> = {
  [celo.id]: "0x3E59A31363E2ad014dcbc521c4a0d5757d9f3402",
};
const INCENTIVES_CONTROLLER_BY_CHAIN: Record<number, Address> = {
  [celo.id]: "0x4725A0FdbEB14A77964bC1C221eE3a7982263103",
};

// aTokens (interest-bearing receipt tokens) per reserve, verified 2026-07-29
// against aave-dao/aave-address-book's AaveV3CeloAssets library and
// cross-checked live on Blockscout (real holder counts: 666/60/851 for
// USDM/cEUR/USDC respectively — genuinely in use, not stale addresses).
// balanceOf on these already reflects live accrued interest since aTokens
// rebase — no separate "growth" calculation needed for current position value.
const A_TOKEN_BY_CHAIN_AND_RESERVE: Record<number, Record<string, Address>> = {
  [celo.id]: {
    "0x765de816845861e75a25fca122bb6898b8b1282a": "0xBba98352628B0B0c4b40583F593fFCb630935a45", // USDM -> aCelcUSD
    "0xd8763cba276a3738e6de85b4b3bf5fded6d6ca73": "0x34c02571094e08E935B8cf8dC10F1Ad6795f1f81", // cEUR -> aCelcEUR
    "0xceba9300f2b948710d2653dd7b07f33a8b32118c": "0xFF8309b9e99bfd2D4021bc71a362aBD93dBd4785", // USDC -> aCelUSDC
  },
};

function getPoolAddress(chainId: number): Address {
  const address = POOL_ADDRESS_BY_CHAIN[chainId];
  if (!address) {
    throw new Error(`Aave V3 has no known deployment on chain ${chainId}`);
  }
  return address;
}

const poolAbi = [
  {
    name: "supply",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "asset", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "onBehalfOf", type: "address" },
      { name: "referralCode", type: "uint16" },
    ],
    outputs: [],
  },
  {
    name: "withdraw",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "asset", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "to", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

const incentivesAbi = [
  {
    name: "claimAllRewards",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "assets", type: "address[]" },
      { name: "to", type: "address" },
    ],
    outputs: [
      { name: "rewardsList", type: "address[]" },
      { name: "claimedAmounts", type: "uint256[]" },
    ],
  },
] as const;

export const aaveAdapter: ProtocolAdapter = {
  id: "aave-v3-celo",

  isSupportedOnChain: (chainId) => chainId in POOL_ADDRESS_BY_CHAIN,

  supportsClaimRewards: (chainId) => chainId in INCENTIVES_CONTROLLER_BY_CHAIN,

  getSpenderAddress: ({ chainId }: DepositParams) => getPoolAddress(chainId),

  buildDepositCall: ({
    chainId,
    tokenAddress,
    amount,
    userAddress,
  }: DepositParams): ContractCall => ({
    address: getPoolAddress(chainId),
    abi: poolAbi,
    functionName: "supply",
    args: [tokenAddress, amount, userAddress, 0],
  }),

  buildWithdrawCall: ({
    chainId,
    tokenAddress,
    amount,
    userAddress,
  }: WithdrawParams): ContractCall => ({
    address: getPoolAddress(chainId),
    abi: poolAbi,
    functionName: "withdraw",
    args: [tokenAddress, amount, userAddress],
  }),

  buildClaimRewardsCall: ({
    chainId,
    userAddress,
    receiptTokenAddresses,
  }: ClaimRewardsParams): ContractCall | null => {
    if (receiptTokenAddresses.length === 0) return null;
    const address = INCENTIVES_CONTROLLER_BY_CHAIN[chainId];
    if (!address) {
      throw new Error(`Aave V3 has no known incentives controller on chain ${chainId}`);
    }
    return {
      address,
      abi: incentivesAbi,
      functionName: "claimAllRewards",
      args: [receiptTokenAddresses, userAddress],
    };
  },

  getReceiptTokenAddress: (chainId, reserveTokenAddress) =>
    A_TOKEN_BY_CHAIN_AND_RESERVE[chainId]?.[reserveTokenAddress.toLowerCase()] ?? null,
};
