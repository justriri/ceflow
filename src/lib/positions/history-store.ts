import type { TransactionRecord } from "@/lib/positions/types";

const STORAGE_KEY = "celo-yield-agent:tx-history:v1";

/**
 * Transaction history is tracked client-side only (localStorage) — this app
 * has no backend/indexer, so it can only know about deposits, withdrawals,
 * and claims made THROUGH this app on this device. A position opened via a
 * protocol's own site, or from a different browser/device, won't appear
 * here even though the on-chain position itself is still detected correctly
 * by usePositions (which reads live balances, not history).
 */
export function loadHistory(): TransactionRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveHistory(records: TransactionRecord[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
    // Storage full or unavailable (private browsing, etc.) — history is
    // best-effort, degrade silently rather than break the app.
  }
}
