import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, TriangleAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnchorChip } from "@/components/anchor-chip";
import { SeverityBadge, categoryLabels } from "@/components/severity-badge";
import { StatusBadges } from "@/components/clients/status-badges";
import { getStorage } from "@/lib/storage";
import { parseClientFile } from "@/lib/brain/clientFile";
import { readLintReport } from "@/lib/brain/reader";

export const dynamic = "force-dynamic";

const typeLabels: Record<string, string> = {
  ustalenie: "ustalenie",
  deadline: "deadline",
  faktura: "faktura",
  kontakt: "kontakt",
};

export default async function ClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!/^[a-z0-9-]+$/.test(id)) notFound();

  const storage = getStorage();
  const [raw, report] = await Promise.all([
    storage.readFile(`brain/clients/${id}.md`),
    readLintReport(storage),
  ]);
  if (raw === null) notFound();

  const profile = parseClientFile(raw, id);
  const fm = profile.frontmatter;
  const loops = (report?.loops ?? []).filter((l) => l.client_id === id);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href="/app/clients"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Pamięć projektów
      </Link>

      <div className="space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight">{fm.name}</h1>
        <StatusBadges fm={fm} />
        {fm.next_action && (
          <p className="text-sm">
            <span className="font-medium">Najbliższa akcja:</span>{" "}
            {fm.next_action}
          </p>
        )}
        {fm.last_contact && (
          <p className="text-xs text-muted-foreground">
            Ostatni kontakt: {fm.last_contact}
          </p>
        )}
      </div>

      {profile.contradictions.length > 0 && (
        <Card className="border-amber-500/40">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <TriangleAlert className="size-4 text-amber-600" />
              Sprzeczności — do rozstrzygnięcia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {profile.contradictions.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {loops.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Otwarte pętle</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {loops.map((l, i) => (
                <li key={i} className="flex flex-wrap items-start gap-2 text-sm">
                  <SeverityBadge severity={l.severity} />
                  <Badge variant="secondary" className="font-normal">
                    {categoryLabels[l.category] ?? l.category}
                  </Badge>
                  <span className="w-full">{l.description}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Ustalenia (anchory)</CardTitle>
        </CardHeader>
        <CardContent>
          {profile.claims.length === 0 ? (
            <p className="text-sm text-muted-foreground">Brak ustaleń.</p>
          ) : (
            <ul className="space-y-3">
              {profile.claims.map((c, i) => (
                <li key={i} className="space-y-1 text-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs text-muted-foreground">
                      [{c.date}]
                    </span>
                    <Badge variant="outline" className="font-normal">
                      {typeLabels[c.type] ?? c.type}
                    </Badge>
                  </div>
                  <p>{c.text}</p>
                  <AnchorChip anchor={c.anchor} />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Historia</CardTitle>
        </CardHeader>
        <CardContent>
          {profile.history.length === 0 ? (
            <p className="text-sm text-muted-foreground">Brak historii.</p>
          ) : (
            <ul className="space-y-2 text-sm text-muted-foreground">
              {profile.history.map((h, i) => (
                <li key={i}>{h}</li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
