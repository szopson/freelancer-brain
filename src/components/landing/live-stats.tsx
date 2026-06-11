import { Activity } from "lucide-react";
import { getStorage } from "@/lib/storage";
import { composeStats } from "@/lib/brain/stats";
import { CountUp } from "./count-up";
import { Reveal } from "./reveal";

// Async RSC streamowany w Suspense — hero nie czeka na odczyt storage.
export async function LiveStats() {
  const stats = await composeStats(getStorage());

  const items = [
    { value: stats.claimsAnchored, label: "ustaleń z kotwicą do źródła" },
    { value: stats.openLoops, label: "otwartych pętli pod obserwacją" },
    { value: stats.processedSources, label: "surowych źródeł przetworzonych" },
    { value: stats.wikiPages, label: "stron wiki utrzymywanych na żywo" },
  ];

  return (
    <section className="relative border-y border-white/5 bg-white/[0.015] py-20">
      <div className="mx-auto max-w-5xl px-6">
        <Reveal>
          <p className="flex items-center justify-center gap-2 font-mono text-xs uppercase tracking-[0.3em] text-primary/80">
            <Activity className="size-3.5" />
            Ten mózg żyje naprawdę
          </p>
        </Reveal>
        <div className="mt-12 grid grid-cols-2 gap-10 md:grid-cols-4">
          {items.map((item, i) => (
            <Reveal key={item.label} delay={i * 100} className="text-center">
              <div className="font-display text-5xl font-light gradient-text sm:text-6xl">
                <CountUp value={item.value} />
              </div>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                {item.label}
              </p>
            </Reveal>
          ))}
        </div>
        <Reveal delay={400}>
          <p className="mt-10 text-center text-xs text-muted-foreground/60">
            Liczby czytane na żywo ze wspólnego demo — zmieniają się, gdy ktoś
            wrzuci nowe źródło albo uruchomi skan.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

export function LiveStatsSkeleton() {
  return (
    <section className="relative border-y border-white/5 bg-white/[0.015] py-20">
      <div className="mx-auto max-w-5xl px-6">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="text-center">
              <div className="mx-auto h-14 w-20 animate-pulse rounded-lg bg-white/5" />
              <div className="mx-auto mt-3 h-3 w-32 animate-pulse rounded bg-white/5" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
