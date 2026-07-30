import { Zap, Coins, Layers, Cpu } from "lucide-react";

const REASONS = [
  {
    icon: Zap,
    title: "Fast transactions",
    description: "Sub-second block times mean deposits and withdrawals confirm in seconds, not minutes.",
  },
  {
    icon: Coins,
    title: "Low fees",
    description: "Gas costs are a fraction of mainnet Ethereum — yield isn't eaten by transaction costs.",
  },
  {
    icon: Layers,
    title: "Stablecoin ecosystem",
    description: "Mento's native stablecoins (USDM, cEUR, cREAL) plus USDC give an agent real assets to work with.",
  },
  {
    icon: Cpu,
    title: "AI-ready infrastructure",
    description: "Cheap, fast execution is what makes AI-prepared transactions and continuous monitoring practical.",
  },
];

export function WhyCelo() {
  return (
    <section id="why-celo" className="relative px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="panel relative overflow-hidden p-8 sm:p-12">
          <div
            className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full opacity-[0.15] blur-[90px]"
            style={{ background: "var(--accent)" }}
            aria-hidden="true"
          />
          <div className="relative mb-12 flex flex-col gap-3">
            <span className="text-xs font-semibold tracking-widest text-accent uppercase">
              Why Celo
            </span>
            <h2 className="max-w-lg text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Built for an AI agent that moves real money
            </h2>
          </div>

          <div className="relative grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {REASONS.map((reason) => (
              <div key={reason.title} className="flex flex-col gap-3">
                <reason.icon size={22} className="text-accent" strokeWidth={1.75} />
                <span className="text-sm font-semibold text-foreground">{reason.title}</span>
                <span className="text-sm text-muted">{reason.description}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
