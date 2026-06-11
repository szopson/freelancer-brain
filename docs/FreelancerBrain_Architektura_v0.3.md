# FreelancerBrain — Drugi Mózg dla solo-konsultanta

**Pozycjonowanie produktu + architektura light + zakres MVP**

Self-serve · budżet wdrożenia: kilka tys. zł · ICP: konsultant / agencja solo
Wersja 0.3 · dokument roboczy · HyperHuman Labs

> **Co nowego w v0.3**
> - Pozycjonowanie i granica LIGHT / PRO / Heavy (warstwa produktowa Jorisa).
> - Pięć funkcji LIGHT jako zdefiniowany zakres MVP — z jawną granicą „i tyle".
> - Lint przemianowany na Open Loops Detector — serce wersji LIGHT.
> - Zachowana pełna głębia techniczna z v0.2 (podział źródło/wiki, pętla, storage, bezpieczeństwo).

---

## 0. Pozycjonowanie: obietnica LIGHT

> **Obietnica produktu**
> Nie buduję mózgu całej firmy — pilnuję człowieka, który sam jest firmą. Freelancer, mały zakład, jednoosobowy wykonawca: kilku klientów, faktury, ustalenia na WhatsAppie, mail, kalendarz i notatki porozrzucane jak resztki po remoncie kuchni.

FreelancerBrain to **osobny produkt**, nie tańsza wersja HyperBrain. Gdyby LIGHT zaczął udawać Heavy, skończy jako przeciążony potworek, którego nikt nie umie wdrożyć. LIGHT ma być brutalnie prosty: mniej chaosu, mniej zapomnianych rzeczy, więcej kontroli nad bieżącą robotą.

### 0.1 Granica LIGHT / PRO / Heavy

| Tier | Obietnica | Dla kogo |
|---|---|---|
| **LIGHT** | „Pilnuję twoich projektów i zobowiązań." | Jednoosobowa działalność, freelancer, mały zakład |
| **PRO** | „Buduję system zarządzania twoją firmą." | Mały zespół, kilka osób, procesy |
| **Heavy (HyperBrain)** | „Staję się mózgiem organizacji." | SME, audyt, diagnoza, ranking szans |

> **Czego LIGHT NIE sprzedaje**
> Nie sprzedajemy transformacji organizacyjnej. Sprzedajemy to, że nie musisz o 23:40 przypominać sobie, że miałeś wysłać klientowi ofertę, wystawić fakturę i oddzwonić do gościa, który czeka trzeci dzień. To wystarczająco wartościowe — i to jest dobry wedge: nie największy biznes od razu, ale bardzo dobry produkt wejściowy.

### 0.2 LIGHT vs Heavy — architektura

| Wymiar | HyperBrain (Heavy) | FreelancerBrain (LIGHT) |
|---|---|---|
| Użytkownik | Konsultant przy wdrożeniu → founder | Sam freelancer (self-serve) |
| Storage | PostgreSQL + pgvector + S3 + KG | Pliki Markdown (lokalne + chmura), bez RAG |
| Retrieval | GraphRAG (graf + wektory) | Kontekst + index.md (poniżej progu RAG) |
| Orkiestracja | n8n, MCP, event log | Skills + pętla ingest/query/lint |
| Cena | 50–150k wdrożenie | Kilka tys. setup + niski abonament |

> **Zasada przewodnia (4C + LLM-Wiki)**
> Wartością nie jest aplikacja ani model, lecz ustrukturyzowane pliki i pętla, która utrzymuje je aktualne. Modele się zmieniają — system zostaje. FreelancerBrain jest tool-agnostic z założenia.

---

## 1. Zakres LIGHT: pięć funkcji i ani jednej więcej

Nie 15 funkcji. Minimalny, ostry zestaw. Feature'owanie to miejsce, gdzie giną małe produkty — dlatego granica jest jawna.

