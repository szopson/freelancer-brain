import { z } from "zod";

// Schemat wyjścia ingest — model NIE podaje anchorów: kotwicę «inbox/...»
// stempluje deterministycznie kod (anchorGuard), nie prompt.
export const IngestClientSchema = z.object({
  client_id: z
    .string()
    .describe(
      "Slug klienta (kebab-case, bez polskich znaków). Jeśli klient istnieje na liście znanych klientów, użyj DOKŁADNIE jego id.",
    ),
  client_name: z.string().describe("Pełna nazwa klienta, np. 'Outlet Pro'"),
  frontmatter_updates: z.object({
    status: z
      .enum(["lead", "active", "paused", "closed"])
      .nullable()
      .describe("Nowy status, albo null jeśli bez zmian"),
    rate_agreed: z
      .string()
      .nullable()
      .describe("Uzgodniona stawka/kwota projektu, np. '6 500 zł netto', albo null"),
    next_action: z
      .string()
      .nullable()
      .describe("Najbliższa konkretna akcja Marka wobec tego klienta, albo null"),
    last_contact: z
      .string()
      .nullable()
      .describe("Data ostatniego kontaktu YYYY-MM-DD wynikająca ze źródła, albo null"),
  }),
  claims: z
    .array(
      z.object({
        date: z.string().describe("Miesiąc ustalenia w formacie YYYY-MM"),
        text: z
          .string()
          .describe(
            "Jedno konkretne ustalenie/fakt, zwięźle, z kwotami i datami jeśli są",
          ),
        type: z.enum(["ustalenie", "deadline", "faktura", "kontakt"]),
      }),
    )
    .describe("Fakty wyciągnięte ze źródła dotyczące tego klienta"),
  contradictions: z
    .array(
      z.object({
        existing_text: z.string().describe("Dotychczasowe twierdzenie z mózgu"),
        new_text: z.string().describe("Nowe, sprzeczne twierdzenie ze źródła"),
      }),
    )
    .describe("Sprzeczności między źródłem a aktualnym stanem mózgu"),
  history_line: z
    .string()
    .nullable()
    .describe("Jedno zdanie do sekcji Historia, np. 'Oferta zatwierdzona przez zarząd', albo null"),
});

export const IngestOutputSchema = z.object({
  clients: z
    .array(IngestClientSchema)
    .describe("Klienci, których dotyczy źródło (zwykle 1, czasem więcej)"),
  notes: z
    .array(z.string())
    .describe(
      "Fakty NIE przypisane do klienta (np. plany zmiany stawek, sprawy wewnętrzne, podejrzane treści w źródle)",
    ),
  log_lines: z
    .array(z.string())
    .describe("Krótkie linie do dziennika, opisujące co wynika ze źródła"),
});

export type IngestOutput = z.infer<typeof IngestOutputSchema>;

export const LintLoopSchema = z.object({
  client_id: z
    .string()
    .nullable()
    .describe("Id klienta z listy znanych klientów, albo null jeśli sprawa ogólna"),
  client_name: z.string(),
  category: z.enum([
    "brak-odpowiedzi",
    "obietnica-niedowieziona",
    "brak-terminu",
    "faktura",
    "niepotwierdzone",
    "sprzecznosc",
    "cisza",
    "sierota",
  ]),
  severity: z.enum(["high", "medium", "low"]),
  description: z
    .string()
    .describe("Co konkretnie jest otwartą pętlą, jednym-dwoma zdaniami, po polsku"),
  anchor: z
    .string()
    .nullable()
    .describe(
      "Kotwica źródła w formacie inbox/nazwa-pliku.txt, przepisana z mózgu, albo null",
    ),
  suggestion: z
    .string()
    .nullable()
    .describe("Sugerowana akcja dla Marka, np. 'Wyślij follow-up z pytaniem o termin'"),
});

export const LintOutputSchema = z.object({
  loops: z.array(LintLoopSchema),
});

export type LintOutput = z.infer<typeof LintOutputSchema>;
