"use client";

import { useCallback, useEffect, useState } from "react";
import { Sparkles, Loader2, CircleCheck, Circle } from "lucide-react";
import { useCeloBalances } from "@/hooks/use-celo-balances";
import { usePortfolioAnalysis } from "@/hooks/use-portfolio-analysis";
import { AgentInsightsPanel } from "@/components/agent-insights-panel";
import { AIActionsCard } from "@/components/ai-actions-card";
import { PortfolioHealthScoreCard } from "@/components/portfolio-health-score-card";
import { AIPremiumSection } from "@/components/ai-premium-section";
import type { StablecoinSymbol } from "@/config/tokens";
import type { UserPreferences } from "@/types/preferences";

interface AgentTabProps {
  preferences: UserPreferences;
}

const SCANNING_STEPS = [
  "Scanning wallet…",
  "Fetching live APYs…",
  "Evaluating risk…",
  "Comparing protocols…",
  "Generating recommendations…",
];

const STEP_DURATION_MS = 550;

type Status = "idle" | "scanning" | "done";

export function AgentTab({ preferences }: AgentTabProps) {
  const { stablecoins } = useCeloBalances();
  const analysis = usePortfolioAnalysis(preferences);
  const [status, setStatus] = useState<Status>("idle");
  const [stepIndex, setStepIndex] = useState(0);

  const getAvailableBalance = useCallback(
    (symbol: StablecoinSymbol) => stablecoins.find((s) => s.symbol === symbol)?.formatted,
    [stablecoins],
  );

  // Advances one scanning step at a time on a fixed cadence, then reveals
  // the (already-computed) analysis — purely cosmetic, the real work
  // finished on the first render of this component.
  useEffect(() => {
    if (status !== "scanning") return;
    if (stepIndex >= SCANNING_STEPS.length - 1) {
      const timeout = setTimeout(() => setStatus("done"), STEP_DURATION_MS);
      return () => clearTimeout(timeout);
    }
    const timeout = setTimeout(() => setStepIndex((i) => i + 1), STEP_DURATION_MS);
    return () => clearTimeout(timeout);
  }, [status, stepIndex]);

  const runAnalysis = () => {
    setStepIndex(0);
    setStatus("scanning");
  };

  return (
    <div className="flex flex-col gap-6">
      {status !== "scanning" && (
        <div className="panel relative flex flex-wrap items-center justify-between gap-4 overflow-hidden p-6">
          <div
            className="pointer-events-none absolute -top-16 -left-16 h-40 w-40 rounded-full opacity-[0.08] blur-[70px]"
            style={{ background: "var(--accent)" }}
            aria-hidden="true"
          />
          <div className="relative flex items-center gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-soft">
              <Sparkles size={19} className="text-accent" strokeWidth={1.75} />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold text-foreground">
                {status === "idle" ? "Ready to analyze your portfolio" : "Analysis complete"}
              </span>
              <span className="text-xs text-muted">
                {status === "idle"
                  ? "The agent will scan your wallet, check live rates, and recommend a strategy."
                  : "Re-run the agent to refresh insights against the latest rates."}
              </span>
            </div>
          </div>
          <button type="button" onClick={runAnalysis} className="btn-primary relative shrink-0 px-4 py-2.5 text-sm">
            <Sparkles size={15} />
            {status === "idle" ? "Analyze Portfolio" : "Re-analyze"}
          </button>
        </div>
      )}

      {status === "scanning" && (
        <div className="panel animate-fade-in flex flex-col items-center gap-8 p-12">
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-soft">
            <Loader2 size={24} className="animate-spin text-accent" />
          </div>
          <div className="flex w-full max-w-xs flex-col gap-3" aria-live="polite">
            {SCANNING_STEPS.map((step, i) => {
              const state = i < stepIndex ? "done" : i === stepIndex ? "active" : "pending";
              return (
                <div key={step} className="flex items-center gap-3 transition-opacity duration-300">
                  {state === "done" && <CircleCheck size={16} className="shrink-0 text-success" />}
                  {state === "active" && (
                    <Loader2 size={16} className="shrink-0 animate-spin text-accent" />
                  )}
                  {state === "pending" && <Circle size={16} className="shrink-0 text-muted-2" />}
                  <span
                    className={`text-sm ${
                      state === "pending" ? "text-muted-2" : "font-medium text-foreground"
                    }`}
                  >
                    {step}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {status === "done" && (
        <div className="animate-fade-up flex flex-col gap-6">
          <AgentInsightsPanel narrative={analysis.narrative} insights={analysis.insights} />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <AIActionsCard actions={analysis.actions} getAvailableBalance={getAvailableBalance} />
            <PortfolioHealthScoreCard healthScore={analysis.healthScore} />
          </div>

          <div className="border-t border-border-subtle pt-6">
            <AIPremiumSection snapshot={analysis.snapshot} getAvailableBalance={getAvailableBalance} />
          </div>
        </div>
      )}
    </div>
  );
}