| # | Funkcja | Co robi |
|---|---|---|
| 1 | **Daily Brief** | Co mam dziś zrobić, komu odpisać, co zaległe, co może mnie ugryźć |
| 2 | **Project Memory (3–5)** | Klient, status, ustalenia, deadline'y, dokumenty, faktury, otwarte pętle, decyzje |
| 3 | **Open Loops Detector** | Serce LIGHT — czego nie dowiozłeś (patrz 1.1) |
| 4 | **Joris Inbox / Dump Zone** | Jedno miejsce na cały chaos: mail, PDF, screen, głosówka, notatka, faktura |
| 5 | **Weekly Review** | Co idzie dobrze, co stoi, gdzie kasa do zebrania, gdzie ryzyko konfliktu |

### 1.1 Open Loops Detector — serce wersji LIGHT

To nie „ładne notatki". To jedyna funkcja, której klient naprawdę nie ma gdzie indziej — i która uzasadnia cały produkt. Wykrywa otwarte pętle:

- komu nie odpisałem
- co obiecałem, a czego nie dowiozłem
- co nie ma terminu
- gdzie klient czeka
- gdzie faktura nie została wystawiona
- gdzie coś jest ustalone, ale niepotwierdzone

> **To samo w środku, lepsza nazwa na zewnątrz**
> Open Loops Detector to nasz techniczny `lint` (rozdz. 4.3) opisany jako wartość dla człowieka. „Lint sprawdza sprzeczności" to język inżyniera. „Joris pilnuje, czego nie dowiozłeś" to język klienta. Jedno dla zespołu, drugie dla użytkownika — ten sam mechanizm.

---

## 2. Most: produkt ↔ architektura

Pięć funkcji LIGHT to warstwa produktowa. Pod każdą z nich siedzi konkretny element architektury. Nie ma konfliktu — to ten sam system w dwóch językach.

| Funkcja (język produktu) | Mechanizm (język architektury) |
|---|---|
| Joris Inbox / Dump Zone | Warstwa `inbox/` — źródła niemutowalne (rozdz. 4.1) |
| Project Memory (3–5 projektów) | `brain/clients/` — profile + ustalenia + anchory |
| „Joris tworzy pierwszy stan projektów" | Pętla ingest → budowa wiki (rozdz. 5.1) |
| Open Loops Detector | Lint — nocny / tygodniowy health-check (5.3) |
| Daily Brief | Output cadence (rozdz. 5) |
| Weekly Review | Lint w cyklu tygodniowym |
| Warstwa 1: Gmail / Kalendarz / Drive | Connections — OAuth, read-only (4.2) |
| „wrzuć chaos, ja go uporządkuję" | Pipeline normalizacji → Markdown |

### 2.1 Onboarding z gotowym rytuałem (w godzinę)

Nie „skonfiguruj sobie system". Sztywny rytuał, który w godzinę buduje pierwszy porządek operacyjny — nie mózg firmy:

| Krok | Co robi Marek | Co robi Joris (w tle) |
|---|---|---|
| 1 | Połącz Gmaila i Kalendarz | OAuth, read-only scope |
| 2 | Wybierz 3–5 aktywnych projektów | Tworzy `brain/clients/<id>.md` |
| 3 | Wrzuć ostatnie ustalenia / faktury / notatki | Ingest do `inbox/` → budowa wiki |
| 4 | — | Tworzy pierwszy stan projektów (Project Memory) |
| 5 | Odbiera pierwszy Daily Brief | Output cadence + pierwszy Open Loops |

> **Uczciwa obietnica zamiast magii**
> Nie obiecujemy „połącz WhatsAppa jednym kliknięciem", jeśli tego nie dowozimy. Obiecujemy coś uczciwszego: wrzuć mi chaos (eksport czatu, PDF, screen, głosówka), ja go uporządkuję. To bardziej realistyczne i mniej głupie produktowo niż udawany enterprise-connector za kilka tysięcy.

---

## 3. Fundament techniczny: model 4C

Produkt stoi na czterech krokach. Każde „C" to warstwa systemu, nie hasło.

