import matter from "gray-matter";
import type { Claim, ClientFrontmatter, ClientProfile } from "@/types/brain";

// Format pliku klienta (brain/clients/<id>.md):
// frontmatter + "## Ustalenia (anchory)" + opcjonalnie "## ⚠️ Sprzeczności" + "## Historia"
// Linia ustalenia: - [2026-06] Treść faktu «inbox/plik.txt»

const CLAIM_RE = /^- \[(\d{4}-\d{2})\]\s+(.*?)\s+«(.+?)»\s*(?:\(typ:\s*(\w+)\))?$/;

// gray-matter parsuje YAML-owe daty do obiektów Date — wracamy do YYYY-MM-DD.
function asDateString(v: unknown): string | undefined {
  if (!v) return undefined;
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  return String(v);
}

export function parseClientFile(raw: string, fallbackId: string): ClientProfile {
  const { data, content } = matter(raw);
  const fm: ClientFrontmatter = {
    id: String(data.id ?? fallbackId),
    name: String(data.name ?? fallbackId),
    status: (data.status as ClientFrontmatter["status"]) ?? "lead",
    rate_agreed: data.rate_agreed ? String(data.rate_agreed) : undefined,
    next_action: data.next_action ? String(data.next_action) : undefined,
    lifecycle: (data.lifecycle as ClientFrontmatter["lifecycle"]) ?? "draft",
    last_contact: asDateString(data.last_contact),
  };

  const claims: Claim[] = [];
  const history: string[] = [];
  const contradictions: string[] = [];
  let section = "";
  for (const line of content.split("\n")) {
    if (line.startsWith("## ")) {
      section = line.slice(3).trim().toLowerCase();
      continue;
    }
    const trimmed = line.trim();
    if (!trimmed.startsWith("- ")) continue;
    if (section.startsWith("ustalenia")) {
      const m = trimmed.match(CLAIM_RE);
      if (m) {
        claims.push({
          date: m[1],
          text: m[2],
          anchor: m[3],
          type: (m[4] as Claim["type"]) ?? "ustalenie",
        });
      }
    } else if (section.startsWith("historia")) {
      history.push(trimmed.slice(2));
    } else if (section.includes("sprzeczno")) {
      contradictions.push(trimmed.slice(2));
    }
  }

  return { frontmatter: fm, claims, history, contradictions, raw };
}

export function serializeClientFile(profile: ClientProfile): string {
  const fm = profile.frontmatter;
  const fmLines = [
    "---",
    `id: ${fm.id}`,
    `name: ${fm.name}`,
    `status: ${fm.status}`,
    ...(fm.rate_agreed ? [`rate_agreed: ${fm.rate_agreed}`] : []),
    ...(fm.next_action ? [`next_action: ${fm.next_action}`] : []),
    `lifecycle: ${fm.lifecycle}`,
    ...(fm.last_contact ? [`last_contact: ${fm.last_contact}`] : []),
    "---",
  ];

  const claimLines = profile.claims.map(
    (c) => `- [${c.date}] ${c.text} «${c.anchor}» (typ: ${c.type})`,
  );

  const parts = [
    fmLines.join("\n"),
    "",
    `# ${fm.name}`,
    "",
    "## Ustalenia (anchory)",
    ...(claimLines.length > 0 ? claimLines : ["- _(brak ustaleń)_"]),
  ];

  if (profile.contradictions.length > 0) {
    parts.push("", "## ⚠️ Sprzeczności");
    parts.push(...profile.contradictions.map((c) => `- ${c}`));
  }

  parts.push("", "## Historia");
  parts.push(
    ...(profile.history.length > 0
      ? profile.history.map((h) => `- ${h}`)
      : ["- _(brak historii)_"]),
  );

  return parts.join("\n") + "\n";
}

export function emptyClientProfile(id: string, name: string): ClientProfile {
  return {
    frontmatter: { id, name, status: "lead", lifecycle: "draft" },
    claims: [],
    history: [],
    contradictions: [],
    raw: "",
  };
}
