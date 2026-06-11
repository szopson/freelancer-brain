import Link from "next/link";
import {
  Sun,
  CircleDashed,
  FolderOpen,
  Inbox,
  CalendarCheck,
  ArrowUpRight,
} from "lucide-react";
import { Reveal } from "./reveal";

export function BentoFeatures() {
  return (
    <section className="relative py-28">
      <div className="aurora-bg">
        <div className="aurora-blob" />
      </div>
      <div className="relative mx-auto max-w-5xl px-6">
        <Reveal>
          <p className="text-center font-mono text-xs uppercase tracking-[0.3em] text-primary/80">
            Zakres LIGHT
          </p>
          <h2 className="mx-auto mt-4 max-w-2xl text-center font-display text-3xl font-medium tracking-tight sm:text-4xl">
            Pięć funkcji. <span className="gradient-text">Ani jednej więcej.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-muted-foreground">
            LIGHT nie buduje mózgu całej firmy — pilnuje człowieka, który sam
            jest firmą.
          </p>
        </Reveal>

        <div className="mt-16 grid gap-4 *:min-w-0 md:grid-cols-3 md:grid-rows-[auto_auto]">
          {/* Open Loops Detector — kafel hero 2×2 */}
          <Reveal className="md:col-span-2 md:row-span-2">
            <Link
              href="/app/loops"
              className="group flex h-full flex-col justify-between overflow-hidden rounded-3xl glass p-8 glow-hover"
            >
              <div>
                <div className="flex items-center justify-between">
                  <CircleDashed className="size-7 text-primary" />
                  <ArrowUpRight className="size-5 text-muted-foreground/40 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
                </div>
                <h3 className="mt-6 font-display text-2xl font-medium">
                  Open Loops Detector
                </h3>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
                  Serce LIGHT. Jedyna funkcja, której nie masz nigdzie indziej:
                  Joris czyta cały mózg i wypisuje, czego nie dowiozłeś — komu
                  nie odpisałeś, co obiecałeś, co nie ma terminu, gdzie faktura
                  czeka, gdzie klient milczy 31 dni.
                </p>
              </div>
              {/* Mini-podgląd pętli */}
              <div className="mt-8 space-y-2">
                {[
                  ["pilne", "Faktura za maj (9 200 zł) — termin mija 15.06", "text-red-400 border-red-400/30 bg-red-400/10"],
                  ["pilne", "Raport Q4 dla Zalando Stock — deadline jutro", "text-red-400 border-red-400/30 bg-red-400/10"],
                  ["w tym tygodniu", "Outlet Pro czeka na doprecyzowanie zaliczki 30%", "text-amber-400 border-amber-400/30 bg-amber-400/10"],
                ].map(([sev, text, cls], i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-xl border border-white/5 bg-background/40 px-4 py-2.5 text-sm backdrop-blur"
                  >
                    <span
                      className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] ${cls}`}
                    >
                      {sev}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-muted-foreground">
                      {text}
                    </span>
                  </div>
                ))}
              </div>
            </Link>
          </Reveal>

          <BentoTile
            href="/app/brief"
            icon={<Sun className="size-6 text-primary" />}
            title="Daily Brief"
            desc="Co masz dziś zrobić, komu odpisać, co może Cię ugryźć — każdego ranka."
            delay={100}
          />
          <BentoTile
            href="/app/clients"
            icon={<FolderOpen className="size-6 text-primary" />}
            title="Project Memory"
            desc="3–5 projektów: status, ustalenia, deadliny, faktury. Nic nie ginie."
            delay={180}
          />
          <BentoTile
            href="/app/inbox"
            icon={<Inbox className="size-6 text-primary" />}
            title="Joris Inbox"
            desc="Jedno miejsce na chaos. Wrzucasz — Joris porządkuje."
            delay={260}
          />
          <BentoTile
            href="/app/review"
            icon={<CalendarCheck className="size-6 text-primary" />}
            title="Weekly Review"
            desc="Co idzie dobrze, co stoi, gdzie kasa do zebrania, gdzie ryzyko konfliktu — przekrój tygodnia w jednym widoku."
            delay={340}
            className="md:col-span-2"
          />
        </div>
      </div>
    </section>
  );
}

function BentoTile({
  href,
  icon,
  title,
  desc,
  delay,
  className = "",
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
  delay: number;
  className?: string;
}) {
  return (
    <Reveal delay={delay} className={className}>
      <Link
        href={href}
        className="group flex h-full flex-col rounded-3xl glass p-6 glow-hover"
      >
        <div className="flex items-center justify-between">
          {icon}
          <ArrowUpRight className="size-4 text-muted-foreground/40 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
        </div>
        <h3 className="mt-4 font-display text-base font-medium">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {desc}
        </p>
      </Link>
    </Reveal>
  );
}
