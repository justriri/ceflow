"use client";

import { useAccount } from "wagmi";
import { ExternalLink } from "lucide-react";
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
      <div className="flex flex-col gap-2 border-t border-border-subtle pt-4">
        <DepositAction
          opportunityId={opportunityId}
          stablecoinSymbol={stablecoinSymbol}
          availableBalance={availableBalance}
        />
        <span className="text-xs text-muted-2">
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
    <div className="flex flex-col gap-1.5 border-t border-border-subtle pt-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-surface-2 px-2.5 py-1 text-xs font-semibold text-muted">
          {label}
        </span>
        <a
          href={protocolUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-muted underline transition-colors hover:text-foreground"
        >
          Deposit manually on the protocol&apos;s site
          <ExternalLink size={11} />
        </a>
      </div>
      <span className="text-xs text-muted-2">{availability.reason}</span>
    </div>
  );
}
