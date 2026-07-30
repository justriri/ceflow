import type { Address } from "viem";

export type TransactionAction = "deposit" | "withdraw" | "claimRewards";

/** Which sub-step of a multi-step flow (e.g. approval, then deposit) is active. */
export type TransactionStep = "approval" | "action" | null;

export type TransactionPhase =
  | "idle"
  | "preparing"
  | "awaiting-signature"
  | "pending"
  | "confirmed"
  | "failed";

export interface ContractCall {
  address: Address;
  abi: readonly unknown[];
  functionName: string;
  args: readonly unknown[];
}

export interface DepositParams {
  chainId: number;
  userAddress: Address;
  tokenAddress: Address;
  amount: bigint;
}

export interface WithdrawParams {
  chainId: number;
  userAddress: Address;
  tokenAddress: Address;
  amount: bigint;
}

export interface ClaimRewardsParams {
  chainId: number;
  userAddress: Address;
  /** aToken (or equivalent receipt-token) addresses to claim rewards for. */
  receiptTokenAddresses: Address[];
}

/**
 * Protocol-specific transaction logic, isolated from the UI and from wagmi.
 * Every method is a pure function returning contract-call config — nothing
 * here reads React state or signs anything. The hook that drives the UI
 * (useProtocolTransaction) is the only place wallet interaction happens.
 *
 * Adapters are chain-aware: `isSupportedOnChain` must be checked by callers
 * before invoking the build* methods, since a protocol may only be deployed
 * on some of the chains this app supports (e.g. mainnet but not the current
 * testnet). The build* methods throw if called for an unsupported chain —
 * that's a defensive backstop, not the intended UI path.
 */
export interface ProtocolAdapter {
  /** Must match the corresponding YieldOpportunity.id in the registry. */
  id: string;
  /** Whether this protocol has a known, verified deployment on the given chain. */
  isSupportedOnChain(chainId: number): boolean;
  /**
   * Whether this protocol has a separate claimable-rewards program on the
   * given chain. Every adapter supports deposit/withdraw once the chain is
   * supported, but rewards are protocol-specific (e.g. Aave's incentive
   * emissions vs Moola, which has no rewards contract at all) — this is a
   * static capability flag, not inferred from calling buildClaimRewardsCall.
   */
  supportsClaimRewards(chainId: number): boolean;
  /** The contract address the user must grant an ERC-20 allowance to before depositing. */
  getSpenderAddress(params: DepositParams): Address;
  buildDepositCall(params: DepositParams): ContractCall;
  buildWithdrawCall(params: WithdrawParams): ContractCall;
  /** Null when this protocol has no separate claimable-rewards action. */
  buildClaimRewardsCall(params: ClaimRewardsParams): ContractCall | null;
  /**
   * The interest-bearing receipt token (e.g. an aToken) that represents a
   * user's deposited position for a given reserve, if one exists and is
   * known. Its `balanceOf` is how we detect and value an active position —
   * null means this protocol/chain/reserve combo can't be detected on-chain
   * by this app.
   */
  getReceiptTokenAddress(chainId: number, reserveTokenAddress: Address): Address | null;
}
