import type { Storage } from "@/lib/storage";
import { readClients, readNotes } from "./reader";

// index.md jest regenerowany deterministycznie z listingu plików —
// zero wywołań LLM, zawsze spójny z faktycznym stanem wiki.
export async function rebuildIndex(storage: Storage): Promise<void> {
  const [clients, notes, contextPaths] = await Promise.all([
    readClients(storage),
    readNotes(storage),
    storage.listFiles("brain/context"),
  ]);

  const lines: string[] = [
    "# Indeks mózgu",
    "",
    "Katalog stron wiki. Aktualizowany automatycznie po każdym ingest — nie edytuj ręcznie.",
    "",
    "## Kontekst",
    "",
  ];

  const contextDescriptions: Record<string, string> = {
    "brain/context/business.md":
      "profil biznesu Marka: kim jest, co sprzedaje, jak pracuje",
    "brain/context/rates.md": "stawki i zasady rozliczeń",
  };
  for (const p of contextPaths) {
    const rel = p.replace(/^brain\//, "");
    lines.push(`- \`${rel}\` — ${contextDescriptions[p] ?? "kontekst"}`);
  }

  lines.push("", "## Klienci", "");
  if (clients.length === 0) {
    lines.push("_(brak — pierwszy ingest utworzy profile klientów)_");
  } else {
    for (const c of clients) {
      const fm = c.frontmatter;
      const bits = [
        `status: ${fm.status}`,
        ...(fm.rate_agreed ? [`stawka: ${fm.rate_agreed}`] : []),
        `${c.claims.length} ustaleń`,
        ...(fm.next_action ? [`next: ${fm.next_action}`] : []),
      ];
      lines.push(`- \`clients/${fm.id}.md\` — ${fm.name} (${bits.join(" · ")})`);
    }
  }

  if (notes.length > 0) {
    lines.push("", "## Notatki luźne", "", `- \`notes.md\` — ${notes.length} wpisów`);
  }

  await storage.writeFile("brain/index.md", lines.join("\n") + "\n");
}
