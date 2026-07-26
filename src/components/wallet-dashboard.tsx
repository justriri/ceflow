"use client";

import { useCallback } from "react";
import { useAccount } from "wagmi";
import { useCeloBalances } from "@/hooks/use-celo-balances";
import { truncateAddress, networkName } from "@/lib/celo-format";
import { BalanceRow } from "@/components/balance-row";

export function WalletDashboard() {
  const { address, isConnected, chainId } = useAccount();
  const {
    isSupportedChain,
    celo: celoBalance,
    stablecoins,
    refetchStablecoins,
  } = useCeloBalances();

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
        Connect your wallet to view your balances.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
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

      {!isSupportedChain ? (
        <p className="text-sm text-amber-600 dark:text-amber-400">
          Switch to Celo Mainnet or Celo Sepolia Testnet to view balances.
        </p>
      ) : (
        <div className="flex flex-col">
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
      )}
    </div>
  );
}
