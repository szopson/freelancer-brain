import { put, del, list } from "@vercel/blob";
import type { Storage } from "./types";

// Wspólny prefix wszystkich plików demo w Blob store.
const PREFIX = "fb/";

function key(logicalPath: string): string {
  if (logicalPath.includes("..")) {
    throw new Error(`Niedozwolona ścieżka: ${logicalPath}`);
  }
  return PREFIX + logicalPath;
}

async function findUrl(logicalPath: string): Promise<string | null> {
  const { blobs } = await list({ prefix: key(logicalPath), limit: 1 });
  const exact = blobs.find((b) => b.pathname === key(logicalPath));
  return exact?.url ?? null;
}

export class BlobStorage implements Storage {
  async readFile(logicalPath: string): Promise<string | null> {
    const url = await findUrl(logicalPath);
    if (!url) return null;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    return res.text();
  }

  async writeFile(logicalPath: string, content: string): Promise<void> {
    await put(key(logicalPath), content, {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "text/plain; charset=utf-8",
    });
  }

  // Blob nie ma prawdziwego append — read+concat+write (wystarczające dla demo).
  async appendFile(logicalPath: string, content: string): Promise<void> {
    const existing = (await this.readFile(logicalPath)) ?? "";
    await this.writeFile(logicalPath, existing + content);
  }

  async listFiles(prefix: string): Promise<string[]> {
    const out: string[] = [];
    let cursor: string | undefined;
    do {
      const res = await list({ prefix: key(prefix), cursor, limit: 1000 });
      out.push(...res.blobs.map((b) => b.pathname.slice(PREFIX.length)));
      cursor = res.hasMore ? res.cursor : undefined;
    } while (cursor);
    return out.sort();
  }

  async deleteFile(logicalPath: string): Promise<void> {
    const url = await findUrl(logicalPath);
    if (url) await del(url);
  }

  async deletePrefix(prefix: string): Promise<void> {
    let cursor: string | undefined;
    do {
      const res = await list({ prefix: key(prefix), cursor, limit: 1000 });
      if (res.blobs.length > 0) await del(res.blobs.map((b) => b.url));
      cursor = res.hasMore ? res.cursor : undefined;
    } while (cursor);
  }
}
