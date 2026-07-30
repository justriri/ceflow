import type { Address } from "viem";
import type { StablecoinSymbol } from "@/config/tokens";
import type { TransactionAction } from "@/lib/transactions/types";
import type { RiskLevel } from "@/types/yield";

export interface TransactionRecord {
  id: string;
  action: TransactionAction;
  opportunityId: string;
  protocolName: string;
  /** Undefined for claimRewards, which isn't tied to one specific asset. */
  stablecoinSymbol?: StablecoinSymbol;
  /** Human-readable decimal amount, e.g. "12.5". Empty for claimRewards. */
  amount: string;
  txHash: `0x${string}` | null;
  status: "pending" | "confirmed" | "failed";
  timestamp: number;
  /** Scopes records per-wallet, since localStorage is device-wide, not wallet-scoped. */
  walletAddress: Address;
  chainId: number;
}

export interface Position {
  opportunityId: string;
  protocolName: string;
  protocolUrl: string;
  stablecoinSymbol: StablecoinSymbol;
  /** Live on-chain receipt-token balance — already reflects accrued interest. */
  currentAmount: number;
  currentUsdValue: number;
  apyValue: number;
  apyIsEstimate: boolean;
  riskLevel: RiskLevel;
  /**
   * Cost basis tracked from this app's own transaction history. Null if we
   * have no recorded deposits for this position (e.g. it predates this app,
   * or was made through the protocol's own site) — callers must not treat
   * null as zero.
   */
  trackedPrincipal: number | null;
  earningsSinceDeposit: number | null;
  dailyEarningsEstimate: number;
  monthlyEarningsEstimate: number;
  yearlyEarningsEstimate: number;
  /** Timestamp of the earliest recorded deposit, or null if unknown. */
  firstDepositAt: number | null;
}
