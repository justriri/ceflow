import type { Address } from "viem";
import type { StablecoinSymbol } from "@/config/tokens";
import type { TransactionRecord } from "@/lib/positions/types";

function matchesPosition(
  record: TransactionRecord,
  opportunityId: string,
  symbol: StablecoinSymbol,
  walletAddress: Address,
): boolean {
  return (
    record.opportunityId === opportunityId &&
    record.stablecoinSymbol === symbol &&
    record.walletAddress.toLowerCase() === walletAddress.toLowerCase() &&
    record.status === "confirmed"
  );
}

/**
 * Net principal tracked from this app's own deposit/withdraw history for one
 * position. Returns null (not 0) when there's no recorded history at all —
 * that means the position predates this app or was opened elsewhere, and
 * callers must not treat it as "deposited nothing."
 */
export function calculateTrackedPrincipal(
  records: TransactionRecord[],
  opportunityId: string,
  symbol: StablecoinSymbol,
  walletAddress: Address,
): number | null {
  const relevant = records.filter(
    (r) =>
      matchesPosition(r, opportunityId, symbol, walletAddress) &&
      (r.action === "deposit" || r.action === "withdraw"),
  );
  if (relevant.length === 0) return null;

  let principal = 0;
  for (const r of relevant) {
    const amount = Number(r.amount);
    if (!Number.isFinite(amount)) continue;
    principal += r.action === "deposit" ? amount : -amount;
  }
  return principal;
}

/** Earliest confirmed deposit timestamp for a position, or null if unknown. */
export function getFirstDepositDate(
  records: TransactionRecord[],
  opportunityId: string,
  symbol: StablecoinSymbol,
  walletAddress: Address,
): number | null {
  const deposits = records.filter(
    (r) => matchesPosition(r, opportunityId, symbol, walletAddress) && r.action === "deposit",
  );
  if (deposits.length === 0) return null;
  return Math.min(...deposits.map((r) => r.timestamp));
}

export interface EarningsProjection {
  daily: number;
  monthly: number;
  yearly: number;
}

/** Forward-looking earnings estimate from current balance and current APY. */
export function projectEarnings(currentAmount: number, apyPercent: number): EarningsProjection {
  const yearly = (currentAmount * apyPercent) / 100;
  return {
    daily: yearly / 365,
    monthly: yearly / 12,
    yearly,
  };
}
