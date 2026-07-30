"use client";

import { useMemo } from "react";
import { Gem } from "lucide-react";
import type { PortfolioSnapshot } from "@/lib/analysis/types";
import type { StablecoinSymbol } from "@/config/tokens";
import { buildOptimizationPlan } from "@/lib/analysis/optimize-portfolio";
import { analyzeRisk } from "@/lib/analysis/risk-analysis";
import { forecastYield } from "@/lib/analysis/yield-forecast";
import { AccessGateBoundary } from "@/components/access-gate-boundary";
import { OptimizePortfolioCard } from "@/components/optimize-portfolio-card";
import { RiskAnalysisCard } from "@/components/risk-analysis-card";
import { YieldForecastCard } from "@/components/yield-forecast-card";
import { ProtocolComparisonCard } from "@/components/protocol-comparison-card";
import { ScenarioSimulatorCard } from "@/components/scenario-simulator-card";
import { AIAlertsCard } from "@/components/ai-alerts-card";

interface AIPremiumSectionProps {
  snapshot: PortfolioSnapshot;
  getAvailableBalance: (symbol: StablecoinSymbol) => string | undefined;
}

/**
 * Advanced AI capabilities, gated behind the existing x402 seam
 * (AccessGateBoundary → useAccessGate → activeAccessGate). Deliberately
 * does NOT wrap deposits, withdrawals, active positions, or the free
 * Agent Insight/Actions/Health panels above it — those stay free
 * regardless of which gate is active. With the free gate (today's
 * default) everything below renders immediately; swapping in the real
 * x402 gate (see lib/payments/index.ts) paywalls this section alone.
 */
export function AIPremiumSection({ snapshot, getAvailableBalance }: AIPremiumSectionProps) {
  const plan = useMemo(() => buildOptimizationPlan(snapshot), [snapshot]);
  const risk = useMemo(() => analyzeRisk(snapshot), [snapshot]);
  const forecast = useMemo(() => forecastYield(snapshot), [snapshot]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Gem size={16} className="text-accent" />
          <span className="text-base font-semibold text-foreground">AI Premium</span>
          <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold text-accent-foreground">
            Advanced
          </span>
        </div>
        <p className="text-xs text-muted">
          Deposits, withdrawals, and your portfolio view always stay free — this section gates only the
          deeper AI tools below.
        </p>
      </div>

      <AccessGateBoundary resourceId="ai-premium">
        <div className="flex flex-col gap-6">
          <OptimizePortfolioCard plan={plan} getAvailableBalance={getAvailableBalance} />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <RiskAnalysisCard risk={risk} />
            <YieldForecastCard forecast={forecast} />
          </div>

          <ScenarioSimulatorCard snapshot={snapshot} />
          <ProtocolComparisonCard snapshot={snapshot} />
          <AIAlertsCard />
        </div>
      </AccessGateBoundary>
    </div>
  );
}
