"use client";

import { useMemo, useState } from "react";
import { FlaskConical, TriangleAlert } from "lucide-react";
import type { PortfolioSnapshot, ScenarioResult } from "@/lib/analysis/types";
import type { StablecoinSymbol } from "@/config/tokens";
import { useLiveMarketData } from "@/hooks/use-live-market-data";
import { simulateScenario } from "@/lib/analysis/simulate-scenario";
import { formatPercent, formatUsd } from "@/lib/analysis/format";

interface ScenarioSimulatorCardProps {
  snapshot: PortfolioSnapshot;
}

/** "What if I move $X worth of USDM?" — a read-only projection, never a prepared transaction. */
export function ScenarioSimulatorCard({ snapshot }: ScenarioSimulatorCardProps) {
  const heldSymbols = useMemo(
    () => Object.keys(snapshot.rankedBySymbol) as StablecoinSymbol[],
    [snapshot.rankedBySymbol],
  );
  const { data: liveData } = useLiveMarketData();
  const priceContext = useMemo(
    () => ({ celoUsdPrice: liveData?.celoUsdPrice ?? null, forexRates: liveData?.forexRates ?? null }),
    [liveData],
  );

  const [symbol, setSymbol] = useState<StablecoinSymbol>(heldSymbols[0] ?? snapshot.selectedSymbol);
  const [amountInput, setAmountInput] = useState("");
  const [result, setResult] = useState<ScenarioResult | null>(null);
  const [ranEmpty, setRanEmpty] = useState(false);

  if (heldSymbols.length === 0) return null;

  const activeSymbol = heldSymbols.includes(symbol) ? symbol : heldSymbols[0];

  const runSimulation = () => {
    const amount = Number(amountInput);
    const outcome = simulateScenario(snapshot, priceContext, activeSymbol, amount);
    setResult(outcome);
    setRanEmpty(outcome === null);
  };

  return (
    <div className="panel flex flex-col gap-4 p-6">
      <div className="flex items-center gap-2">
        <FlaskConical size={14} className="text-accent" />
        <span className="text-sm font-semibold text-muted">Scenario Simulation</span>
      </div>
      <p className="text-xs text-muted">
        Explore &quot;what if&quot; — this never touches your positions, it only projects the outcome.
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted">What if I move</span>
        <input
          type="number"
          inputMode="decimal"
          min={0}
          step="any"
          placeholder="0.0"
          value={amountInput}
          onChange={(e) => setAmountInput(e.target.value)}
          className="input-field w-28 min-w-0 px-3 py-1.5 text-sm text-foreground"
        />
        <select
          value={activeSymbol}
          onChange={(e) => setSymbol(e.target.value as StablecoinSymbol)}
          className="input-field px-2 py-1.5 text-sm text-foreground"
        >
          {heldSymbols.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <span className="text-sm text-muted">?</span>
        <button
          type="button"
          onClick={runSimulation}
          disabled={!amountInput}
          className="btn-primary ml-auto px-4 py-1.5 text-sm"
        >
          Simulate
        </button>
      </div>

      {ranEmpty && (
        <p className="flex items-center gap-1.5 text-xs text-risk">
          <TriangleAlert size={13} />
          Enter a positive amount to see a projection.
        </p>
      )}

      {result && (
        <div className="animate-fade-in flex flex-col gap-3 border-t border-border-subtle pt-4">
          <p className="text-sm text-foreground">{result.reasoning}</p>
          <div className="flex flex-wrap gap-6">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted">Current effective APY</span>
              <span className="text-lg font-semibold text-foreground tabular-nums">
                {formatPercent(result.currentEffectiveApy)}
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted">Projected effective APY</span>
              <span className="text-lg font-semibold text-success tabular-nums">
                {formatPercent(result.projectedEffectiveApyAfterMove)}
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted">Additional yearly earnings</span>
              <span className="text-lg font-semibold text-success tabular-nums">
                +{formatUsd(result.additionalAnnualEarnings)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
