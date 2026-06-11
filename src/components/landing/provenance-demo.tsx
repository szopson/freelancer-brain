import { FileCheck2 } from "lucide-react";
import { AnchorChip } from "@/components/anchor-chip";
import { Reveal } from "./reveal";

// Prawdziwy dowód: ustalenie z wiki + klikalna kotwica otwierająca
// nietknięte źródło przez /api/source. Zero mocka.
export function ProvenanceDemo() {
  return (
    <section className="relative py-28">
      <div className="mx-auto max-w-5xl px-6">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <Reveal>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary/80">
              Provenance
            </p>
            <h2 className="mt-4 font-display text-3xl font-medium tracking-tight sm:text-4xl">
              Zero zmyślania.
              <br />
              <span className="gradient-text">Każdy fakt ma kotwicę.</span>
            </h2>
            <p className="mt-5 max-w-md leading-relaxed text-muted-foreground">
              Joris nie może stwierdzić faktu bez wskazania źródła — kotwica
              «inbox/…» jest stemplowana przez kod, nie przez prompt. Kliknij
              chip obok i zobacz nietknięty, surowy mail, z którego pochodzi to
              ustalenie.
            </p>
            <p className="mt-4 text-sm text-muted-foreground/70">
              Twardy podział: model nigdy nie pisze do <code>inbox/</code>,
              człowiek nigdy nie edytuje <code>brain/</code>.
            </p>
          </Reveal>

          <Reveal delay={150}>
            <div className="relative">
              <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-tr from-amber-400/10 via-transparent to-cyan-400/10 blur-xl" />
              <div className="relative rounded-2xl glass p-6">
                <p className="font-mono text-[11px] text-muted-foreground">
                  brain/clients/outlet-pro.md · Ustalenia (anchory)
                </p>
                <div className="mt-4 space-y-3 text-sm">
                  <div className="rounded-xl border border-white/8 bg-background/50 p-4">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-mono">[2026-06]</span>
                      <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px]">
                        ustalenie
                      </span>
                    </div>
                    <p className="mt-2 leading-relaxed">
                      Zarząd zatwierdził ofertę na audyt procesu ofertowania —{" "}
                      <span className="text-primary">6 500 zł netto</span> za
                      całość.
                    </p>
                    <div className="mt-3">
                      <AnchorChip anchor="inbox/2026-06-10-mail-outlet-pro.txt" />
                    </div>
                  </div>
                  <p className="flex items-center gap-2 text-xs text-muted-foreground/70">
                    <FileCheck2 className="size-3.5" />
                    To żywe dane z demo — chip otwiera prawdziwy plik źródłowy.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
