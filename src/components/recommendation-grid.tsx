import type { ScoredOpportunity } from "@/lib/scoring/types";
import type { StablecoinSymbol } from "@/config/tokens";
import { OpportunityCard } from "@/components/opportunity-card";

interface RecommendationGridProps {
  top: ScoredOpportunity;
  alternatives: ScoredOpportunity[];
  stablecoinSymbol: StablecoinSymbol;
  availableBalance: string | undefined;
}

/**
 * Renders the top pick plus every other eligible opportunity side by side —
 * 1 column on mobile, 2 on tablet, 2-3 on desktop depending on width, wrapping
 * naturally as more opportunities appear. Grid's default item-stretch
 * behavior gives every card in a row equal height for free; each
 * OpportunityCard pins its execution button to the bottom (`mt-auto`) so
 * those line up too.
 */
export function RecommendationGrid({
  top,
  alternatives,
  stablecoinSymbol,
  availableBalance,
}: RecommendationGridProps) {
  const opportunities = [top, ...alternatives];

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
      {opportunities.map((scored) => (
        <OpportunityCard
          key={scored.opportunity.id}
          scored={scored}
          stablecoinSymbol={stablecoinSymbol}
          availableBalance={availableBalance}
          isTopPick={scored.opportunity.id === top.opportunity.id}
          topPick={top}
        />
      ))}
    </div>
  );
}
