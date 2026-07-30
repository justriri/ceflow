import { CalendarDays } from "lucide-react";
import { RiskBadge } from "@/components/risk-badge";
import { EarningsTracker } from "@/components/earnings-tracker";
import { WithdrawAction } from "@/components/withdraw-action";
import type { Position } from "@/lib/positions/types";

function formatDate(timestamp: number | null): string {
  if (timestamp === null) return "Not tracked (position may predate this app)";
  return new Date(timestamp).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

interface PositionCardProps {
  position: Position;
}

export function PositionCard({ position }: PositionCardProps) {
  const {
    protocolName,
    protocolUrl,
    stablecoinSymbol,
    currentAmount,
    currentUsdValue,
    apyValue,
    apyIsEstimate,
    riskLevel,
    firstDepositAt,
    opportunityId,
  } = position;

  return (
    <div className="panel panel-interactive flex h-full flex-col gap-4 p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <a
            href={protocolUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-lg font-semibold text-foreground underline decoration-transparent transition-colors hover:decoration-current"
          >
            {protocolName}
          </a>
          <span className="text-sm text-muted">
            {stablecoinSymbol}
            {stablecoinSymbol === "USDM" && " (cUSD-compatible — same underlying asset)"}
          </span>
        </div>
        <RiskBadge level={riskLevel} />
      </div>

      <div className="flex flex-wrap gap-8">
        <div className="flex flex-col gap-1">
          <span className="text-sm text-muted">Deposited amount</span>
          <span className="text-2xl font-semibold text-foreground tabular-nums">
            {currentAmount.toLocaleString(undefined, { maximumFractionDigits: 4 })}{" "}
            <span className="text-base font-normal text-muted">{stablecoinSymbol}</span>
          </span>
          <span className="text-xs text-muted tabular-nums">
            ≈ ${currentUsdValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <span className="flex items-center gap-1.5 text-sm text-muted">
            APY
            {apyIsEstimate ? (
              <span className="rounded-full bg-surface-2 px-1.5 py-0.5 text-[10px] font-medium text-muted">
                estimate
              </span>
            ) : (
              <span className="flex items-center gap-1 rounded-full bg-success-soft px-1.5 py-0.5 text-[10px] font-medium text-success">
                <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden="true" />
                live
              </span>
            )}
          </span>
          <span className="text-2xl font-semibold text-foreground tabular-nums">{apyValue}%</span>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <span className="flex items-center gap-1.5 text-sm text-muted">
          <CalendarDays size={13} />
          Deposit date
        </span>
        <span className="text-sm text-foreground">{formatDate(firstDepositAt)}</span>
      </div>

      <EarningsTracker position={position} />

      <div className="mt-auto flex flex-col gap-2 border-t border-border-subtle pt-4">
        <WithdrawAction
          opportunityId={opportunityId}
          stablecoinSymbol={stablecoinSymbol}
          depositedAmount={currentAmount.toString()}
        />
      </div>
    </div>
  );
}
