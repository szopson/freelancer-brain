import { createHash } from "node:crypto";

// Anchor = provenance + klucz deduplikacji. Stemplowany przez kod,
// nigdy przez model — fakt bez kotwicy jest strukturalnie niemożliwy.

export function formatAnchor(inboxPath: string): string {
  return `«${inboxPath}»`;
}

export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[„”"'«»]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

export function dedupKey(anchor: string, text: string): string {
  const hash = createHash("sha1")
    .update(normalizeText(text))
    .digest("hex")
    .slice(0, 8);
  return `${anchor}#${hash}`;
}

export function slugify(input: string): string {
  const map: Record<string, string> = {
    ą: "a", ć: "c", ę: "e", ł: "l", ń: "n", ó: "o", ś: "s", ź: "z", ż: "z",
  };
  return input
    .toLowerCase()
    .replace(/[ąćęłńóśźż]/g, (ch) => map[ch] ?? ch)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}
