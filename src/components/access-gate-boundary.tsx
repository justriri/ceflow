"use client";

import type { ReactNode } from "react";
import { Lock } from "lucide-react";
import { useAccessGate } from "@/hooks/use-access-gate";

interface AccessGateBoundaryProps {
  resourceId: string;
  children: ReactNode;
}

/**
 * Wraps a priced resource (currently "generating recommendations" and
 * "ai-premium" — deliberately NOT wrapped around deposit/withdraw, since
 * execution should never be metered the same way analysis is). With the
 * default free gate this renders `children` immediately; this component is
 * the intended mount point for a future paywall UI, not a functional
 * paywall today.
 */
export function AccessGateBoundary({ resourceId, children }: AccessGateBoundaryProps) {
  const { isGranted, isChecking, result } = useAccessGate(resourceId);

  if (isChecking) {
    return <div className="skeleton h-32 w-full" role="status" aria-label="Checking access" />;
  }

  if (!isGranted && result?.requirement) {
    const { priceUsd, asset, description } = result.requirement;
    return (
      <div className="panel flex flex-col items-center gap-3 p-10 text-center">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-soft">
          <Lock size={18} className="text-accent" strokeWidth={1.75} />
        </div>
        <span className="text-sm font-semibold text-foreground">Payment required</span>
        <span className="max-w-sm text-sm text-muted">
          {description} — ${priceUsd} {asset}
        </span>
      </div>
    );
  }

  return <>{children}</>;
}
