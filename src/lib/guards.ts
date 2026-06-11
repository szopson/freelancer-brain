import type { Storage } from "@/lib/storage";
import { todayWarsaw } from "@/lib/brain/reader";

// Strażnicy kosztów publicznego demo. Limit per-IP jest in-memory
// (per instancja lambdy — wystarczające dla demo), limit dzienny
// jest trwały w storage.

const WINDOW_MS = 10 * 60 * 1000;
const MAX_CALLS_PER_WINDOW = 10;
const buckets = new Map<string, number[]>();

export function checkIpLimit(ip: string): boolean {
  const now = Date.now();
  const calls = (buckets.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (calls.length >= MAX_CALLS_PER_WINDOW) {
    buckets.set(ip, calls);
    return false;
  }
  calls.push(now);
  buckets.set(ip, calls);
  return true;
}

const DAILY_CAP = Number(process.env.DAILY_CALL_CAP || 150);

export async function checkAndIncrementDailyCap(
  storage: Storage,
): Promise<boolean> {
  const today = todayWarsaw();
  const raw = await storage.readFile("meta/usage.json");
  let usage: { date: string; calls: number } = { date: today, calls: 0 };
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed.date === today) usage = parsed;
    } catch {
      // uszkodzony plik — zaczynamy licznik od zera
    }
  }
  if (usage.calls >= DAILY_CAP) return false;
  usage.calls++;
  await storage.writeFile("meta/usage.json", JSON.stringify(usage));
  return true;
}

export const LIMIT_MESSAGES = {
  ip: "Zwolnij — limit 10 wywołań AI na 10 minut w demo. Spróbuj za chwilę.",
  daily: "Demo osiągnęło dzienny limit wywołań AI — wróć jutro.",
} as const;
