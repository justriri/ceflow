import { HeartPulse } from "lucide-react";
import type { PortfolioHealthScore } from "@/lib/analysis/types";

function scoreColor(score: number) {
  if (score >= 85) return "text-success";
  if (score >= 60) return "text-risk";
  return "text-danger";
}

function barColor(score: number) {
  if (score >= 85) return "bg-success";
  if (score >= 60) return "bg-risk";
  return "bg-danger";
}

interface PortfolioHealthScoreCardProps {
  healthScore: PortfolioHealthScore;
}

export function PortfolioHealthScoreCard({ healthScore }: PortfolioHealthScoreCardProps) {
  const { score, breakdown, summary, improvements } = healthScore;

  return (
    <div className="panel flex flex-col gap-4 p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <HeartPulse size={14} className="text-accent" />
          <span className="text-sm font-semibold text-muted">Portfolio Health Score</span>
        </div>
        <span className={`text-3xl font-bold tabular-nums ${scoreColor(score)}`}>{score}/100</span>
      </div>

      <p className="text-sm text-muted">{summary}</p>

      <div className="flex flex-col gap-3">
        {breakdown.map((factor) => (
          <div key={factor.factor} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted">{factor.factor}</span>
              <span className="text-muted tabular-nums">{factor.score}/100</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
              <div
                className={`h-full rounded-full transition-all duration-500 ${barColor(factor.score)}`}
                style={{ width: `${Math.max(0, Math.min(100, factor.score))}%` }}
              />
            </div>
            <span className="text-[11px] text-muted-2">{factor.note}</span>
          </div>
        ))}
      </div>

      {improvements.length > 0 && (
        <div className="flex flex-col gap-1.5 border-t border-border-subtle pt-3">
          <span className="text-xs font-semibold text-muted">Suggested improvements</span>
          <ul className="flex flex-col gap-1 text-xs text-foreground">
            {improvements.map((improvement) => (
              <li key={improvement} className="flex gap-2">
                <span className="text-accent" aria-hidden="true">
                  •
                </span>
                {improvement}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
