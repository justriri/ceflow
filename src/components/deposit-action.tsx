"use client";

import { useMemo } from "react";
import { useAccount } from "wagmi";
import { parseUnits } from "viem";
import { STABLECOINS, type StablecoinSymbol } from "@/config/tokens";
import { useProtocolTransaction } from "@/hooks/use-protocol-transaction";
import { AmountActionForm } from "@/components/amount-action-form";

interface DepositActionProps {
  opportunityId: string;
  stablecoinSymbol: StablecoinSymbol;
  availableBalance: string | undefined;
}

export function DepositAction({
  opportunityId,
  stablecoinSymbol,
  availableBalance,
}: DepositActionProps) {
  const { chainId } = useAccount();
  const { phase, step, error, txHash, isSupported, deposit, reset } =
    useProtocolTransaction(opportunityId);

  const token = useMemo(
    () => STABLECOINS.find((t) => t.symbol === stablecoinSymbol),
    [stablecoinSymbol],
  );
  const tokenAddress = token && chainId !== undefined ? token.addresses[chainId] : undefined;

  if (!isSupported || !token || !tokenAddress) return null;

  return (
    <AmountActionForm
      label={`Deposit ${stablecoinSymbol}`}
      actionLabel="Deposit"
      busyLabel="Depositing…"
      maxAmount={availableBalance}
      maxHelperLabel={
        availableBalance !== undefined ? `Balance: ${availableBalance} ${stablecoinSymbol}` : ""
      }
      phase={phase}
      step={step}
      error={error}
      txHash={txHash}
      onReset={reset}
      onSubmit={async (humanAmount) => {
        const amount = parseUnits(humanAmount, token.decimals);
        await deposit({ tokenAddress, amount, humanAmount });
      }}
    />
  );
}
