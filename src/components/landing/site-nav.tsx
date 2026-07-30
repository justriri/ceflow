import Link from "next/link";
import { ArrowUpRight, Code2 } from "lucide-react";
import { Logo } from "@/components/logo";

export function SiteNav() {
  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="glass mx-auto mt-4 flex w-[calc(100%-2rem)] max-w-6xl items-center justify-between rounded-2xl px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <Logo size={26} />
          <span className="text-sm font-semibold tracking-tight text-foreground">
            Ceflow
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-muted sm:flex">
          <a href="#how-it-works" className="transition-colors hover:text-foreground">
            How it works
          </a>
          <a href="#features" className="transition-colors hover:text-foreground">
            Features
          </a>
          <a href="#why-celo" className="transition-colors hover:text-foreground">
            Why Celo
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <a
            href="https://github.com/justriri/celo-stablecoin-yield-agent"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden rounded-lg p-2 text-muted transition-colors hover:bg-surface-2 hover:text-foreground sm:inline-flex"
            aria-label="View source on GitHub"
          >
            <Code2 size={18} />
          </a>
          <Link
            href="/app"
            className="btn-primary px-4 py-2 text-sm"
          >
            Launch App
            <ArrowUpRight size={15} />
          </Link>
        </div>
      </div>
    </header>
  );
}
