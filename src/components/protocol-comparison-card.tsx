"use client";

import { useMemo, useState } from "react";
import { GitCompareArrows, Trophy } from "lucide-react";
import type { PortfolioSnapshot } from "@/lib/analysis/types";
import type { StablecoinSymbol } from "@/config/tokens";
import { getRankedFor } from "@/lib/analysis/snapshot-helpers";
import { RiskBadge } from "@/components/risk-badge";

interface ProtocolComparisonCardProps {
  snapshot: PortfolioSnapshot;
}

/** Cross-protocol comparison for every asset actually held — reuses the same per-symbol ranking everything else in the Agent tab is built on, just laid out side by side. */
export function ProtocolComparisonCard({ snapshot }: ProtocolComparisonCardProps) {
  const heldSymbols = useMemo(
    () => Object.keys(snapshot.rankedBySymbol) as StablecoinSymbol[],
    [snapshot.rankedBySymbol],
  );
  const [symbol, setSymbol] = useState<StablecoinSymbol>(
    heldSymbols.includes(snapshot.selectedSymbol) ? snapshot.selectedSymbol : (heldSymbols[0] ?? snapshot.selectedSymbol),
  );

  const ranked = getRankedFor(snapshot, heldSymbols.includes(symbol) ? symbol : heldSymbols[0]);

  if (heldSymbols.length === 0) return null;

  return (
    <div className="panel flex flex-col gap-4 p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <GitCompareArrows size={14} className="text-accent" />
          <span className="text-sm font-semibold text-muted">Cross-Protocol Comparison</span>
        </div>
        {heldSymbols.length > 1 && (
          <div className="flex gap-1 rounded-lg border border-border-subtle bg-surface-2 p-1">
            {heldSymbols.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSymbol(s)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  symbol === s
                    ? "bg-accent text-accent-foreground"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px] text-left text-xs">
          <thead>
            <tr className="text-muted-2">
              <th className="pb-2 font-medium">Protocol</th>
              <th className="pb-2 font-medium">APY</th>
              <th className="pb-2 font-medium">Risk</th>
              <th className="pb-2 font-medium">Score</th>
            </tr>
          </thead>
          <tbody>
            {ranked.map((r, i) => (
              <tr key={r.opportunity.id} className="border-t border-border-subtle">
                <td className="py-2.5 pr-2 font-medium text-foreground">
                  <span className="flex items-center gap-1.5">
                    {i === 0 && <Trophy size={13} className="text-accent" aria-hidden="true" />}
                    {r.opportunity.protocolName}
                  </span>
                </td>
                <td className="py-2.5 pr-2 text-muted tabular-nums">{r.opportunity.apy.value}%</td>
                <td className="py-2.5 pr-2">
                  <RiskBadge level={r.opportunity.riskLevel} />
                </td>
                <td className="py-2.5 text-muted tabular-nums">{r.score.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
