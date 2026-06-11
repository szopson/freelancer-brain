import type { Storage } from "@/lib/storage";
import { todayWarsaw } from "./reader";

export async function appendLog(
  storage: Storage,
  lines: string[],
): Promise<void> {
  if (lines.length === 0) return;
  const time = new Intl.DateTimeFormat("pl-PL", {
    timeZone: "Europe/Warsaw",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());
  const stamp = `${todayWarsaw()} ${time}`;
  const block = lines.map((l) => `- ${stamp} · ${l}`).join("\n") + "\n";
  await storage.appendFile("brain/log.md", block);
}
