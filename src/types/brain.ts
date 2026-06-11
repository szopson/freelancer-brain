export type ClientStatus = "lead" | "active" | "paused" | "closed";
export type Lifecycle = "draft" | "active" | "stale" | "contradicted";

export interface ClientFrontmatter {
  id: string;
  name: string;
  status: ClientStatus;
  rate_agreed?: string;
  next_action?: string;
  lifecycle: Lifecycle;
  last_contact?: string; // YYYY-MM-DD
}

export interface Claim {
  date: string; // YYYY-MM (per spec format [2026-06])
  text: string;
  type: "ustalenie" | "deadline" | "faktura" | "kontakt";
  anchor: string; // "inbox/2026-06-10-mail-outlet-pro.txt"
}

export interface ClientProfile {
  frontmatter: ClientFrontmatter;
  claims: Claim[];
  history: string[]; // raw lines from "## Historia"
  contradictions: string[]; // raw ⚠️ lines
  raw: string;
}

export type LoopCategory =
  | "brak-odpowiedzi"
  | "obietnica-niedowieziona"
  | "brak-terminu"
  | "faktura"
  | "niepotwierdzone"
  | "sprzecznosc"
  | "cisza"
  | "sierota";

export type LoopSeverity = "high" | "medium" | "low";

export interface LintLoop {
  client_id: string | null;
  client_name: string;
  category: LoopCategory;
  severity: LoopSeverity;
  description: string;
  anchor?: string;
  suggestion?: string;
}

export interface LintReport {
  generated_at: string; // ISO
  loops: LintLoop[];
}

export interface IngestClientResult {
  client_id: string;
  client_name: string;
  created: boolean;
  claims_added: Claim[];
  claims_skipped: number; // dedup hits
  contradictions: { existing_text: string; new_text: string }[];
  frontmatter_changes: string[]; // human-readable, e.g. "next_action → umówić start"
}

export interface IngestResult {
  source: string; // inbox path
  clients: IngestClientResult[];
  log_lines: string[];
  changed_files: string[];
}

export interface InboxFileInfo {
  path: string; // "inbox/2026-06-10-mail.txt"
  name: string;
  size: number;
  processed: boolean;
}
