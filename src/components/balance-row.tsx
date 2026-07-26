"use client";

import { formatAmount } from "@/lib/celo-format";

interface BalanceRowProps {
  label: string;
  formatted: string | undefined;
  isLoading: boolean;
  isError: boolean;
  onRetry?: () => void;
}

export function BalanceRow({
  label,
  formatted,
  isLoading,
  isError,
  onRetry,
}: BalanceRowProps) {
  return (
    <div className="flex items-center justify-between border-b border-black/5 py-3 last:border-0 dark:border-white/5">
      <span className="text-sm text-zinc-600 dark:text-zinc-400">{label}</span>
      {isLoading ? (
        <span
          role="status"
          aria-label={`Loading ${label} balance`}
          className="h-4 w-20 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800"
        />
      ) : isError ? (
        <button
          type="button"
          onClick={onRetry}
          className="text-sm text-red-600 underline decoration-dotted dark:text-red-400"
        >
          Unable to load — retry
        </button>
      ) : (
        <span className="font-mono text-sm text-black dark:text-zinc-50">
          {formatAmount(formatted) ?? "0"}
        </span>
      )}
    </div>
  );
}
