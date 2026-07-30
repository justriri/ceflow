import type { Position } from "@/lib/positions/types";

function fmt(value: number) {
  return value.toLocaleString(undefined, { maximumFractionDigits: 4 });
}

interface EarningsTrackerProps {
  position: Position;
}

/**
 * "Yield Earned" section. Current value comes straight from the receipt
 * token's live on-chain balance (aTokens rebase, so growth is real, not
 * estimated). Everything measured against a starting point — earnings
 * since deposit, and the daily/monthly/yearly projections — is inherently
 * an estimate (projections extrapolate today's APY forward; "since deposit"
 * depends on principal tracked from this app's own history) and is labeled
 * as such.
 */
export function EarningsTracker({ position }: EarningsTrackerProps) {
  const {
    stablecoinSymbol,
    trackedPrincipal,
    currentAmount,
    earningsSinceDeposit,
    dailyEarningsEstimate,
    monthlyEarningsEstimate,
    yearlyEarningsEstimate,
  } = position;

  return (
    <div className="flex flex-col gap-3 rounded-xl bg-zinc-50 p-3 dark:bg-zinc-900">
      <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        Yield earned
      </span>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="flex flex-col">
          <span className="text-xs text-zinc-500 dark:text-zinc-400">Principal</span>
          <span className="font-medium text-black dark:text-zinc-50">
            {trackedPrincipal !== null ? `${fmt(trackedPrincipal)} ${stablecoinSymbol}` : "Not tracked"}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-zinc-500 dark:text-zinc-400">Current value (live)</span>
          <span className="font-medium text-black dark:text-zinc-50">
            {fmt(currentAmount)} {stablecoinSymbol}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-zinc-500 dark:text-zinc-400">Earned since deposit (est.)</span>
          <span className="font-medium text-black dark:text-zinc-50">
            {earningsSinceDeposit !== null
              ? `${earningsSinceDeposit >= 0 ? "+" : ""}${fmt(earningsSinceDeposit)} ${stablecoinSymbol}`
              : "Unknown — predates this app"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 border-t border-black/5 pt-3 dark:border-white/5">
        <div className="flex flex-col">
          <span className="text-xs text-zinc-500 dark:text-zinc-400">Daily (est.)</span>
          <span className="text-sm font-medium text-black dark:text-zinc-50">
            {fmt(dailyEarningsEstimate)}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-zinc-500 dark:text-zinc-400">Monthly (est.)</span>
          <span className="text-sm font-medium text-black dark:text-zinc-50">
            {fmt(monthlyEarningsEstimate)}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-zinc-500 dark:text-zinc-400">Yearly (est.)</span>
          <span className="text-sm font-medium text-black dark:text-zinc-50">
            {fmt(yearlyEarningsEstimate)}
          </span>
        </div>
      </div>
    </div>
  );
}
