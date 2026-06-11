import type { Storage } from "@/lib/storage";
import type { ClientProfile, LintLoop, LintReport } from "@/types/brain";
import { readClients, readLintReport, todayWarsaw } from "./reader";

// Daily Brief składa się deterministycznie z frontmatter klientów + raportu
// lint — zero wywołań LLM przy renderze (spec: output cadence).

export interface BriefItem {
  client_id: string;
  client_name: string;
  text: string;
  anchor?: string;
}

export interface DailyBrief {
  date: string;
  today: BriefItem[]; // next_action per aktywny klient
  lintFlags: LintLoop[]; // high/medium z raportu
  risks: LintLoop[]; // cisza, sprzeczności
  lintGeneratedAt: string | null;
  clientCount: number;
}

export async function composeBrief(storage: Storage): Promise<DailyBrief> {
  const [clients, report] = await Promise.all([
    readClients(storage),
    readLintReport(storage),
  ]);

  const today = clients
    .filter(
      (c) =>
        c.frontmatter.next_action &&
        ["active", "lead"].includes(c.frontmatter.status),
    )
    .map((c) => ({
      client_id: c.frontmatter.id,
      client_name: c.frontmatter.name,
      text: c.frontmatter.next_action!,
      anchor: latestAnchor(c),
    }));

  const loops = report?.loops ?? [];
  const riskCategories = new Set(["cisza", "sprzecznosc", "sierota"]);
  const risks = loops.filter((l) => riskCategories.has(l.category));
  const lintFlags = loops.filter(
    (l) => !riskCategories.has(l.category) && l.severity !== "low",
  );

  return {
    date: todayWarsaw(),
    today,
    lintFlags,
    risks,
    lintGeneratedAt: report?.generated_at ?? null,
    clientCount: clients.length,
  };
}

function latestAnchor(c: ClientProfile): string | undefined {
  return c.claims.at(-1)?.anchor;
}
