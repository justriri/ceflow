import { Sparkles } from "lucide-react";
import type { Insight } from "@/lib/analysis/types";

const SEVERITY_STYLES: Record<Insight["severity"], string> = {
  positive: "bg-success-soft text-success",
  warning: "bg-risk-soft text-risk",
  info: "bg-surface-2 text-muted",
};

interface AgentInsightsPanelProps {
  narrative: string;
  insights: Insight[];
}

export function AgentInsightsPanel({ narrative, insights }: AgentInsightsPanelProps) {
  return (
    <div className="panel flex flex-col gap-5 p-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-accent" />
          <span className="text-sm font-semibold text-muted">Agent Insight</span>
        </div>
        <p className="text-[15px] leading-relaxed text-foreground">{narrative}</p>
      </div>

      {insights.length > 0 && (
        <ul className="flex flex-col gap-3 border-t border-border-subtle pt-4">
          {insights.map((insight) => (
            <li key={insight.id} className="flex items-start gap-3">
              <span
                className={`mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${SEVERITY_STYLES[insight.severity]}`}
              >
                {insight.category}
              </span>
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-foreground">{insight.headline}</span>
                <span className="text-xs text-muted">{insight.detail}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
