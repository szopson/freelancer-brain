"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function ResetButton() {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function reset() {
    setBusy(true);
    try {
      const res = await fetch("/api/reset", { method: "POST" });
      if (!res.ok) throw new Error(await res.text());
      toast.success("Demo zresetowane — przywrócono dane startowe Marka.");
      setOpen(false);
      router.refresh();
    } catch {
      toast.error("Nie udało się zresetować demo. Spróbuj ponownie.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        <RotateCcw className="size-4" />
        Resetuj demo
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Zresetować demo?</DialogTitle>
          <DialogDescription>
            Wszystkie wgrane pliki i wygenerowana wiedza zostaną usunięte, a
            mózg wróci do stanu startowego z przykładowymi danymi Marka.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Anuluj
          </Button>
          <Button onClick={reset} disabled={busy}>
            {busy && <Loader2 className="size-4 animate-spin" />}
            Resetuj
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
