import type { Storage } from "@/lib/storage";
import { readClients, readLintReport, readProcessed } from "./reader";

export interface BrainStats {
  claimsAnchored: number;
  openLoops: number;
  processedSources: number;
  wikiPages: number;
}

// Żywe liczby do landingu — czytane z PRAWDZIWEGO stanu demo.
export async function composeStats(storage: Storage): Promise<BrainStats> {
  const [clients, report, processed, brainFiles] = await Promise.all([
    readClients(storage),
    readLintReport(storage),
    readProcessed(storage),
    storage.listFiles("brain"),
  ]);

  return {
    claimsAnchored: clients.reduce(
      (sum, c) => sum + c.claims.filter((cl) => cl.anchor).length,
      0,
    ),
    openLoops: report?.loops.length ?? 0,
    processedSources: processed.length,
    wikiPages: brainFiles.filter((f) => f.endsWith(".md")).length,
  };
}
