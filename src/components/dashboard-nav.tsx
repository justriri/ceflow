import Link from "next/link";
import { Logo } from "@/components/logo";
import { ConnectWalletButton } from "@/components/connect-wallet-button";

export function DashboardNav() {
  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="glass mx-auto mt-4 flex w-[calc(100%-2rem)] max-w-6xl items-center justify-between rounded-2xl px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <Logo size={26} />
          <span className="hidden text-sm font-semibold tracking-tight text-foreground sm:inline">
            Ceflow
          </span>
        </Link>

        <ConnectWalletButton />
      </div>
    </header>
  );
}
