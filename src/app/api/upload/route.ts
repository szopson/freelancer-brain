import { NextRequest, NextResponse } from "next/server";
import { getStorage } from "@/lib/storage";
import { slugify } from "@/lib/brain/anchors";
import { todayWarsaw } from "@/lib/brain/reader";

export const dynamic = "force-dynamic";

const MAX_SIZE = 50 * 1024; // 50 KB
const MAX_INBOX_FILES = 30;

// Upload trafia WYŁĄCZNIE do inbox/ — to jedyna ścieżka zapisu człowieka,
// model nigdy tu nie pisze (twardy podział źródło/wiki).
export async function POST(req: NextRequest) {
  let filename: string;
  let text: string;

  const contentType = req.headers.get("content-type") ?? "";
  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Brak pliku." }, { status: 400 });
    }
    filename = file.name;
    text = await file.text();
  } else {
    const body = await req.json().catch(() => null);
    if (!body || typeof body.filename !== "string" || typeof body.text !== "string") {
      return NextResponse.json(
        { error: "Podaj pola filename i text." },
        { status: 400 },
      );
    }
    filename = body.filename;
    text = body.text;
  }

  if (text.length === 0) {
    return NextResponse.json({ error: "Plik jest pusty." }, { status: 400 });
  }
  if (text.length > MAX_SIZE) {
    return NextResponse.json(
      { error: "Plik za duży (limit 50 KB w demo)." },
      { status: 413 },
    );
  }
  if (!/\.(txt|md)$/i.test(filename)) {
    return NextResponse.json(
      { error: "Demo przyjmuje tylko pliki .txt i .md." },
      { status: 415 },
    );
  }

  const storage = getStorage();
  const existing = await storage.listFiles("inbox");
  if (existing.length >= MAX_INBOX_FILES) {
    return NextResponse.json(
      { error: "Inbox pełny (limit 30 plików w demo). Zresetuj demo." },
      { status: 409 },
    );
  }

  const ext = filename.toLowerCase().endsWith(".md") ? ".md" : ".txt";
  const base = slugify(filename.replace(/\.(txt|md)$/i, "")) || "notatka";
  const datePrefix = /^\d{4}-\d{2}-\d{2}/.test(base) ? "" : `${todayWarsaw()}-`;
  let path = `inbox/${datePrefix}${base}${ext}`;
  // Unikamy nadpisania istniejącego źródła — źródła są niemutowalne.
  let i = 2;
  while (existing.includes(path)) {
    path = `inbox/${datePrefix}${base}-${i}${ext}`;
    i++;
  }

  await storage.writeFile(path, text);
  return NextResponse.json({ ok: true, path });
}
