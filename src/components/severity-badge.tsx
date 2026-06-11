import { Badge } from "@/components/ui/badge";
import type { LoopSeverity } from "@/types/brain";

const config: Record<LoopSeverity, { label: string; className: string }> = {
  high: { label: "pilne", className: "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30" },
  medium: { label: "w tym tygodniu", className: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30" },
  low: { label: "warto domknąć", className: "bg-sky-500/15 text-sky-700 dark:text-sky-400 border-sky-500/30" },
};

export function SeverityBadge({ severity }: { severity: LoopSeverity }) {
  const c = config[severity];
  return (
    <Badge variant="outline" className={c.className}>
      {c.label}
    </Badge>
  );
}

export const categoryLabels: Record<string, string> = {
  "brak-odpowiedzi": "ktoś czeka na odpowiedź",
  "obietnica-niedowieziona": "obiecane, niedowiezione",
  "brak-terminu": "brak terminu",
  faktura: "faktura",
  niepotwierdzone: "ustalone, niepotwierdzone",
  sprzecznosc: "sprzeczność",
  cisza: "cisza w kontakcie",
  sierota: "bez planu",
};
