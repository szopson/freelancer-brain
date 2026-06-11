import { promises as fs } from "node:fs";
import path from "node:path";
import type { Storage } from "./types";

const ROOT = path.join(process.cwd(), "data");

function resolveSafe(logicalPath: string): string {
  const abs = path.normalize(path.join(ROOT, logicalPath));
  if (!abs.startsWith(ROOT + path.sep)) {
    throw new Error(`Niedozwolona ścieżka: ${logicalPath}`);
  }
  return abs;
}

export class LocalStorage implements Storage {
  async readFile(logicalPath: string): Promise<string | null> {
    try {
      return await fs.readFile(resolveSafe(logicalPath), "utf-8");
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === "ENOENT") return null;
      throw err;
    }
  }

  async writeFile(logicalPath: string, content: string): Promise<void> {
    const abs = resolveSafe(logicalPath);
    await fs.mkdir(path.dirname(abs), { recursive: true });
    await fs.writeFile(abs, content, "utf-8");
  }

  async appendFile(logicalPath: string, content: string): Promise<void> {
    const abs = resolveSafe(logicalPath);
    await fs.mkdir(path.dirname(abs), { recursive: true });
    await fs.appendFile(abs, content, "utf-8");
  }

  async listFiles(prefix: string): Promise<string[]> {
    const dir = resolveSafe(prefix);
    let entries: string[];
    try {
      entries = await fs.readdir(dir, { recursive: true });
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === "ENOENT") return [];
      throw err;
    }
    const out: string[] = [];
    for (const entry of entries) {
      const abs = path.join(dir, entry);
      const stat = await fs.stat(abs);
      if (stat.isFile()) {
        out.push(path.posix.join(prefix, entry.split(path.sep).join("/")));
      }
    }
    return out.sort();
  }

  async deleteFile(logicalPath: string): Promise<void> {
    await fs.rm(resolveSafe(logicalPath), { force: true });
  }

  async deletePrefix(prefix: string): Promise<void> {
    await fs.rm(resolveSafe(prefix), { recursive: true, force: true });
  }
}
