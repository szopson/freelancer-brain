import { NextRequest, NextResponse } from "next/server";
import { getStorage } from "@/lib/storage";
import { ingestFile } from "@/lib/brain/ingest";
import {
  LIMIT_MESSAGES,
  checkAndIncrementDailyCap,
  checkIpLimit,
} from "@/lib/guards";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "local";
  if (!checkIpLimit(ip)) {
    return NextResponse.json({ error: LIMIT_MESSAGES.ip }, { status: 429 });
  }
  if (!(await checkAndIncrementDailyCap(getStorage()))) {
    return NextResponse.json({ error: LIMIT_MESSAGES.daily }, { status: 429 });
  }

  let file: unknown;
  try {
    ({ file } = await req.json());
  } catch {
    return NextResponse.json({ error: "Body musi być JSON-em." }, { status: 400 });
  }
  if (typeof file !== "string" || !file.startsWith("inbox/")) {
    return NextResponse.json(
      { error: "Podaj pole file ze ścieżką inbox/…" },
      { status: 400 },
    );
  }

  try {
    const result = await ingestFile(getStorage(), file);
    return NextResponse.json(result);
  } catch (err) {
    console.error("ingest failed:", err);
    const message =
      err instanceof Error ? err.message : "Ingest nie powiódł się.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
