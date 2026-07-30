import type { PortfolioHealthScore } from "@/lib/analysis/types";

function scoreColor(score: number) {
  if (score >= 85) return "text-emerald-600 dark:text-emerald-400";
  if (score >= 60) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

function barColor(score: number) {
  if (score >= 85) return "bg-emerald-500";
  if (score >= 60) return "bg-amber-500";
  return "bg-red-500";
}

interface PortfolioHealthScoreCardProps {
  healthScore: PortfolioHealthScore;
}

export function PortfolioHealthScoreCard({ healthScore }: PortfolioHealthScoreCardProps) {
  const { score, breakdown, summary, improvements } = healthScore;

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-black/10 bg-white p-6 dark:border-white/10 dark:bg-zinc-950">
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">Portfolio Health Score</span>
        <span className={`text-3xl font-bold tabular-nums ${scoreColor(score)}`}>{score}/100</span>
      </div>

      <p className="text-sm text-zinc-600 dark:text-zinc-400">{summary}</p>

      <div className="flex flex-col gap-2">
        {breakdown.map((factor) => (
          <div key={factor.factor} className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-600 dark:text-zinc-400">{factor.factor}</span>
              <span className="tabular-nums text-zinc-500 dark:text-zinc-400">{factor.score}/100</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
              <div
                className={`h-full rounded-full ${barColor(factor.score)}`}
                style={{ width: `${Math.max(0, Math.min(100, factor.score))}%` }}
              />
            </div>
            <span className="text-[11px] text-zinc-400 dark:text-zinc-500">{factor.note}</span>
          </div>
        ))}
      </div>

      {improvements.length > 0 && (
        <div className="flex flex-col gap-1 border-t border-black/5 pt-3 dark:border-white/5">
          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            Suggested improvements
          </span>
          <ul className="flex flex-col gap-1 text-xs text-black dark:text-zinc-50">
            {improvements.map((improvement) => (
              <li key={improvement} className="flex gap-2">
                <span aria-hidden="true">•</span>
                {improvement}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
