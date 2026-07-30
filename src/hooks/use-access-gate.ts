"use client";

import { useEffect, useState } from "react";
import { activeAccessGate } from "@/lib/payments";
import type { AccessCheckResult } from "@/lib/payments/types";

interface CheckState {
  resourceId: string;
  result: AccessCheckResult;
}

/**
 * Checks access to a priced resource via whichever AccessGate is currently
 * active (see lib/payments/index.ts). With the default free gate this
 * resolves to "granted" immediately; nothing about this hook changes when
 * a real gate is swapped in.
 */
export function useAccessGate(resourceId: string) {
  const [state, setState] = useState<CheckState | null>(null);

  useEffect(() => {
    let cancelled = false;
    activeAccessGate.checkAccess(resourceId).then((result) => {
      if (!cancelled) setState({ resourceId, result });
    });
    return () => {
      cancelled = true;
    };
  }, [resourceId]);

  // Stale results (from a previous resourceId) read as "still checking"
  // rather than needing a separate reset — avoids a synchronous setState
  // at the top of the effect just to clear the old value.
  const isChecking = state === null || state.resourceId !== resourceId;
  const result = isChecking ? null : state.result;

  return {
    isGranted: result?.status === "granted",
    isChecking,
    result,
  };
}
