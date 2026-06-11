"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ScanSearch } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function ScanButton({ label = "Uruchom skan" }: { label?: string }) {
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function scan() {
    setBusy(true);
    try {
      const res = await fetch("/api/lint", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`Skan zakończony: ${data.loops.length} otwartych pętli.`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Skan nie powiódł się.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button onClick={scan} disabled={busy}>
      {busy ? (
        <>
          <Loader2 className="size-4 animate-spin" /> Joris skanuje mózg…
        </>
      ) : (
        <>
          <ScanSearch className="size-4" /> {label}
        </>
      )}
    </Button>
  );
}
