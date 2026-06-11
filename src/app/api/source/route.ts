import { NextRequest, NextResponse } from "next/server";
import { getStorage } from "@/lib/storage";

export const dynamic = "force-dynamic";

// Podgląd surowego źródła dla anchor-chipów (provenance).
export async function GET(req: NextRequest) {
  const path = req.nextUrl.searchParams.get("path");
  if (!path || !path.startsWith("inbox/") || path.includes("..")) {
    return NextResponse.json({ error: "Nieprawidłowa ścieżka." }, { status: 400 });
  }
  const content = await getStorage().readFile(path);
  if (content === null) {
    return NextResponse.json({ error: "Nie znaleziono pliku." }, { status: 404 });
  }
  return NextResponse.json({ path, content });
}
