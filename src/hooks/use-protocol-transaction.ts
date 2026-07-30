"use client";

import { useCallback, useState } from "react";
import { useAccount, useConfig, useWriteContract } from "wagmi";
import { readContract, waitForTransactionReceipt } from "wagmi/actions";
import { erc20Abi, type Address } from "viem";
import { useQueryClient } from "@tanstack/react-query";
import { getAdapter } from "@/lib/transactions/adapters";
import { YIELD_OPPORTUNITIES } from "@/lib/protocols";
import { STABLECOINS } from "@/config/tokens";
import { useTransactionHistory } from "@/hooks/use-transaction-history";
import type { TransactionPhase, TransactionStep } from "@/lib/transactions/types";
import type { TransactionRecord } from "@/lib/positions/types";

export interface UseProtocolTransactionResult {
  phase: TransactionPhase;
  step: TransactionStep;
  error: string | null;
  txHash: `0x${string}` | null;
  /** False when this opportunity has no adapter, or the adapter doesn't support the connected chain. */
  isSupported: boolean;
  deposit: (params: { tokenAddress: Address; amount: bigint; humanAmount: string }) => Promise<void>;
  withdraw: (params: { tokenAddress: Address; amount: bigint; humanAmount: string }) => Promise<void>;
  claimRewards: (params: { receiptTokenAddresses: Address[] }) => Promise<void>;
  reset: () => void;
}

function findStablecoinSymbol(chainId: number, tokenAddress: Address) {
  const match = STABLECOINS.find(
    (t) => t.addresses[chainId]?.toLowerCase() === tokenAddress.toLowerCase(),
  );
  return match?.symbol;
}

