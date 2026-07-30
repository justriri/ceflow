"use client";

import { Wallet, Loader2 } from "lucide-react";
import { usePositions } from "@/hooks/use-positions";
import { PortfolioSummaryCard } from "@/components/portfolio-summary-card";
import { PositionCard } from "@/components/position-card";
import { EmptyState } from "@/components/empty-state";

export function ActivePositionsSection() {
  const { positions, isLoading } = usePositions();

  if (isLoading && positions.length === 0) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted">
        <Loader2 size={14} className="animate-spin" />
        Loading your positions…
      </div>
    );
  }

  if (positions.length === 0) {
    return (
      <EmptyState
        icon={Wallet}
        title="No active positions yet"
        description="Deposit into a recommendation to see it here."
      />
    );
  }

  return (
    <div className="animate-fade-up flex flex-col gap-6">
      <PortfolioSummaryCard positions={positions} />
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {positions.map((position) => (
          <PositionCard
            key={`${position.opportunityId}-${position.stablecoinSymbol}`}
            position={position}
          />
        ))}
      </div>
    </div>
  );
}
