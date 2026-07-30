import type { StablecoinSymbol } from "@/config/tokens";

export type ProtocolType = "lending" | "lp" | "vault" | "staking";

export type RiskLevel = "low" | "medium" | "high";

export type ImpermanentLossRisk = "none" | "low" | "medium" | "high";

export interface LockupInfo {
  /** False for opportunities you can exit at any time. */
  hasLockup: boolean;
  description: string;
}

export interface WithdrawalInfo {
  /** False if withdrawals can be delayed, queued, or otherwise restricted. */
  isInstant: boolean;
  description: string;
}

export interface ApyEstimate {
  /**
   * Annual percentage yield, as a percentage (e.g. 4.2 = 4.2%).
   * This is a placeholder estimate, not a live rate — see `isEstimate`.
   */
  value: number;
  /**
   * Always true until this is wired to a live rate API. Callers must not
   * present `value` as a real-time figure while this is true.
   */
  isEstimate: boolean;
  note: string;
}

export interface YieldOpportunity {
  id: string;
  protocolName: string;
  protocolType: ProtocolType;
  description: string;
  supportedStablecoins: StablecoinSymbol[];
  apy: ApyEstimate;
  riskLevel: RiskLevel;
  impermanentLossRisk: ImpermanentLossRisk;
  lockup: LockupInfo;
  withdrawal: WithdrawalInfo;
  /**
   * 1 (least established) to 5 (most established/audited/battle-tested).
   * A separate signal from riskLevel — e.g. a protocol can be low-TVL but
   * still low-mechanism-risk, or vice versa.
   */
  trustScore: 1 | 2 | 3 | 4 | 5;
  protocolUrl: string;
  /** Chain IDs this opportunity is actually deployed and usable on. */
  chainIds: number[];
  /**
   * DefiLlama pool UUID for the stablecoin `apy` represents, if this
   * opportunity has a live rate source. Absent when no live source was
   * found for this protocol on Celo — `apy` stays a static estimate.
   */
  defiLlamaPoolId?: string;
}
