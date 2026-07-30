import { ShieldAlert, TriangleAlert } from "lucide-react";
import type { RiskAnalysis } from "@/lib/analysis/types";
import { RiskBadge } from "@/components/risk-badge";
import { formatUsd } from "@/lib/analysis/format";

function scoreColor(score: number) {
  if (score >= 85) return "text-success";
  if (score >= 60) return "text-risk";
  return "text-danger";
}

interface RiskAnalysisCardProps {
  risk: RiskAnalysis;
}

export function RiskAnalysisCard({ risk }: RiskAnalysisCardProps) {
  const { safetyScore, narrative, breakdown, warnings } = risk;

  return (
    <div className="panel flex flex-col gap-4 p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <ShieldAlert size={14} className="text-accent" />
          <span className="text-sm font-semibold text-muted">Risk Analysis</span>
        </div>
        <span className={`text-2xl font-bold tabular-nums ${scoreColor(safetyScore)}`}>
          {Math.round(safetyScore)}/100
        </span>
      </div>

      <p className="text-sm text-muted">{narrative}</p>

      {breakdown.length > 0 && (
        <div className="flex flex-col gap-2.5 border-t border-border-subtle pt-3">
          {breakdown.map((entry) => (
            <div key={entry.level} className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <RiskBadge level={entry.level} />
                <span className="text-muted">{entry.protocols.join(", ")}</span>
              </div>
              <span className="text-muted tabular-nums">
                {formatUsd(entry.usdValue)} ({Math.round(entry.share * 100)}%)
              </span>
            </div>
          ))}
        </div>
      )}

      {warnings.length > 0 && (
        <ul className="flex flex-col gap-1.5 border-t border-border-subtle pt-3 text-xs text-risk">
          {warnings.map((warning) => (
            <li key={warning} className="flex gap-2">
              <TriangleAlert size={13} className="mt-0.5 shrink-0" />
              {warning}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
