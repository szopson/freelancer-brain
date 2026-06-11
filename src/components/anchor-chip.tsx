"use client";

import { useState } from "react";
import { FileText, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

// Sygnaturowy komponent demo: każda kotwica «inbox/…» otwiera nietknięte
// surowe źródło — provenance widoczne jednym kliknięciem.
export function AnchorChip({ anchor }: { anchor: string }) {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const name = anchor.replace(/^inbox\//, "");

  async function show() {
    setOpen(true);
    if (content !== null) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/source?path=${encodeURIComponent(anchor)}`);
      const data = await res.json();
      setContent(data.content ?? "(nie znaleziono źródła)");
    } catch {
      setContent("(błąd wczytywania źródła)");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={show}
        className="inline-flex items-center gap-1 rounded-full border bg-muted/50 px-2 py-0.5 font-mono text-[11px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        title={`Pokaż źródło: ${anchor}`}
      >
        <FileText className="size-3" />
        {name}
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-mono text-sm">{anchor}</DialogTitle>
            <DialogDescription>
              Surowe źródło — niemutowalne, model go nigdy nie edytuje.
            </DialogDescription>
          </DialogHeader>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <ScrollArea className="max-h-[60vh]">
              <pre className="whitespace-pre-wrap rounded-md bg-muted p-4 text-xs leading-relaxed">
                {content}
              </pre>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
