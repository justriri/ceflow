"use client";

import { useCallback, useState } from "react";
import { useAccount } from "wagmi";
import { Sparkles, TrendingUp, Wallet, History, SlidersHorizontal, Coins } from "lucide-react";
import { useCeloBalances } from "@/hooks/use-celo-balances";
import { useRecommendations } from "@/hooks/use-recommendations";
import { BalanceRow } from "@/components/balance-row";
import { PreferencesForm } from "@/components/preferences-form";
import { RecommendationGrid } from "@/components/recommendation-grid";
import { SwitchNetworkButton } from "@/components/switch-network-button";
import { PortfolioValue } from "@/components/portfolio-value";
import { ActivePositionsSection } from "@/components/active-positions-section";
import { HistoryTab } from "@/components/history-tab";
import { AccessGateBoundary } from "@/components/access-gate-boundary";
import { AgentTab } from "@/components/agent-tab";
import { EmptyState } from "@/components/empty-state";
import { DEFAULT_PREFERENCES } from "@/types/preferences";

type Tab = "agent" | "recommendations" | "positions" | "history";

const TABS: { id: Tab; label: string; icon: typeof Sparkles }[] = [
  { id: "agent", label: "Agent", icon: Sparkles },
  { id: "recommendations", label: "Recommendations", icon: TrendingUp },
  { id: "positions", label: "Active Positions", icon: Wallet },
  { id: "history", label: "History", icon: History },
];

export function YieldDashboard() {
  const { address, isConnected } = useAccount();
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
  const [tab, setTab] = useState<Tab>("agent");

  const {
    isSupportedChain,
    celo: celoBalance,
    stablecoins,
    refetchStablecoins,
  } = useCeloBalances();
  const { top, alternatives } = useRecommendations(preferences);
  const selectedBalance = stablecoins.find(
    (s) => s.symbol === preferences.selectedStablecoin,
  )?.formatted;

  const { refetch: refetchCelo } = celoBalance;
  const retryCelo = useCallback(() => {
    void refetchCelo();
  }, [refetchCelo]);
  const retryStablecoins = useCallback(() => {
    void refetchStablecoins();
  }, [refetchStablecoins]);

  if (!isConnected || !address) {
    return (
      <div className="flex flex-1 items-center justify-center py-16">
        <EmptyState
          icon={Wallet}
          title="Connect your wallet to get started"
          description="Use the button in the top right to connect — your balances and personalized yield recommendations will appear here."
        />
      </div>
    );
  }

  return (
    <div className="animate-fade-up flex flex-col gap-8">
      {!isSupportedChain && <SwitchNetworkButton />}

      {isSupportedChain && (
        <>
          <PortfolioValue />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="panel flex flex-col p-5">
              <div className="mb-1 flex items-center gap-2">
                <Coins size={15} className="text-muted" />
                <span className="text-sm font-semibold text-foreground">Balances</span>
              </div>
              <BalanceRow
                label="CELO"
                formatted={celoBalance.formatted}
                isLoading={celoBalance.isLoading}
                isError={celoBalance.isError}
                onRetry={retryCelo}
              />
              {stablecoins.map((token) => (
                <BalanceRow
                  key={token.symbol}
                  label={token.symbol}
                  formatted={token.formatted}
                  isLoading={token.isLoading}
                  isError={token.isError}
                  onRetry={retryStablecoins}
                />
              ))}
            </div>

            <div className="panel flex flex-col gap-4 p-5">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={15} className="text-muted" />
                <span className="text-sm font-semibold text-foreground">Your preferences</span>
              </div>
              <PreferencesForm preferences={preferences} onChange={setPreferences} />
            </div>
          </div>

          <p className="text-xs text-muted-2">
            APY figures marked &quot;live&quot; are fetched from DefiLlama; the rest are estimates
            from the last time this app was updated. Portfolio value uses live CELO/EUR/BRL prices
            where available, otherwise a rough fallback. Always confirm current rates on the
            protocol&apos;s own site before relying on them.
          </p>

          <div className="flex flex-col gap-6">
            <div className="inline-flex w-fit max-w-full gap-1 overflow-x-auto rounded-xl border border-border-subtle bg-surface p-1">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                    tab === t.id
                      ? "bg-accent text-accent-foreground"
                      : "text-muted hover:bg-surface-2 hover:text-foreground"
                  }`}
                >
                  <t.icon size={15} />
                  {t.label}
                </button>
              ))}
            </div>

            <div key={tab} className="animate-fade-up">
              {tab === "agent" && <AgentTab preferences={preferences} />}

              {tab === "recommendations" && (
                <AccessGateBoundary resourceId="yield-recommendations">
                  {top === null ? (
                    <EmptyState
                      icon={TrendingUp}
                      title="No matching opportunities"
                      description="No opportunity matches your current preferences. Try lowering your minimum APY or risk tolerance."
                    />
                  ) : (
                    <RecommendationGrid
                      top={top}
                      alternatives={alternatives}
                      stablecoinSymbol={preferences.selectedStablecoin}
                      availableBalance={selectedBalance}
                    />
                  )}
                </AccessGateBoundary>
              )}

              {tab === "positions" && <ActivePositionsSection />}

              {tab === "history" && <HistoryTab />}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
