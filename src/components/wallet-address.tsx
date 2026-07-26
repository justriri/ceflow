"use client";

import { useAccount } from "wagmi";
import { celo, celoAlfajores } from "wagmi/chains";

function truncateAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function networkName(chainId: number | undefined) {
  if (chainId === celo.id) return "Celo Mainnet";
  if (chainId === celoAlfajores.id) return "Alfajores Testnet";
  return "Unsupported Network";
}

export function WalletAddress() {
  const { address, isConnected, chainId } = useAccount();

  if (!isConnected || !address) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        No wallet connected.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm text-zinc-500 dark:text-zinc-400">
        Connected Address
      </span>
      <span className="font-mono text-base text-black dark:text-zinc-50">
        {truncateAddress(address)}
      </span>
      <span className="text-sm text-zinc-500 dark:text-zinc-400">
        {networkName(chainId)}
      </span>
    </div>
  );
}
