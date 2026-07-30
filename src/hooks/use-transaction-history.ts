"use client";

import { useCallback, useSyncExternalStore } from "react";
import { loadHistory, saveHistory } from "@/lib/positions/history-store";
import type { TransactionRecord } from "@/lib/positions/types";

// Module-level store shared by every call site, so a deposit recorded from
// one component (e.g. DepositAction) is immediately visible to any other
// (ActivePositionsSection, HistoryTab) without waiting for an unrelated
// re-render — useSyncExternalStore is React's dedicated tool for exactly
// this "external mutable store" shape (localStorage), and correctly
// separates the SSR snapshot (empty) from the client one, unlike a
// useState+useEffect pair which caused a set-state-in-effect anti-pattern.
const listeners = new Set<() => void>();
let cachedRecords: TransactionRecord[] = [];
let hasLoaded = false;

function ensureLoaded() {
  if (!hasLoaded) {
    cachedRecords = loadHistory();
    hasLoaded = true;
  }
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function getSnapshot(): TransactionRecord[] {
  ensureLoaded();
  return cachedRecords;
}

function getServerSnapshot(): TransactionRecord[] {
  return [];
}

function persist(next: TransactionRecord[]) {
  cachedRecords = next;
  hasLoaded = true;
  saveHistory(next);
  listeners.forEach((listener) => listener());
}

export function useTransactionHistory() {
  const records = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const addRecord = useCallback((record: TransactionRecord) => {
    persist([...cachedRecords, record]);
  }, []);

  const updateRecord = useCallback(
    (id: string, patch: Partial<Pick<TransactionRecord, "status" | "txHash">>) => {
      persist(cachedRecords.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    },
    [],
  );

  return { records, addRecord, updateRecord };
}
