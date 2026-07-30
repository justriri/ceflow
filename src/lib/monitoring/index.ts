import type { MonitorEvent, MonitorSource } from "@/lib/monitoring/types";
import { apyChangeSource } from "@/lib/monitoring/sources/apy-change-source";

export type { MonitorEvent, MonitorEventType, MonitorSource } from "@/lib/monitoring/types";

/**
 * Every registered detector. Adding a new one is: write a file implementing
 * MonitorSource in sources/, add it here — nothing else changes, since
 * runMonitors() and every consumer only depend on the MonitorSource
 * interface, never a concrete source.
 *
 * Currently registered:
 *   - apyChangeSource: real, working today (client-side, per-device).
 *
 * Designed but NOT implemented — each needs infrastructure this app
 * doesn't have yet, listed so the gap is explicit rather than silently
 * faked with a source that always returns []:
 *   - new-opportunity: needs the registry itself to be checked against a
 *     previous snapshot. Static today (a code change adds a protocol), so
 *     there's nothing to diff against at runtime yet — would apply once
 *     the registry is fetched from a remote source instead of bundled.
 *   - risk-change: needs a live signal for protocol risk (e.g. exploit
 *     disclosures, audit status, a TVL/liquidity monitor) — riskLevel is
 *     currently a static, manually-researched field per protocol.
 *   - better-allocation: a scheduled version of the "better opportunity"
 *     comparison generate-insights.ts already does for the connected
 *     wallet on each visit — needs a way to run per-wallet without a user
 *     present (a background job with stored wallet addresses, or a
 *     "watch this address" opt-in), not just on-demand in the browser.
 *   - market-event: needs a source of qualitative news/events (protocol
 *     announcements, governance proposals) — no such feed exists yet.
 *
 * None of these run automatically — there's no scheduler/cron/push
 * infrastructure in this app. runMonitors() is the seam a future job
 * would call.
 */
const REGISTERED_SOURCES: MonitorSource[] = [apyChangeSource];

export async function runMonitors(sources: MonitorSource[] = REGISTERED_SOURCES): Promise<MonitorEvent[]> {
  const results = await Promise.allSettled(sources.map((source) => source.detect()));
  return results.flatMap((result) => (result.status === "fulfilled" ? result.value : []));
}
