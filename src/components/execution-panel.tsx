"use client";

import { useAccount } from "wagmi";
import type { StablecoinSymbol } from "@/config/tokens";
import { getExecutionAvailability } from "@/lib/transactions/execution-availability";
import { DepositAction } from "@/components/deposit-action";

interface ExecutionPanelProps {
  opportunityId: string;
  protocolUrl: string;
  stablecoinSymbol: StablecoinSymbol;
  availableBalance: string | undefined;
}

export function ExecutionPanel({
  opportunityId,
  protocolUrl,
  stablecoinSymbol,
  availableBalance,
}: ExecutionPanelProps) {
  const { chainId } = useAccount();
  const availability = getExecutionAvailability(opportunityId, chainId);

  if (availability.available) {
    return (
      <div className="flex flex-col gap-2 border-t border-black/5 pt-4 dark:border-white/5">
        <DepositAction
          opportunityId={opportunityId}
          stablecoinSymbol={stablecoinSymbol}
          availableBalance={availableBalance}
        />
        <span className="text-xs text-zinc-400 dark:text-zinc-500">
          Deposit &amp; withdraw supported.{" "}
          {availability.supportsClaimRewards
            ? "Rewards are separately claimable."
            : "No separate rewards to claim for this protocol."}
        </span>
      </div>
    );
  }

  const label = availability.hasAdapter ? "Execution coming soon" : "Manual deposit";

  return (
    <div className="flex flex-col gap-1 border-t border-black/5 pt-4 dark:border-white/5">
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
          {label}
        </span>
        <a
          href={protocolUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-zinc-500 underline dark:text-zinc-400"
        >
          Deposit manually on the protocol&apos;s site →
        </a>
      </div>
      <span className="text-xs text-zinc-400 dark:text-zinc-500">{availability.reason}</span>
    </div>
  );
}
