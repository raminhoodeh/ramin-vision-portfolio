# Mass Social Wisdom Agent - Portfolio Write-up

---

## 1. Problem — *What you were solving*

The knowledge I was accumulating across Instagram Reels, YouTube breakdowns, and screenshot-heavy carousel posts had no coherent home. Every session ended the same way: a WhatsApp thread full of dumped links, a camera roll bloated with screenshots of slides I had no time to read, and a vague plan to "go through them later" that never materialised. The existing tools — note-taking apps, bookmark managers, read-it-later services — treated every piece of content as a link to preserve, not knowledge to extract and organise. There was nothing that reached into the content itself, pulled the meaning out, and filed it somewhere structured and searchable without me spending the next hour doing it manually.

---

## 2. Architecture — *How you built it*

The system implements a seven-stage autonomous pipeline — Inspect, Route, Compose, Self-Assess, Categorise, Sort, Export — running inside a Flask server, triggered from a real-time dual-column web UI, and driven entirely by Google Gemini 2.5 Flash.

### 5-Layer Stack

| Layer | Implementation |
| --- | --- |
| **Model** | Google Gemini 2.5 Flash — handles OCR, composition, quality scoring, categorisation, and similarity sorting. One model doing five distinct reasoning tasks across the same pipeline run. |
| **Context** | System-level prompt engineering at each stage. Separate prompt profiles govern the standard composition pass vs. the lenient retry pass. The quality-assessment prompt is structured to return a single digit (1–5), eliminating parsing ambiguity. The categorisation prompt lists all eight categories verbatim and instructs the model to return only the category name. |
| **Orchestration** | Python threading: each extraction job runs as a background daemon thread with a shared in-memory job tracker (`jobs` dict). The Flask `/status/<job_id>` endpoint is polled by the frontend every two seconds via `EventSource`, streaming `log[]` and `live_items[]` as they accumulate in real time. A `stop_requested` flag allows mid-run cancellation. |
| **Governance** | Keyword override lists for Finance and Romantic Relationships bypass Gemini categorisation entirely for high-recall terms (e.g., `polymarket`, `kalshi`, `bitcoin`, `rizz`, `dating`). URL sanitisation strips Instagram tracking parameters (`igsh`, `si`, `utm_*`), unwraps login-redirect URLs (`/accounts/login/?next=`), and normalises `/reels/` to `/reel/` before any API call is made. Failed URLs are written to a `failed_urls_*.txt` file automatically for re-ingestion. A 4-second inter-URL delay and 3-second inter-slide delay manage Gemini Free Tier rate limits without manual intervention. |
| **Human** | The user pastes raw, unstructured text — a WhatsApp conversation, a Notion page, a wall of URLs with surrounding prose — into the left panel. The agent extracts, deduplicates, and processes all valid links without any pre-cleaning. The Scan folder provides the second input channel: drop screenshots, presentation slides, or chart images before triggering the run, and the agent OCR-s, composes, and categories them alongside URL-sourced content in the same output document. |

### Data Flow (end-to-end)

```
Raw text input (URLs + messy prose)
    │
    ▼
URL extraction via regex → deduplication → normalisation (tracking param strip, redirect unwrap)
    │
    ▼
Classification: instagram_reel / instagram_post / youtube / unknown
    │
    ├─ instagram_reel    → SociaVault transcript API + SociaVault post-info (caption)
    ├─ instagram_post    → post-info type resolution:
    │                        XDTGraphSidecar  → Gemini Vision OCR per slide + caption
    │                        XDTGraphVideo    → SociaVault transcript + caption
    │                        XDTGraphImage    → Gemini Vision OCR (single image) + caption
    ├─ youtube           → SociaVault YouTube transcript API
    └─ Scan/ folder      → Gemini Vision OCR (local image files)
    │
    ▼
compose_output() — Gemini fuses transcript + caption + OCR slides into cohesive prose
    │
    ▼
assess_output_quality() — Gemini returns 1–5 quality score
    │
    ├─ Score < 3 → compose_output(lenient=True) → re-score → keep higher-scoring result
    └─ Score ≥ 3 → proceed
    │
    ▼
categorise_content() — keyword overrides first, then Gemini reasoning → 1 of 8 categories
    │
    ▼
sort_items_by_similarity() — Gemini reorders items within each category by topic proximity
    │
    ▼
generate_docx() — structured .docx with H1 category headings, source links, separator rules
    │
    ▼
Download → Notion import
```

### Key Tools and APIs

