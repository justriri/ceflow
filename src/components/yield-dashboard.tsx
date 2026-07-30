"use client";

import { useCallback, useState } from "react";
import { useAccount } from "wagmi";
import { useCeloBalances } from "@/hooks/use-celo-balances";
import { useRecommendations } from "@/hooks/use-recommendations";
import { truncateAddress, networkName } from "@/lib/celo-format";
import { BalanceRow } from "@/components/balance-row";
import { PreferencesForm } from "@/components/preferences-form";
import { RecommendationGrid } from "@/components/recommendation-grid";
import { SwitchNetworkButton } from "@/components/switch-network-button";
import { PortfolioValue } from "@/components/portfolio-value";
import { ActivePositionsSection } from "@/components/active-positions-section";
import { HistoryTab } from "@/components/history-tab";
import { AccessGateBoundary } from "@/components/access-gate-boundary";
import { AgentTab } from "@/components/agent-tab";
import { DEFAULT_PREFERENCES } from "@/types/preferences";

type Tab = "agent" | "recommendations" | "positions" | "history";

const TABS: { id: Tab; label: string }[] = [
  { id: "agent", label: "Agent" },
  { id: "recommendations", label: "Recommendations" },
  { id: "positions", label: "Active Positions" },
  { id: "history", label: "History" },
];

export function YieldDashboard() {
  const { address, isConnected, chainId } = useAccount();
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
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Connect your wallet to see yield recommendations.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex w-full max-w-2xl flex-col gap-6">
        <div className="flex flex-col gap-1">
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            Connected Address
          </span>
          <span className="font-mono text-base text-black dark:text-zinc-50">
            {truncateAddress(address)}
          </span>
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            {networkName(chainId)}
          </span>
        </div>

        {!isSupportedChain && <SwitchNetworkButton />}

        {isSupportedChain && (
          <>
            <PortfolioValue />

            <div className="flex flex-col rounded-2xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-zinc-950">
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

            <div className="flex flex-col gap-3 rounded-2xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-zinc-950">
              <span className="text-sm text-zinc-500 dark:text-zinc-400">
                Your preferences
              </span>
              <PreferencesForm preferences={preferences} onChange={setPreferences} />
            </div>

            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              APY figures marked &quot;live&quot; are fetched from DefiLlama; the
              rest are estimates from the last time this app was updated.
              Portfolio value uses live CELO/EUR/BRL prices where available,
              otherwise a rough fallback. Always confirm current rates on the
              protocol&apos;s own site before relying on them.
            </p>
          </>
        )}
      </div>

      {isSupportedChain && (
        <div className="flex flex-col gap-6">
          <div className="flex gap-1 border-b border-black/10 dark:border-white/10">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  tab === t.id
                    ? "border-b-2 border-black text-black dark:border-white dark:text-zinc-50"
                    : "text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-zinc-50"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === "agent" && <AgentTab preferences={preferences} />}

          {tab === "recommendations" && (
            <AccessGateBoundary resourceId="yield-recommendations">
              {top === null ? (
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  No opportunity matches your current preferences. Try lowering
                  your minimum APY or risk tolerance.
                </p>
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
      )}
    </div>
  );
}
