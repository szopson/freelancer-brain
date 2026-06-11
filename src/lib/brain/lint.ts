import { getAnthropic, LINT_MODEL } from "@/lib/ai/client";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { LintOutputSchema } from "@/lib/ai/schemas";
import { LINT_SYSTEM, lintUserMessage } from "@/lib/ai/prompts";
import type { Storage } from "@/lib/storage";
import type { LintReport } from "@/types/brain";
import { appendLog } from "./log";
import { brainSnapshot, readClients, todayWarsaw } from "./reader";

const SEVERITY_ORDER = { high: 0, medium: 1, low: 2 } as const;

export async function runLint(storage: Storage): Promise<LintReport> {
  const [snapshot, clients] = await Promise.all([
    brainSnapshot(storage),
    readClients(storage),
  ]);

  const message = await getAnthropic().messages.parse({
    model: LINT_MODEL,
    max_tokens: 4000,
    system: LINT_SYSTEM,
    messages: [
      {
        role: "user",
        content: lintUserMessage({
          brainSnapshot: snapshot,
          knownClients: clients.map((c) => ({
            id: c.frontmatter.id,
            name: c.frontmatter.name,
          })),
          today: todayWarsaw(),
        }),
      },
    ],
    output_config: { format: zodOutputFormat(LintOutputSchema) },
  });

  const output = message.parsed_output;
  if (!output) {
    throw new Error("Model nie zwrócił poprawnego wyniku skanu.");
  }

  const knownIds = new Set(clients.map((c) => c.frontmatter.id));
  const report: LintReport = {
    generated_at: new Date().toISOString(),
    loops: output.loops
      .map((l) => ({
        ...l,
        client_id: l.client_id && knownIds.has(l.client_id) ? l.client_id : null,
        anchor: l.anchor ?? undefined,
        suggestion: l.suggestion ?? undefined,
      }))
      .sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]),
  };

  await storage.writeFile(
    "brain/lint-report.json",
    JSON.stringify(report, null, 2),
  );
  await appendLog(storage, [
    `Lint / Open Loops: ${report.loops.length} otwartych pętli (${report.loops.filter((l) => l.severity === "high").length} pilnych)`,
  ]);

  return report;
}