- **Google Gemini 2.5 Flash** (`google-genai` SDK) — text generation and vision
- **SociaVault API** — Instagram transcript, Instagram post-info, YouTube transcript endpoints
- **Flask 3.0** — lightweight HTTP server and SSE-style polling endpoint
- **python-docx** — programmatic `.docx` generation with heading levels, font colours, and paragraph spacing
- **Pillow** — image loading for both local file OCR and in-memory CDN image decoding
- **Python `threading`** — background job execution with live log streaming

**GitHub:** [github.com/raminhoodeh/mass-social-wisdom-agent](https://github.com/raminhoodeh/mass-social-wisdom-agent)

---

## 3. Why This Approach — *Your reasoning*

The most obvious alternative was a RAG pipeline: embed every piece of content into a vector database and let the user query it semantically later. That approach was rejected because the use case is not retrieval — it is curation. The user wants a structured knowledge document after each session, not a searchable corpus to interrogate. A flat, category-sorted `.docx` that imports cleanly into Notion is more useful than a query interface for content the user has already watched. The second deliberate decision was to use a single model (Gemini 2.5 Flash) for all five reasoning tasks — OCR, composition, quality scoring, categorisation, and similarity sorting — rather than specialised models per task. At this scale and latency profile, context-switching between model providers adds operational overhead without meaningful accuracy gains. Gemini 2.5 Flash's multimodal capability means the same API call handles both text reasoning and image analysis, which eliminates an entire integration layer.

---

## 4. Tradeoffs — *What you gave up*

- **Statelessness over persistence.** The job tracker is an in-memory Python dictionary (`jobs = {}`). Every server restart clears all session state. This was a deliberate v1 choice: a database layer (SQLite, Supabase) was deferred because the target workflow is single-session extraction runs, not a longitudinal knowledge graph. The tradeoff is that a crash mid-run loses the job log and any already-processed items that hadn't been exported yet.
- **Gemini Free Tier rate-limit management via sleep, not queuing.** The 4-second inter-URL delay and 3-second inter-slide delay are hardcoded constants. At 10 URLs with multi-slide carousels, a session can take 5–8 minutes. A proper token-bucket or exponential-backoff queue would handle this more elegantly and scale to paid-tier RPM limits without code changes. The current implementation trades sophistication for zero configuration overhead.
- **No eval coverage for the self-assessment loop.** The quality-scoring function returns a 1–5 integer from a free-text Gemini response. The retry threshold is fixed at 3. There is no evaluation suite validating that the quality scores are internally consistent across content types, that the lenient retry reliably produces higher-scoring output, or that the "keep higher result" comparison logic is behaving as intended in edge cases. This is the most significant governance gap in v1.
- **Categorisation accuracy is bounded by eight fixed categories.** The category list (Finance, AI, Health, Film, Personal Branding, Conspiracy, Romantic Relationships, Other) reflects the specific content diet of the initial user. Content that spans categories (e.g., an AI-powered trading tool breakdown) defaults to the first keyword override that fires. There is no multi-label support and no confidence threshold — every item receives exactly one category regardless of ambiguity.

---

## 5. Demo — *A live, clickable URL*

**GitHub Repository (public):** [github.com/raminhoodeh/mass-social-wisdom-agent](https://github.com/raminhoodeh/mass-social-wisdom-agent)

The repository includes a `mock_demo_server.py` — a self-contained Flask server that replays a realistic extraction session with pre-baked log entries and sample output items, requiring no API keys. The `demo-animation.gif` in the README root shows a full end-to-end session: URL paste, real-time log streaming, quality score annotation, and the final `.docx` download. The production deployment configuration (Dockerfile, Cloud Run-compatible `PORT` environment variable binding) is included for reference.

---

## 6. What I Would Improve — *Honest self-assessment*

The self-assessment loop is the most intellectually interesting part of the system and also its least validated component. The quality scoring relies on Gemini evaluating its own output — a known reliability concern — and the eval suite consists of zero formal test cases. Before expanding the agent to a broader user base, the immediate priority would be building a labelled dataset of 40–60 extraction outputs with manually assigned quality scores (1–5) and ground-truth categories, then measuring how often the agent's self-assigned score agrees with the human score within one point. The second improvement would be replacing the hardcoded sleep-based rate-limit strategy with a proper request queue and exponential backoff, which would also unlock concurrent URL processing and cut session time by roughly 60–70 percent for large batches. The third gap is the `.docx` output format itself: while functional and Notion-compatible, it is a one-directional export with no metadata attached to each entry. Adding source type, processing timestamp, quality score, and word count per entry as document properties would make the output auditable and allow downstream filtering without re-running the agent.