import Link from "next/link";
import { ArrowRight, FilePlus2, FileEdit, TriangleAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { IngestResult } from "@/types/brain";

// "Moment wow": pokazuje, jak jeden surowy plik rozszedł się po wiki.
export function DiffPanel({ result }: { result: IngestResult }) {
  return (
    <Card className="border-primary/30 bg-primary/[0.03]">
      <CardHeader className="pb-2">
        <CardTitle className="flex flex-wrap items-center gap-2 text-sm font-medium">
          <span className="font-mono text-muted-foreground">
            {result.source.replace("inbox/", "")}
          </span>
          <ArrowRight className="size-4 text-muted-foreground" />
          <span>
            {result.changed_files.length}{" "}
            {result.changed_files.length === 1 ? "strona wiki" : "stron wiki"}{" "}
            zaktualizowanych
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {result.clients.map((c) => (
          <div key={c.client_id} className="rounded-lg border bg-background p-3">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              {c.created ? (
                <FilePlus2 className="size-4 text-green-600" />
              ) : (
                <FileEdit className="size-4 text-muted-foreground" />
              )}
              <Link
                href={`/app/clients/${c.client_id}`}
                className="font-medium hover:underline"
              >
                {c.client_name}
              </Link>
              {c.created && <Badge variant="secondary">nowy profil</Badge>}
              {c.claims_added.length > 0 && (
                <Badge variant="outline">
                  +{c.claims_added.length}{" "}
                  {c.claims_added.length === 1 ? "ustalenie" : "ustaleń"}
                </Badge>
              )}
              {c.claims_skipped > 0 && (
                <Badge variant="outline" className="text-muted-foreground">
                  {c.claims_skipped} duplikatów pominięto
                </Badge>
              )}
            </div>
            <ul className="space-y-1">
              {c.claims_added.map((claim, i) => (
                <li key={i} className="flex gap-2 text-muted-foreground">
                  <span className="text-green-600">+</span>
                  <span>{claim.text}</span>
                </li>
              ))}
              {c.frontmatter_changes.map((ch, i) => (
                <li key={`fm-${i}`} className="flex gap-2 text-muted-foreground">
                  <span className="text-sky-600">~</span>
                  <span>{ch}</span>
                </li>
              ))}
              {c.contradictions.map((con, i) => (
                <li key={`con-${i}`} className="flex gap-2">
                  <TriangleAlert className="mt-0.5 size-3.5 shrink-0 text-amber-600" />
                  <span className="text-amber-700 dark:text-amber-400">
                    Sprzeczność: „{con.existing_text}” vs „{con.new_text}” —
                    oznaczone, nie nadpisane
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
        {result.log_lines.length > 0 && (
          <p className="text-xs text-muted-foreground">
            Dziennik: {result.log_lines.join(" · ")}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
