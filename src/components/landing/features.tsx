import {
  Brain,
  Lightbulb,
  Radar,
  SlidersHorizontal,
  FlaskConical,
  ShieldAlert,
  GitCompareArrows,
  BellRing,
  Gem,
  type LucideIcon,
} from "lucide-react";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  premium?: boolean;
}

const FEATURES: Feature[] = [
  {
    icon: Brain,
    title: "AI Portfolio Analysis",
    description: "A conversational read on your positions, idle capital, and diversification.",
  },
  {
    icon: Lightbulb,
    title: "Agent Insights",
    description: "Effective APY, yearly earnings, risk warnings, and suggested actions at a glance.",
  },
  {
    icon: Radar,
    title: "Live Yield Discovery",
    description: "Real-time APYs pulled from DefiLlama, ranked for your risk tolerance.",
  },
  {
    icon: SlidersHorizontal,
    title: "Portfolio Optimization",
    description: "A proposed reallocation with reasoning, projected APY, and prepared transactions.",
  },
  {
    icon: FlaskConical,
    title: "Scenario Simulator",
    description: '"What if I moved $X into USDM?" — a read-only projection before you commit.',
  },
  {
    icon: ShieldAlert,
    title: "Risk Analysis",
    description: "A safety score built from protocol risk, trust scores, and concentration.",
  },
  {
    icon: GitCompareArrows,
    title: "Cross-Protocol Comparison",
    description: "Every ranked opportunity for your assets, side by side.",
  },
  {
    icon: BellRing,
    title: "AI Monitoring",
    description: "Automated checks for APY changes, surfaced as alerts while you're active.",
  },
  {
    icon: Gem,
    title: "Premium AI (x402)",
    description: "Advanced agent tools, metered per-use over the x402 payment protocol.",
    premium: true,
  },
];

export function Features() {
  return (
    <section id="features" className="relative px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto mb-16 flex max-w-xl flex-col items-center gap-3 text-center">
          <span className="text-xs font-semibold tracking-widest text-accent uppercase">
            Features
          </span>
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Everything the agent does for you
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, i) => (
            <div
              key={feature.title}
              className="panel panel-interactive animate-fade-up group relative flex flex-col gap-4 p-6"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              {feature.premium && (
                <span className="absolute top-5 right-5 rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-semibold text-accent">
                  Premium
                </span>
              )}
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-soft transition-transform duration-200 group-hover:scale-105">
                <feature.icon size={20} className="text-accent" strokeWidth={1.75} />
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-semibold text-foreground">{feature.title}</span>
                <span className="text-sm text-muted">{feature.description}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
