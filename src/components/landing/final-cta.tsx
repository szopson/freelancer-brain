import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "./reveal";

export function FinalCta() {
  return (
    <section className="relative overflow-hidden py-32">
      <div className="aurora-bg">
        <div className="aurora-blob" />
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      <div className="relative mx-auto flex max-w-3xl flex-col items-center px-6 text-center">
        <Reveal>
          <h2 className="font-display text-4xl font-medium tracking-tight sm:text-5xl">
            Godzina do <span className="gradient-text">porządku.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-md text-muted-foreground">
            Rytuał startowy: połącz źródła, wybierz projekty, wrzuć chaos — i
            odbierz pierwszy Daily Brief z wykrytymi otwartymi pętlami.
          </p>
          <div className="mt-9">
            <Button
              size="lg"
              className="h-13 px-8 text-base shadow-[0_0_48px_-8px_oklch(0.82_0.13_75/60%)]"
              render={<Link href="/onboarding" />}
            >
              Zacznij teraz <ArrowRight className="size-4" />
            </Button>
          </div>
          <p className="mt-6 text-xs text-muted-foreground/60">
            „Nie sprzedajemy transformacji organizacyjnej. Sprzedajemy to, że
            nie musisz o 23:40 przypominać sobie, że miałeś wysłać ofertę
            i wystawić fakturę.”
          </p>
        </Reveal>
      </div>
    </section>
  );
}
