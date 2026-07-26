import { ConnectWalletButton } from "@/components/connect-wallet-button";
import { WalletDashboard } from "@/components/wallet-dashboard";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-xl flex-1 flex-col gap-8 px-6 py-24">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
            Celo Stablecoin Yield Agent
          </h1>
          <p className="text-base text-zinc-600 dark:text-zinc-400">
            Connect your wallet to get started.
          </p>
        </div>

        <div className="flex flex-col gap-6 rounded-2xl border border-black/10 bg-white p-6 dark:border-white/10 dark:bg-zinc-950">
          <ConnectWalletButton />
          <WalletDashboard />
        </div>
      </main>
    </div>
  );
}
