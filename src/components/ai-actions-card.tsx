"use client";

import { useState } from "react";
import { ChevronRight, Zap } from "lucide-react";
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
  if (confidence >= 75) return "bg-success";
  if (confidence >= 50) return "bg-risk";
  return "bg-muted-2";
}

interface ActionRowProps {
  action: AgentAction;
  availableBalance: string | undefined;
}

function ActionRow({ action, availableBalance }: ActionRowProps) {
  const [expanded, setExpanded] = useState(false);
  const canExecute = action.relatedOpportunityId !== null && action.relatedStablecoin !== null;

  return (
    <div className="panel-interactive flex flex-col gap-3 rounded-xl border border-border-subtle p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-semibold tracking-wide text-muted-2 uppercase">
            {TYPE_LABELS[action.type]}
          </span>
          <span className="text-sm font-semibold text-foreground">{action.title}</span>
          <span className="text-xs text-muted">{action.explanation}</span>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <span className="text-sm font-semibold text-foreground tabular-nums">{action.expectedImpact}</span>
          <div className="flex items-center gap-1.5">
            <span className={`h-1.5 w-1.5 rounded-full ${confidenceColor(action.confidence)}`} aria-hidden="true" />
            <span className="text-[10px] text-muted">{action.confidence}% confidence</span>
          </div>
        </div>
      </div>

      {canExecute && (
        <div className="border-t border-border-subtle pt-3">
          {!expanded ? (
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="group flex items-center gap-1 text-xs font-medium text-accent"
            >
              Prepare transaction
              <ChevronRight size={13} className="transition-transform group-hover:translate-x-0.5" />
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
    <div className="panel flex flex-col gap-4 p-6">
      <div className="flex items-center gap-2">
        <Zap size={14} className="text-accent" />
        <span className="text-sm font-semibold text-muted">AI Actions</span>
      </div>
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
      <p className="text-xs text-muted-2">
        Preparing a transaction only builds it for your review — nothing is signed or sent until you
        approve it in your wallet.
      </p>
    </div>
  );
}
