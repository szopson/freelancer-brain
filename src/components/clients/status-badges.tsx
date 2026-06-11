import { Badge } from "@/components/ui/badge";
import type { ClientFrontmatter } from "@/types/brain";

const statusConfig: Record<string, { label: string; className: string }> = {
  lead: { label: "lead", className: "bg-sky-500/15 text-sky-700 dark:text-sky-400" },
  active: { label: "aktywny", className: "bg-green-500/15 text-green-700 dark:text-green-400" },
  paused: { label: "wstrzymany", className: "bg-amber-500/15 text-amber-700 dark:text-amber-400" },
  closed: { label: "zamknięty", className: "bg-muted text-muted-foreground" },
};

export function StatusBadges({ fm }: { fm: ClientFrontmatter }) {
  const status = statusConfig[fm.status] ?? statusConfig.lead;
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Badge variant="secondary" className={status.className}>
        {status.label}
      </Badge>
      {fm.lifecycle === "contradicted" && (
        <Badge variant="outline" className="border-amber-500/40 text-amber-700 dark:text-amber-400">
          ⚠️ sprzeczność
        </Badge>
      )}
      {fm.lifecycle === "stale" && (
        <Badge variant="outline" className="text-muted-foreground">
          nieaktualny
        </Badge>
      )}
      {fm.rate_agreed && <Badge variant="outline">{fm.rate_agreed}</Badge>}
    </div>
  );
}
