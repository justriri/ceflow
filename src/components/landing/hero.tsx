import Link from "next/link";
import { ArrowRight, PlayCircle } from "lucide-react";

const PROTOCOLS = ["Aave", "Moola Market", "Curve", "Uniswap V3", "Mento", "Ubeswap"];

export function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pt-20 pb-24 sm:pt-28 sm:pb-32">
      <div className="bg-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,black_10%,transparent_75%)]" />
      <div
        className="pointer-events-none absolute top-[-12rem] left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full opacity-20 blur-[100px]"
        style={{ background: "radial-gradient(circle, var(--accent) 0%, transparent 70%)" }}
        aria-hidden="true"
      />

      <div className="relative mx-auto flex max-w-4xl flex-col items-center gap-8 text-center">
        <span className="animate-fade-in inline-flex items-center gap-2 rounded-full border border-border-subtle bg-surface/60 px-3.5 py-1.5 text-xs font-medium text-muted">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
          </span>
          Ceflow · Built on Celo
        </span>

        <h1 className="animate-fade-up text-4xl leading-[1.1] font-semibold tracking-tight text-balance text-foreground sm:text-6xl [animation-delay:80ms]">
          <span className="text-accent">Ceflow</span> is the AI Yield Agent for Celo
          stablecoins.
        </h1>

        <p className="animate-fade-up text-lg font-medium tracking-wide text-accent [animation-delay:160ms]">
          Analyze. Optimize. Execute.
        </p>

        <p className="animate-fade-up max-w-xl text-base text-balance text-muted [animation-delay:200ms]">
          Ceflow continuously monitors the best yield opportunities across Celo&apos;s stablecoin
          DeFi protocols while you stay in control of every transaction — your autonomous yield
          assistant, one signature away from executing.
        </p>

        <div className="animate-fade-up flex flex-col items-center gap-3 [animation-delay:280ms] sm:flex-row">
          <Link href="/app" className="btn-primary group px-6 py-3 text-sm">
            Launch App
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
          <a href="#how-it-works" className="btn-secondary px-6 py-3 text-sm">
            <PlayCircle size={16} />
            View Demo
          </a>
        </div>

        <div className="animate-fade-up flex flex-col items-center gap-3 pt-10 [animation-delay:360ms]">
          <span className="text-[11px] font-medium tracking-widest text-muted-2 uppercase">
            Live across real Celo protocols
          </span>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {PROTOCOLS.map((protocol) => (
              <span key={protocol} className="text-sm text-muted">
                {protocol}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
