# RazinFlix - Portfolio Write-up

---

## 1. Problem — What You Were Solving

I had been maintaining a personal film library as a spreadsheet for years — a flat list of titles, rough ratings, and half-remembered notes that was entirely useless the moment I wanted to find something to watch. The problem was not that a spreadsheet is the wrong tool for cataloguing; it is that cataloguing at any useful depth — descriptions, trailers, accurate metadata, sensible categorisation — is manual work that scales with library size and eventually stops happening. By the time the list hit a few hundred titles, it was stale, inconsistent, and had no interface. The gap was not a missing streaming app; it was the absence of a pipeline that could take a list of film titles and turn them into something you could actually navigate and discover within — without any human doing the enrichment work.

---

## 2. Architecture — How You Built It

### Ingestion Pipeline (4-API Parallel Execution)

**Batch Ingestion with Terminal Log UI**

The Add Film modal accepts a multi-film text input: a comma-separated or line-break-separated list of film titles, with optional year hints in the format `Film Title (2019)`. Each title is parsed into a `{ title, year }` pair before the pipeline executes. Films are processed sequentially rather than in parallel to respect API rate limits and prevent race conditions on the Supabase insert sequence.

During processing, the modal transitions from an input view to a terminal-style log panel: a monospace green-on-black display that streams a step-by-step log of exactly what each API is doing in real time — TMDB scan, Gemini synthesis, YouTube search, Vision scan, Supabase save. A CSS `@keyframes indeterminate` progress bar animates beneath the log. The visual design mirrors a CI/CD deployment terminal, making the wait feel like a system doing serious work rather than a spinner.

**The 4-API Pipeline**

When an admin types a film title into the Add Film modal, four external APIs fire in near-parallel inside a single Next.js API route (`/api/razinflix/add`):

**TMDB API**
Searches the TMDB movie database by title with optional year. If the primary release year yields no results, the route retries with ±1 year automatically before falling back — handling the common case where TMDB records a release year slightly differently from the cultural memory of the film. Returns: poster URL, IMDb vote average, release year, and TMDB overview text.

**Gemini 2.5 Flash (Description)**
Takes the TMDB overview as background context and rewrites it as a 2–3 sentence atmospheric, emotionally resonant plot description. The prompt explicitly forbids: including the title or year, using quotes or bold formatting, and returning introductory text — producing a clean, display-ready string. If the model wraps the response in quotation marks despite the instruction, the route strips them programmatically before saving.

**Gemini 2.5 Flash (Category)**
A second, independent Gemini call taxonomically assigns the film to one of 14 curated category strings. The taxonomy was designed to replace TMDB's generic genre tags (Action, Drama, Thriller) with opinionated, atmosphere-forward labels: "Critically-Acclaimed Mind-Bending Sci-Fi," "Surreal & Left-of-Center Cinema," "Gritty Heist & Crime Thrillers." The prompt enforces strict list membership — the model is instructed to return only the exact string from the allowed list, and the route applies a substring fallback match before defaulting to a catch-all if the response is non-conforming.

**YouTube Data API v3 (Trailer)**
Constructs a search query in the format `[title] [year] official trailer -review -reaction -full -gameplay` — the negative terms are deliberate: they suppress the most common sources of wrong results (review channels, reaction videos, full-film uploads) and bias the top result toward official distributor uploads. Returns an 11-character YouTube video ID stored as `trailer_key`.

**Google Cloud Vision API (Poster Validation)**
After the TMDB poster URL is resolved, the Vision API's `TEXT_DETECTION` feature scans the poster image and returns all text found in the artwork. The route then checks whether at least one word of the film title longer than two characters appears in the extracted text. If it does, the poster is considered verified. If not — indicating either a blank placeholder, a foreign-language localisation, or a stylised design where the title is rendered as an image rather than text — the `_posterVerified` flag is returned as `false` to the client for surfacing in the admin UI. Placeholder URLs ([via.placeholder.com](http://via.placeholder.com/)) are excluded from Vision processing.

