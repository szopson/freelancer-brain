import { Suspense } from "react";
import { Brain } from "lucide-react";
import { Nav } from "@/components/landing/nav";
import { Hero } from "@/components/landing/hero";
import { LiveStats, LiveStatsSkeleton } from "@/components/landing/live-stats";
import { LoopSection } from "@/components/landing/loop-section";
import { BentoFeatures } from "@/components/landing/bento-features";
import { ProvenanceDemo } from "@/components/landing/provenance-demo";
import { FinalCta } from "@/components/landing/final-cta";

export const dynamic = "force-dynamic";

export default function LandingPage() {
  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <Nav />
      <main className="flex-1">
        <Hero />
        <Suspense fallback={<LiveStatsSkeleton />}>
          <LiveStats />
        </Suspense>
        <LoopSection />
        <BentoFeatures />
        <ProvenanceDemo />
        <FinalCta />
      </main>
      <footer className="border-t border-white/5">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-6 py-8 text-xs text-muted-foreground/70">
          <span className="flex items-center gap-2">
            <Brain className="size-3.5 text-primary/70" />
            FreelancerBrain LIGHT — prototyp HyperHuman Labs · dane demo są
            fikcyjne
          </span>
          <span className="font-mono">
            Next.js · Anthropic API · LLM-Wiki · Higgsfield
          </span>
        </div>
      </footer>
    </div>
  );
}
