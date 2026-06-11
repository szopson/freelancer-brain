import Link from "next/link";
import {
  CalendarCheck,
  ThumbsUp,
  PauseCircle,
  Banknote,
  TriangleAlert,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnchorChip } from "@/components/anchor-chip";
import { getStorage } from "@/lib/storage";
import { readClients, readLintReport } from "@/lib/brain/reader";
import type { LintLoop } from "@/types/brain";

export const dynamic = "force-dynamic";

export default async function ReviewPage() {
  const storage = getStorage();
  const [clients, report] = await Promise.all([
    readClients(storage),
    readLintReport(storage),
  ]);
  const loops = report?.loops ?? [];

  const highIds = new Set(
    loops.filter((l) => l.severity === "high").map((l) => l.client_id),
  );
  const going = clients.filter(
    (c) => c.frontmatter.status === "active" && !highIds.has(c.frontmatter.id),
  );
  const stuck = loops.filter((l) =>
    ["brak-terminu", "obietnica-niedowieziona", "niepotwierdzone", "sierota"].includes(
      l.category,
    ),
  );
  const money = loops.filter((l) => l.category === "faktura");
  const risk = loops.filter((l) =>
    ["cisza", "sprzecznosc", "brak-odpowiedzi"].includes(l.category),
  );

  const hasData = clients.length > 0;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <CalendarCheck className="size-6" />
          Przegląd tygodnia
        </h1>
        <p className="text-muted-foreground">
          Co idzie dobrze, co stoi, gdzie kasa do zebrania, gdzie ryzyko.
        </p>
      </div>

      {!hasData ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            Mózg jest pusty — przetwórz źródła w{" "}
            <Link href="/app/inbox" className="underline">
              Joris Inbox
            </Link>
            , a przegląd zbuduje się sam.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <ThumbsUp className="size-4 text-green-400" /> Co idzie dobrze
              </CardTitle>
            </CardHeader>
            <CardContent>
              {going.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Żaden aktywny projekt nie jest wolny od pilnych pętli.
                </p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {going.map((c) => (
                    <li key={c.frontmatter.id}>
                      <Link
                        href={`/app/clients/${c.frontmatter.id}`}
                        className="font-medium hover:underline"
                      >
                        {c.frontmatter.name}
                      </Link>{" "}
                      <span className="text-muted-foreground">
                        — {c.claims.length} ustaleń, bez pilnych pętli
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <PauseCircle className="size-4 text-amber-400" /> Co stoi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <LoopList loops={stuck} empty="Nic nie utknęło." />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Banknote className="size-4 text-green-400" /> Kasa do zebrania
              </CardTitle>
            </CardHeader>
            <CardContent>
              <LoopList loops={money} empty="Brak zaległych faktur. 🎉" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <TriangleAlert className="size-4 text-red-400" /> Ryzyko
              </CardTitle>
            </CardHeader>
            <CardContent>
              <LoopList loops={risk} empty="Brak wykrytych ryzyk relacji." />
            </CardContent>
          </Card>
        </div>
      )}

      {hasData && report === null && (
        <p className="text-sm text-muted-foreground">
          Sekcje pętli wypełnią się po pierwszym skanie w{" "}
          <Link href="/app/loops" className="underline">
            Otwartych pętlach
          </Link>
          .
        </p>
      )}
    </div>
  );
}

function LoopList({ loops, empty }: { loops: LintLoop[]; empty: string }) {
  if (loops.length === 0) {
    return <p className="text-sm text-muted-foreground">{empty}</p>;
  }
  return (
    <ul className="space-y-3">
      {loops.map((l, i) => (
        <li key={i} className="space-y-1 text-sm">
          <p>
            {l.client_id ? (
              <Link
                href={`/app/clients/${l.client_id}`}
                className="font-medium hover:underline"
              >
                {l.client_name}
              </Link>
            ) : (
              <span className="font-medium">{l.client_name}</span>
            )}{" "}
            — {l.description}
          </p>
          {l.anchor && <AnchorChip anchor={l.anchor} />}
        </li>
      ))}
    </ul>
  );
}
