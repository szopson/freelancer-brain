import { promises as fs } from "node:fs";
import path from "node:path";
import type { Storage } from "@/lib/storage";

// seed/ jest commitowany do repo i dołączany do bundla serverless
// przez outputFileTracingIncludes w next.config.ts.
const SEED_ROOT = path.join(process.cwd(), "seed");

async function readSeedFiles(): Promise<{ path: string; content: string }[]> {
  const entries = await fs.readdir(SEED_ROOT, { recursive: true });
  const files: { path: string; content: string }[] = [];
  for (const entry of entries) {
    const abs = path.join(SEED_ROOT, entry);
    const stat = await fs.stat(abs);
    if (!stat.isFile()) continue;
    files.push({
      path: entry.split(path.sep).join("/"),
      content: await fs.readFile(abs, "utf-8"),
    });
  }
  return files;
}

export async function resetToSeed(storage: Storage): Promise<number> {
  const files = await readSeedFiles();
  await storage.deletePrefix("inbox");
  await storage.deletePrefix("brain");
  await Promise.all(files.map((f) => storage.writeFile(f.path, f.content)));
  return files.length;
}
