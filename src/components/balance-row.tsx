"use client";

import { RotateCw } from "lucide-react";
import { formatAmount } from "@/lib/celo-format";

const TOKEN_STYLES: Record<string, string> = {
  CELO: "bg-accent-soft text-accent",
  USDM: "bg-success-soft text-success",
  cEUR: "bg-[rgba(96,165,250,0.12)] text-[#60a5fa]",
  cREAL: "bg-[rgba(45,212,191,0.12)] text-[#2dd4bf]",
  USDC: "bg-[rgba(129,140,248,0.12)] text-[#818cf8]",
};

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
  const badgeStyle = TOKEN_STYLES[label] ?? "bg-surface-2 text-muted";

  return (
    <div className="flex items-center justify-between border-b border-border-subtle py-3.5 last:border-0">
      <div className="flex items-center gap-3">
        <span
          className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${badgeStyle}`}
          aria-hidden="true"
        >
          {label.slice(0, 1)}
        </span>
        <span className="text-sm font-medium text-foreground">{label}</span>
      </div>
      {isLoading ? (
        <span
          role="status"
          aria-label={`Loading ${label} balance`}
          className="skeleton h-4 w-20"
        />
      ) : isError ? (
        <button
          type="button"
          onClick={onRetry}
          className="flex items-center gap-1.5 text-sm text-danger transition-opacity hover:opacity-80"
        >
          <RotateCw size={13} />
          Retry
        </button>
      ) : (
        <span className="font-mono text-sm text-foreground tabular-nums">
          {formatAmount(formatted) ?? "0"}
        </span>
      )}
    </div>
  );
}
