"use client";

import { useMemo } from "react";
import { erc20Abi, formatUnits, type Address } from "viem";
import { useAccount, useBalance, useReadContracts } from "wagmi";
import {
  STABLECOINS,
  SUPPORTED_CHAIN_IDS,
  type StablecoinSymbol,
} from "@/config/tokens";

export interface StablecoinBalance {
  symbol: StablecoinSymbol;
  name: string;
  formatted: string | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

export function useCeloBalances() {
  const { address, chainId, isConnected } = useAccount();

  const isSupportedChain =
    chainId !== undefined && SUPPORTED_CHAIN_IDS.includes(chainId);
  const enabled = isConnected && !!address && isSupportedChain;

  const celoBalance = useBalance({
    address,
    chainId,
    query: { enabled },
  });

  const contracts = useMemo(() => {
    if (!enabled || chainId === undefined || !address) return [];
    return STABLECOINS.map((token) => ({
      address: token.addresses[chainId] as Address,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [address],
      chainId,
    }));
  }, [enabled, chainId, address]);

  const stablecoinReads = useReadContracts({
    contracts,
    allowFailure: true,
    query: { enabled: enabled && contracts.length > 0 },
  });

  const stablecoins = useMemo<StablecoinBalance[]>(
    () =>
      STABLECOINS.map((token, i) => {
        const result = stablecoinReads.data?.[i];
        const failed =
          stablecoinReads.isError || result?.status === "failure";
        const raw =
          result?.status === "success" ? (result.result as bigint) : undefined;

        return {
          symbol: token.symbol,
          name: token.name,
          formatted: raw !== undefined ? formatUnits(raw, token.decimals) : undefined,
          isLoading: stablecoinReads.isLoading,
          isError: failed,
          error: result?.status === "failure" ? (result.error as Error) : null,
        };
      }),
    [stablecoinReads.data, stablecoinReads.isLoading, stablecoinReads.isError],
  );

  return {
    isConnected,
    isSupportedChain,
    celo: {
      formatted:
        celoBalance.data !== undefined
          ? formatUnits(celoBalance.data.value, celoBalance.data.decimals)
          : undefined,
      isLoading: celoBalance.isLoading,
      isError: celoBalance.isError,
      error: celoBalance.error,
      refetch: celoBalance.refetch,
    },
    stablecoins,
    refetchStablecoins: stablecoinReads.refetch,
  };
}
