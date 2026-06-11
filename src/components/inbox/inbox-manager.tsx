"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  ClipboardPaste,
  FileText,
  Loader2,
  Sparkles,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { IngestResult, InboxFileInfo } from "@/types/brain";
import { DiffPanel } from "./diff-panel";

type Busy = { kind: "idle" } | { kind: "file"; path: string } | { kind: "all" };

export function InboxManager({ files }: { files: InboxFileInfo[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<Busy>({ kind: "idle" });
  const [results, setResults] = useState<IngestResult[]>([]);
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteName, setPasteName] = useState("");
  const [pasteText, setPasteText] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const unprocessed = files.filter((f) => !f.processed);

  async function uploadFiles(list: FileList | File[]) {
    for (const file of list) {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) {
        toast.error(`${file.name}: ${data.error}`);
      } else {
        toast.success(`Wrzucono do inbox: ${data.path.replace("inbox/", "")}`);
      }
    }
    router.refresh();
  }

  async function uploadPaste() {
    const res = await fetch("/api/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filename: (pasteName || "notatka") + ".txt",
        text: pasteText,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error);
      return;
    }
    toast.success(`Wrzucono do inbox: ${data.path.replace("inbox/", "")}`);
    setPasteOpen(false);
    setPasteName("");
    setPasteText("");
    router.refresh();
  }

  const ingestOne = useCallback(
    async (path: string): Promise<boolean> => {
      const res = await fetch("/api/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file: path }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(`${path.replace("inbox/", "")}: ${data.error}`);
        return false;
      }
      setResults((prev) => [data, ...prev]);
      return true;
    },
    [],
  );

  async function processFile(path: string) {
    setBusy({ kind: "file", path });
    try {
      const ok = await ingestOne(path);
      if (ok) toast.success("Mózg zaktualizowany.");
    } finally {
      setBusy({ kind: "idle" });
      router.refresh();
    }
  }

  async function processAll() {
    setBusy({ kind: "all" });
    try {
      for (const f of unprocessed) {
        setBusy({ kind: "file", path: f.path });
        await ingestOne(f.path);
      }
      toast.success("Wszystkie źródła przetworzone.");
    } finally {
      setBusy({ kind: "idle" });
      router.refresh();
    }
  }

  return (
    <div className="space-y-6">
      {/* Dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (e.dataTransfer.files.length) uploadFiles(e.dataTransfer.files);
        }}
        className={`flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
          dragOver ? "border-primary bg-primary/5" : "border-muted-foreground/20"
        }`}
      >
        <Upload className="size-8 text-muted-foreground" />
        <div>
          <p className="font-medium">Wrzuć chaos — Joris go uporządkuje</p>
          <p className="text-sm text-muted-foreground">
            Mail, eksport WhatsApp, notatka z calla, transkrypcja głosówki
            (.txt / .md, max 50 KB)
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => fileInput.current?.click()}>
            <Upload className="size-4" /> Wybierz plik
          </Button>
          <Button variant="outline" size="sm" onClick={() => setPasteOpen(true)}>
            <ClipboardPaste className="size-4" /> Wklej tekst
          </Button>
        </div>
        <input
          ref={fileInput}
          type="file"
          accept=".txt,.md"
          multiple
          hidden
          onChange={(e) => {
            if (e.target.files?.length) uploadFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {/* Lista plików */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-muted-foreground">
            Źródła w inbox ({files.length}) — niemutowalne, model tylko czyta
          </h2>
          {unprocessed.length > 1 && (
            <Button
              size="sm"
              onClick={processAll}
              disabled={busy.kind !== "idle"}
            >
              {busy.kind === "all" || busy.kind === "file" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Sparkles className="size-4" />
              )}
              Przetwórz wszystkie ({unprocessed.length})
            </Button>
          )}
        </div>
        {files.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              Inbox pusty. Wrzuć pierwsze źródło powyżej.
            </CardContent>
          </Card>
        )}
        {files.map((f) => {
          const isBusy = busy.kind === "file" && busy.path === f.path;
          return (
            <Card key={f.path}>
              <CardContent className="flex items-center gap-3 py-3">
                <FileText className="size-4 shrink-0 text-muted-foreground" />
                <span className="min-w-0 flex-1 truncate font-mono text-sm">
                  {f.name}
                </span>
                {f.processed ? (
                  <Badge variant="secondary" className="gap-1">
                    <CheckCircle2 className="size-3" /> przetworzony
                  </Badge>
                ) : (
                  <Badge variant="outline">nowy</Badge>
                )}
                <Button
                  size="sm"
                  variant={f.processed ? "ghost" : "default"}
                  onClick={() => processFile(f.path)}
                  disabled={busy.kind !== "idle"}
                >
                  {isBusy ? (
                    <>
                      <Loader2 className="size-4 animate-spin" /> Joris czyta…
                    </>
                  ) : (
                    <>
                      <Sparkles className="size-4" />
                      {f.processed ? "Przetwórz ponownie" : "Przetwórz"}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Wyniki ingest (diff) */}
      {results.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground">
            Co się zmieniło w mózgu
          </h2>
          {results.map((r, i) => (
            <DiffPanel key={`${r.source}-${i}`} result={r} />
          ))}
        </div>
      )}

      {/* Dialog wklejania */}
      <Dialog open={pasteOpen} onOpenChange={setPasteOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Wklej treść źródła</DialogTitle>
            <DialogDescription>
              Np. treść maila, fragment rozmowy, notatka po callu.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Nazwa, np. mail-od-klienta"
              value={pasteName}
              onChange={(e) => setPasteName(e.target.value)}
            />
            <Textarea
              placeholder="Wklej tekst…"
              rows={10}
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setPasteOpen(false)}>
              Anuluj
            </Button>
            <Button onClick={uploadPaste} disabled={!pasteText.trim()}>
              Wrzuć do inbox
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
