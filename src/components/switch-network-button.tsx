"use client";

import { useSwitchChain } from "wagmi";
import { celo, celoSepolia } from "wagmi/chains";
import { TriangleAlert } from "lucide-react";

const TARGET_CHAINS = [celo, celoSepolia];

export function SwitchNetworkButton() {
  const { switchChain, isPending, error } = useSwitchChain();

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-[rgba(245,185,66,0.25)] bg-risk-soft p-5">
      <div className="flex items-start gap-2.5">
        <TriangleAlert size={16} className="mt-0.5 shrink-0 text-risk" />
        <p className="text-sm text-foreground">
          You&apos;re connected to an unsupported network. Switch to Celo to see balances and yield
          recommendations.
        </p>
      </div>
      <div className="flex flex-wrap gap-2 pl-[1.625rem]">
        {TARGET_CHAINS.map((chain) => (
          <button
            key={chain.id}
            type="button"
            disabled={isPending}
            onClick={() => switchChain({ chainId: chain.id })}
            className="rounded-lg bg-risk px-4 py-2 text-sm font-medium text-accent-foreground transition-all hover:brightness-105 disabled:opacity-50"
          >
            {isPending ? "Switching…" : `Switch to ${chain.name}`}
          </button>
        ))}
      </div>
      {error && <p className="pl-[1.625rem] text-xs text-risk">{error.message}</p>}
    </div>
  );
}
