"use client";

import type { ReactNode } from "react";
import { useAccessGate } from "@/hooks/use-access-gate";

interface AccessGateBoundaryProps {
  resourceId: string;
  children: ReactNode;
}

/**
 * Wraps a priced resource (currently just "generating recommendations" —
 * deliberately NOT wrapped around deposit/withdraw, since execution should
 * never be metered the same way analysis is). With the default free gate
 * this renders `children` immediately; this component is the intended
 * mount point for a future paywall UI, not a functional paywall today.
 */
export function AccessGateBoundary({ resourceId, children }: AccessGateBoundaryProps) {
  const { isGranted, isChecking, result } = useAccessGate(resourceId);

  if (isChecking) return null;

  if (!isGranted && result?.requirement) {
    const { priceUsd, asset, description } = result.requirement;
    return (
      <div className="flex flex-col gap-2 rounded-2xl border border-black/10 bg-white p-6 text-sm dark:border-white/10 dark:bg-zinc-950">
        <span className="font-medium text-black dark:text-zinc-50">Payment required</span>
        <span className="text-zinc-500 dark:text-zinc-400">
          {description} — ${priceUsd} {asset}
        </span>
      </div>
    );
  }

  return <>{children}</>;
}
