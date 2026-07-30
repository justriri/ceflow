import type { MonitorEvent, MonitorSource } from "@/lib/monitoring/types";
import { YIELD_OPPORTUNITIES } from "@/lib/protocols";
import { applyLiveApy } from "@/lib/yield/apply-live-apy";
import { detectApyChanges } from "@/lib/analysis/apy-change-tracker";

/**
 * The one fully working detector today — reuses the same
 * detectApyChanges/live-data fetch already driving the "market" insights in
 * the Agent tab. Self-contained (fetches its own live data) so it can run
 * outside a React render, e.g. from a future scheduled job.
 */
export const apyChangeSource: MonitorSource = {
  id: "apy-change",
  async detect(): Promise<MonitorEvent[]> {
    let poolApys: Record<string, number> = {};
    try {
      const res = await fetch("/api/live-data");
      if (res.ok) {
        const data = await res.json();
        poolApys = data.poolApys ?? {};
      }
    } catch {
      return []; // live data unavailable — nothing to report this run, not an error state
    }

    const opportunities = applyLiveApy(YIELD_OPPORTUNITIES, poolApys);
    const changes = detectApyChanges(opportunities);

    return changes.map((change) => ({
      type: "apy-change" as const,
      headline: `${change.protocolName}'s APY ${change.deltaPercentagePoints > 0 ? "rose" : "fell"} to ${change.currentApy}%`,
      detail: `Was ${change.previousApy}% at last check.`,
      timestamp: Date.now(),
      opportunityId: change.opportunityId,
    }));
  },
};