**Result:** One text input → a fully enriched, described, categorised, trailer-linked, poster-verified database record committed to Supabase in a single insert, with optimistic state prepended to the React film array without a page reload.

**Duplicate Resolver (Migration-Time)**

The original spreadsheet-to-database migration used a Python `resolve_dups.py` script employing Levenshtein distance fuzzing and token overlap scoring to detect near-identical entries (e.g. `Bladerunner 2049` vs `Blade Runner 2049`). For each detected pair, the script automatically scrubs the lower-quality record based on a data completeness score — number of populated fields, description length, poster presence — preserving the richer record.

---

### Self-Healing Database Layer

**Update Mode** is a dedicated view mode (`viewMode === 'update_mode'`) that re-sorts the entire film grid to prioritise records with missing or broken assets. On activation, the frontend initiates a batched background sweep across every film's poster URL: for each URL, a hidden `Image` element is constructed with a 4-second timeout; if the image fails to load or hangs, the film's ID is added to a `brokenPosters` Set. The Update Mode sort comparator places films with missing or broken posters first, followed by films with null `trailer_key` values, making the data gap queue immediately visible without any server-side scan.

**Autonomous Category Repair** (`scripts/cleanup-categories.mjs`) is a standalone Node script that reads the full film database, identifies any record whose category string is not in the 14-item canonical list (orphaned strings from previous taxonomy iterations, "Recently Added" placeholders, "Uncategorized" fallbacks, or categories with fewer than 5 films — indicating a taxonomy gap), and fires a Gemini 2.5 Flash call for each affected record to re-classify it. The script writes the corrected category directly to Supabase and rate-limits itself to 800ms between records to respect the Gemini API quota. It is designed to be run without downtime — reads and writes to the live table — and produces a terminal log of every migration made.

**Bulk Migration Pipeline** (`scripts/migrate-razinflix.ts`) handled the one-time data ingestion from the original `films.json` flat file into Supabase, inserting in batches of 50 records and clearing the table first to guarantee a clean slate. It was used once at project initialisation and is retained as a reproducible migration artifact.

---

### Recommendations Engine (Client-Side Jaccard Similarity)

When a film detail modal opens, a `useEffect` hook scores every other film in the loaded dataset against the currently selected film using a three-factor weighted algorithm:

- **Director match** (+50 points) — the strongest signal; two films by the same director are the highest-confidence recommendation
- **Category intersection** (+10 points per shared category) — rewards films that share the curated taxonomy labels
- **Description keyword Jaccard overlap** (+2 points per shared token) — strips stop-words, tokenises descriptions, and scores on token overlap between the selected film's description and each candidate

The top 15 films by total score are rendered as a horizontal scroll carousel below the trailer — equivalent to Netflix's "More Like This" row. Navigation between recommended films is supported inline without closing the modal.

---

### Netflix-Fidelity Frontend

**Hero Billboard:** The page loads 5 randomly selected films with trailers and renders an autoplay YouTube embed at `scale-[1.35]` with `opacity-60`, creating a full-bleed cinematic backdrop. Bi-directional gradient overlays (bottom-to-top and left-to-right) render the film title and description legibly over the video. Desktop: clicking anywhere on the hero background toggles volume, mirroring native Netflix behaviour. Mobile: the same click event opens the film detail modal; swipe gestures (delta > 50px) cycle through the featured films.

**Category Carousels:** The category grouping logic runs as a `useMemo` computation over the full film array. Categories with fewer than 5 films are dissolved and their films merged into the "Visually Striking Emotional Dramas" catch-all, preventing thin rows from degrading the grid. The "Recently Added" category is always sorted to the top of the page. Japanese Anime receives special-case treatment: because films may have been assigned a second category, the grouping logic explicitly checks for "Japanese Anime" membership and prioritises it over the primary category string, ensuring the Anime row always surfaces.

