# Dreamsea - Portfolio Write-up

---

## 1. Problem — *What you were solving*

Every morning I'd wake from a vivid dream and immediately lose it — not because I didn't try to remember, but because the tools I reached for were wrong for the moment. Notes apps demanded full cognition; typing in the dark destroyed the fragile hypnopompic state I was trying to preserve. And even when I did capture something, I had no framework to do anything with it. The symbolic language of dreams — Jungian archetypes, Egyptian oneiromancy, Persian tradition — lived in books I'd read, not in any tool that could meet me at 3am and do the translation work.

---

## 🏗️ 2. Architecture — *How you built it*

### Product Scope

Dreamsea is a full iOS app — live on the App Store — built across 5 functional epics:

| Epic | Features |
| --- | --- |
| **Capture (The Threshold)** | Lock screen widget (WidgetKit) deep-links directly into recording mode; voice-first `AVFoundation` audio recording with a 5-min hard cap; offline queue with automatic retry on reconnection |
| **AI Generation (The Triad Engine)** | Gemini multimodal audio-to-text transcription (tuned for groggy, whispered speech); parallel generation of: dream title, poetic subtitle, 4 philosophy-specific interpretations (Jungian, Persian, Egyptian, Japanese), archetypal symbol extraction (3–7 per dream), and a **Gemini Imagen watercolor painting** per entry |
| **Dream Management (The Archive)** | Chronological dream library with watercolor thumbnails; inline audio playback with scrubber; editable transcript with one-tap **Regenerate** (re-runs the full AI pipeline on the corrected text); atomic **Merge** (combine 2+ recordings into one analysis); **Split** (divide one transcript at a cut-point into two separate dreams); native Share Sheet for image or full interpretation export |
| **Personalization & Analysis** | Custom waking-life context toggle (injects user's current situation into the interpretation prompt); preferred philosophy setting (persists as default tab); **Monthly Dream Theme** — server-side Gemini aggregation across all dreams in the month generating a 4-sentence psychological summary + a personalized first-person affirmation |
| **Education (Dream School)** | Dream Wiki with 20 expandable philosophy sections (4 traditions × 5 sections each: purpose of the human, how dreams serve, where dreams come from, how to interpret, how to integrate); all wiki content is also injected live into the AI interpretation context — the same text the user reads is what the model reasons from |

### 5-Layer Stack

Built in SwiftUI (iOS 26), with Gemini API as the intelligence layer and Supabase as the backend:

**Stack Layer Breakdown:**

| Layer | What's Here |
| --- | --- |
| **Model** | Google Gemini — multimodal (audio-to-text) + text generation + image generation (`Imagen`) |
| **Context** | Two-tier context injection: (1) the user's dream transcript `{TRANSCRIPT}`, (2) the full Dream Philosophy Wiki content `{WIKI}` — 5 curated sections per tradition — fetched from Supabase and injected per-philosophy at runtime |
| **Orchestration** | `GenerationOrchestrator.swift` — a sequential-then-parallel pipeline: audio → Gemini STT → transcription, then 8 parallel async calls (title, subtitle, 4 interpretations × philosophy, symbol extraction, watercolor image). Each result is persisted to Core Data + Supabase the moment it resolves, not when all complete. Retries up to 10× with exponential back-off |
| **Governance** | Dream quota (5 free / 33 paid per month via StoreKit 2), cost limiter on the Gemini account, audio deleted from cloud immediately post-transcription (never stored server-side), Row-Level Security on all Supabase tables |
| **Human** | Non-technical co-founder (Azin, licensed psychotherapist) edits AI prompts and wiki content live via a CMS (`nsso.me/dreamsea/prompts`) — no code deployment needed. Hardcoded fallback content compiled into the binary ensures the AI always has philosophy context even offline |

**Key Tools / APIs / Frameworks:**

- **Gemini API** (Google AI Swift SDK via SPM) — audio transcription, text generation, Imagen image generation
- **Supabase** — PostgreSQL backend with RLS, Supabase Storage for dream images, Edge Functions for server-side aggregation
- **WidgetKit + App Intents** — "Threshold Widget" on iOS lock screen; fires `RecordIntent` to deep-link directly into recording mode while half-asleep
- **AVFoundation** — microphone capture with 5-minute hard timeout
- **Core Data** — local persistence (chosen over SwiftData specifically for atomic transaction support in the Merge feature)
- **StoreKit 2** — auto-renewable subscription
- **CMS** (custom HTML/JS page on Vercel) — prompt and wiki management for the domain expert co-founder

**Data Flow:**

```
Lock screen widget tap
  → RecordIntent → App launches → AVFoundation records audio (local)
  → Audio uploaded to Supabase Storage
  → Gemini STT → transcription saved
  → Audio deleted from cloud
  → 8 parallel Gemini calls (title, subtitle, 4 interpretations, symbols, watercolor image)
  → Results persisted field-by-field as they arrive
  → Dream image stored in Supabase Storage, public URL saved
  → Monthly Aggregation: server-side Edge Function → Gemini → theme + affirmation
```

🔗 **Live App Store link:** [Dreamsea on the App Store](https://apps.apple.com/us/app/dreamsea/id6761101193)

---

## 🤔 3. Why This Approach — *Your reasoning*

The most obvious alternative was a RAG pipeline over a static dream symbol database — you'd embed symbols, retrieve similar entries, and pass them to the LLM. I rejected that because the use case isn't retrieval; it's *philosophical translation*. The quality of a Jungian interpretation depends not on finding matching symbols, but on the model reasoning through the dream within a coherent framework of depth psychology. The better choice was curated, philosophy-specific knowledge injected as structured context — the same prose the user reads in the Dream Wiki, fed to Gemini as the interpretive lens, so the AI and the app teach from exactly the same source. The single `{WIKI}` placeholder design also means a non-technical psychotherapist can update the AI's interpretive framework through a web CMS with no code deployment — which was the real unlock for maintaining quality without a full-time AI engineer.

---

## ⚖️ 4. Tradeoffs — *What you gave up*

- **Speed vs. depth:** The sequential-then-parallel orchestration means the user waits for transcription before any analysis starts. A faster path would stream analysis from the raw audio, but at the cost of interpretive accuracy — the transcription is the correctable source of truth every downstream call depends on, and that editing capability is architecturally essential.
- **Privacy vs. convenience:** Audio is permanently local-only; it uploads to Supabase Storage for transcription only, then is deleted immediately. This is a genuine privacy decision (voice recordings are biometric), but it means no server-side audio search, cross-device syncing of recordings, or future audio-based aggregation analysis.
- **Social deferred for trust:** Dream sharing (the "Dream with Friends" feed) is explicitly out of Phase 1 scope. The tradeoff is lower virality in exchange for building interpretive depth first — sharing a dream publicly changes what you record. Phase 1 earns private trust before asking for public exposure.
- **Governance gap:** The eval suite for prompt quality is informal — TestFlight with real recordings, no automated evals across the 8 prompt types. At 10× users the cost and quality variance in interpretation output becomes the primary risk. The next meaningful governance investment is a structured eval set (minimum ~30 dream transcripts with ground-truth interpretations per tradition) and observability on Gemini call failure rates per field.

---

## 🔗 5. Demo — *A live, clickable URL*

📱 [**Dreamsea — App Store**](https://apps.apple.com/us/app/dreamsea/id6761101193)

Available on iPhone. No password, no TestFlight — live production release.

---

## 🔧 6. What I Would Improve — *Honest self-assessment*

The biggest limitation right now is that the Gemini interpretation prompts are evaluated informally — I know they produce compelling output on *my* dreams, but I haven't stress-tested them against edge cases: very short recordings (< 20 seconds), non-English speech, or dreams with no clear symbolic content. The prompt fallback strategy (hardcoded defaults if Supabase is unreachable) protects against availability failure, but there's no quality floor — a poorly-transcribed whisper in the dark produces an interpretation with equal confidence to a clear, detailed recording. The next sprint would be adding a transcription quality gate: if the STT output is below a word-count threshold or Gemini flags it as unintelligible, surface a gentle re-record prompt rather than silently generating a low-quality analysis the user will read the next morning and not trust.