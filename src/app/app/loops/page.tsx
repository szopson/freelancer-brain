import Link from "next/link";
import { CircleDashed, Lightbulb } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { AnchorChip } from "@/components/anchor-chip";
import { SeverityBadge, categoryLabels } from "@/components/severity-badge";
import { ScanButton } from "@/components/loops/scan-button";
import { getStorage } from "@/lib/storage";
import { readLintReport } from "@/lib/brain/reader";

export const dynamic = "force-dynamic";

export default async function LoopsPage() {
  const report = await readLintReport(getStorage());

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <CircleDashed className="size-6" />
            Otwarte pętle
          </h1>
          <p className="text-muted-foreground">
            Czego nie dowiozłeś: komu nie odpisałeś, co obiecałeś, co nie ma
            terminu, gdzie faktura czeka.
          </p>
        </div>
        <ScanButton
          label={report ? "Skanuj ponownie" : "Uruchom pierwszy skan"}
        />
      </div>

      {report === null ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            Brak raportu. Uruchom skan — Joris przeczyta cały mózg i wypisze,
            co wymaga uwagi. W pełnej wersji robi to sam, co noc.
          </CardContent>
        </Card>
      ) : (
        <>
          <p className="text-xs text-muted-foreground">
            Ostatni skan:{" "}
            {new Intl.DateTimeFormat("pl-PL", {
              dateStyle: "medium",
              timeStyle: "short",
              timeZone: "Europe/Warsaw",
            }).format(new Date(report.generated_at))}{" "}
            · {report.loops.length} pętli
          </p>
          {report.loops.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-sm text-muted-foreground">
                Wszystkie pętle domknięte. 🎉
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {report.loops.map((l, i) => (
                <Card key={i}>
                  <CardContent className="space-y-2 py-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <SeverityBadge severity={l.severity} />
                      <Badge variant="secondary" className="font-normal">
                        {categoryLabels[l.category] ?? l.category}
                      </Badge>
                      {l.client_id ? (
                        <Link
                          href={`/app/clients/${l.client_id}`}
                          className="text-sm font-medium hover:underline"
                        >
                          {l.client_name}
                        </Link>
                      ) : (
                        <span className="text-sm font-medium">
                          {l.client_name}
                        </span>
                      )}
                      {l.anchor && (
                        <span className="ml-auto">
                          <AnchorChip anchor={l.anchor} />
                        </span>
                      )}
                    </div>
                    <p className="text-sm">{l.description}</p>
                    {l.suggestion && (
                      <p className="flex items-start gap-1.5 text-sm text-muted-foreground">
                        <Lightbulb className="mt-0.5 size-3.5 shrink-0" />
                        {l.suggestion}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
