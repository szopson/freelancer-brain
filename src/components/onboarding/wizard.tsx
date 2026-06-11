"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Brain,
  Calendar,
  Check,
  CheckCircle2,
  CircleDashed,
  ClipboardPaste,
  FileText,
  Loader2,
  Mail,
  Plus,
  Sparkles,
  Sun,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";

const STEPS = [
  "Połącz źródła",
  "Wybierz projekty",
  "Wrzuć chaos",
  "Joris buduje mózg",
  "Pierwszy brief",
];

const SUGGESTED = ["Zalando Stock", "Outlet Pro", "Stock-Hurt"];

type FileStatus = { path: string; state: "waiting" | "reading" | "done" | "error" };

export function OnboardingWizard({ seedFiles }: { seedFiles: string[] }) {
  const [step, setStep] = useState(0);

  // krok 1 — atrapy OAuth
  const [gmail, setGmail] = useState<"idle" | "connecting" | "done">("idle");
  const [calendar, setCalendar] = useState<"idle" | "connecting" | "done">("idle");

  // krok 2 — projekty
  const [projects, setProjects] = useState<string[]>(SUGGESTED);
  const [newProject, setNewProject] = useState("");

  // krok 3 — upload
  const [uploaded, setUploaded] = useState<string[]>([]);
  const [useSeed, setUseSeed] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [pasteName, setPasteName] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  // krok 4 — ingest
  const [fileStatuses, setFileStatuses] = useState<FileStatus[]>([]);
  const [building, setBuilding] = useState(false);
  const [built, setBuilt] = useState(false);
  const [lintCount, setLintCount] = useState<number | null>(null);

  function mockConnect(
    set: (s: "idle" | "connecting" | "done") => void,
  ) {
    set("connecting");
    setTimeout(() => set("done"), 1200);
  }

  function toggleProject(name: string) {
    setProjects((prev) =>
      prev.includes(name)
        ? prev.filter((p) => p !== name)
        : prev.length < 5
          ? [...prev, name]
          : prev,
    );
  }

  async function uploadFiles(list: FileList) {
    for (const file of list) {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) toast.error(`${file.name}: ${data.error}`);
      else setUploaded((prev) => [...prev, data.path]);
    }
  }

  async function uploadPaste() {
    if (!pasteText.trim()) return;
    const res = await fetch("/api/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filename: (pasteName || "notatka") + ".txt",
        text: pasteText,
      }),
    });
    const data = await res.json();
    if (!res.ok) toast.error(data.error);
    else {
      setUploaded((prev) => [...prev, data.path]);
      setPasteText("");
      setPasteName("");
    }
  }

  async function startBuild() {
    setStep(3);
    setBuilding(true);
    try {
      // Stuby profili wybranych projektów
      await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ names: projects }),
      });

      const files = [...uploaded, ...(useSeed ? seedFiles : [])];
      const unique = [...new Set(files)];
      setFileStatuses(unique.map((path) => ({ path, state: "waiting" })));

      for (const path of unique) {
        setFileStatuses((prev) =>
          prev.map((f) => (f.path === path ? { ...f, state: "reading" } : f)),
        );
        const res = await fetch("/api/ingest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ file: path }),
        });
        setFileStatuses((prev) =>
          prev.map((f) =>
            f.path === path
              ? { ...f, state: res.ok ? "done" : "error" }
              : f,
          ),
        );
      }

      // Pierwszy skan Open Loops
      const lintRes = await fetch("/api/lint", { method: "POST" });
      if (lintRes.ok) {
        const report = await lintRes.json();
        setLintCount(report.loops.length);
      }
      setBuilt(true);
    } finally {
      setBuilding(false);
    }
  }

  const canLeaveStep1 = gmail === "done" || calendar === "done";
  const filesReady = uploaded.length > 0 || useSeed;

  return (
    <div className="mx-auto w-full max-w-2xl space-y-8">
      {/* Pasek postępu */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          {STEPS.map((s, i) => (
            <span
              key={s}
              className={i === step ? "font-medium text-foreground" : ""}
            >
              {i + 1}. {s}
            </span>
          ))}
        </div>
        <Progress value={((step + 1) / STEPS.length) * 100} />
      </div>

      {/* Krok 1: atrapy OAuth */}
      {step === 0 && (
        <Card>
          <CardContent className="space-y-6 py-6">
            <div>
              <h2 className="text-lg font-semibold">Połącz źródła danych</h2>
              <p className="text-sm text-muted-foreground">
                W pełnej wersji Joris czyta Gmaila i Kalendarz (tylko odczyt,
                OAuth). W demo — przyciski udają.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <ConnectTile
                icon={<Mail className="size-5" />}
                label="Gmail"
                state={gmail}
                onClick={() => mockConnect(setGmail)}
              />
              <ConnectTile
                icon={<Calendar className="size-5" />}
                label="Kalendarz Google"
                state={calendar}
                onClick={() => mockConnect(setCalendar)}
              />
            </div>
            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setStep(1)}>
                Pomiń
              </Button>
              <Button onClick={() => setStep(1)} disabled={!canLeaveStep1}>
                Dalej <ArrowRight className="size-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Krok 2: projekty */}
      {step === 1 && (
        <Card>
          <CardContent className="space-y-6 py-6">
            <div>
              <h2 className="text-lg font-semibold">
                Wybierz 3–5 aktywnych projektów
              </h2>
              <p className="text-sm text-muted-foreground">
                Joris utworzy dla nich Project Memory i będzie ich pilnować.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {[...new Set([...SUGGESTED, ...projects])].map((name) => {
                const active = projects.includes(name);
                return (
                  <button
                    key={name}
                    onClick={() => toggleProject(name)}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors ${
                      active
                        ? "border-primary bg-primary/10 font-medium"
                        : "hover:bg-muted"
                    }`}
                  >
                    {active ? <Check className="size-3.5" /> : <Plus className="size-3.5" />}
                    {name}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Dodaj własny projekt…"
                value={newProject}
                onChange={(e) => setNewProject(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newProject.trim()) {
                    toggleProject(newProject.trim());
                    setNewProject("");
                  }
                }}
              />
              <Button
                variant="outline"
                onClick={() => {
                  if (newProject.trim()) {
                    toggleProject(newProject.trim());
                    setNewProject("");
                  }
                }}
              >
                Dodaj
              </Button>
            </div>
            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setStep(0)}>
                Wstecz
              </Button>
              <Button
                onClick={() => setStep(2)}
                disabled={projects.length < 1}
              >
                Dalej ({projects.length}/5) <ArrowRight className="size-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Krok 3: upload */}
      {step === 2 && (
        <Card>
          <CardContent className="space-y-6 py-6">
            <div>
              <h2 className="text-lg font-semibold">
                Wrzuć ostatnie ustalenia, faktury, notatki
              </h2>
              <p className="text-sm text-muted-foreground">
                Eksport czatu, treść maila, notatka z calla — surowy chaos.
                Joris go uporządkuje.
              </p>
            </div>

            <button
              onClick={() => setUseSeed((v) => !v)}
              className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left text-sm transition-colors ${
                useSeed ? "border-primary bg-primary/5" : "hover:bg-muted"
              }`}
            >
              <Sparkles className="size-4 shrink-0 text-primary" />
              <span className="flex-1">
                Użyj przykładowych danych Marka ({seedFiles.length} plików:
                WhatsApp, maile, głosówka)
              </span>
              {useSeed && <Check className="size-4 text-primary" />}
            </button>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => fileInput.current?.click()}
              >
                <Upload className="size-4" /> Wgraj pliki (.txt / .md)
              </Button>
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

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ClipboardPaste className="size-4" /> …albo wklej tekst:
              </div>
              <Input
                placeholder="Nazwa (np. mail-od-klienta)"
                value={pasteName}
                onChange={(e) => setPasteName(e.target.value)}
              />
              <Textarea
                placeholder="Wklej treść maila / rozmowy / notatki…"
                rows={4}
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
              />
              {pasteText.trim() && (
                <Button size="sm" variant="outline" onClick={uploadPaste}>
                  Dodaj do inbox
                </Button>
              )}
            </div>

            {uploaded.length > 0 && (
              <ul className="space-y-1 text-sm">
                {uploaded.map((p) => (
                  <li key={p} className="flex items-center gap-2">
                    <FileText className="size-3.5 text-muted-foreground" />
                    <span className="font-mono text-xs">
                      {p.replace("inbox/", "")}
                    </span>
                    <CheckCircle2 className="size-3.5 text-green-600" />
                  </li>
                ))}
              </ul>
            )}

            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setStep(1)}>
                Wstecz
              </Button>
              <Button onClick={startBuild} disabled={!filesReady}>
                <Brain className="size-4" /> Zbuduj pierwszy stan projektów
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Krok 4: ingest na żywo */}
      {step === 3 && (
        <Card>
          <CardContent className="space-y-6 py-6">
            <div>
              <h2 className="text-lg font-semibold">
                Joris tworzy pierwszy stan projektów
              </h2>
              <p className="text-sm text-muted-foreground">
                Każde źródło przechodzi przez pętlę ingest: ekstrakcja faktów →
                kotwice → aktualizacja wiki.
              </p>
            </div>
            <ul className="space-y-2">
              {fileStatuses.map((f) => (
                <li key={f.path} className="flex items-center gap-3 text-sm">
                  {f.state === "waiting" && (
                    <CircleDashed className="size-4 text-muted-foreground" />
                  )}
                  {f.state === "reading" && (
                    <Loader2 className="size-4 animate-spin text-primary" />
                  )}
                  {f.state === "done" && (
                    <CheckCircle2 className="size-4 text-green-600" />
                  )}
                  {f.state === "error" && <X className="size-4 text-red-600" />}
                  <span className="font-mono text-xs">
                    {f.path.replace("inbox/", "")}
                  </span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {f.state === "reading" && "czytam → ekstrakcja → zapis…"}
                    {f.state === "done" && "wiki zaktualizowane"}
                    {f.state === "error" && "błąd"}
                  </span>
                </li>
              ))}
            </ul>
            {building && fileStatuses.every((f) => f.state === "done") && (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Open Loops Detector skanuje mózg…
              </p>
            )}
            {built && (
              <div className="space-y-4 rounded-lg border bg-muted/40 p-4 text-sm">
                <p className="flex items-center gap-2 font-medium">
                  <CheckCircle2 className="size-4 text-green-600" />
                  Mózg zbudowany.
                  {lintCount !== null &&
                    ` Open Loops Detector znalazł ${lintCount} otwartych pętli.`}
                </p>
                <Button onClick={() => setStep(4)}>
                  Zobacz pierwszy Daily Brief <ArrowRight className="size-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Krok 5: brief */}
      {step === 4 && (
        <Card>
          <CardContent className="flex flex-col items-center gap-6 py-10 text-center">
            <Sun className="size-10 text-amber-500" />
            <div>
              <h2 className="text-lg font-semibold">
                Twój pierwszy Daily Brief czeka
              </h2>
              <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
                Od teraz każdego ranka: co masz dziś zrobić, komu odpisać, co
                zaległe i co może Cię ugryźć — z kotwicą do źródła przy każdym
                fakcie.
              </p>
            </div>
            <Button size="lg" render={<Link href="/app/brief" />}>
              Otwórz Daily Brief <ArrowRight className="size-4" />
            </Button>
            {lintCount !== null && lintCount > 0 && (
              <Badge variant="secondary">
                {lintCount} otwartych pętli już wykrytych
              </Badge>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ConnectTile({
  icon,
  label,
  state,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  state: "idle" | "connecting" | "done";
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={state !== "idle"}
      className={`flex items-center gap-3 rounded-lg border p-4 text-left transition-colors ${
        state === "done" ? "border-green-600/40 bg-green-500/5" : "hover:bg-muted"
      }`}
    >
      {icon}
      <div className="flex-1">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">
          {state === "idle" && "Połącz (tylko odczyt)"}
          {state === "connecting" && "Łączenie…"}
          {state === "done" && "Połączono ✓"}
        </p>
      </div>
      {state === "connecting" && <Loader2 className="size-4 animate-spin" />}
      {state === "done" && (
        <Badge variant="secondary" className="text-[10px]">
          demo
        </Badge>
      )}
    </button>
  );
}
