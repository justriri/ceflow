"use client";

import { useCallback } from "react";
import { useCeloBalances } from "@/hooks/use-celo-balances";
import { usePortfolioAnalysis } from "@/hooks/use-portfolio-analysis";
import { AgentInsightsPanel } from "@/components/agent-insights-panel";
import { AIActionsCard } from "@/components/ai-actions-card";
import { PortfolioHealthScoreCard } from "@/components/portfolio-health-score-card";
import type { StablecoinSymbol } from "@/config/tokens";
import type { UserPreferences } from "@/types/preferences";

interface AgentTabProps {
  preferences: UserPreferences;
}

export function AgentTab({ preferences }: AgentTabProps) {
  const { stablecoins } = useCeloBalances();
  const analysis = usePortfolioAnalysis(preferences);

  const getAvailableBalance = useCallback(
    (symbol: StablecoinSymbol) => stablecoins.find((s) => s.symbol === symbol)?.formatted,
    [stablecoins],
  );

  return (
    <div className="flex flex-col gap-6">
      <AgentInsightsPanel narrative={analysis.narrative} insights={analysis.insights} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <AIActionsCard actions={analysis.actions} getAvailableBalance={getAvailableBalance} />
        <PortfolioHealthScoreCard healthScore={analysis.healthScore} />
      </div>
    </div>
  );
}
