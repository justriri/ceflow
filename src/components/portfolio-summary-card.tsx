import type { Position } from "@/lib/positions/types";

function fmtUsd(value: number) {
  return `$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

interface PortfolioSummaryCardProps {
  positions: Position[];
}

export function PortfolioSummaryCard({ positions }: PortfolioSummaryCardProps) {
  const totalValue = positions.reduce((sum, p) => sum + p.currentUsdValue, 0);

  const trackedPositions = positions.filter((p) => p.trackedPrincipal !== null);
  const hasUntrackedPositions = trackedPositions.length < positions.length;
  const totalDeposited = trackedPositions.reduce((sum, p) => sum + (p.trackedPrincipal ?? 0), 0);
  const totalEarnings = trackedPositions.reduce((sum, p) => sum + (p.earningsSinceDeposit ?? 0), 0);

  const weightedApy =
    totalValue > 0
      ? positions.reduce((sum, p) => sum + p.apyValue * p.currentUsdValue, 0) / totalValue
      : 0;

  return (
    <div className="panel grid grid-cols-2 gap-6 p-6 sm:grid-cols-3 lg:grid-cols-5">
      <div className="flex flex-col gap-1">
        <span className="text-sm text-muted">Total portfolio value</span>
        <span className="text-2xl font-semibold text-foreground tabular-nums">{fmtUsd(totalValue)}</span>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-sm text-muted">Total deposited</span>
        <span className="text-2xl font-semibold text-foreground tabular-nums">
          {fmtUsd(totalDeposited)}
          {hasUntrackedPositions && <span className="align-top text-xs">*</span>}
        </span>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-sm text-muted">Estimated earnings</span>
        <span
          className={`text-2xl font-semibold tabular-nums ${totalEarnings >= 0 ? "text-success" : "text-danger"}`}
        >
          {totalEarnings >= 0 ? "+" : ""}
          {fmtUsd(totalEarnings)}
          {hasUntrackedPositions && <span className="align-top text-xs">*</span>}
        </span>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-sm text-muted">Weighted avg. APY</span>
        <span className="text-2xl font-semibold text-foreground tabular-nums">
          {weightedApy.toFixed(2)}%
        </span>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-sm text-muted">Active positions</span>
        <span className="text-2xl font-semibold text-foreground tabular-nums">{positions.length}</span>
      </div>
      {hasUntrackedPositions && (
        <p className="col-span-full text-xs text-muted-2">
          * Deposited/earnings totals only include positions with a principal tracked by this app
          (deposits made through this app&apos;s own Deposit flow). Positions opened elsewhere still
          appear above with their live value, but aren&apos;t included in these two totals.
        </p>
      )}
    </div>
  );
}