**Alternative View Modes:** The navbar dropdown exposes five view modes beyond Category: alphabetical (A–Z), newest release date, highest IMDb rating, lowest IMDb rating, and Update Mode. Switching view modes collapses the category carousels and renders a flat responsive grid (2 → 6 columns at breakpoints), with rating parsing that correctly handles "N/A" and "TBD" strings by sorting them to the bottom.

**Full-Text Search:** The search bar filters across title, director, AND description simultaneously — not just titles. Entering a director's name surfaces every film by that person across all categories. The search state switches the view to a flat "Search Results" category row regardless of the active view mode, and clears back to category view on input clear.

**Director and Category Click-to-Search:** In the film detail modal, clicking the director's name or clicking any category tag dispatches a search for that value, programmatically populating the search bar and switching the grid to Search Results mode — enabling one-tap exploration of a director's full filmography or all films in a category.

**Keyboard Navigation:** The modal supports full keyboard control: `Escape` closes, `ArrowLeft` / `ArrowRight` navigate between films in the active context list. Scroll carousel auto-scrolls to the active film card using `scrollIntoView({ behavior: 'smooth', inline: 'center' })`.

**Admin Layer:** All write operations (add, edit, delete) are gated behind a password prompt (`window.prompt`) checked against a `NEXT_PUBLIC_ADMIN_PASSWORD` environment variable. The edit modal exposes a constrained category `<select>` — only the 14 canonical values plus "Uncategorized" — and the backend API independently rejects non-conforming payloads. Destructive deletes execute a client-side recursive state-tree sweep across all relevant state slices without a page reload.

**Poster Upload to Supabase Storage:** In the film edit modal, admins can upload a replacement poster image directly. The upload routes through `/api/razinflix/update` using `multipart/form-data`, stores the file in the `razinflix_posters` Supabase Storage bucket, and replaces the TMDB poster URL with the public Supabase URL in the database — persisting the correction permanently rather than re-fetching from TMDB.

**Inline Film Navigation Without Modal Close:** In both the film detail modal and the Similar Films carousel, navigating to a new film updates the modal content in place — no close/open cycle. The carousel auto-scrolls to the newly active card and the trailer iframe re-mounts with the new `trailer_key`.

---

### Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | Next.js 16 (App Router), TypeScript |
| Styling | Tailwind CSS 4 |
| Database | Supabase Postgres |
| Poster Storage | Supabase Storage (`razinflix_posters` bucket) |
| AI Description & Taxonomy | Google Gemini 2.5 Flash |
| Poster Validation | Google Cloud Vision API (TEXT_DETECTION) |
| Trailer Resolution | YouTube Data API v3 |
| Film Metadata | TMDB API |

---

## 3. Why This Approach — My Reasoning

The decision to override TMDB's genre taxonomy entirely was the most deliberate design choice in the project. TMDB's genre tags (Action, Drama, Thriller, etc.) are accurate but artistically inert — they describe what a film contains mechanically, not what it feels like to watch it. A personal streaming platform curated around taste needs a taxonomy that encodes aesthetic intent. "Surreal & Left-of-Center Cinema" communicates something about why you would choose to watch a film in that category that "Drama" does not. Gemini 2.5 Flash, given a film title, year, and its own atmospheric description as context, reliably assigns films to the correct curated category because the category names themselves are descriptive enough to act as a zero-shot prompt — no examples needed.

The Google Cloud Vision OCR step is the least obvious design decision and the one most people would omit. The problem it solves is specific: TMDB serves localised poster variants based on region, and their default API response sometimes returns a foreign-language poster for non-English-speaking markets rather than the English-language version. A poster where the title is written in Arabic or Korean is not useful in a platform built around English discovery. Rather than attempting to detect locale headers or filter by ISO language codes — which would require understanding TMDB's region system — OCR directly answers the question of whether the English title is physically on the artwork. It is a pixel-level truth check, not a metadata inference.

