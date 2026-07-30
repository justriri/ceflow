"use client";

import { useState } from "react";
import { ChevronRight, Wand2 } from "lucide-react";
import type { AllocationMove, OptimizationPlan } from "@/lib/analysis/types";
import type { StablecoinSymbol } from "@/config/tokens";
import { formatPercent, formatUsd } from "@/lib/analysis/format";
import { WithdrawAction } from "@/components/withdraw-action";
import { DepositAction } from "@/components/deposit-action";

interface MoveRowProps {
  move: AllocationMove;
  getAvailableBalance: (symbol: StablecoinSymbol) => string | undefined;
}

function MoveRow({ move, getAvailableBalance }: MoveRowProps) {
  const [expanded, setExpanded] = useState(false);
  const hasWithdrawStep = move.fromOpportunityId !== null;

  return (
    <div className="panel-interactive flex flex-col gap-3 rounded-xl border border-border-subtle p-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-semibold text-foreground">
            {move.fromProtocolName
              ? `Move ${move.stablecoinSymbol} from ${move.fromProtocolName} to ${move.toProtocolName}`
              : `Deposit idle ${move.stablecoinSymbol} into ${move.toProtocolName}`}
          </span>
          <span className="text-xs text-muted">{move.reasoning}</span>
          <span className="text-xs text-muted-2 tabular-nums">
            {formatUsd(move.amountUsd)} · {formatPercent(move.currentApy)} → {formatPercent(move.projectedApy)}
          </span>
        </div>
        <span className="shrink-0 text-sm font-semibold text-success tabular-nums">
          +{formatUsd(move.estimatedAnnualImprovement)}/yr
        </span>
      </div>

      <div className="border-t border-border-subtle pt-3">
        {!expanded ? (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="group flex items-center gap-1 text-xs font-medium text-accent"
          >
            Prepare transaction{hasWithdrawStep ? "s" : ""}
            <ChevronRight size={13} className="transition-transform group-hover:translate-x-0.5" />
          </button>
        ) : (
          <div className="flex flex-col gap-4">
            {hasWithdrawStep && (
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-semibold tracking-wide text-muted-2 uppercase">
                  Step 1 — Withdraw from {move.fromProtocolName}
                </span>
                <WithdrawAction
                  opportunityId={move.fromOpportunityId!}
                  stablecoinSymbol={move.stablecoinSymbol}
                  depositedAmount={move.amount.toString()}
                />
              </div>
            )}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-semibold tracking-wide text-muted-2 uppercase">
                {hasWithdrawStep ? `Step 2 — Deposit into ${move.toProtocolName}` : `Deposit into ${move.toProtocolName}`}
              </span>
              <DepositAction
                opportunityId={move.toOpportunityId}
                stablecoinSymbol={move.stablecoinSymbol}
                availableBalance={getAvailableBalance(move.stablecoinSymbol)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface OptimizePortfolioCardProps {
  plan: OptimizationPlan;
  getAvailableBalance: (symbol: StablecoinSymbol) => string | undefined;
}

/**
 * The Optimize Portfolio workflow: Analyze (already done — `plan` is a pure
 * function of the current snapshot) → Explain (summary + per-move
 * reasoning) → Prepare Transaction (each move expands into the real
 * withdraw/deposit forms, unsigned) → User reviews → wallet signature →
 * execute. Nothing here ever submits a transaction on its own; every step
 * still ends at the same wallet-confirmation flow deposits/withdrawals
 * already use elsewhere in the app.
 */
export function OptimizePortfolioCard({ plan, getAvailableBalance }: OptimizePortfolioCardProps) {
  return (
    <div className="panel flex flex-col gap-4 p-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Wand2 size={14} className="text-accent" />
          <span className="text-sm font-semibold text-muted">Optimize Portfolio</span>
        </div>
        <p className="text-[15px] leading-relaxed text-foreground">{plan.summary}</p>
      </div>

      {plan.hasChanges && (
        <>
          <div className="flex flex-wrap gap-6 border-t border-border-subtle pt-4">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted">Current effective APY</span>
              <span className="text-lg font-semibold text-foreground tabular-nums">
                {formatPercent(plan.currentEffectiveApy)}
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted">Projected effective APY</span>
              <span className="text-lg font-semibold text-success tabular-nums">
                {formatPercent(plan.projectedEffectiveApy)}
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted">Estimated improvement</span>
              <span className="text-lg font-semibold text-success tabular-nums">
                +{formatUsd(plan.estimatedAnnualImprovement)}/yr
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {plan.moves.map((move) => (
              <MoveRow key={move.id} move={move} getAvailableBalance={getAvailableBalance} />
            ))}
          </div>

          <p className="text-xs text-muted-2">
            Preparing a transaction only builds it for your review — nothing is signed or sent until you
            approve it in your wallet. Moves out of an existing position require a withdrawal first, then a
            separate deposit.
          </p>
        </>
      )}
    </div>
  );
}
