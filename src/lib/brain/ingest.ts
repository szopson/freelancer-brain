import { getAnthropic, INGEST_MODEL } from "@/lib/ai/client";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { IngestOutputSchema } from "@/lib/ai/schemas";
import { INGEST_SYSTEM, ingestUserMessage } from "@/lib/ai/prompts";
import type { Storage } from "@/lib/storage";
import type { Claim, IngestClientResult, IngestResult } from "@/types/brain";
import { dedupKey, slugify } from "./anchors";
import {
  emptyClientProfile,
  parseClientFile,
  serializeClientFile,
} from "./clientFile";
import { rebuildIndex } from "./indexBuilder";
import { appendLog } from "./log";
import {
  brainSnapshot,
  readClients,
  readNotes,
  readProcessed,
  todayWarsaw,
} from "./reader";

const MAX_SOURCE_CHARS = 10_000;

export async function ingestFile(
  storage: Storage,
  inboxPath: string,
): Promise<IngestResult> {
  if (!inboxPath.startsWith("inbox/")) {
    throw new Error(`Ingest przyjmuje tylko pliki z inbox/: ${inboxPath}`);
  }
  const source = await storage.readFile(inboxPath);
  if (source === null) {
    throw new Error(`Nie znaleziono pliku: ${inboxPath}`);
  }

  const [snapshot, existingClients] = await Promise.all([
    brainSnapshot(storage),
    readClients(storage),
  ]);
  const knownClients = existingClients.map((c) => ({
    id: c.frontmatter.id,
    name: c.frontmatter.name,
  }));

  const message = await getAnthropic().messages.parse({
    model: INGEST_MODEL,
    max_tokens: 4000,
    system: INGEST_SYSTEM,
    messages: [
      {
        role: "user",
        content: ingestUserMessage({
          filename: inboxPath,
          source: source.slice(0, MAX_SOURCE_CHARS),
          brainSnapshot: snapshot,
          knownClients,
          today: todayWarsaw(),
        }),
      },
    ],
    output_config: { format: zodOutputFormat(IngestOutputSchema) },
  });

  const output = message.parsed_output;
  if (!output) {
    throw new Error("Model nie zwrócił poprawnego wyniku ekstrakcji.");
  }

  const changedFiles = new Set<string>();
  const clientResults: IngestClientResult[] = [];

  for (const extracted of output.clients) {
    // Id z modelu zawsze przechodzi przez slugify; dryf nazw łapiemy
    // fuzzy-matchem po nazwie zanim utworzymy nowy profil.
    let id = slugify(extracted.client_id);
    const byName = existingClients.find(
      (c) =>
        c.frontmatter.id === id ||
        slugify(c.frontmatter.name) === slugify(extracted.client_name),
    );
    if (byName) id = byName.frontmatter.id;

    const path = `brain/clients/${id}.md`;
    const raw = await storage.readFile(path);
    const profile = raw
      ? parseClientFile(raw, id)
      : emptyClientProfile(id, extracted.client_name);
    const created = raw === null;

    // anchorGuard: kotwica stemplowana przez kod z faktycznej ścieżki źródła.
    const existingKeys = new Set(
      profile.claims.map((c) => dedupKey(c.anchor, c.text)),
    );
    const added: Claim[] = [];
    let skipped = 0;
    for (const c of extracted.claims) {
      if (!c.text.trim()) continue;
      const claim: Claim = { ...c, anchor: inboxPath };
      const key = dedupKey(claim.anchor, claim.text);
      if (existingKeys.has(key)) {
        skipped++;
        continue;
      }
      existingKeys.add(key);
      profile.claims.push(claim);
      added.push(claim);
    }

    // Sprzeczność = sygnał, nie błąd: oznaczamy, nie nadpisujemy po cichu.
    for (const con of extracted.contradictions) {
      profile.contradictions.push(
        `„${con.existing_text}" vs „${con.new_text}" «${inboxPath}»`,
      );
      profile.frontmatter.lifecycle = "contradicted";
    }

    const fmChanges: string[] = [];
    const fu = extracted.frontmatter_updates;
    if (fu.status && fu.status !== profile.frontmatter.status) {
      fmChanges.push(`status: ${profile.frontmatter.status} → ${fu.status}`);
      profile.frontmatter.status = fu.status;
    }
    if (fu.rate_agreed && fu.rate_agreed !== profile.frontmatter.rate_agreed) {
      fmChanges.push(`stawka → ${fu.rate_agreed}`);
      profile.frontmatter.rate_agreed = fu.rate_agreed;
    }
    if (fu.next_action) {
      fmChanges.push(`next_action → ${fu.next_action}`);
      profile.frontmatter.next_action = fu.next_action;
    }
    if (
      fu.last_contact &&
      (!profile.frontmatter.last_contact ||
        fu.last_contact > profile.frontmatter.last_contact)
    ) {
      profile.frontmatter.last_contact = fu.last_contact;
    }
    if (
      profile.frontmatter.lifecycle === "draft" &&
      profile.claims.length > 0
    ) {
      profile.frontmatter.lifecycle = "active";
    }

    if (extracted.history_line) {
      profile.history.push(
        `${todayWarsaw()} — ${extracted.history_line} «${inboxPath}»`,
      );
    }

    const changed =
      created ||
      added.length > 0 ||
      fmChanges.length > 0 ||
      extracted.contradictions.length > 0 ||
      extracted.history_line !== null;
    if (changed) {
      await storage.writeFile(path, serializeClientFile(profile));
      changedFiles.add(path);
    }

    clientResults.push({
      client_id: id,
      client_name: extracted.client_name,
      created,
      claims_added: added,
      claims_skipped: skipped,
      contradictions: extracted.contradictions,
      frontmatter_changes: fmChanges,
    });
  }

  // Luźne notatki (bez klienta) — z kotwicą i dedupem jak wszystko inne.
  if (output.notes.length > 0) {
    const existing = await readNotes(storage);
    const existingKeys = new Set(existing.map((n) => normalizeNoteKey(n)));
    const fresh = output.notes
      .map((n) => `${n} «${inboxPath}»`)
      .filter((n) => !existingKeys.has(normalizeNoteKey(n)));
    if (fresh.length > 0) {
      const all = [...existing, ...fresh].map((n) => `- ${n}`).join("\n");
      await storage.writeFile(
        "brain/notes.md",
        `# Notatki luźne\n\n${all}\n`,
      );
      changedFiles.add("brain/notes.md");
    }
  }

  await appendLog(storage, [
    `Ingest «${inboxPath}»`,
    ...output.log_lines.map((l) => `↳ ${l}`),
  ]);
  changedFiles.add("brain/log.md");

  await rebuildIndex(storage);
  changedFiles.add("brain/index.md");

  const processed = await readProcessed(storage);
  if (!processed.includes(inboxPath)) {
    await storage.writeFile(
      "brain/meta/processed.json",
      JSON.stringify([...processed, inboxPath], null, 2),
    );
  }

  return {
    source: inboxPath,
    clients: clientResults,
    log_lines: output.log_lines,
    changed_files: [...changedFiles].sort(),
  };
}

function normalizeNoteKey(note: string): string {
  return note.toLowerCase().replace(/\s+/g, " ").trim();
}
