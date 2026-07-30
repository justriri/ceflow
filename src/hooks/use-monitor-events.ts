"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { runMonitors } from "@/lib/monitoring";
import type { MonitorEvent } from "@/lib/monitoring";

const POLL_INTERVAL_MS = 60_000;

/**
 * "Automated monitoring" + "AI alerts": a manual check plus a lightweight
 * interval poll while this hook stays mounted (i.e., while the AI Premium
 * panel is open). Client-side and per-session — there's no background/push
 * infra in this app, so nothing runs while the tab is closed; see
 * lib/monitoring/index.ts for exactly what a real scheduled version would
 * need. Honest about that limit rather than implying it runs unattended.
 */
export function useMonitorEvents(autoPoll: boolean) {
  const [events, setEvents] = useState<MonitorEvent[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheckedAt, setLastCheckedAt] = useState<number | null>(null);
  const mountedRef = useRef(false);

  const checkNow = useCallback(async () => {
    setIsChecking(true);
    try {
      const results = await runMonitors();
      if (mountedRef.current) {
        setEvents(results);
        setLastCheckedAt(Date.now());
      }
    } finally {
      if (mountedRef.current) setIsChecking(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    // Deferred a tick so the first setState lands in a microtask, not
    // synchronously inside the effect body (checkNow's setIsChecking(true)
    // runs before its first await, which the effect-setState lint rule
    // flags if called directly here).
    Promise.resolve().then(() => checkNow());
    return () => {
      mountedRef.current = false;
    };
  }, [checkNow]);

  useEffect(() => {
    if (!autoPoll) return;
    const interval = setInterval(() => void checkNow(), POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [autoPoll, checkNow]);

  return { events, isChecking, lastCheckedAt, checkNow };
}
