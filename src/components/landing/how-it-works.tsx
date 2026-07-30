import { Wallet2, BrainCircuit, Compass, ShieldCheck, Activity } from "lucide-react";

const STEPS = [
  {
    icon: Wallet2,
    title: "Connect Wallet",
    description: "Link your Celo wallet — balances and positions load automatically.",
  },
  {
    icon: BrainCircuit,
    title: "AI analyzes portfolio",
    description: "The agent evaluates exposure, idle capital, and risk across every position.",
  },
  {
    icon: Compass,
    title: "Discover best yield",
    description: "Live APYs are ranked across protocols for your risk profile.",
  },
  {
    icon: ShieldCheck,
    title: "Execute securely",
    description: "Every transaction is prepared for review — you sign, always.",
  },
  {
    icon: Activity,
    title: "Monitor performance",
    description: "Track earnings and get alerted when a better opportunity appears.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto mb-16 flex max-w-xl flex-col items-center gap-3 text-center">
          <span className="text-xs font-semibold tracking-widest text-accent uppercase">
            How it works
          </span>
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            From wallet to yield in five steps
          </h2>
        </div>

        <div className="relative grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5 lg:gap-4">
          <div className="absolute top-7 right-0 left-0 hidden h-px bg-gradient-to-r from-transparent via-border-strong to-transparent lg:block" />
          {STEPS.map((step, i) => (
            <div
              key={step.title}
              className="animate-fade-up relative flex flex-col items-center gap-3 text-center lg:items-start lg:text-left"
              style={{ animationDelay: `${i * 90}ms` }}
            >
              <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl border border-border-subtle bg-surface shadow-[0_1px_2px_rgba(0,0,0,0.3),0_12px_32px_-16px_rgba(0,0,0,0.6)]">
                <step.icon size={22} className="text-accent" strokeWidth={1.75} />
                <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">
                  {i + 1}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-semibold text-foreground">{step.title}</span>
                <span className="text-xs text-muted">{step.description}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
