import type { Address } from "viem";

export type AccessGateStatus = "granted" | "payment-required";

/**
 * x402 on Celo settles via EIP-3009 transferWithAuthorization, which
 * Mento's StableTokenV2 (USDM/cUSD, cEUR, cREAL) does not implement — only
 * EIP-2612 permit. Verified against docs.celo.org's x402 facilitator docs,
 * 2026-07-29. A price can only be denominated in one of these two assets
 * when using Celo's native facilitator (x402.celo.org); a different
 * facilitator (e.g. thirdweb's) may support more, but that's a fact to
 * verify at integration time, not assume.
 */
export type X402SettlementAsset = "USDC" | "USDT";

export interface PaymentRequirement {
  /** Decimal USD string, e.g. "0.01" — matches the `price` shape thirdweb/x402-express expect. */
  priceUsd: string;
  asset: X402SettlementAsset;
  payToAddress: Address;
  network: "celo";
  description: string;
}

export interface AccessCheckResult {
  status: AccessGateStatus;
  /** Present only when status is "payment-required". */
  requirement?: PaymentRequirement;
}

/**
 * Gates access to a priced resource (e.g. generating a recommendation
 * ranking). This is the entire seam a future x402 integration plugs into:
 * implement this interface, swap the export in payments/index.ts, and every
 * caller (useAccessGate, AccessGateBoundary) picks it up with no other
 * changes — the scoring engine, transaction adapters, and UI components
 * that use the gate never reference a concrete implementation.
 */
export interface AccessGate {
  id: string;
  checkAccess(resourceId: string): Promise<AccessCheckResult>;
}
