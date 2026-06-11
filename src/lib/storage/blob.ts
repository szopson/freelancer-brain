import { del, list, put } from "@vercel/blob";
import type { Storage } from "./types";

// Wspólny prefix wszystkich plików demo w Blob store.
const PREFIX = "fb/";

function key(logicalPath: string): string {
  if (logicalPath.includes("..")) {
    throw new Error(`Niedozwolona ścieżka: ${logicalPath}`);
  }
  return PREFIX + logicalPath;
}

// Z addRandomSuffix:false adres blobu jest deterministyczny — budujemy go
// z id store'a zaszytego w tokenie, zamiast polegać na list(), który jest
// eventually consistent (świeży zapis potrafi nie być widoczny sekundami).
function storeBaseUrl(): string {
  const token = process.env.BLOB_READ_WRITE_TOKEN ?? "";
  const m = token.match(/^vercel_blob_rw_([A-Za-z0-9]+)_/);
  if (!m) throw new Error("Brak poprawnego BLOB_READ_WRITE_TOKEN.");
  return `https://${m[1].toLowerCase()}.public.blob.vercel-storage.com`;
}

function blobUrl(logicalPath: string): string {
  return `${storeBaseUrl()}/${key(logicalPath)}`;
}

export class BlobStorage implements Storage {
  async readFile(logicalPath: string): Promise<string | null> {
    // Parametr ts omija cache CDN — wiki musi czytać własne świeże zapisy.
    const res = await fetch(`${blobUrl(logicalPath)}?ts=${Date.now()}`, {
      cache: "no-store",
    });
    if (res.status === 404 || res.status === 403) return null;
    if (!res.ok) {
      throw new Error(`Blob read ${logicalPath}: HTTP ${res.status}`);
    }
    return res.text();
  }

  async writeFile(logicalPath: string, content: string): Promise<void> {
    await put(key(logicalPath), content, {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "text/plain; charset=utf-8",
      cacheControlMaxAge: 60, // minimum dla public blob — i tak busujemy ?ts
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
    await del(blobUrl(logicalPath));
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
