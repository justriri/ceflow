"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
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
      <span className="text-sm text-muted">{label}</span>
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
          className="input-field min-w-0 flex-1 px-3 py-2 text-sm text-foreground disabled:opacity-50"
        />
        {maxAmount !== undefined && (
          <button
            type="button"
            disabled={isBusy}
            onClick={() => setAmountInput(maxAmount)}
            className="btn-secondary shrink-0 px-3 py-2 text-xs"
          >
            Max
          </button>
        )}
        <button
          type="button"
          disabled={isBusy || !amountInput}
          onClick={handleSubmit}
          className="btn-primary shrink-0 px-4 py-2 text-sm"
        >
          {isBusy && <Loader2 size={14} className="animate-spin" />}
          {isBusy ? busyLabel : actionLabel}
        </button>
      </div>
      {maxAmount !== undefined && <span className="text-xs text-muted-2">{maxHelperLabel}</span>}
      <TransactionStatus phase={phase} step={step} error={error} txHash={txHash} />
      {isDone && (
        <button
          type="button"
          onClick={() => {
            onReset();
            setAmountInput("");
          }}
          className="self-start text-xs text-muted underline transition-colors hover:text-foreground"
        >
          Dismiss
        </button>
      )}
    </div>
  );
}
