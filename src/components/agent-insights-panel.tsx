import type { Insight } from "@/lib/analysis/types";

const SEVERITY_STYLES: Record<Insight["severity"], string> = {
  positive: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  warning: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  info: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
};

interface AgentInsightsPanelProps {
  narrative: string;
  insights: Insight[];
}

export function AgentInsightsPanel({ narrative, insights }: AgentInsightsPanelProps) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-black/10 bg-white p-6 dark:border-white/10 dark:bg-zinc-950">
      <div className="flex flex-col gap-1">
        <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">Agent Insight</span>
        <p className="text-sm leading-relaxed text-black dark:text-zinc-50">{narrative}</p>
      </div>

      {insights.length > 0 && (
        <ul className="flex flex-col gap-2 border-t border-black/5 pt-4 dark:border-white/5">
          {insights.map((insight) => (
            <li key={insight.id} className="flex items-start gap-2">
              <span
                className={`mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${SEVERITY_STYLES[insight.severity]}`}
              >
                {insight.category}
              </span>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-black dark:text-zinc-50">{insight.headline}</span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">{insight.detail}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
