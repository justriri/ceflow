"use client";

import { useState } from "react";
import type { AgentAction } from "@/lib/analysis/types";
import type { StablecoinSymbol } from "@/config/tokens";
import { DepositAction } from "@/components/deposit-action";

const TYPE_LABELS: Record<AgentAction["type"], string> = {
  "deposit-idle": "Deposit idle funds",
  rebalance: "Rebalance",
  hold: "Stay in current strategy",
  diversify: "Increase diversification",
  "reduce-concentration": "Reduce protocol concentration",
  switch: "Switch opportunity",
  wait: "Wait",
};

function confidenceColor(confidence: number) {
  if (confidence >= 75) return "bg-emerald-500";
  if (confidence >= 50) return "bg-amber-500";
  return "bg-zinc-400";
}

interface ActionRowProps {
  action: AgentAction;
  availableBalance: string | undefined;
}

function ActionRow({ action, availableBalance }: ActionRowProps) {
  const [expanded, setExpanded] = useState(false);
  const canExecute = action.relatedOpportunityId !== null && action.relatedStablecoin !== null;

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-black/5 p-4 dark:border-white/5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
            {TYPE_LABELS[action.type]}
          </span>
          <span className="text-sm font-semibold text-black dark:text-zinc-50">{action.title}</span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">{action.explanation}</span>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <span className="text-sm font-semibold text-black dark:text-zinc-50">{action.expectedImpact}</span>
          <div className="flex items-center gap-1.5">
            <span className={`h-1.5 w-1.5 rounded-full ${confidenceColor(action.confidence)}`} aria-hidden="true" />
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400">{action.confidence}% confidence</span>
          </div>
        </div>
      </div>

      {canExecute && (
        <div className="border-t border-black/5 pt-3 dark:border-white/5">
          {!expanded ? (
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="text-xs font-medium text-black underline dark:text-zinc-50"
            >
              Prepare transaction →
            </button>
          ) : (
            <DepositAction
              opportunityId={action.relatedOpportunityId!}
              stablecoinSymbol={action.relatedStablecoin as StablecoinSymbol}
              availableBalance={availableBalance}
            />
          )}
        </div>
      )}
    </div>
  );
}

interface AIActionsCardProps {
  actions: AgentAction[];
  getAvailableBalance: (symbol: StablecoinSymbol) => string | undefined;
}

export function AIActionsCard({ actions, getAvailableBalance }: AIActionsCardProps) {
  if (actions.length === 0) return null;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-black/10 bg-white p-6 dark:border-white/10 dark:bg-zinc-950">
      <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">AI Actions</span>
      <div className="flex flex-col gap-3">
        {actions.map((action) => (
          <ActionRow
            key={action.id}
            action={action}
            availableBalance={
              action.relatedStablecoin ? getAvailableBalance(action.relatedStablecoin) : undefined
            }
          />
        ))}
      </div>
      <p className="text-xs text-zinc-400 dark:text-zinc-500">
        Preparing a transaction only builds it for your review — nothing is signed or sent until you
        approve it in your wallet.
      </p>
    </div>
  );
}
