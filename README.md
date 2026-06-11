# FreelancerBrain — LIGHT (prototyp)

> **Pilnuję twoich projektów i zobowiązań.** Drugi Mózg dla solo-konsultanta:
> wrzucasz chaos (maile, eksporty WhatsApp, notatki, głosówki), a Joris buduje
> z nich żywą, ukotwiczoną w źródłach pamięć twojej firmy.

Prototyp **HyperHuman Labs** — lekka wersja produktu HyperBrain, zaprojektowana
dla freelancerów i firm jednoosobowych. Architektura: wzorzec **LLM-Wiki**
(model przyrostowo buduje i utrzymuje wiki w Markdownie) — bez RAG, bez bazy
danych, bez wektorów. Specyfikacja: `docs/FreelancerBrain_Architektura_v0.3.md`.

## Co tu naprawdę działa (a co jest atrapą)

| Element | Status |
|---|---|
| Pętla **ingest → query → lint** na plikach Markdown | ✅ działa naprawdę (Anthropic API) |
| anchorGuard — każdy fakt z kotwicą «inbox/…» do nietkniętego źródła | ✅ wymuszany w kodzie, nie w prompcie |
| Deduplikacja przed zapisem + sprzeczności jako sygnał (nie nadpisanie) | ✅ działa |
| Guard na prompt injection (treść źródła = dane, nigdy instrukcje) | ✅ w definicji skilla + strukturalne wyjście |
| Upload źródeł (plik / wklejenie) do `inbox/` | ✅ działa |
| Open Loops Detector (lint) — komu nie odpisałeś, co bez terminu, faktury | ✅ działa naprawdę |
| Daily Brief / Weekly Review | ✅ składane deterministycznie z wiki + raportu lint (zero LLM przy renderze) |
| Connectory Gmail / Kalendarz (OAuth) | 🎭 atrapa — przyciski „wkrótce" |
| Nocna cadence (scheduler) | 🎭 w demo skan uruchamiasz przyciskiem |

## Pięć funkcji LIGHT → gdzie ich szukać

| Funkcja | Widok | Mechanizm |
|---|---|---|
| Daily Brief | `/app/brief` | output cadence z wiki + lint |
| Project Memory | `/app/clients` | `brain/clients/<id>.md` (frontmatter + ustalenia z anchorami) |
| Open Loops Detector | `/app/loops` | skill lint — nocny health-check |
| Joris Inbox | `/app/inbox` | upload do `inbox/` + przycisk „Przetwórz" (ingest) |
| Weekly Review | `/app/review` | przekrój wiki + raport lint |

Plus: rytuał onboardingu (5 kroków) pod `/onboarding`.

## Architektura w 30 sekund

```
data/ (lokalnie) lub Vercel Blob (produkcja)
├─ inbox/   ← ŹRÓDŁA: niemutowalne, wrzuca tylko człowiek
└─ brain/   ← WIKI: generowane, pisze tylko model
   ├─ index.md          (katalog stron — regenerowany deterministycznie)
   ├─ log.md            (append-only dziennik)
   ├─ context/          (profil biznesu, stawki)
   ├─ clients/<id>.md   (profil + ustalenia «anchor» + historia)
   └─ lint-report.json  (wynik Open Loops Detector)
```

Twardy podział: model **nigdy** nie pisze do `inbox/`, człowiek nigdy nie
edytuje `brain/`. Każde twierdzenie w wiki da się prześledzić do nietkniętego
źródła jednym kliknięciem (chip z kotwicą).

## Uruchomienie lokalne

```bash
npm install
cp .env.example .env.local   # uzupełnij ANTHROPIC_API_KEY
npm run seed                 # przywraca data/ do stanu startowego (dane Marka)
npm run dev                  # http://localhost:3000
```

Przepływ demo: `/onboarding` → rytuał 5 kroków → Daily Brief. Albo od razu
`/app/inbox` → „Przetwórz wszystkie" → `/app/loops` → „Uruchom skan".

## Deploy na Vercel

1. Zaimportuj repo w Vercel (Next.js — ustawienia domyślne).
2. **Storage → Create Blob store → Connect** (ustawia `BLOB_READ_WRITE_TOKEN`,
   co automatycznie przełącza storage na Blob).
3. Dodaj env `ANTHROPIC_API_KEY` (Production + Preview).
4. Po pierwszym deployu wywołaj `POST /api/reset` (albo przycisk „Resetuj
   demo"), żeby zasiać Blob danymi startowymi.

Limity wbudowane w demo: 10 wywołań AI / 10 min / IP, dzienny limit globalny
(`DAILY_CALL_CAP`, domyślnie 150), upload tylko `.txt`/`.md` ≤ 50 KB, max 30
plików w inbox.

## Bezpieczeństwo

- **Zero sekretów w repo** — klucz Anthropic tylko w `.env.local` / env Vercela
  (`.gitignore` wyklucza `.env*`).
- Treść źródeł traktowana jako dane: instrukcje wstrzyknięte w plik (np.
  „zignoruj poprzednie polecenia") są streszczane, nie wykonywane — w seedzie
  jest plik, który to demonstruje.
- Wspólne demo: dane są fikcyjne i widoczne dla wszystkich odwiedzających;
  pliki w Blob są publiczne pod losowymi URL-ami. Nie wrzucaj prawdziwych
  danych klientów.

---

*Prototyp zbudowany wg `docs/FreelancerBrain_Claude_Code_Polecenia.md`.
Stack: Next.js 16 · TypeScript · Tailwind 4 · shadcn/ui · Anthropic API
(structured outputs) · Vercel Blob. Grafika hero: Higgsfield AI.*
