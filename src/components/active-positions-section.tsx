"use client";

import { usePositions } from "@/hooks/use-positions";
import { PortfolioSummaryCard } from "@/components/portfolio-summary-card";
import { PositionCard } from "@/components/position-card";

export function ActivePositionsSection() {
  const { positions, isLoading } = usePositions();

  if (isLoading && positions.length === 0) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading your positions…</p>
    );
  }

  if (positions.length === 0) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        No active positions yet. Deposit into a recommendation to see it here.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PortfolioSummaryCard positions={positions} />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
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
