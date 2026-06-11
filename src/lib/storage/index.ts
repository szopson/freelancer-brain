import type { Storage } from "./types";
import { LocalStorage } from "./local";
import { BlobStorage } from "./blob";

let instance: Storage | null = null;

export function getStorage(): Storage {
  if (instance) return instance;
  const driver =
    process.env.STORAGE_DRIVER ||
    (process.env.BLOB_READ_WRITE_TOKEN ? "blob" : "local");
  instance = driver === "blob" ? new BlobStorage() : new LocalStorage();
  return instance;
}

export type { Storage };