| Krok | Co znaczy w produkcie | Artefakt |
|---|---|---|
| **Context** | Onboarding generuje profil biznesu, ICP, stawki, ton + plik-router | `BRAIN.md` + `context/*.md` |
| **Connections** | Dostęp do danych: Gmail, Kalendarz, Slack przez OAuth, ograniczony scope | `connections/` + klucze |
| **Capabilities** | Skills działające jak linia montażowa (ingest, oferta, brief, lint) | `skills/*.md` |
| **Cadence** | Harmonogram: pętla ingest→query→lint odpala się sama (np. nocą) | `cadence/` + scheduler |

> **Test wartości onboardingu**
> Po setupie: „Zapytaj mózg o swój biznes. Czy odpowiedź brzmi jak od nieznajomego, czy jak od współzałożyciela?" To definicja done dla warstwy Context.

---

## 4. Architektura: wzorzec LLM-Wiki

Rdzeń to wzorzec, który Karpathy nazwał **LLM-Wiki**: zamiast odkrywać wiedzę od zera przy każdym pytaniu (RAG), model **przyrostowo buduje i utrzymuje trwałe wiki** — ustrukturyzowany zbiór plików Markdown między freelancerem a surowymi źródłami. Wiedza jest kompilowana raz i utrzymywana aktualna, nie wyprowadzana na nowo. To dokładnie różnicuje FreelancerBrain od „kolejnego bota z uploadem plików".

### 4.1 Trzy warstwy (twardy podział)

Najważniejsza decyzja v0.2: rozdzielić to, co wrzuca człowiek, od tego, co generuje model. Te warstwy mają różne reguły zapisu.

| Warstwa | Kto jest właścicielem | Reguła | Pliki |
|---|---|---|---|
| Źródła (raw) | Freelancer | Niemutowalne — model tylko czyta, nigdy nie zmienia | `inbox/` |
| Wiki (mózg) | Joris / model | Generowane — model tworzy, aktualizuje, łączy strony | `brain/` |
| Schemat | My + freelancer | Konfiguracja — jak wiki jest zbudowane i jak działa | `BRAIN.md` |

> **Dlaczego ten podział jest kluczowy**
> Marek nigdy nie edytuje mózgu — wrzuca tylko surowe rzeczy (maile, notatki, eksport WhatsAppa). Joris nigdy nie nadpisuje źródeł — buduje na nich osobną, spójną warstwę wiedzy. Dzięki temu zawsze można prześledzić każde twierdzenie z powrotem do nietkniętego źródła. To provenance wbudowane w strukturę, nie w prompt.

### 4.2 Pełna warstwowość systemu

| # | Warstwa | Rola | Technologia |
|---|---|---|---|
| 5 | Interfejs | Chat + onboarding + brief (mózg niewidoczny) | Web ↔ pliki |
| 4 | Cadence | Pętla ingest→query→lint, nocne taski | Scheduler |
| 3 | Skills | Ingest, oferta, follow-up, brief, lint | Markdown + `anchorGuard()` |
| 2 | Connections | Gmail, Kalendarz, Slack — OAuth, read-only | MCP connectors |
| 1 | Wiki + Źródła | `brain/` (generowany) + `inbox/` (surowy) | Markdown, lokalnie + chmura |

### 4.3 Hybryda lokalne + chmurowe

**Decyzja:** single source of truth = pliki Markdown w jednym repo/folderze, sync do chmury. Lokalność = szybkość i kontrola; chmura = backup, dostęp z wielu urządzeń, serwerowy scheduler dla cadence.

| Opcja | Plus | Minus | Werdykt |
|---|---|---|---|
| A. Tylko lokalne | Kontrola, zero kosztów chmury | Brak nocnej cadence, brak backupu | Za słabe |
| B. Tylko chmurowe | Cadence serwerowa, dostęp wszędzie | Lock-in, koszt, wolniejsza iteracja | Za ciężkie |
| **C. Hybryda (rekom.)** | Lokalna szybkość + chmurowy backup i scheduler | Trzeba zarządzać syncem i konfliktami | **Wybór** |