All four API calls in the ingestion pipeline run in parallel by design: the API route fires `fetch` for TMDB, constructs the Gemini calls after receiving the TMDB result (since they depend on the title and overview), and fires the YouTube and Vision calls independently. The Gemini calls are the latency bottleneck — two sequential model calls on the hot path. This was accepted over a batched request approach because Gemini Flash's cold-start latency is low enough that the sequential model calls complete within the visual duration of the terminal log animation in the Add Film modal, making the wait feel purposeful rather than slow.

---

## 4. Tradeoffs — What You Gave Up

**Vision API OCR false-negative rate on stylised posters.** The title-word matching heuristic — "does any word longer than two characters from the title appear in the OCR output?" — is effective for most posters but breaks on films with highly stylised typography where the title is rendered as a graphic element rather than machine-readable text. For example, a film where the title logo is an elaborate custom letterform will return no OCR text even when the English title is clearly visible to a human viewer. The `_posterVerified: false` flag is surfaced in the admin log but does not block the record from being saved — the poster is kept and the gap is flagged for manual review. A more robust approach would use Vision's `LOGO_DETECTION` or `OBJECT_LOCALIZATION` features alongside text detection, but the incremental accuracy gain was not worth the added API complexity for a personal library tool.

**The ingestion pipeline has no idempotency guard.** If the same film title is submitted twice, two records are created. There is no deduplication check at the API route level — no lookup against existing titles before insert. For a single-admin personal platform, this is acceptable; the duplicate resolver script (`resolve_dups.py`) using Levenshtein distance and token overlap scoring was built to handle the initial migration's duplicates and is not integrated into the live Add Film flow. Adding a pre-insert fuzzy-match query would eliminate the gap but would add latency to every add operation and introduce its own false-positive risk (blocking legitimate entries for films with similar titles).

**No user accounts or access control beyond a shared password.** The admin layer is a `window.prompt` checking a hardcoded environment variable. This is appropriate for a single-owner personal platform but is not extensible to multi-user or role-based access without a full auth layer. Supabase Row Level Security is enabled with a public read policy and service-role-key writes — there is no RLS policy for authenticated write access because the anticipated access pattern is one owner, one environment.

**Client-side similarity engine with no feedback loop.** The Jaccard + director + category scoring is a deterministic algorithm with fixed weights that does not improve over time and does not incorporate any user behaviour signal (watches, skips, session duration). The director weight (+50) was calibrated heuristically — it produces the right intuition (two Christopher Nolan films should always appear in each other's recommendations) but will systematically over-recommend within a director's filmography even when the films are stylistically dissimilar. A learned embedding model over the Gemini-generated descriptions would produce more nuanced recommendations, but the infrastructure cost for a personal library did not justify it.

---

## 5. Demo — A Live, Clickable URL

The platform is deployed and accessible at:

[**nsso.me/](https://nsso.me/ramin)film/razinflix** — navigate to the RazinFlix section from the dashboard

The Add Film flow, category carousels, hero billboard, and film detail modals are all accessible on the live deployment.

---

## 6. What I Would Improve — Honest Self-Assessment

The most significant architectural gap is that the ingestion pipeline is not observable after the fact. The terminal log in the Add Film modal shows real-time pipeline execution during the add operation, but once the modal closes that data is gone. There is no per-record audit trail of which APIs succeeded, what the Vision API returned, or what category Gemini originally assigned before any manual corrections. This makes debugging data quality issues retroactive — you can see that a record is wrong in Update Mode, but you cannot see why it ended up that way. A simple `ingestion_log` JSONB column on the `razinflix_films` table, written at insert time with the raw API responses and confidence flags, would make every data quality decision auditable without adding any latency to the pipeline.

The category repair script (`cleanup-categories.mjs`) also has no run-once guard. If executed multiple times, it will re-classify every film in an orphaned or thin category on each run — potentially moving films that were manually corrected back to Gemini's preferred category. An `auto_categorized: boolean` flag on the schema, set to `false` after any manual category edit, would allow the script to skip human-reviewed records and run safely on a schedule.