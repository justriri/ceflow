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
    <div className="flex h-full flex-col gap-4 rounded-2xl border border-black/10 bg-white p-6 dark:border-white/10 dark:bg-zinc-950">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <a
            href={protocolUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-lg font-semibold text-black underline decoration-transparent transition-colors hover:decoration-current dark:text-zinc-50"
          >
            {protocolName}
          </a>
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            {stablecoinSymbol}
            {stablecoinSymbol === "USDM" && " (cUSD-compatible — same underlying asset)"}
          </span>
        </div>
        <RiskBadge level={riskLevel} />
      </div>

      <div className="flex flex-wrap gap-8">
        <div className="flex flex-col gap-1">
          <span className="text-sm text-zinc-500 dark:text-zinc-400">Deposited amount</span>
          <span className="text-2xl font-semibold text-black dark:text-zinc-50">
            {currentAmount.toLocaleString(undefined, { maximumFractionDigits: 4 })}{" "}
            <span className="text-base font-normal text-zinc-500 dark:text-zinc-400">
              {stablecoinSymbol}
            </span>
          </span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            ≈ ${currentUsdValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <span className="flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400">
            APY
            {apyIsEstimate ? (
              <span className="rounded-full bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                estimate
              </span>
            ) : (
              <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
                live
              </span>
            )}
          </span>
          <span className="text-2xl font-semibold text-black dark:text-zinc-50">{apyValue}%</span>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-sm text-zinc-500 dark:text-zinc-400">Deposit date</span>
        <span className="text-sm text-black dark:text-zinc-50">{formatDate(firstDepositAt)}</span>
      </div>

      <EarningsTracker position={position} />

      <div className="mt-auto flex flex-col gap-2 border-t border-black/5 pt-4 dark:border-white/5">
        <WithdrawAction
          opportunityId={opportunityId}
          stablecoinSymbol={stablecoinSymbol}
          depositedAmount={currentAmount.toString()}
        />
      </div>
    </div>
  );
}