> **Rekomendacja: Opcja C**
> Pliki to warstwa kanoniczna i przenośna (przeżyją zmianę modelu). Chmura to warstwa wykonawcza: sync, backup i miejsce, gdzie scheduler odpala nocne skills bez włączonego laptopa. Konflikty rozwiązywane na poziomie append-only logu — patrz rozdział 7.2.

### 4.4 Struktura plików

Folder = produkt. Podział źródło/wiki widoczny od najwyższego poziomu:

```
freelancer-brain/
├─ BRAIN.md              ← SCHEMAT: kim jestem, jak działa wiki, workflowy
│
├─ inbox/                ← ŹRÓDŁA (niemutowalne, tylko człowiek wrzuca)
│   ├─ 2026-06-10-mail-outlet.txt
│   ├─ 2026-06-09-wa-export-zalando.txt
│   └─ notatka-glosowa-call.txt
│
├─ brain/                ← WIKI (generowane, model jest właścicielem)
│   ├─ index.md          ← katalog stron + 1-liniowe opisy
│   ├─ log.md            ← chronologiczny, append-only dziennik
│   ├─ context/          ← business, rates, voice, positioning
│   ├─ clients/          ← profil + historia + anchory per klient
│   └─ synthesis.md      ← przekrój: szanse, ryzyka, priorytety
│
├─ skills/               ← ingest, proposal, followup, brief, lint
├─ cadence/schedule.yaml ← co, kiedy, jakim modelem
└─ connections/scopes.yaml
```

> **Dlaczego pliki, nie baza danych**
> Tool-agnostic: dziś Fable, jutro inny model — system się nie zmienia. Markdown jest czytelny dla człowieka i modelu naraz. Zero kosztu utrzymania bazy = możliwa cena „kilka tys.". Patrz rozdział 6: dlaczego to wystarczy bez RAG.

---

## 5. Pętla operacyjna: ingest → query → lint (Open Loops)

To serce produktu i element, którego brakowało w v0.1. Trzy operacje, które utrzymują mózg żywym i aktualnym.

```
   ŹRÓDŁO              MÓZG (wiki)                 OUTPUT
  ┌────────┐         ┌──────────────┐          ┌──────────┐
  │ inbox/ │──INGEST→│ aktualizuje  │──QUERY──→ │  brief   │
  │ (mail, │         │ 10-15 stron  │          │  oferta  │
  │  WA,   │         │ + index+log  │←─zapis────│ podsum.  │
  │ notat.)│         └──────┬───────┘ odpowiedzi└──────────┘
  └────────┘                │ jako nowa strona
                            ↓
                      ┌──────────┐
                      │   LINT   │  nocny health-check:
                      │ (cadence)│  sprzeczności, luki,
                      └──────────┘  stare ustalenia, sieroty
```

### 5.1 Ingest — wrzucasz źródło, mózg się przebudowuje

Marek wrzuca mail do `inbox/`. Skill ingest czyta, wyciąga kluczowe info i integruje je w istniejące wiki: aktualizuje profil klienta, rewizuje ustalenia, zaznacza gdzie nowe dane przeczą starym. Jeden mail dotyka 10-15 stron.

- **Nie filing, lecz integracja.** Mail nie ląduje w jednym miejscu — rozchodzi się: profil klienta + ustalenia + next_action + log.
- **Każde twierdzenie z anchorem.** Skill zapisuje fakt tylko z kotwicą źródła «inbox/...». To `anchorGuard()` na poziomie zapisu.
- **Sprzeczność = sygnał, nie błąd.** Jeśli nowy mail przeczy staremu ustaleniu, mózg to oznacza, nie nadpisuje po cichu.

### 5.2 Query — pytasz, mózg syntetyzuje (i zapisuje odpowiedź)

