import { SiteNav } from "@/components/landing/site-nav";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Features } from "@/components/landing/features";
import { WhyCelo } from "@/components/landing/why-celo";
import { ClosingCta } from "@/components/landing/closing-cta";
import { SiteFooter } from "@/components/landing/site-footer";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteNav />
      <main className="flex flex-1 flex-col">
        <Hero />
        <HowItWorks />
        <Features />
        <WhyCelo />
        <ClosingCta />
      </main>
      <SiteFooter />
    </div>
  );
}
