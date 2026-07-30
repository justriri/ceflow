"use client";

import { useSwitchChain } from "wagmi";
import { celo, celoSepolia } from "wagmi/chains";

const TARGET_CHAINS = [celo, celoSepolia];

export function SwitchNetworkButton() {
  const { switchChain, isPending, error } = useSwitchChain();

  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-amber-300/50 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-950/30">
      <p className="text-sm text-amber-800 dark:text-amber-300">
        You&apos;re connected to an unsupported network. Switch to Celo to see
        balances and yield recommendations.
      </p>
      <div className="flex flex-wrap gap-2">
        {TARGET_CHAINS.map((chain) => (
          <button
            key={chain.id}
            type="button"
            disabled={isPending}
            onClick={() => switchChain({ chainId: chain.id })}
            className="rounded-full bg-amber-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-700 disabled:opacity-50 dark:bg-amber-700 dark:hover:bg-amber-600"
          >
            {isPending ? "Switching…" : `Switch to ${chain.name}`}
          </button>
        ))}
      </div>
      {error && (
        <p className="text-xs text-amber-700 dark:text-amber-400">
          {error.message}
        </p>
      )}
    </div>
  );
}
