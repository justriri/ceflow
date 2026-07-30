import { Loader2, CircleCheck, CircleX, ExternalLink } from "lucide-react";
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
    <div className="animate-fade-in flex flex-col gap-1.5 rounded-lg border border-border-subtle bg-surface-2 p-3 text-sm">
      <div className="flex items-center gap-2">
        {isBusy && <Loader2 size={13} className="animate-spin text-accent" aria-hidden="true" />}
        {phase === "confirmed" && <CircleCheck size={14} className="text-success" aria-hidden="true" />}
        {phase === "failed" && <CircleX size={14} className="text-danger" aria-hidden="true" />}
        <span className="text-foreground">
          {stepPrefix(step)}
          {PHASE_LABELS[phase]}
        </span>
      </div>
      {txHash && (
        <a
          href={`https://celoscan.io/tx/${txHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-fit items-center gap-1 font-mono text-xs text-muted underline transition-colors hover:text-foreground"
        >
          {txHash.slice(0, 10)}…{txHash.slice(-8)}
          <ExternalLink size={10} />
        </a>
      )}
      {error && <span className="text-xs text-danger">{error}</span>}
    </div>
  );
}
