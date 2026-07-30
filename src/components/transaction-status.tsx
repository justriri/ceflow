import type { TransactionPhase, TransactionStep } from "@/lib/transactions/types";

const PHASE_LABELS: Record<TransactionPhase, string> = {
  idle: "",
  preparing: "Preparing transaction…",
  "awaiting-signature": "Waiting for you to sign in your wallet…",
  pending: "Transaction submitted, waiting for confirmation…",
  confirmed: "Confirmed",
  failed: "Failed",
};

function stepPrefix(step: TransactionStep) {
  if (step === "approval") return "Approval: ";
  if (step === "action") return "";
  return "";
}

export function TransactionStatus({
  phase,
  step,
  error,
  txHash,
}: {
  phase: TransactionPhase;
  step: TransactionStep;
  error: string | null;
  txHash: `0x${string}` | null;
}) {
  if (phase === "idle") return null;

  const isBusy = phase === "preparing" || phase === "awaiting-signature" || phase === "pending";

  return (
    <div className="flex flex-col gap-1 rounded-lg border border-black/10 bg-zinc-50 p-3 text-sm dark:border-white/10 dark:bg-zinc-900">
      <div className="flex items-center gap-2">
        {isBusy && (
          <span
            className="h-3 w-3 animate-spin rounded-full border-2 border-zinc-400 border-t-transparent"
            aria-hidden="true"
          />
        )}
        {phase === "confirmed" && (
          <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
        )}
        {phase === "failed" && (
          <span className="h-2 w-2 rounded-full bg-red-500" aria-hidden="true" />
        )}
        <span className="text-zinc-700 dark:text-zinc-300">
          {stepPrefix(step)}
          {PHASE_LABELS[phase]}
        </span>
      </div>
      {txHash && (
        <a
          href={`https://celoscan.io/tx/${txHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-xs text-zinc-500 underline dark:text-zinc-400"
        >
          {txHash.slice(0, 10)}…{txHash.slice(-8)}
        </a>
      )}
      {error && <span className="text-xs text-red-600 dark:text-red-400">{error}</span>}
    </div>
  );
}
