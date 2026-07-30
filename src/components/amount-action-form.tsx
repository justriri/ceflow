"use client";

import { useState } from "react";
import { TransactionStatus } from "@/components/transaction-status";
import type { TransactionPhase, TransactionStep } from "@/lib/transactions/types";

interface AmountActionFormProps {
  label: string;
  actionLabel: string;
  busyLabel: string;
  maxAmount: string | undefined;
  maxHelperLabel: string;
  phase: TransactionPhase;
  step: TransactionStep;
  error: string | null;
  txHash: `0x${string}` | null;
  onSubmit: (humanAmount: string) => Promise<void>;
  onReset: () => void;
}

/** Shared amount-entry + lifecycle UI for both deposit and withdraw actions. */
export function AmountActionForm({
  label,
  actionLabel,
  busyLabel,
  maxAmount,
  maxHelperLabel,
  phase,
  step,
  error,
  txHash,
  onSubmit,
  onReset,
}: AmountActionFormProps) {
  const [amountInput, setAmountInput] = useState("");
  const isBusy = phase === "preparing" || phase === "awaiting-signature" || phase === "pending";
  const isDone = phase === "confirmed" || phase === "failed";

  const handleSubmit = async () => {
    const parsed = Number(amountInput);
    if (!Number.isFinite(parsed) || parsed <= 0) return;
    await onSubmit(amountInput);
  };

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm text-zinc-500 dark:text-zinc-400">{label}</span>
      <div className="flex gap-2">
        <input
          type="number"
          inputMode="decimal"
          min={0}
          step="any"
          placeholder="0.0"
          value={amountInput}
          disabled={isBusy}
          onChange={(e) => setAmountInput(e.target.value)}
          className="min-w-0 flex-1 rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-black/20 disabled:opacity-50 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:ring-white/20"
        />
        {maxAmount !== undefined && (
          <button
            type="button"
            disabled={isBusy}
            onClick={() => setAmountInput(maxAmount)}
            className="rounded-lg border border-black/10 px-3 py-2 text-xs font-medium text-zinc-600 hover:bg-black/[.02] disabled:opacity-50 dark:border-white/10 dark:text-zinc-400 dark:hover:bg-white/[.03]"
          >
            Max
          </button>
        )}
        <button
          type="button"
          disabled={isBusy || !amountInput}
          onClick={handleSubmit}
          className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-black"
        >
          {isBusy ? busyLabel : actionLabel}
        </button>
      </div>
      {maxAmount !== undefined && (
        <span className="text-xs text-zinc-400 dark:text-zinc-500">{maxHelperLabel}</span>
      )}
      <TransactionStatus phase={phase} step={step} error={error} txHash={txHash} />
      {isDone && (
        <button
          type="button"
          onClick={() => {
            onReset();
            setAmountInput("");
          }}
          className="self-start text-xs text-zinc-500 underline dark:text-zinc-400"
        >
          Dismiss
        </button>
      )}
    </div>
  );
}