Marek pyta („co ustaliliśmy z Outletem?"). Skill czyta `index.md`, wybiera 1-2 strony, syntetyzuje odpowiedź z cytatami. Kluczowy insight: **dobra odpowiedź wraca do wiki jako nowa strona**. Porównanie, analiza, znalezione powiązanie — nie giną w czacie, kumulują się jak źródła.

### 5.3 Lint — nocny health-check (= Open Loops Detector)

Nowa, sprzedawalna funkcja w cadence. Raz na noc skill lint sprawdza zdrowie wiki i zgłasza, co wymaga uwagi:

| Co sprawdza lint | Przykład dla konsultanta |
|---|---|
| Sprzeczności między stronami | Stawka 6,5k w ofercie vs 7k w profilu klienta |
| Przeterminowane twierdzenia | „Budżet do zatwierdzenia" sprzed 2 mies. |
| Sieroce strony (brak linków) | Klient bez żadnej historii ani next_action |
| Luki | Ustalono zakres, brak terminu — [DO UZUPEŁNIENIA] |
| Sugestie pytań | „Nie kontaktowałeś się z X od 31 dni — odnowić?" |

> **Dlaczego to przewaga (Open Loops Detector)**
> Ludzie porzucają bazy wiedzy, bo koszt utrzymania rośnie szybciej niż wartość. Model nie nudzi się i potrafi dotknąć 15 plików w jednym przebiegu. Mózg zostaje aktualny, bo koszt utrzymania ≈ zero. To technicznie ten sam mechanizm, który w warstwie produktu sprzedajemy jako Open Loops Detector — „Joris pilnuje, czego nie dowiozłeś" (patrz rozdz. 1.1).

---

## 6. Decyzja storage: kontekst, nie RAG

Rozstrzygnięcie, które v0.1 zostawiła otwarte. **Dla skali solo-konsultanta nie używamy bazy wektorowej.** Zamiast RAG (embeddingi + chunking + retrieval) stosujemy czysty kontekst nawigowany przez `index.md`.

### 6.1 Próg, który o tym decyduje

| Rozmiar wiedzy | Podejście | Dlaczego |
|---|---|---|
| < ~50–100k tokenów (~150-200 stron) | Kontekst (LLM-Wiki) | 100% niezawodność retrievalu, zero infrastruktury, globalne rozumowanie po całości |
| Miliony tokenów+ | RAG | Nie mieści się — retrieval to jedyny sposób na skalę |
| Pomiędzy / produkcja | Hybryda | Stały rdzeń w kontekście, dynamiczna reszta w RAG |

> **Gdzie leży FreelancerBrain**
> Baza klientów konsultanta to **kilka–kilkanaście tysięcy tokenów** — głęboko poniżej progu. RAG byłby tu czystym narzutem i obniżeniem niezawodności (zgubione chunki, semantyka pocięta przez chunking). **index.md to nie RAG** — nie robi matchowania wektorowego, tylko pozwala otworzyć mniej całych plików, gdy wiki rośnie.

### 6.2 Co to daje light-produktowi

- **Zero infrastruktury.** Brak pgvector, brak pipeline'u embeddingów, brak strojenia retrievalu. Godziny zamiast tygodni.
- **Niższy koszt.** Brak bazy do utrzymania = możliwa cena „kilka tys." i niski abonament.
- **Wyższa niezawodność.** Model widzi całą relację, nie sklejone fragmenty. Lepsze przy „podsumuj wszystko o kliencie X".
- **Rośnie z modelami.** Okna kontekstu 200k–1M+ tokenów podnoszą sufit tego podejścia z każdą generacją.

---

## 7. Bezpieczeństwo: dwa nowe zagrożenia z auto-ingestu

Auto-ingestujące wiki wprowadza dwa ryzyka, których nie było w statycznym uploadzie. Oba trzeba zaadresować strukturalnie.

### 7.1 Prompt injection przez źródło

> **Zagrożenie**
> Auto-ingest to powierzchnia ataku. Spreparowane źródło (np. mail „od klienta") może zawierać tekst sterujący modelem, który przetrwa do wiki i zatruje kolejne sesje.

Zabezpieczenia na poziomie skilla ingest:

- **Treść źródła to zawsze DANE, nigdy instrukcja.** Skill ingest traktuje zawartość `inbox/` jako materiał do streszczenia, nie jako polecenia. Egzekwowane w definicji skilla, nie w prompcie ad hoc.
- **Twardy podział źródło/wiki pomaga.** Skoro źródła są niemutowalne i oddzielone od mózgu, wstrzyknięta instrukcja nie ma jak „awansować" na zaufaną warstwę bez przejścia przez kontrolowany ingest.
- **Read-only domyślnie.** Nawet jeśli injection przejdzie, agent nie ma uprawnień do akcji nieodwracalnych — to osobny, jawny scope. Patrz 7.3.

### 7.2 Deduplikacja semantyczna

> **Zagrożenie**
> Czysty merge to nie poprawny merge. Dwa zapisy tego samego faktu różnymi słowami („ustalono ścieżkę B" vs „idziemy w opcję B") scalają się czysto i mózg ma duplikat — albo dwie wersje prawdy.

Rozwiązanie domyka model anchorów:

- **Grep po anchorze PRZED zapisem, nie po.** Skill ingest sprawdza, czy fakt z danym anchorem «źródło» już istnieje, zanim doda nową linię. Anchor staje się kluczem deduplikacji.
- **Identity, nie pozycja.** Wykrywanie sprzeczności opiera się na stabilnej tożsamości twierdzenia (cytat/anchor), nie na bliskości tekstu. Kolejność ingestu nie zmienia wyniku.
- **Append-only log.** `log.md` jest dopisywany linia po linii — przy sync chmurowym to eliminuje konflikty merge (każdy zapis to nowa linia, nic się nie nadpisuje).

### 7.3 Uprawnienia nad promptem

> **Twarda zasada**
> Prompt nigdy nie jest warstwą uprawnień. Zakładamy: jeśli agent COŚ potrafi, to to zrobi. Bezpieczeństwo = ograniczony scope kluczy, nie instrukcja. Akcje nieodwracalne (mail, faktura) zawsze za akceptem człowieka — skill generuje draft, nie wysyła.

---

## 8. Model danych

Encje są lekkie — nagłówki Markdown z polami, nie tabele SQL. Rozdzielone na źródła (`inbox`) i wiki (`brain`).

| Encja | Warstwa | Plik | Kto zapisuje |
|---|---|---|---|
| RawSource | źródło | `inbox/<data>-<typ>.txt` | Freelancer (wrzuca) |
| BusinessProfile | wiki | `brain/context/business.md` | Onboarding |
| Client | wiki | `brain/clients/<id>.md` | Skill ingest |
| Index | wiki | `brain/index.md` | Skill (auto) |
| Log | wiki | `brain/log.md` | Skill (append-only) |
| Skill | schemat | `skills/<name>.md` | My (szablon) |

### 8.1 Przykład: profil klienta (`brain/clients/outlet-pro.md`)

```
---
id: outlet-pro
status: active            # lead | active | paused | closed
rate_agreed: 6 500 zł     # z context/rates.md
next_action: czeka na termin startu  # [DO UZUPEŁNIENIA]
lifecycle: active         # draft|active|stale|contradicted
---

## Ustalenia (anchory)
- [2026-11] Zakres: audyt ofertowania  «inbox/2026-11-call.txt»
- [2026-11] Stawka 6 500 zł zatwierdzona  «inbox/2026-11-mail.txt»

## Historia
- 2026-11-28  Wysłana oferta v2  → log.md
```

> **Anchor = provenance + klucz dedup**
> Każde ustalenie ma znacznik źródła wskazujący nietknięty plik w `inbox/`. To jednocześnie provenance (skąd fakt) i klucz deduplikacji (czy już go mam). `anchorGuard()` nie pozwala stwierdzić faktu bez takiej kotwicy.

---

## 9. Przykładowe outputy

**Case:** Marek, solo-konsultant operacyjny. 6 klientów, ofertowanie ręczne, ustalenia giną w rozmowach. Po 15 min onboardingu mózg zna jego biznes, stawki i klientów.

### 9.1 Poranny brief (cadence)

> **☀️ Brief — wtorek, 10 czerwca**
> - **Dziś:** 1) Zalando Stock — raport Q4, termin jutro. 2) Outlet Pro — follow-up, 6 dni ciszy.
> - **Lint zgłasza:** Outlet Pro — brak terminu startu mimo zatwierdzonej oferty [DO UZUPEŁNIENIA].
> - **Ryzyko:** Stock-Hurt — 31 dni bez kontaktu. Draft re-engage gotowy do akceptu.

