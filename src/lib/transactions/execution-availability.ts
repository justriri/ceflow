import { getAdapter } from "@/lib/transactions/adapters";

export interface ExecutionAvailability {
  opportunityId: string;
  chainId: number | undefined;
  hasAdapter: boolean;
  chainSupported: boolean;
  /** True only when deposit/withdraw can actually be executed right now. */
  available: boolean;
  supportsDeposit: boolean;
  supportsWithdraw: boolean;
  supportsClaimRewards: boolean;
  /** Human-readable explanation of the state above — same info as the debug log, surfaced to the UI. */
  reason: string;
}

/**
 * Determines whether an opportunity can be executed on-chain right now, and
 * why. This is the single source of truth both the UI and the console debug
 * log read from — recommendation ranking (the scoring engine) never calls
 * this and is entirely unaware of it, per the separation-of-concerns
 * requirement: ranking and execution availability are independent axes.
 */
export function getExecutionAvailability(
  opportunityId: string,
  chainId: number | undefined,
): ExecutionAvailability {
  const adapter = getAdapter(opportunityId);
  const base = {
    opportunityId,
    chainId,
    supportsDeposit: false,
    supportsWithdraw: false,
    supportsClaimRewards: false,
  };

  let result: ExecutionAvailability;

  if (!adapter) {
    result = {
      ...base,
      hasAdapter: false,
      chainSupported: false,
      available: false,
      reason: `No transaction adapter is registered for "${opportunityId}" — manual deposit only.`,
    };
  } else if (chainId === undefined) {
    result = {
      ...base,
      hasAdapter: true,
      chainSupported: false,
      available: false,
      reason: `Adapter "${adapter.id}" exists, but no wallet is connected to determine chain support.`,
    };
  } else if (!adapter.isSupportedOnChain(chainId)) {
    result = {
      ...base,
      hasAdapter: true,
      chainSupported: false,
      available: false,
      reason: `Adapter "${adapter.id}" exists, but has no known deployment on chain ${chainId}.`,
    };
  } else {
    const supportsClaimRewards = adapter.supportsClaimRewards(chainId);
    result = {
      ...base,
      hasAdapter: true,
      chainSupported: true,
      available: true,
      supportsDeposit: true,
      supportsWithdraw: true,
      supportsClaimRewards,
      reason: `Adapter "${adapter.id}" supports deposit/withdraw on chain ${chainId}${
        supportsClaimRewards ? " (rewards claimable)." : " (no separate rewards to claim)."
      }`,
    };
  }

  if (process.env.NODE_ENV !== "production") {
    console.debug("[execution-availability]", result);
  }

  return result;
}
