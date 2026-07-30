"use client";

import { useMemo } from "react";
import { useAccount, useReadContracts } from "wagmi";
import { erc20Abi, formatUnits, type Address } from "viem";
import { STABLECOINS, type StablecoinSymbol } from "@/config/tokens";
import { YIELD_OPPORTUNITIES } from "@/lib/protocols";
import { applyLiveApy } from "@/lib/yield/apply-live-apy";
import { getAdapter } from "@/lib/transactions/adapters";
import { getStablecoinUsdPrice } from "@/lib/yield/prices";
import {
  calculateTrackedPrincipal,
  getFirstDepositDate,
  projectEarnings,
} from "@/lib/positions/calculate-earnings";
import { useLiveMarketData } from "@/hooks/use-live-market-data";
import { useTransactionHistory } from "@/hooks/use-transaction-history";
import type { Position } from "@/lib/positions/types";

interface PositionCheck {
  opportunityId: string;
  protocolName: string;
  protocolUrl: string;
  symbol: StablecoinSymbol;
  decimals: number;
  receiptTokenAddress: Address;
  apyValue: number;
  apyIsEstimate: boolean;
  riskLevel: Position["riskLevel"];
}

export function usePositions() {
  const { address, chainId, isConnected } = useAccount();
  const { data: liveData } = useLiveMarketData();
  const { records } = useTransactionHistory();

  const opportunities = useMemo(
    () => applyLiveApy(YIELD_OPPORTUNITIES, liveData?.poolApys ?? {}),
    [liveData],
  );

  const checks = useMemo<PositionCheck[]>(() => {
    if (chainId === undefined) return [];
    const list: PositionCheck[] = [];
    for (const opportunity of opportunities) {
      const adapter = getAdapter(opportunity.id);
      if (!adapter || !adapter.isSupportedOnChain(chainId)) continue;
      for (const symbol of opportunity.supportedStablecoins) {
        const token = STABLECOINS.find((t) => t.symbol === symbol);
        const tokenAddress = token?.addresses[chainId];
        if (!token || !tokenAddress) continue;
        const receiptTokenAddress = adapter.getReceiptTokenAddress(chainId, tokenAddress);
        if (!receiptTokenAddress) continue;
        list.push({
          opportunityId: opportunity.id,
          protocolName: opportunity.protocolName,
          protocolUrl: opportunity.protocolUrl,
          symbol,
          decimals: token.decimals,
          receiptTokenAddress,
          apyValue: opportunity.apy.value,
          apyIsEstimate: opportunity.apy.isEstimate,
          riskLevel: opportunity.riskLevel,
        });
      }
    }
    return list;
  }, [opportunities, chainId]);

  const contracts = useMemo(() => {
    if (!address) return [];
    return checks.map((c) => ({
      address: c.receiptTokenAddress,
      abi: erc20Abi,
      functionName: "balanceOf" as const,
      args: [address] as const,
    }));
  }, [checks, address]);

  const enabled = isConnected && !!address && contracts.length > 0;
  const { data: balanceResults, isLoading } = useReadContracts({
    contracts,
    allowFailure: true,
    query: { enabled },
  });

  const positions = useMemo<Position[]>(() => {
    if (!address) return [];
    const priceContext = {
      celoUsdPrice: liveData?.celoUsdPrice ?? null,
      forexRates: liveData?.forexRates ?? null,
    };

    const result: Position[] = [];
    checks.forEach((c, i) => {
      const raw = balanceResults?.[i];
      const value = raw?.status === "success" ? (raw.result as bigint) : undefined;
      if (value === undefined || value <= BigInt(0)) return;

      const currentAmount = Number(formatUnits(value, c.decimals));
      const usdPrice = getStablecoinUsdPrice(c.symbol, priceContext);
      const trackedPrincipal = calculateTrackedPrincipal(
        records,
        c.opportunityId,
        c.symbol,
        address,
      );
      const earningsSinceDeposit =
        trackedPrincipal !== null ? currentAmount - trackedPrincipal : null;
      const { daily, monthly, yearly } = projectEarnings(currentAmount, c.apyValue);
      const firstDepositAt = getFirstDepositDate(records, c.opportunityId, c.symbol, address);

      result.push({
        opportunityId: c.opportunityId,
        protocolName: c.protocolName,
        protocolUrl: c.protocolUrl,
        stablecoinSymbol: c.symbol,
        currentAmount,
        currentUsdValue: currentAmount * usdPrice,
        apyValue: c.apyValue,
        apyIsEstimate: c.apyIsEstimate,
        riskLevel: c.riskLevel,
        trackedPrincipal,
        earningsSinceDeposit,
        dailyEarningsEstimate: daily,
        monthlyEarningsEstimate: monthly,
        yearlyEarningsEstimate: yearly,
        firstDepositAt,
      });
    });
    return result;
  }, [checks, balanceResults, records, address, liveData]);

  return { positions, isLoading: enabled && isLoading };
}
