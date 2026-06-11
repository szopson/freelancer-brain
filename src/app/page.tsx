import Link from "next/link";
import {
  ArrowRight,
  Brain,
  CalendarCheck,
  CircleDashed,
  FolderOpen,
  Inbox,
  Sun,
  FileText,
  Sparkles,
  ScanSearch,
  Code2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { HeroMedia } from "@/components/landing/hero-media";

const FEATURES = [
  {
    icon: Sun,
    title: "Daily Brief",
    desc: "Co masz dziś zrobić, komu odpisać, co zaległe, co może Cię ugryźć — każdego ranka.",
  },
  {
    icon: FolderOpen,
    title: "Project Memory",
    desc: "3–5 projektów: klient, status, ustalenia, deadliny, faktury, decyzje. Nic nie ginie.",
  },
  {
    icon: CircleDashed,
    title: "Open Loops Detector",
    desc: "Serce LIGHT. Joris pilnuje, czego nie dowiozłeś: obietnice, terminy, niewystawione faktury.",
  },
  {
    icon: Inbox,
    title: "Joris Inbox",
    desc: "Jedno miejsce na chaos: mail, eksport WhatsApp, notatka, głosówka. Wrzucasz — Joris porządkuje.",
  },
  {
    icon: CalendarCheck,
    title: "Weekly Review",
    desc: "Co idzie dobrze, co stoi, gdzie kasa do zebrania, gdzie ryzyko konfliktu.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Nagłówek */}
      <header className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Brain className="size-5 text-primary" />
            <span className="font-semibold tracking-tight">FreelancerBrain</span>
            <Badge variant="secondary" className="text-[10px]">
              LIGHT · demo
            </Badge>
          </div>
          <nav className="flex items-center gap-2">
            <Button variant="ghost" size="sm" render={<Link href="/app/brief" />}>
              Demo
            </Button>
            <Button size="sm" render={<Link href="/onboarding" />}>
              Zacznij <ArrowRight className="size-4" />
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto grid max-w-5xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
          <div className="space-y-6">
            <Badge variant="outline" className="font-normal">
              Drugi Mózg dla solo-konsultanta
            </Badge>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
              Pilnuję twoich projektów{" "}
              <span className="text-muted-foreground">i zobowiązań.</span>
            </h1>
            <p className="max-w-md text-lg text-muted-foreground">
              Kilku klientów, faktury, ustalenia na WhatsAppie, mail, notatki
              porozrzucane jak resztki po remoncie kuchni. Wrzuć mi ten chaos —
              ja go uporządkuję. I nie zapomnę.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" render={<Link href="/onboarding" />}>
                Przejdź rytuał startowy <ArrowRight className="size-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                render={<Link href="/app/brief" />}
              >
                Zobacz demo z danymi Marka
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Wspólne demo — dane są fikcyjne i widoczne dla wszystkich
              odwiedzających. Pętla ingest → lint działa naprawdę.
            </p>
          </div>
          <HeroMedia />
        </section>

        {/* Jak działa pętla */}
        <section className="border-y bg-muted/30">
          <div className="mx-auto max-w-5xl space-y-8 px-4 py-16">
            <div className="text-center">
              <h2 className="text-2xl font-semibold tracking-tight">
                Nie kolejny bot z uploadem plików
              </h2>
              <p className="mx-auto mt-2 max-w-2xl text-muted-foreground">
                Joris przyrostowo buduje i utrzymuje trwałe wiki twojej firmy
                (wzorzec LLM-Wiki). Każdy fakt ma kotwicę do nietkniętego
                źródła — zero zmyślania, pełna identyfikowalność.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardContent className="space-y-2 py-6">
                  <Inbox className="size-6 text-primary" />
                  <h3 className="font-medium">1. Ingest</h3>
                  <p className="text-sm text-muted-foreground">
                    Wrzucasz surowe źródło. Joris wyciąga ustalenia, stawki,
                    deadliny — i aktualizuje 10–15 stron wiki naraz.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="space-y-2 py-6">
                  <Sparkles className="size-6 text-primary" />
                  <h3 className="font-medium">2. Wiki</h3>
                  <p className="text-sm text-muted-foreground">
                    Profile klientów, ustalenia z kotwicami «inbox/…»,
                    append-only dziennik. Czytelne dla ciebie i dla modelu.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="space-y-2 py-6">
                  <ScanSearch className="size-6 text-primary" />
                  <h3 className="font-medium">3. Lint</h3>
                  <p className="text-sm text-muted-foreground">
                    Nocny health-check: sprzeczności, brakujące terminy,
                    niewystawione faktury, klienci w ciszy. Sam z siebie.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* 5 funkcji */}
        <section className="mx-auto max-w-5xl space-y-8 px-4 py-16">
          <div className="text-center">
            <h2 className="text-2xl font-semibold tracking-tight">
              Pięć funkcji. Ani jednej więcej.
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-muted-foreground">
              LIGHT nie buduje mózgu całej firmy — pilnuje człowieka, który sam
              jest firmą.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <Card key={f.title}>
                <CardContent className="space-y-2 py-6">
                  <f.icon className="size-6 text-primary" />
                  <h3 className="font-medium">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
            <Card className="border-dashed">
              <CardContent className="flex h-full flex-col justify-center gap-2 py-6 text-center">
                <p className="text-sm font-medium text-muted-foreground">
                  „Nie sprzedajemy transformacji organizacyjnej. Sprzedajemy
                  to, że nie musisz o 23:40 przypominać sobie, że miałeś
                  wysłać ofertę i wystawić fakturę.”
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t bg-muted/30">
          <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-4 py-16 text-center">
            <FileText className="size-8 text-primary" />
            <h2 className="text-2xl font-semibold tracking-tight">
              Godzina do porządku.
            </h2>
            <p className="max-w-md text-muted-foreground">
              Rytuał startowy: połącz źródła, wybierz projekty, wrzuć chaos —
              i odbierz pierwszy Daily Brief z wykrytymi otwartymi pętlami.
            </p>
            <Button size="lg" render={<Link href="/onboarding" />}>
              Zacznij teraz <ArrowRight className="size-4" />
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-6 text-xs text-muted-foreground">
          <span>
            FreelancerBrain LIGHT — prototyp HyperHuman Labs. Dane demo są
            fikcyjne.
          </span>
          <span className="inline-flex items-center gap-1">
            <Code2 className="size-3.5" /> open prototype
          </span>
        </div>
      </footer>
    </div>
  );
}
