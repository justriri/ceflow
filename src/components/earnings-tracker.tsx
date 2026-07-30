import { TrendingUp } from "lucide-react";
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
    <div className="flex flex-col gap-3 rounded-xl bg-surface-2 p-4">
      <span className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted uppercase">
        <TrendingUp size={12} className="text-success" />
        Yield earned
      </span>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="flex flex-col">
          <span className="text-xs text-muted">Principal</span>
          <span className="font-medium text-foreground tabular-nums">
            {trackedPrincipal !== null ? `${fmt(trackedPrincipal)} ${stablecoinSymbol}` : "Not tracked"}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-muted">Current value (live)</span>
          <span className="font-medium text-foreground tabular-nums">
            {fmt(currentAmount)} {stablecoinSymbol}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-muted">Earned since deposit (est.)</span>
          <span
            className={`font-medium tabular-nums ${
              earningsSinceDeposit !== null && earningsSinceDeposit >= 0 ? "text-success" : "text-foreground"
            }`}
          >
            {earningsSinceDeposit !== null
              ? `${earningsSinceDeposit >= 0 ? "+" : ""}${fmt(earningsSinceDeposit)} ${stablecoinSymbol}`
              : "Unknown — predates this app"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 border-t border-border-subtle pt-3">
        <div className="flex flex-col">
          <span className="text-xs text-muted">Daily (est.)</span>
          <span className="text-sm font-medium text-foreground tabular-nums">
            {fmt(dailyEarningsEstimate)}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-muted">Monthly (est.)</span>
          <span className="text-sm font-medium text-foreground tabular-nums">
            {fmt(monthlyEarningsEstimate)}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-muted">Yearly (est.)</span>
          <span className="text-sm font-medium text-foreground tabular-nums">
            {fmt(yearlyEarningsEstimate)}
          </span>
        </div>
      </div>
    </div>
  );
}
