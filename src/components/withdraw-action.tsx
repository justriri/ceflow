"use client";

import { useMemo } from "react";
import { useAccount } from "wagmi";
import { parseUnits } from "viem";
import { STABLECOINS, type StablecoinSymbol } from "@/config/tokens";
import { useProtocolTransaction } from "@/hooks/use-protocol-transaction";
import { AmountActionForm } from "@/components/amount-action-form";

interface WithdrawActionProps {
  opportunityId: string;
  stablecoinSymbol: StablecoinSymbol;
  /** The user's current deposited balance in this protocol — the "Withdraw Max" ceiling. */
  depositedAmount: string;
}

export function WithdrawAction({
  opportunityId,
  stablecoinSymbol,
  depositedAmount,
}: WithdrawActionProps) {
  const { chainId } = useAccount();
  const { phase, step, error, txHash, isSupported, withdraw, reset } =
    useProtocolTransaction(opportunityId);

  const token = useMemo(
    () => STABLECOINS.find((t) => t.symbol === stablecoinSymbol),
    [stablecoinSymbol],
  );
  const tokenAddress = token && chainId !== undefined ? token.addresses[chainId] : undefined;

  if (!isSupported || !token || !tokenAddress) return null;

  return (
    <AmountActionForm
      label={`Withdraw ${stablecoinSymbol}`}
      actionLabel="Withdraw"
      busyLabel="Withdrawing…"
      maxAmount={depositedAmount}
      maxHelperLabel={`Deposited: ${depositedAmount} ${stablecoinSymbol}`}
      phase={phase}
      step={step}
      error={error}
      txHash={txHash}
      onReset={reset}
      onSubmit={async (humanAmount) => {
        const amount = parseUnits(humanAmount, token.decimals);
        await withdraw({ tokenAddress, amount, humanAmount });
      }}
    />
  );
}
