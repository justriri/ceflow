import { LineChart } from "lucide-react";
import type { YieldForecast } from "@/lib/analysis/types";
import { formatUsd } from "@/lib/analysis/format";

interface YieldForecastCardProps {
  forecast: YieldForecast;
}

export function YieldForecastCard({ forecast }: YieldForecastCardProps) {
  const { points, assumptionNote } = forecast;

  return (
    <div className="panel flex flex-col gap-4 p-6">
      <div className="flex items-center gap-2">
        <LineChart size={14} className="text-accent" />
        <span className="text-sm font-semibold text-muted">Yield Forecasting</span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {points.map((point) => (
          <div
            key={point.days}
            className="panel-interactive flex flex-col gap-1 rounded-xl border border-border-subtle p-3"
          >
            <span className="text-xs text-muted">{point.label}</span>
            <span className="text-sm font-semibold text-success tabular-nums">
              +{formatUsd(point.projectedEarnings)}
            </span>
            <span className="text-[11px] text-muted-2 tabular-nums">
              → {formatUsd(point.projectedPortfolioValue)}
            </span>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-2">{assumptionNote}</p>
    </div>
  );
}
