import type { YieldOpportunity } from "@/types/yield";

const STORAGE_KEY = "celo-yield-agent:last-seen-apy:v1";

export interface ApyChange {
  opportunityId: string;
  protocolName: string;
  previousApy: number;
  currentApy: number;
  deltaPercentagePoints: number;
}

function loadSnapshot(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveSnapshot(snapshot: Record<string, number>): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    // best-effort, same as transaction history
  }
}

/**
 * Compares today's live APYs against the last-seen snapshot (client-side,
 * per-device — there's no backend to poll rates in between visits) and
 * returns what changed meaningfully. Updates the snapshot as a side effect,
 * so call this once per analysis run, not on every render.
 */
export function detectApyChanges(
  opportunities: YieldOpportunity[],
  minDeltaPoints = 0.1,
): ApyChange[] {
  const previous = loadSnapshot();
  const next: Record<string, number> = {};
  const changes: ApyChange[] = [];

  for (const opportunity of opportunities) {
    next[opportunity.id] = opportunity.apy.value;
    const prevValue = previous[opportunity.id];
    if (prevValue === undefined) continue;
    const delta = opportunity.apy.value - prevValue;
    if (Math.abs(delta) >= minDeltaPoints) {
      changes.push({
        opportunityId: opportunity.id,
        protocolName: opportunity.protocolName,
        previousApy: prevValue,
        currentApy: opportunity.apy.value,
        deltaPercentagePoints: delta,
      });
    }
  }

  saveSnapshot(next);
  return changes;
}
