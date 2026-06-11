import { Inbox, Sparkles, ScanSearch } from "lucide-react";
import { Reveal } from "./reveal";

const STEPS = [
  {
    n: "01",
    icon: Inbox,
    title: "Ingest",
    desc: "Wrzucasz surowe źródło — mail, eksport czatu, głosówkę. Joris wyciąga ustalenia, stawki, deadliny i rozprowadza je po 10–15 stronach wiki naraz.",
    accent: "from-amber-400/60",
  },
  {
    n: "02",
    icon: Sparkles,
    title: "Wiki",
    desc: "Profile klientów, ustalenia z kotwicami «inbox/…», append-only dziennik. Każdy fakt da się prześledzić do nietkniętego źródła jednym kliknięciem.",
    accent: "from-cyan-400/60",
  },
  {
    n: "03",
    icon: ScanSearch,
    title: "Lint",
    desc: "Nocny health-check: sprzeczności, brakujące terminy, niewystawione faktury, klienci w ciszy. Mózg utrzymuje się aktualny sam — koszt ≈ zero.",
    accent: "from-violet-400/60",
  },
];

export function LoopSection() {
  return (
    <section className="relative py-28">
      <div className="mx-auto max-w-5xl px-6">
        <Reveal>
          <p className="text-center font-mono text-xs uppercase tracking-[0.3em] text-primary/80">
            Pętla LLM-Wiki
          </p>
          <h2 className="mx-auto mt-4 max-w-2xl text-center font-display text-3xl font-medium tracking-tight sm:text-4xl">
            Nie kolejny bot z uploadem plików
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-muted-foreground">
            Joris przyrostowo buduje i utrzymuje trwałe wiki twojej firmy.
            Wiedza jest kompilowana raz — nie odkrywana od zera przy każdym
            pytaniu.
          </p>
        </Reveal>

        <div className="mt-16 grid gap-5 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 120}>
              <div className="group relative h-full overflow-hidden rounded-2xl glass p-7 glow-hover">
                <div
                  className={`pointer-events-none absolute -top-12 left-6 h-24 w-40 rounded-full bg-gradient-to-b ${s.accent} to-transparent opacity-25 blur-2xl transition-opacity group-hover:opacity-50`}
                />
                <div className="flex items-start justify-between">
                  <s.icon className="size-6 text-primary" />
                  <span className="font-display text-4xl font-light text-white/10 transition-colors group-hover:text-white/20">
                    {s.n}
                  </span>
                </div>
                <h3 className="mt-5 font-display text-lg font-medium">
                  {s.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {s.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
