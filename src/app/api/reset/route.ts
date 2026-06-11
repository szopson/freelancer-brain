import { NextResponse } from "next/server";
import { getStorage } from "@/lib/storage";
import { resetToSeed } from "@/lib/brain/seed";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST() {
  try {
    const count = await resetToSeed(getStorage());
    return NextResponse.json({ ok: true, files: count });
  } catch (err) {
    console.error("reset failed:", err);
    return NextResponse.json(
      { ok: false, error: "Reset nie powiódł się." },
      { status: 500 },
    );
  }
}
