import { NextRequest, NextResponse } from "next/server";
import { getStorage } from "@/lib/storage";
import { runLint } from "@/lib/brain/lint";
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

  try {
    const report = await runLint(getStorage());
    return NextResponse.json(report);
  } catch (err) {
    console.error("lint failed:", err);
    const message = err instanceof Error ? err.message : "Skan nie powiódł się.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