### 9.2 Draft oferty (skill: proposal)

> **Oferta → Outlet Pro (draft, do akceptu)**
> - **Zakres:** audyt ofertowania «inbox/2026-11-call.txt».
> - **Stawka:** 6 500 zł — z rates.md, nie wymyślona.
> - **[DO UZUPEŁNIENIA]:** termin startu — brak anchora, mózg nie zgaduje.

---

## 10. Roadmapa

| Faza | Czas | Zakres | Efekt |
|---|---|---|---|
| 0 · Prototyp | 1–2 tyg. | `inbox/`+`brain/`, skills ingest+proposal, onboarding ręczny, lokalnie | Działa dla Marka |
| 1 · Pętla | 2–3 tyg. | Query + lint, `index.md`+`log.md`, cadence nocna, routing modeli | Brief + lint same się generują |
| 2 · Connections | 2–3 tyg. | MCP Gmail+Kalendarz (read-only), guard injection | Mózg czyta realne dane |
| 3 · Self-serve | 3–4 tyg. | Web onboarding → eksport folderu do Drive, akcept w UI | Klient setuje się sam |
| 4 · Pakiety ICP | ciągłe | Gotowe paczki skills per ICP | Powtarzalny produkt |

### 10.1 Co czyni to powtarzalnym

- **Onboarding generuje 80% kontekstu.** Reszta to dopisanie klientów — minuty.
- **Pętla jest generyczna.** Ten sam ingest/query/lint działa dla każdego konsultanta; różni się tylko folder `brain/`.
- **Zero bazy.** Koszt krańcowy nowego klienta ≈ koszt onboardingu. To umożliwia cenę „kilka tys.".

