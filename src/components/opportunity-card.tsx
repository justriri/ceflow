import type { ScoredOpportunity } from "@/lib/scoring/types";
import type { StablecoinSymbol } from "@/config/tokens";
import { RiskBadge } from "@/components/risk-badge";
import { ExecutionPanel } from "@/components/execution-panel";
import { generateCardReasoning } from "@/lib/analysis/generate-card-reasoning";

function formatEarnings(value: number | null, symbol: string) {
  if (value === null) return null;
  return `${value.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${symbol}/yr`;
}

interface OpportunityCardProps {
  scored: ScoredOpportunity;
  stablecoinSymbol: StablecoinSymbol;
  availableBalance: string | undefined;
  /** Purely a visual "top pick" flag — ranking always comes from the scoring engine. */
  isTopPick?: boolean;
  /** The top-ranked opportunity in this list, for the comparative AI reasoning sentence. Omit to skip it. */
  topPick?: ScoredOpportunity;
}

/**
 * One card = one opportunity, laid out identically for every protocol so
 * cards read as a true side-by-side comparison in the grid: protocol name,
 * APY (large), live/estimate badge, risk badge, reason, execution.
 */
export function OpportunityCard({
  scored,
  stablecoinSymbol,
  availableBalance,
  isTopPick = false,
  topPick,
}: OpportunityCardProps) {
  const { opportunity, reasons, estimatedYearlyEarnings } = scored;
  const earnings = formatEarnings(estimatedYearlyEarnings, stablecoinSymbol);
  const aiReasoning = topPick ? generateCardReasoning(scored, topPick) : null;

  return (
    <div className="flex h-full flex-col gap-4 rounded-2xl border border-black/10 bg-white p-6 dark:border-white/10 dark:bg-zinc-950">
      {/* 1. Protocol name */}
      <div className="flex items-start justify-between gap-2">
        <a
          href={opportunity.protocolUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-lg font-semibold text-black underline decoration-transparent transition-colors hover:decoration-current dark:text-zinc-50"
        >
          {opportunity.protocolName}
        </a>
        {isTopPick && (
          <span className="shrink-0 rounded-full bg-black px-2 py-0.5 text-[10px] font-semibold text-white dark:bg-white dark:text-black">
            Top pick
          </span>
        )}
      </div>
      <p className="line-clamp-2 text-xs text-zinc-500 dark:text-zinc-400">
        {opportunity.description}
      </p>

      {/* 2 & 3. APY + live/estimate badge */}
      <div className="flex flex-col gap-1">
        <span className="flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400">
          {stablecoinSymbol} APY
          {opportunity.apy.isEstimate ? (
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
        <span className="text-3xl font-semibold text-black dark:text-zinc-50">
          {opportunity.apy.value}%
        </span>
        <span className="text-xs text-zinc-400 dark:text-zinc-500">{opportunity.apy.note}</span>
        {earnings !== null && (
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            ≈ {earnings} at your current balance
          </span>
        )}
      </div>

      {/* 4. Risk badge */}
      <RiskBadge level={opportunity.riskLevel} />

      {/* 5. AI reasoning */}
      <div className="flex flex-col gap-1">
        <span className="text-sm text-zinc-500 dark:text-zinc-400">AI reasoning</span>
        {aiReasoning && (
          <p className="text-xs text-black dark:text-zinc-50">{aiReasoning}</p>
        )}
        <ul className="flex flex-col gap-1 text-xs text-black dark:text-zinc-50">
          {reasons.map((reason) => (
            <li key={reason} className="flex gap-2">
              <span aria-hidden="true">•</span>
              {reason}
            </li>
          ))}
        </ul>
      </div>

      {/* 6. Execution — pinned to the bottom so buttons line up across a row */}
      <div className="mt-auto pt-2">
        <ExecutionPanel
          opportunityId={opportunity.id}
          protocolUrl={opportunity.protocolUrl}
          stablecoinSymbol={stablecoinSymbol}
          availableBalance={availableBalance}
        />
      </div>
    </div>
  );
}
