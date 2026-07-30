import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function ClosingCta() {
  return (
    <section className="relative px-6 pb-24">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 rounded-2xl border border-border-subtle bg-gradient-to-b from-surface to-background px-8 py-16 text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Put your stablecoins to work.
        </h2>
        <p className="max-w-md text-base text-muted">
          Connect your wallet and let the agent show you what your portfolio could be earning.
        </p>
        <Link href="/app" className="btn-primary group px-6 py-3 text-sm">
          Launch App
          <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </section>
  );
}
