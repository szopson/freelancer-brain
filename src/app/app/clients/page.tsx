import Link from "next/link";
import { FolderOpen, ArrowRight, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadges } from "@/components/clients/status-badges";
import { getStorage } from "@/lib/storage";
import { readClients } from "@/lib/brain/reader";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const clients = await readClients(getStorage());

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <FolderOpen className="size-6" />
          Pamięć projektów
        </h1>
        <p className="text-muted-foreground">
          Klient, status, ustalenia, deadliny, otwarte sprawy — wszystko z
          kotwicą do źródła.
        </p>
      </div>

      {clients.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <p className="text-sm text-muted-foreground">
              Brak profili klientów. Przetwórz źródła w Joris Inbox — profile
              powstaną same.
            </p>
            <Button render={<Link href="/app/inbox" />}>
              Przejdź do Joris Inbox <ArrowRight className="size-4" />
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {clients.map((c) => (
            <Link key={c.frontmatter.id} href={`/app/clients/${c.frontmatter.id}`}>
              <Card className="h-full transition-colors hover:bg-muted/40">
                <CardContent className="space-y-3 py-4">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="font-medium">{c.frontmatter.name}</h2>
                    <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                  </div>
                  <StatusBadges fm={c.frontmatter} />
                  {c.frontmatter.next_action && (
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Next:</span>{" "}
                      {c.frontmatter.next_action}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {c.claims.length} ustaleń
                    {c.frontmatter.last_contact &&
                      ` · ostatni kontakt ${c.frontmatter.last_contact}`}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
