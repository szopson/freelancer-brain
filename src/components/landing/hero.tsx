import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Hero3D } from "./hero-3d";

export function Hero() {
  return (
    <section className="relative flex h-svh min-h-[640px] flex-col overflow-hidden">
      {/* Warstwa 3D / poster / video — pełny ekran */}
      <Hero3D />

      {/* Winieta dla czytelności tekstu */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-background/85 via-background/40 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />

      {/* Treść */}
      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-6 pt-24">
        <p className="mb-5 inline-flex w-fit items-center gap-2 rounded-full glass px-3 py-1 text-xs text-muted-foreground">
          <span className="size-1.5 animate-pulse rounded-full bg-primary" />
          Drugi Mózg dla solo-konsultanta — pętla myśli naprawdę
        </p>
        <h1 className="max-w-3xl font-display text-4xl font-medium leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl">
          Chaos wpada.
          <br />
          <span className="gradient-text">Pamięć zostaje.</span>
        </h1>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Maile, eksporty WhatsAppa, notatki z calli, głosówki. Wrzucasz chaos —
          Joris buduje z niego żywą wiki twojej firmy i pilnuje, czego nie
          dowiozłeś.
        </p>
        <div className="mt-9 flex flex-wrap items-center gap-3">
          <Button
            size="lg"
            className="h-12 px-7 text-base shadow-[0_0_36px_-8px_oklch(0.82_0.13_75/55%)]"
            render={<Link href="/onboarding" />}
          >
            Przejdź rytuał startowy <ArrowRight className="size-4" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-12 glass px-7 text-base"
            render={<Link href="/app/brief" />}
          >
            Demo z danymi Marka
          </Button>
        </div>
        <p className="mt-5 text-xs text-muted-foreground/70">
          Wspólne demo · dane fikcyjne · pętla ingest → lint działa naprawdę na
          Anthropic API
        </p>
      </div>

      {/* Scroll cue */}
      <div className="relative z-10 flex justify-center pb-6">
        <ChevronDown className="size-5 animate-bounce text-muted-foreground/50" />
      </div>
    </section>
  );
}