export function useProtocolTransaction(opportunityId: string): UseProtocolTransactionResult {
  const { address: userAddress, chainId } = useAccount();
  const config = useConfig();
  const { writeContractAsync } = useWriteContract();
  const queryClient = useQueryClient();
  const { addRecord, updateRecord } = useTransactionHistory();

  const [phase, setPhase] = useState<TransactionPhase>("idle");
  const [step, setStep] = useState<TransactionStep>(null);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);

  const adapter = getAdapter(opportunityId);
  const isSupported =
    adapter !== null && chainId !== undefined && adapter.isSupportedOnChain(chainId);

  const reset = useCallback(() => {
    setPhase("idle");
    setStep(null);
    setError(null);
    setTxHash(null);
  }, []);

  // Broad invalidation is intentional: a confirmed transaction can affect
  // wallet balances, live APYs (TVL shift), portfolio value, active
  // positions, and therefore the recommendation ranking — cheaper to
  // refetch everything than to enumerate every query key that could be stale.
  const refreshAfterSuccess = useCallback(async () => {
    await queryClient.invalidateQueries();
  }, [queryClient]);

  const ensureApproval = useCallback(
    async (tokenAddress: Address, amount: bigint, spender: Address, owner: Address) => {
      setStep("approval");
      setPhase("preparing");
      const allowance = await readContract(config, {
        address: tokenAddress,
        abi: erc20Abi,
        functionName: "allowance",
        args: [owner, spender],
      });
      if (allowance >= amount) return;

      setPhase("awaiting-signature");
      const approveHash = await writeContractAsync({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: "approve",
        args: [spender, amount],
      });
      setPhase("pending");
      const receipt = await waitForTransactionReceipt(config, { hash: approveHash });
      if (receipt.status !== "success") {
        throw new Error("Approval transaction reverted");
      }
    },
    [config, writeContractAsync],
  );

  const runCall = useCallback(
    async (
      call: { address: Address; abi: readonly unknown[]; functionName: string; args: readonly unknown[] },
      historyRecordId: string | null,
    ) => {
      setStep("action");
      setPhase("awaiting-signature");
      const hash = await writeContractAsync(call as Parameters<typeof writeContractAsync>[0]);
      setTxHash(hash);
      if (historyRecordId) updateRecord(historyRecordId, { txHash: hash });
      setPhase("pending");
      const receipt = await waitForTransactionReceipt(config, { hash });
      if (receipt.status !== "success") {
        throw new Error("Transaction reverted");
      }
      setPhase("confirmed");
      if (historyRecordId) updateRecord(historyRecordId, { status: "confirmed" });
      await refreshAfterSuccess();
    },
    [config, writeContractAsync, refreshAfterSuccess, updateRecord],
  );

  const withErrorHandling = useCallback(
    async (historyRecordId: string | null, run: () => Promise<void>) => {
      setError(null);
      try {
        await run();
      } catch (e) {
        setPhase("failed");
        setError(e instanceof Error ? e.message : "Transaction failed");
        if (historyRecordId) updateRecord(historyRecordId, { status: "failed" });
      }
    },
    [updateRecord],
  );

  const recordHistory = useCallback(
    (
      action: TransactionRecord["action"],
      symbol: ReturnType<typeof findStablecoinSymbol> | undefined,
      humanAmount: string,
    ) => {
      if (!userAddress || chainId === undefined) return null;
      const protocolName =
        YIELD_OPPORTUNITIES.find((o) => o.id === opportunityId)?.protocolName ?? opportunityId;
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      addRecord({
        id,
        action,
        opportunityId,
        protocolName,
        stablecoinSymbol: symbol,
        amount: humanAmount,
        txHash: null,
        status: "pending",
        timestamp: Date.now(),
        walletAddress: userAddress,
        chainId,
      });
      return id;
    },
    [addRecord, opportunityId, userAddress, chainId],
  );

  const deposit = useCallback(
    async ({ tokenAddress, amount, humanAmount }: { tokenAddress: Address; amount: bigint; humanAmount: string }) => {
      if (!adapter || !userAddress || chainId === undefined || !isSupported) return;
      const symbol = findStablecoinSymbol(chainId, tokenAddress);
      const recordId = recordHistory("deposit", symbol, humanAmount);
      await withErrorHandling(recordId, async () => {
        const params = { chainId, userAddress, tokenAddress, amount };
        setPhase("preparing");
        const spender = adapter.getSpenderAddress(params);
        await ensureApproval(tokenAddress, amount, spender, userAddress);
        const call = adapter.buildDepositCall(params);
        await runCall(call, recordId);
      });
    },
    [adapter, userAddress, chainId, isSupported, withErrorHandling, ensureApproval, runCall, recordHistory],
  );

  const withdraw = useCallback(
    async ({ tokenAddress, amount, humanAmount }: { tokenAddress: Address; amount: bigint; humanAmount: string }) => {
      if (!adapter || !userAddress || chainId === undefined || !isSupported) return;
      const symbol = findStablecoinSymbol(chainId, tokenAddress);
      const recordId = recordHistory("withdraw", symbol, humanAmount);
      await withErrorHandling(recordId, async () => {
        setPhase("preparing");
        const call = adapter.buildWithdrawCall({ chainId, userAddress, tokenAddress, amount });
        await runCall(call, recordId);
      });
    },
    [adapter, userAddress, chainId, isSupported, withErrorHandling, runCall, recordHistory],
  );

  const claimRewards = useCallback(
    async ({ receiptTokenAddresses }: { receiptTokenAddresses: Address[] }) => {
      if (!adapter || !userAddress || chainId === undefined || !isSupported) return;
      const recordId = recordHistory("claimRewards", undefined, "");
      await withErrorHandling(recordId, async () => {
        setPhase("preparing");
        const call = adapter.buildClaimRewardsCall({ chainId, userAddress, receiptTokenAddresses });
        if (!call) {
          throw new Error("This protocol has no separate rewards to claim.");
        }
        await runCall(call, recordId);
      });
    },
    [adapter, userAddress, chainId, isSupported, withErrorHandling, runCall, recordHistory],
  );

  return {
    phase,
    step,
    error,
    txHash,
    isSupported,
    deposit,
    withdraw,
    claimRewards,
    reset,
  };
}
