import { NextRequest, NextResponse } from "next/server";
import { getStorage } from "@/lib/storage";
import { slugify } from "@/lib/brain/anchors";
import {
  emptyClientProfile,
  serializeClientFile,
} from "@/lib/brain/clientFile";
import { rebuildIndex } from "@/lib/brain/indexBuilder";

export const dynamic = "force-dynamic";

// Onboarding krok 2: tworzy puste profile wybranych projektów.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const names: unknown = body?.names;
  if (
    !Array.isArray(names) ||
    names.length === 0 ||
    names.length > 5 ||
    !names.every((n) => typeof n === "string" && n.trim().length > 0)
  ) {
    return NextResponse.json(
      { error: "Podaj 1–5 nazw projektów (names: string[])." },
      { status: 400 },
    );
  }

  const storage = getStorage();
  const created: string[] = [];
  for (const name of names as string[]) {
    const id = slugify(name);
    if (!id) continue;
    const path = `brain/clients/${id}.md`;
    if ((await storage.readFile(path)) !== null) continue;
    await storage.writeFile(
      path,
      serializeClientFile(emptyClientProfile(id, name.trim())),
    );
    created.push(id);
  }
  await rebuildIndex(storage);

  return NextResponse.json({ ok: true, created });
}
