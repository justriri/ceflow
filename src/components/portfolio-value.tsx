"use client";

import { useMemo } from "react";
import { useCeloBalances } from "@/hooks/use-celo-balances";
import { useLiveMarketData } from "@/hooks/use-live-market-data";
import { calculatePortfolioValue } from "@/lib/yield/portfolio";
import type { StablecoinSymbol } from "@/config/tokens";

export function PortfolioValue() {
  const { celo: celoBalance, stablecoins } = useCeloBalances();
  const { data: liveData, isLoading: isPriceLoading } = useLiveMarketData();

  const total = useMemo(() => {
    const celoNum =
      celoBalance.formatted !== undefined ? Number(celoBalance.formatted) : null;

    const stablecoinBalances: Partial<Record<StablecoinSymbol, number | null>> = {};
    for (const token of stablecoins) {
      stablecoinBalances[token.symbol] =
        token.formatted !== undefined ? Number(token.formatted) : null;
    }

    return calculatePortfolioValue(
      { celoBalance: celoNum, stablecoinBalances },
      {
        celoUsdPrice: liveData?.celoUsdPrice ?? null,
        forexRates: liveData?.forexRates ?? null,
      },
    );
  }, [celoBalance.formatted, stablecoins, liveData]);

  const isBalanceLoading = celoBalance.isLoading || stablecoins.some((s) => s.isLoading);

  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm text-zinc-500 dark:text-zinc-400">
        Total portfolio value
      </span>
      {isBalanceLoading ? (
        <span className="h-9 w-32 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
      ) : (
        <span className="text-3xl font-semibold text-black dark:text-zinc-50">
          ${total.toLocaleString(undefined, { maximumFractionDigits: 2 })}
        </span>
      )}
      {isPriceLoading && (
        <span className="text-xs text-zinc-400 dark:text-zinc-500">
          Using fallback prices while live rates load…
        </span>
      )}
    </div>
  );
}
