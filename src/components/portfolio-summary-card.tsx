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
    <div className="grid grid-cols-2 gap-6 rounded-2xl border border-black/10 bg-white p-6 dark:border-white/10 dark:bg-zinc-950 sm:grid-cols-3 lg:grid-cols-5">
      <div className="flex flex-col gap-1">
        <span className="text-sm text-zinc-500 dark:text-zinc-400">Total portfolio value</span>
        <span className="text-2xl font-semibold text-black dark:text-zinc-50">
          {fmtUsd(totalValue)}
        </span>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-sm text-zinc-500 dark:text-zinc-400">Total deposited</span>
        <span className="text-2xl font-semibold text-black dark:text-zinc-50">
          {fmtUsd(totalDeposited)}
          {hasUntrackedPositions && <span className="align-top text-xs">*</span>}
        </span>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-sm text-zinc-500 dark:text-zinc-400">Estimated earnings</span>
        <span className="text-2xl font-semibold text-black dark:text-zinc-50">
          {totalEarnings >= 0 ? "+" : ""}
          {fmtUsd(totalEarnings)}
          {hasUntrackedPositions && <span className="align-top text-xs">*</span>}
        </span>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-sm text-zinc-500 dark:text-zinc-400">Weighted avg. APY</span>
        <span className="text-2xl font-semibold text-black dark:text-zinc-50">
          {weightedApy.toFixed(2)}%
        </span>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-sm text-zinc-500 dark:text-zinc-400">Active positions</span>
        <span className="text-2xl font-semibold text-black dark:text-zinc-50">
          {positions.length}
        </span>
      </div>
      {hasUntrackedPositions && (
        <p className="col-span-full text-xs text-zinc-400 dark:text-zinc-500">
          * Deposited/earnings totals only include positions with a principal tracked by this app
          (deposits made through this app&apos;s own Deposit flow). Positions opened elsewhere still
          appear above with their live value, but aren&apos;t included in these two totals.
        </p>
      )}
    </div>
  );
}
