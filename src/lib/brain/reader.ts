import type { Storage } from "@/lib/storage";
import type { ClientProfile, InboxFileInfo, LintReport } from "@/types/brain";
import { parseClientFile } from "./clientFile";

export async function readClients(storage: Storage): Promise<ClientProfile[]> {
  const paths = (await storage.listFiles("brain/clients")).filter((p) =>
    p.endsWith(".md"),
  );
  const files = await Promise.all(
    paths.map(async (p) => ({ path: p, raw: await storage.readFile(p) })),
  );
  return files
    .filter((f): f is { path: string; raw: string } => f.raw !== null)
    .map((f) => {
      const id = f.path.split("/").pop()!.replace(/\.md$/, "");
      return parseClientFile(f.raw, id);
    })
    .sort((a, b) => a.frontmatter.name.localeCompare(b.frontmatter.name, "pl"));
}

export async function readContext(
  storage: Storage,
): Promise<{ path: string; content: string }[]> {
  const paths = await storage.listFiles("brain/context");
  const out: { path: string; content: string }[] = [];
  for (const p of paths) {
    const content = await storage.readFile(p);
    if (content) out.push({ path: p, content });
  }
  return out;
}

// Pełny snapshot mózgu jako jeden string — czysty kontekst, bez RAG (spec §6).
export async function brainSnapshot(storage: Storage): Promise<string> {
  const [index, log, context, clients, notes] = await Promise.all([
    storage.readFile("brain/index.md"),
    storage.readFile("brain/log.md"),
    readContext(storage),
    readClients(storage),
    readNotes(storage),
  ]);

  const sections: string[] = [];
  if (index) sections.push(`=== brain/index.md ===\n${index}`);
  for (const c of context) sections.push(`=== ${c.path} ===\n${c.content}`);
  for (const c of clients) {
    sections.push(`=== brain/clients/${c.frontmatter.id}.md ===\n${c.raw}`);
  }
  if (notes.length > 0) {
    sections.push(`=== brain/notes.md ===\n${notes.map((n) => `- ${n}`).join("\n")}`);
  }
  if (log) {
    // Dziennik bywa długi — ostatnie 40 linii wystarcza jako kontekst.
    const lines = log.trim().split("\n");
    sections.push(`=== brain/log.md (ostatnie wpisy) ===\n${lines.slice(-40).join("\n")}`);
  }
  return sections.join("\n\n");
}

export async function readNotes(storage: Storage): Promise<string[]> {
  const raw = await storage.readFile("brain/notes.md");
  if (!raw) return [];
  return raw
    .split("\n")
    .filter((l) => l.trim().startsWith("- "))
    .map((l) => l.trim().slice(2));
}

export async function readProcessed(storage: Storage): Promise<string[]> {
  const raw = await storage.readFile("brain/meta/processed.json");
  if (!raw) return [];
  try {
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

export async function readInbox(storage: Storage): Promise<InboxFileInfo[]> {
  const [paths, processed] = await Promise.all([
    storage.listFiles("inbox"),
    readProcessed(storage),
  ]);
  return paths
    .map((p) => ({
      path: p,
      name: p.split("/").pop()!,
      size: 0,
      processed: processed.includes(p),
    }))
    .sort((a, b) => b.name.localeCompare(a.name));
}

export async function readLintReport(
  storage: Storage,
): Promise<LintReport | null> {
  const raw = await storage.readFile("brain/lint-report.json");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as LintReport;
  } catch {
    return null;
  }
}

export function todayWarsaw(): string {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Warsaw",
  }).format(new Date());
}
