"use client";

import { useState } from "react";
import {
  BellRing,
  TrendingUp,
  Sparkles,
  TriangleAlert,
  Repeat,
  Newspaper,
  Loader2,
  type LucideIcon,
} from "lucide-react";
import { useMonitorEvents } from "@/hooks/use-monitor-events";

const TYPE_ICON: Record<string, LucideIcon> = {
  "apy-change": TrendingUp,
  "new-opportunity": Sparkles,
  "risk-change": TriangleAlert,
  "better-allocation": Repeat,
  "market-event": Newspaper,
};

function formatLastChecked(timestamp: number | null): string {
  if (timestamp === null) return "Not checked yet";
  return `Last checked ${new Date(timestamp).toLocaleTimeString()}`;
}

/** Automated Monitoring (the polling control) + AI Alerts (the resulting event feed) — one card, since alerts are simply what monitoring produces. */
export function AIAlertsCard() {
  const [autoPoll, setAutoPoll] = useState(false);
  const { events, isChecking, lastCheckedAt, checkNow } = useMonitorEvents(autoPoll);

  return (
    <div className="panel flex flex-col gap-4 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <BellRing size={14} className="text-accent" />
          <span className="text-sm font-semibold text-muted">Automated Monitoring &amp; AI Alerts</span>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 text-xs text-muted">
            <input
              type="checkbox"
              checked={autoPoll}
              onChange={(e) => setAutoPoll(e.target.checked)}
              className="accent-accent"
            />
            Auto-check every 60s while open
          </label>
          <button
            type="button"
            onClick={() => void checkNow()}
            disabled={isChecking}
            className="btn-secondary flex items-center gap-1.5 px-3 py-1.5 text-xs"
          >
            {isChecking && <Loader2 size={12} className="animate-spin" />}
            {isChecking ? "Checking…" : "Check now"}
          </button>
        </div>
      </div>

      <span className="text-[11px] text-muted-2">{formatLastChecked(lastCheckedAt)}</span>

      {events.length === 0 ? (
        <p className="text-sm text-muted">
          No alerts right now — you&apos;ll see APY changes here since your last check. This runs while this
          panel is open, in your browser; it isn&apos;t a background service that watches your portfolio when
          the tab is closed.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {events.map((event, i) => {
            const Icon = TYPE_ICON[event.type] ?? BellRing;
            return (
              <li
                key={`${event.type}-${event.opportunityId}-${i}`}
                className="panel-interactive flex items-start gap-2.5 rounded-xl border border-border-subtle p-3 text-sm"
              >
                <Icon size={15} className="mt-0.5 shrink-0 text-accent" />
                <div className="flex flex-col">
                  <span className="font-medium text-foreground">{event.headline}</span>
                  <span className="text-xs text-muted">{event.detail}</span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
