import Link from "next/link";
import {
  Sun,
  CircleDashed,
  TriangleAlert,
  ArrowRight,
  Inbox,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnchorChip } from "@/components/anchor-chip";
import { SeverityBadge } from "@/components/severity-badge";
import { getStorage } from "@/lib/storage";
import { composeBrief } from "@/lib/brain/brief";

export const dynamic = "force-dynamic";

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("pl-PL", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(iso + "T12:00:00"));
}

export default async function BriefPage() {
  const brief = await composeBrief(getStorage());
  const empty =
    brief.today.length === 0 &&
    brief.lintFlags.length === 0 &&
    brief.risks.length === 0;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <Sun className="size-6 text-amber-500" />
          Brief — {formatDate(brief.date)}
        </h1>
        <p className="text-muted-foreground">
          Co masz dziś zrobić, co zgłasza Open Loops Detector i co może Cię
          ugryźć.
        </p>
      </div>

      {empty ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <Inbox className="size-8 text-muted-foreground" />
            <div>
              <p className="font-medium">Mózg jest jeszcze pusty.</p>
              <p className="text-sm text-muted-foreground">
                Wrzuć źródła w Joris Inbox i przetwórz je — brief zbuduje się
                sam.
              </p>
            </div>
            <Button render={<Link href="/app/inbox" />}>
              Przejdź do Joris Inbox <ArrowRight className="size-4" />
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Dziś</CardTitle>
            </CardHeader>
            <CardContent>
              {brief.today.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Brak zaplanowanych akcji — sprawdź otwarte pętle poniżej.
                </p>
              ) : (
                <ol className="space-y-3">
                  {brief.today.map((item, i) => (
                    <li key={item.client_id} className="flex gap-3 text-sm">
                      <span className="font-mono text-muted-foreground">
                        {i + 1}.
                      </span>
                      <div className="space-y-1">
                        <p>
                          <Link
                            href={`/app/clients/${item.client_id}`}
                            className="font-medium hover:underline"
                          >
                            {item.client_name}
                          </Link>{" "}
                          — {item.text}
                        </p>
                        {item.anchor && <AnchorChip anchor={item.anchor} />}
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <CircleDashed className="size-4" />
                Lint zgłasza
              </CardTitle>
            </CardHeader>
            <CardContent>
              {brief.lintGeneratedAt === null ? (
                <p className="text-sm text-muted-foreground">
                  Open Loops Detector jeszcze nie skanował mózgu —{" "}
                  <Link href="/app/loops" className="underline">
                    uruchom pierwszy skan
                  </Link>
                  .
                </p>
              ) : brief.lintFlags.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nic pilnego — wszystkie pętle domknięte. 🎉
                </p>
              ) : (
                <ul className="space-y-3">
                  {brief.lintFlags.map((l, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <SeverityBadge severity={l.severity} />
                      <div className="space-y-1">
                        <p>
                          <span className="font-medium">{l.client_name}</span>{" "}
                          — {l.description}
                        </p>
                        {l.anchor && <AnchorChip anchor={l.anchor} />}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {brief.risks.length > 0 && (
            <Card className="border-amber-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <TriangleAlert className="size-4 text-amber-600" />
                  Ryzyko
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {brief.risks.map((l, i) => (
                    <li key={i} className="space-y-1 text-sm">
                      <p>
                        <span className="font-medium">{l.client_name}</span> —{" "}
                        {l.description}
                      </p>
                      {l.suggestion && (
                        <p className="text-muted-foreground">
                          → {l.suggestion}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