### 10.2 Jakie dane potrzebne, jakich brakuje

| Potrzebne | Skąd | Status MVP |
|---|---|---|
| Profil, stawki, ton | Onboarding | ✅ generowane |
| Klienci + historia | `inbox` + ingest | 🟡 częściowo |
| Treść rozmów | Gmail / WhatsApp-export | 🟡 connection / upload |
| Sygnały churn | Metadane + log + lint | 🔴 faza 2 |

---

## 11. Pierwszy płatny krok i ekonomia

> **Rekomendowany pierwszy płatny projekt**
> „Setup Drugiego Mózgu" — pakiet startowy: onboarding + folder (`inbox/`+`brain/`) + skills ingest+proposal + poranny brief z lintem. Stała cena, tydzień, efekt już pierwszego ranka.
> **Dlaczego:** najniższy próg, natychmiastowa wartość, naturalny upsell do connections i pełnej cadence w abonamencie.

**Model przychodu:** jednorazowy setup (kilka tys. zł) + niski abonament za cadence/sync/connections. Upsell: paczki skills, integracje, WhatsApp live.

**Granica względem HyperHuman:** ceny i pakietowanie ustala HyperHuman osobno — ten dokument pokazuje logikę, nie cennik.

---

*Dokument roboczy v0.3. Zmiany vs v0.2: pozycjonowanie i granica LIGHT/PRO/Heavy, pięć funkcji LIGHT jako zakres MVP, Open Loops Detector jako warstwa produktowa lintu, most produkt↔architektura. Następny krok: szablony skills (ingest, proposal, lint) albo prototyp onboardingu w kodzie.*
