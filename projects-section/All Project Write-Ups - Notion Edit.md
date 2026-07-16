# All Project Write-Ups - Notion Edit

Combined project and Thoughts-page case-study write-ups for editing in Notion. Generated from Markdown files in `projects-section` plus missing Thoughts-page case-study data from `src/data/projects.ts`.

## Contents

- [nsso](#nsso)
- [Dreamsea](#dreamsea)
- [Qadam](#qadam)
- [24Seven](#24seven)
- [RazinFlix](#razinflix)
- [Mass Social Wisdom Agent](#mass-social-wisdom-agent)
- [AI Costs Dashboard](#ai-costs-dashboard)
- [RAG Pipeline](#rag-pipeline)
- [AI-Native Product OS](#ai-native-product-os)

---

<a id="nsso"></a>

# nsso

Source: `projects-section/nsso - Portfolio Write-Up.md`

---

## 1. Problem — What You Were Solving

When we meet someone new, one of the first questions we are asked is: "so... what do you do?" Career and identity are so interlinked that what you do often becomes who you are. Most people have learned to answer with a title, an employer, or a category. It compresses years into a sentence and moves the conversation forward.

But that compression is starting to cost people opportunities. Hobbies are becoming careers, careers are expanding into side projects, and employers increasingly ask candidates what they have built outside of work. The world is starting to reward the full picture of a person, not just the title. The full picture has become very hard to show.

The average person's identity is spread across too many platforms. LinkedIn holds the professional. Instagram holds the personality. A portfolio holds the work. A link-in-bio holds the links. Each one shows a different angle, but none of them show how the parts connect. Somewhere in that scatter, the most interesting thing disappears: the synergy between someone's skills, story, and what makes them distinctly them.

With all this new opportunity also comes paralysis. Too much choice about who you could be. Too much noise to hear your own signal. Link-in-bio tools were a start, but a list of links is still just a list of links. It does not help someone understand the relevance of everything you have done, and it does not help you see it clearly yourself.

That is the product opportunity nsso was built around. Think Shopify, but the product is you: a surface where building your profile becomes an act of self-clarification. Bringing all the parts together helps you answer the question nsso was born from: what makes you, you?

The hard part was not the profile. It was building an AI agent that could read your live profile, write directly into it, and make self-articulation feel like a conversation rather than a form.

---

## 2. Architecture — How You Built It

### Model

The model layer of nsso is **Deity**, the AI profile coach that helps users understand, write, and improve their public identity. Deity uses Gemini 2.0 Flash for the main chatbot experience: profile coaching, streamed conversation, tool calling, and structured profile suggestions.

nsso also uses Gemini Embedding 001 to create 768-dimensional embeddings through two separate passes: one for the incoming query and one for the user's live profile text. Those embeddings let a Supabase RPC re-rank retrieved knowledge chunks by a weighted combination of query similarity and profile similarity, so two different users asking the same question can receive differently ordered results.

For profile-building requests, Deity uses Gemini's streaming function-calling interface. It emits structured tool calls mid-stream, such as `update_bio`, `add_experience`, and `add_project`. The server converts those into Review Mode confirmation cards before any write reaches Supabase.

The knowledge corpus is stored in `pgvector` inside the same Supabase instance as the user profiles. Retrieval is therefore a single authenticated SQL call rather than a cross-service request to a separate vector database. A separate AI feature also uses Gemini 2.0 Flash to rewrite profile sections, and the storefront uses structured sales psychology prompts to help users generate landing-page copy for products and services.

### Context

The context layer is what makes nsso personal, relevant, and useful. Deity does not answer from a blank chat window. It receives the user's live profile as context: name, headline, bio, work experiences, qualifications, projects, products, links, and contact methods. The agent speaks to the actual person in front of it, not an imagined user.

Alongside the profile, nsso uses a custom knowledge database built from curated CSVs and Markdown files: investors, grants, accelerators, AI tools, job boards, courses, services, members' clubs, business knowledge, pitch deck structures, films, and creative inspiration.

For commercial pages, the context also includes sales psychology structures: headline hooks, pain-benefit framing, value stacking, testimonials, and conversion-oriented landing page sections. nsso's AI features therefore draw from three forms of context: who the user is, what nsso knows externally, and how the user is trying to present or sell themselves.

### Orchestration

The orchestration layer is how Deity turns conversation into action. Every incoming message is first passed through dual-mode intent arbitration before the model is given any tool access.

If the message signals profile intent, the tool schema is injected and Deity can emit function calls. If it signals a knowledge request, the tool schema is withheld and the system runs a RAG retrieval pass instead. Keeping write tools and search tools on separate execution paths prevents the model from confusing a knowledge question with a profile update.

When profile intent is confirmed, Deity's tool calls are parsed server-side and surfaced to the user as Review Mode confirmation cards. Each card shows the field being changed, the current value, and the proposed new value. Deity becomes more than a chatbot: it can orchestrate profile completion, while the user still controls what becomes public.

### Governance

The governance layer exists because nsso deals with public identity, money, and AI-generated self-presentation.

Users can embed PayPal HTML directly on their profiles to transact products and services. Rather than accepting this HTML unsanitised or blocking it outright, nsso treats the embed field as a governed security surface. Each submission is parsed, disallowed tags and attributes are stripped, unsafe script patterns are checked, and external domains are validated against a PayPal allowlist. The UI surfaces the sanitisation result as scanning, secure, or unsafe before the embed is saved.

Deity also has profile-integrity rules. It should not invent credentials, companies, job titles, projects, or achievements that are not present in the user's actual profile. The product tries to prevent users from using Deity to lie about themselves, publish abusive profile content, or create harmful commercial claims. The goal is not only to keep the app technically safe, but to protect the trustworthiness of the identity people publish through nsso.

### Human

The human layer is the product judgment behind nsso. The product was shaped by being the user: needing one place that could hold work, writing, products, links, identity, and proof without flattening them into a CV or scattering them across platforms.

That judgment shaped the core sections:

- **Links** consolidate the user's digital footprint.
- **Experiences** and **Qualifications** become the proof layer.
- **Projects** show what someone has built beyond job titles.
- **Products & Services** make the profile actionable: an hour of time, a course, a piece of work, or a service can sit beside the evidence that explains why it is worth buying.

The decision to combine profile context, external knowledge, and sales psychology came from the same place: people do not just need a nicer page. They need help understanding how to present themselves to different audiences. The visual language, liquid glass design system, public profile structure, and monetisation layer all serve the same brief: nsso should make someone feel clearer, more future-proofed, and more proud to share themselves with the world.

---

## 3. Why This Approach — My Reasoning

**Streaming tool calls over a request-response loop.** The obvious implementation for a profile-coaching agent is a standard chat interface: the user sends a message, the model replies with a suggestion, and the user manually applies it. That keeps the model and database decoupled, but it also means the agent can never actually do anything. Deity uses Gemini's streaming function-calling interface so each model turn can emit structured profile changes mid-stream. The server intercepts those tool calls and converts them into reviewable confirmation cards before any write reaches Supabase.

**Dual-mode intent arbitration before tool routing.** Every incoming message is classified before the model is given tool access. If the message signals profile intent, the tool schema is injected. If it signals a knowledge request, the tool schema is withheld and retrieval runs instead. Giving an LLM both a search tool and a write tool on every turn creates ambiguity; separate execution paths reduce the surface area for misrouted tool calls.

**Sanitised HTML embeds as a governed security surface.** Allowing PayPal buttons on public profiles means the platform accepts user-authored HTML. Rather than blocking embeds entirely or accepting them unsanitised, nsso parses the HTML, strips disallowed tags and attributes, checks unsafe script patterns, and validates that external domains match a PayPal allowlist. That keeps monetisation usable while treating the embed field as an explicit attack surface.

**Identity operating system over link-in-bio.** The defining product choice was to treat nsso as an identity operating system, not a prettier link page. If the promise is "all of you, all in one place," the product cannot stop at links; it has to support structured proof, public storytelling, products and services, contact routes, and guided self-description in the same surface.

---

## 4. Tradeoffs — What You Gave Up

**No social layer.** nsso has no feeds, followers, or engagement mechanics. That probably makes growth harder, because social features are a fast distribution lever. But social mechanics change what people are willing to say about themselves. If someone thinks their profile might surface in a feed, they start optimising for performance rather than accuracy. nsso chose integrity of identity over virality.

**Review Mode over full autonomy.** An agent that applies changes without confirmation would feel faster and more impressive. But a wrong change to a live public profile is a trust problem that takes one second to create and much longer to undo. The review card adds friction deliberately. That friction is the product.

**Gemini Flash over a larger-context model.** Flash is fast and cheap, which matters for a conversational product where latency is felt immediately. But its context window is not large enough to scan the entire nsso knowledge corpus in a single pass for richer cross-cutting synthesis. The product trades depth-of-corpus reasoning for responsiveness.

**Fixed profile structure over unlimited flexibility.** Users cannot invent every possible section type or fully rearrange the product architecture. That can frustrate power users, but it is intentional. Links, Experiences, Qualifications, Projects, and Products & Services reflect a considered view of what future-proofing a professional identity requires. Full structural freedom would produce inconsistent profiles and weaken the coherence that makes nsso feel intentional.

---

## 5. Demo — A Live, Clickable URL

[**nsso.me**](https://nsso.me/) — landing page with product trailer, sign-up, username claim flow, and Deity guest access.

[**nsso.me/ramin**](https://nsso.me/ramin) — live example profile showing the identity surface, projects, product listings, links, and public profile structure.

---

## 6. What I Would Improve — Honest Self-Assessment

The intent arbitration system is the single most fragile component and the one I would address first. The current keyword switch is a lookup table dressed up as logic. It works for clear inputs — "add my experience at Google" is clearly profile intent; "what courses should I take?" is clearly knowledge intent — but it fails on messages that carry signals from both modes. The correct fix is a two-class classifier trained on labelled nsso queries, producing a probability score: above 0.75 is profile mode, below 0.25 is knowledge mode, and the uncertain middle triggers disambiguation before tools are declared.

The second gap is observability. Deity executes multiple downstream operations per turn: RAG retrieval, re-ranking, link verification, tool-call parsing, and action delivery. None of these are instrumented deeply enough. There is no structured event log showing what fraction of turns produce tool calls, what fraction are accepted in Review Mode, or what fraction of knowledge queries return results above the confidence threshold. A per-turn event log would make the agent debuggable instead of a black box.

The third gap is the CRO schema on user sales pages. The field set — headline, tagline, value proposition, benefits, testimonials — was designed from established conversion frameworks, but no A/B test on this specific user base has validated which combinations actually drive conversion. The next version should instrument sales pages and let data close that gap. Meta Pixel, Hotjar, Google Analytics, and other analytics integrations would help users understand how visitors interact with their profile and product pages.

---

<a id="dreamsea"></a>

# Dreamsea

Source: `projects-section/Dreamsea - Portfolio Write-up.md`

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

---

<a id="qadam"></a>

# Qadam

Source: `projects-section/Qadam - Portfolio Write-Up.md`

---

## A Readable Macro-Intelligence Control Room

---

## 1. Problem - What You Were Solving

Qadam began from a specific frustration with retail trading systems: they often chase indicators, copy other people's trades, or hide behind black-box automation. They rarely explain why a trade exists, what evidence supports it, what would invalidate it, or whether the system is learning from mistakes.

The deeper product challenge was not simply "build a trading bot." It was to make the whole chain readable: world event, source evidence, hypothesis, challenge, risk gate, paper order, result, postmortem, and learning update. A Fund Manager should be able to inspect why Qadam is allowed to act, blocked, degraded, or waiting.

Qadam compresses the operating discipline of a small macro hedge fund into a local-first machine. Instead of hiring a COO, analyst, strategist, quant reviewer, risk officer, and execution desk, Qadam turns those roles into software agents and deterministic gates: a Python orchestrator, local Research Analyst, Strategy Lead, Head of Quant / quantum-classical review, Signal Integrity, Risk Agent, Execution Policy, paper execution rails, and a protected cockpit.

Its trading inspiration is high-conviction, catalyst-driven decision-making: do not trade random noise, do not overtrade, do not confuse a story with an edge, and do not act unless the market appears to be mispricing something real. Qadam exists to test whether that philosophy can become a repeatable, observable, logged system.

---

## 2. Architecture - How You Built It

Qadam's product surface is the protected dashboard at `qadam.trade`. The dashboard is not just a trading screen. It is a readable control room designed to show the full path from evidence to action to learning, while keeping execution authority visibly locked behind paper-only runtime gates.

The cockpit follows a deliberate sequence:

1. **Login / Access Gate**
   The user enters through `qadam.trade`, signs in, and only allowlisted Fund Managers reach the cockpit.

2. **Safety Status**
   Safety comes before intelligence. The first operating question is: "Can Qadam do anything dangerous right now?" The dashboard answers that with paper mode, live capital off, and order authority behind runtime gates.

3. **Overview / Mission Control**
   Mission Control orients the Fund Manager without dumping raw ledgers. It summarizes fund state, source state, strategy posture, team/agent state, hypotheses, paper account status, and learning-loop maturity.

4. **Source Intelligence Network**
   This layer explains what Qadam is observing: conflict, physical/OSINT, macro, market, narrative, and supplemental technical sources. It also shows which feeds are healthy, degraded, stale, or unavailable.

5. **Strategy Universe + Reasoning**
   This is where Qadam's thinking lives. It separates worldview priors, evidence packets, research goals, hypotheses, Strategy Lead challenges, and Head of Quant / quantum-classical review. The key rule is explicit: reasoning can explain and challenge, but it cannot execute.

6. **Trade Lifecycle**
   The trades view turns cognition into lifecycle state: observed signals, trade ideas, blocked trades, staged paper orders, submitted paper orders, open positions, closed paper trades, and postmortems. Candidate identity and order lineage belong here, because a paper trade only matters if its origin is traceable.

7. **Paper Account & Trade State**
   This layer shows whether the paper account is proving anything: balance, P&L, open exposure, closed trades, drawdown, proof ledger, maturity, and whether postmortems are complete.

8. **Operations / Control Plane**
   This is the machinery layer: Python COO, local LLM, frontier LLM, Head of Quant, Risk Agent, Execution Policy, source plumbing, Telegram, governance, event logs, and diagnostics. It explains why Qadam is allowed, blocked, degraded, or waiting.

9. **Backtesting & Replay Lab**
   The final layer closes the loop. It compares past evidence, paper outcomes, postmortems, strategy updates, edge memory, and replayable source history so Qadam can learn without silently mutating strategy.

As of the cockpit snapshot on June 27, 2026, Qadam is in paper mode with 29/37 sources online, 387 research goals, 5 hypotheses, 1 candidate, 2 open positions, 78 closed paper trades, and live capital disabled. The 30-day edge hunt has 5 candidate relationships under observation and 0 confirmed edges.

That is the correct posture: candidate edge is not the same thing as proven edge.

---

## 3. Why This Approach - Your Reasoning

The simplest mental model is:

```text
World happens
-> Qadam observes
-> Qadam filters sources
-> Qadam forms hypotheses
-> Qadam challenges them
-> Qadam checks risk and authority
-> Qadam paper-trades only if gates pass
-> Qadam logs the outcome
-> Qadam learns
-> Fund Managers review the whole chain
```

That sequence matters because the obvious wrong approach would be another signal generator: ingest a few feeds, ask an LLM for a thesis, and send alerts when the answer sounds plausible. Qadam was designed against that failure mode. A dramatic story means nothing unless source evidence, market confirmation, risk, and invalidation are clear.

The dashboard also avoids the opposite failure mode: dumping raw operational data without product judgment. Mission Control gives orientation. Source Intelligence explains evidence. Strategy + Reasoning shows cognition. Trade Lifecycle shows order lineage. Paper Account shows proof state. Operations explains authority. Replay shows learning.

The architecture separates cognition and authority. The Python COO coordinates. The local Research Analyst compresses noise. The Strategy Lead challenges the thesis. The Head of Quant / quantum-classical review layer challenges ambiguity and non-linear structure. Signal Integrity, Risk Agent, Execution Policy, idempotency, and Alpaca Paper gates decide whether action is allowed.

AI and quantum-classical review are leverage, not authority. They can compress, challenge, and detect patterns, but they do not override deterministic gates.

---

## 4. Tradeoffs - What You Gave Up

**Safety comes first, even when it costs attention.** The dashboard spends prime real estate on paper mode, live-capital boundaries, and runtime gates. That makes the product less flashy, but it answers the most important question before anything else: whether Qadam can do anything dangerous.

**No forced trades.** A quiet day is acceptable if there is no qualified setup. This reduces action and demo drama, but it protects the proof claim: Qadam should only act when a lineaged setup survives evidence, market context, source quality, risk, and execution gates.

**Fail closed by design.** Missing evidence, stale data, degraded sources, unclear authority, or duplicate order risk block action instead of permitting it. That creates more "waiting" and "blocked" states, but it keeps uncertainty from becoming false confidence.

**Reasoning is visibly separated from execution.** Strategy and quant review can explain, challenge, and recommend, but they cannot execute. This reduces autonomy, but it protects the system from letting speculative reasoning override safety.

**Paper before live.** The paper phase limits capital deployment and observable alpha, but a system that cannot prove discipline in paper mode should not be trusted with live capital. Qadam's current proof boundary is intentionally paper-level, not live-capital proof.

**Local-first sovereignty increases operational burden.** Keeping memory, logs, comments, postmortems, evidence, source history, and runtime state under local control improves replayability and ownership, but it adds setup, storage, maintenance, and observability work that a hosted SaaS path would hide.

---

## 5. Demo - A Live, Clickable URL

[qadam.trade](http://qadam.trade)

The public proof is intentionally product-level rather than live-capital proof. Qadam is presented as a catalyst-driven macro-intelligence control room in paper validation: access gate, safety status, Mission Control, Source Intelligence Network, Strategy + Reasoning, Trade Lifecycle, Paper Account, Operations / Control Plane, Telegram summaries, and Backtesting & Replay.

The point is not to show "trade alerts." The point is to show what Qadam saw, what evidence mattered, what the system believed, what challenged that belief, what blocked or allowed a paper action, what happened afterward, and what was learned.

---

## 6. What I Would Improve - Honest Self-Assessment

The next improvement is to make the evidence-to-action timeline even more explicit. A Fund Manager should be able to click any paper trade or blocked idea and see the full chain: source observations, evidence packet, hypothesis, challenge, risk gate, execution policy, paper order state, postmortem, and learning update.

The second improvement is a stricter edge-proof framework. The 30-day edge hunt currently has candidate relationships under observation, not confirmed edge. The cockpit should make that distinction impossible to miss: candidate, watchlisted, qualified, confirmed, and retired should be separate states with clear evidence thresholds.

The third improvement is stronger replay and postmortem ergonomics. Qadam already treats learning as something earned through outcomes, postmortems, replay, and edge memory. The interface should make it easier to compare prior evidence, similar setups, strategy changes, and outcome quality without silently mutating the strategy.

The fourth improvement is Fund Manager governance. Comments, strategy review, kill-switch visibility, future improvement notes, and review history should sit around the system without contaminating individual paper-trade proof samples. That would let humans shape strategy while keeping each trade's evidence trail clean.

The most important long-term improvement is packaging Qadam as an installable local-first fund OS: a system that can eventually be tailored to a Fund Manager's machine, data sources, strategy universe, and governance style without becoming a black box.

---

<a id="24seven"></a>

# 24Seven

Source: `projects-section/24Seven - Portfolio Write-up.md`

---

## 1. Problem - What You Were Solving

I was approached by a small boutique concierge business that had already digitised its offering. Bookings for yachts, villas, and experiences across Ibiza and Marbella lived in a proper Shopify-based catalogue, browsable through their own iOS and Android apps. The infrastructure was there. But their actual clients, high-net-worth people used to being served rather than searching, were not engaging with it that way. They wanted to text. A WhatsApp message along the lines of "something in Marbella next week, sleeps ten, a yacht if you can" was how they naturally reached out, the same way they would speak to a real concierge.

The trouble was that a text thread alone could not do the job either. You cannot send someone ten property links over WhatsApp and call that a menu. Clients still needed to see what was actually available: photos, pricing, capacity, and the detail that turns "something in Marbella" into an actual decision. The business was stuck between two half-solutions: an app with a browsable catalogue nobody wanted to browse, and a chat channel clients loved that had no way of showing them anything.

What they wanted, and what I was brought in to build, was both at once: the ease of ordering by conversation, with a visual menu and cart sitting behind it. I took their existing app and codebase and put a Gemini Flash concierge engine inside it.

---

## 2. Architecture - How You Built It

### Model

The concierge is powered by Google Gemini 2.5 Flash, called in its native JSON output mode. I chose Flash because the app it was going into was already live and fast, and a booking chat that hesitates for a few seconds before replying breaks the feeling of speaking to a real concierge. JSON-native output mattered just as much as speed. Rather than parsing freeform text and hoping the model happened to mention the right product names, Gemini returns a structured object containing a message and a list of recommended product handles, which the app renders directly as a carousel of real catalogue items. A second, lighter call to Gemini 2.0 Flash handles smaller per-product booking messages, generating a contextual enquiry from a product's details and whatever dates the client picked.

### Context

The client's existing Shopify catalogue is the model's whole world. On every conversation, the full Storefront catalogue, up to 250 products across Ibiza, Marbella, and a growing Dubai selection, is pulled via a GraphQL query and compressed down to the essentials: handle, title, tags, shortened description, price, and collection. That compressed catalogue, plus the running chat history serialised as plain text, is sent to Gemini on every turn. I deliberately fed the model the entire catalogue rather than retrieving a filtered subset, because a client's request rarely fits one clean category. Someone asking for a yacht in Ibiza and a villa in Marbella the same week needs the model reasoning across the whole inventory at once, not a narrowed slice of it.

### Orchestration

Underneath the chat, the app still runs on the client's existing Expo and React Native codebase, so the orchestration work was about wiring a new AI layer into an app that already worked, not starting over. A conversation runs through Gemini for planning and product linking, and once a client is ready, a second Gemini call condenses the whole conversation into a clean, readable booking brief. That brief becomes the payload for a WhatsApp deep link straight to the human concierge's number. Chat state lives in a small local store persisted on the device, so a client can close the app mid-planning and pick the conversation back up later without losing anything. For the Dubai expansion, which needed to launch ahead of full Shopify onboarding, I built a mock data layer that clones the existing Ibiza collections and relabels them, so Dubai could exist as a real, browsable destination in the app immediately, even though the AI concierge itself cannot yet see or recommend Dubai inventory until it is properly onboarded into Shopify.

### Governance

Because the model is speaking on behalf of a real concierge business to real paying clients, the prompt carries hard constraints rather than suggestions. It is told explicitly never to reference a product that is not in the catalogue it was given, and to always return valid JSON with nothing else wrapped around it. There is also strict prompting to keep a reserved and professional tone and avoid emojis entirely. There is no server-side session either; the entire conversational memory is just the serialised history block sent with each call. That keeps the app simple, but it also means the model's discipline in following those prompt constraints is the only thing standing between a client and a hallucinated product.

### Human

The AI never gets to close a sale. Every planning conversation ends the same way: a confirm booking on WhatsApp button that hands the finished brief to a real concierge agent's WhatsApp number. That was a deliberate line I drew early on, given who the client is. A high-net-worth guest booking a yacht in Ibiza is not looking for a chatbot to confirm their trip; they are looking for the same white-glove service they would get from a phone call, just reached through a faster front door. The AI's job is to make that front door effortless. Closing the booking stays human.

---

## 3. Why This Approach - Your Reasoning

The client did not need a new app, and they definitely did not need me to convince their clients to start browsing a catalogue they had already shown no interest in browsing. The obvious move given the problem, high-net-worth guests who wanted to text rather than search, was to meet them inside the chat channel they were already using, and let the model do the work of turning a loose WhatsApp-style request into a visual, bookable answer. That is why the concierge is a layer inside their existing app rather than a separate product: the catalogue, the booking flow, and the brand were already right. What was missing was a way to talk to it.

The next real decision was how the model should see the catalogue. The obvious alternative was a standard RAG setup: embed the products, retrieve the top few matches by similarity, and only show those to the model. I ruled this out on purpose. At 250 products, the catalogue is small enough that injecting the whole thing costs far less than standing up a vector database, and it avoids a specific failure mode that matters a lot for this client's guests: someone asking for "a yacht in Ibiza and a villa in Marbella the same week" needs the model reasoning across the entire inventory at once, not just whatever narrow slice a similarity search happened to retrieve. Full injection was the boring choice, but it was the one that could not quietly miss half of a compound request.

The last decision was to make Gemini return structured JSON rather than a normal chat reply. A concierge chat that is just freeform text still leaves someone squinting at a wall of prose trying to picture a yacht. Forcing the model to return a message plus a list of exact product handles meant the app could always render real, clickable product cards from the response, not a hopeful guess at parsing them out of a paragraph. It also made failure visible: if the JSON does not parse, that is a loud, catchable error instead of a silent mismatch between what the model said and what got shown to a paying client.

---

## 4. Tradeoffs - What You Gave Up

The first tradeoff was catalog injection over a leaner retrieval step, and it is the right call for where the product is today. Sending Gemini the entire compressed catalogue on every message means the AI Concierge can reason across every restaurant, villa, car, and private jet in the inventory at once, rather than guessing which slice of the catalogue a request falls into. At a few hundred products, that is a real advantage: a compound request like a villa and a yacht in the same week gets answered properly instead of half-missed. It is a choice that will need revisiting once the catalogue grows past roughly 500 products, but for a catalogue this size, full injection is simpler to reason about and more reliable than a retrieval layer built before it is actually needed.

Second, I chose not to give the concierge any server-side memory, which is the right shape for a single-session planning tool bolted onto an existing app. Chat history is serialised on the client and replayed with every call, so a member can close the app mid-plan and reopen it exactly where they left off, with no backend to build or maintain. That is the right trade for getting this feature live fast and keeping it cheap to run. The absence of a stored history only becomes a real cost once the business wants to study what members are asking for over time, and that is a problem worth solving once there is a track record to learn from, not before.

Third, I shipped without a formal evaluation suite behind the AI Concierge, and that was the right call for getting a first version of this feature in front of real clients quickly. The prompt instructs Gemini never to reference a product outside the real catalogue, and enforcing that through instruction alone was fast to build and good enough to prove clients actually wanted a chat-based ordering experience before investing in test infrastructure. Building an eval suite before knowing whether the feature would be used would have been effort spent in the wrong place. It is the right next investment now that itineraries are being generated for real, paying clients, not a gap that should have been closed on day one.

---

## 5. Demo - A Live, Clickable URL

**App Store:** [24Seven Concierge on the App Store](https://apps.apple.com/us/app/24seven-concierge/id6663954162)

Live on the App Store. Browse the catalogue, and use the AI Concierge bar at the bottom of every screen to create your itinerary.

---

## 6. What I Would Improve - Honest Self-Assessment

The most concrete next investment is the evaluation suite the tradeoffs above deferred, now that there is real usage to justify building it. Today the only signal that Gemini is performing well is human observation, with no automated coverage of the failure modes that actually matter: a hallucinated product that is not in the catalogue, an itinerary that quietly misses a date conflict, or a malformed response when the catalogue JSON runs long. The plan is a suite of roughly 30 to 50 test cases split across three failure types: out-of-catalog references, multi-destination constraint satisfaction, and graceful handling when Gemini returns invalid JSON despite the structured-output instruction.

The second improvement is closing the gap at the end of the WhatsApp handoff. Every AI-generated itinerary currently ends the same way: a message to a human agent, with no async slot reservation, no price lock, and no structured booking intake beyond free text. A member who finishes planning at 2am gets no acknowledgment until a human reads WhatsApp the next morning. A Shopify checkout integration that can at minimum capture a structured hold or enquiry against specific product variants would turn that final step into an actual booking record instead of a prose message.

---

<a id="razinflix"></a>

# RazinFlix

Source: `projects-section/RazinFlix - Portfolio-Write-up.md`

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

---

<a id="mass-social-wisdom-agent"></a>

# Mass Social Wisdom Agent

Sources:
- `projects-section/Mass Social Wisdom Agent - Portfolio Write-up.md`
- `thoughts-section/case-study-write-ups/Mass Social Wisdom Agent - Portfolio Write-up.md`

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

---

<a id="ai-costs-dashboard"></a>

# AI Costs Dashboard

Source: `src/data/projects.ts / Thoughts page case-study data`

---

## A provider-agnostic Python tool for metering LLM calls, normalising spend, enforcing budgets, and routing tasks to the cheapest model that still clears the eval bar.

**Tag:** AI cost governance

### Quick Reference

- **Metering:** Append-only usage events by product, feature, provider, model, cost, latency, and status
- **Routing:** Cheapest model that clears cached eval threshold; conservative escalation otherwise
- **Proof:** 13 local unit tests passed

### Architecture Chips

- **Model:** No generation model in the core; it governs whichever provider/model your product calls
- **Context:** Usage events, pricing registry, cached eval scores, product budgets, and task/model metadata
- **Orchestration:** Meter records calls, router selects candidates, CLI seeds/reports/routes, dashboard reads Store
- **Governance:** Budget alerts, eval thresholds, conservative fallback, latency/status logging, and auditable spend rollups
- **Human:** Product judgment sets quality thresholds, eval design, budget limits, and acceptable cost/quality tradeoffs

---

## 1. Problem - What You Were Solving

AI product cost usually becomes visible too late. A team ships useful model calls across several products, then the bill arrives split across Google, OpenAI, Anthropic, or another provider with no clean answer to the product question: which feature created the spend, which model was used, and whether that model was necessary.

The second problem is routing discipline. Without an eval-gated rule, teams often default to one familiar model per task. That means easy summarisation jobs can be run on unnecessarily expensive frontier models, while harder structured-output jobs may silently use a cheap model that does not meet the product quality bar.

The product opportunity was to turn AI spend from an invoice problem into a product-control surface: meter every call, normalise cost by product and feature, cache eval scores per task/model pair, and choose the cheapest model that is good enough before the call happens.

The tool is deliberately standalone and provider-agnostic. It is not wired into private products in the repo; it is the reusable core that can be dropped into products such as nsso, Dreamsea, 24Seven, or any AI feature that needs cost and quality to be governed together.

---

## 2. Architecture - How You Built It

### Model

There is no generation model inside the core - the package is provider-agnostic and governs whichever model your product already calls. The core Meter object wraps pricing, storage, routing, budgets, and reporting behind one small product-facing API, and model choice is treated as a decision the router makes rather than something hard-coded per product. The stack underneath is Python, SQLite, an argparse CLI, editable JSON pricing, unittest coverage, and an optional Streamlit/Pandas dashboard. There is no model SDK dependency in the core, because products call their own providers and the tool only meters, routes, and reports around those calls.

### Context

The context layer is the Store, a local SQLite database by default with three tables: usage_events, eval_scores, and budgets. usage_events is append-only and records timestamp, product, feature, task_type, provider, model, input tokens, output tokens, computed cost, latency, and status. eval_scores caches quality scores by task_type and model so a routing decision never has to wait on a fresh eval run. budgets stores product-level limits and alert thresholds. Sitting next to the Store is the pricing layer, which loads provider and model rates from ai_costs_dashboard/pricing.json and estimates cost from input and output tokens - normalising Google, Anthropic, OpenAI, or any future provider into the same reporting model, while keeping pricing editable since rates change often.

### Orchestration

The Meter records every call as it happens, the router picks the model for the next one, and the CLI gives the whole loop a working operational surface through aicd seed-demo, report, route, and budget. The demo command seeds eval scores for tasks like summarise and extract-json, records usage across dreamsea, 24seven, and nsso, and prints spend by product, so the governance loop can be exercised end to end without ever connecting a real provider account. The dashboard.py surface is a Streamlit reader over that same Store - showing total spend, product count, models in use, spend by product, spend by model, spend by feature, budget progress, and cached eval scores. It is intentionally a thin observability layer over the append-only usage store, not a second source of truth.

### Governance

The router is itself the main governance mechanism: it sorts candidate models from cheapest to most expensive for the expected token profile, picks the first one whose cached eval score clears the threshold, and escalates to the best-scoring candidate if none clears. If no eval data exists at all, it falls back to the priciest model as a proxy for capability rather than silently choosing cheap and unsafe. Every usage event, budget alert, and eval threshold lands in the same auditable store, so a spend rollup can always be traced back to a specific product, feature, and model. The package is also built for a clean upgrade path without breaking that governance model - the schema is shaped so a Postgres or Supabase adapter can replace the Store without changing the Meter API, and the public roadmap names provider-dashboard imports, per-user cost attribution, and a hosted Next.js cockpit as the next layers of oversight.

### Human

Product judgment still sets the terms the system runs on: the quality threshold a model has to clear for a given task, the design of the evals that produce that score, the budget limit per product, and what counts as an acceptable cost/quality tradeoff in the first place. The tool does not try to automate that judgment away - it gives it somewhere to live as data, so the same judgment gets applied consistently on every call instead of being re-decided by whoever happens to be looking at the bill that week.

---

## 3. Why This Approach - Your Reasoning

The important product choice is that routing is eval-gated, not cost-only. A cheap model only wins if it clears the product quality threshold for that task. That preserves the business benefit of cost reduction without turning governance into silent quality degradation.

Eval scores are cached rather than computed during every route call. That keeps routing fast, deterministic, and cheap. The product team can run evals on its own schedule, then let production code use those scores as a decision table.

The tool starts as a library rather than a hosted SaaS dashboard because the first job is instrumentation. Product teams need a small Meter they can import at the point of model use, not another external dashboard that still depends on clean events being sent into it.

SQLite is a pragmatic default. It keeps the repo installable in minutes, makes tests deterministic, and proves the schema before a team pays the operational cost of a shared database. For portfolio purposes, that matters: the product value is the governance pattern, not cloud complexity.

The Streamlit dashboard is intentionally secondary. The durable surface is the event model and routing logic; the dashboard is a quick way to inspect it. That keeps the architecture honest and makes the hosted cockpit a future presentation layer rather than the core product.

---

## 4. Tradeoffs - What You Gave Up

The first tradeoff is SQLite as the default store instead of a production-grade database. That makes the repo installable in minutes and keeps every test deterministic, but it is not the right store for a multi-product team with high-volume traffic, multiple environments, user-level attribution, and long retention needs. The schema is shaped so a Postgres or Supabase adapter can replace it later without changing the Meter API, but that migration has not happened yet.

The second tradeoff is a bundled, editable pricing table instead of a live pricing feed. Keeping pricing.json as a flat file means there is no dependency on a provider billing API and the numbers stay easy to inspect and override, but it also means the reported spend is only as accurate as however recently a team updated that file - a model price change that is not reflected in pricing.json quietly produces a stale cost figure.

The third tradeoff is trusting the router to whatever eval scores it has been given, and defaulting to the most expensive model when it has none. That conservative fallback avoids the worse failure mode of silently picking a cheap, unproven model, but it means a team that has not invested in evals yet ends up paying frontier prices by default instead of saving money. The tool makes evaluation operational, but it does not replace the work of designing good evals in the first place.

---

## 5. Demo / Proof - A Live, Clickable URL

- [GitHub](https://github.com/raminhoodeh/ai-costs-dashboard)

The public GitHub repository includes the Python package, README, editable pricing registry, CLI, Streamlit dashboard, demo script, tests, pyproject metadata, and MIT license.

The local test suite was run against the attached codebase and passed 13 tests covering pricing load/estimation, unknown model handling, router decisions, budget alerts, eval-score upserts, spend rollups, invalid dimensions, and since filters.

The demo script proves the core behavior: summarise routes to a cheap model that clears the eval threshold, extract-json skips cheaper models that fail and moves to the cheapest model that passes, then usage is recorded and reported by product.

The package exposes an installable CLI through the aicd command, with seed-demo, report, route, and budget subcommands.

The README is explicit about honest scope: this is a standalone reusable core, not a private-product integration pretending to be live telemetry.

---

## 6. What I Would Improve - Honest Self-Assessment

The tradeoffs above point directly at what is next. Replacing SQLite with a Postgres or Supabase Store adapter would resolve the first tradeoff without giving up the speed that made local development easy - multiple products and environments could write to the same governed cost ledger without changing the Meter API.

Provider import would close the gap the pricing tradeoff creates. Pulling historical usage straight from Google, OpenAI, and Anthropic billing dashboards would keep spend accurate even when pricing.json falls behind, and would make the tool useful before every product has instrumented its own Meter calls.

The router dependence on whatever eval scores it is given - the third tradeoff - is also the clearest place to strengthen the Governance layer. Richer eval metadata, such as eval version, dataset name, sample size, date run, owner, and regression status, would turn a single cached score into something closer to real model governance, rather than a routing decision that looks disciplined without being auditable.

The dashboard itself should grow past reporting spend and start doing the Human layer actual job: connecting cost to outcomes. Cost per successful task, cost per user journey, cost per accepted AI action, latency by feature, failure rate by provider, and drift after model changes would show not just what was spent, but whether it was worth it.

The hosted cockpit should eventually replace the Streamlit dashboard for public-facing use - but only once the library has proven the event model and routing decisions in real product traffic, the same library-before-SaaS sequencing laid out in Why This Approach above.

---

## Asset Request

Needs hosted dashboard screenshot, routing-decision diagram, and provider-import roadmap visual.

---

<a id="rag-pipeline"></a>

# RAG Pipeline

Source: `src/data/projects.ts / Thoughts page case-study data`

---

## A zero-dependency Python RAG layer for ingesting, chunking, embedding, storing, retrieving, and packing cited context across product namespaces.

**Tag:** Reusable context infrastructure

### Quick Reference

- **Ingestion:** Heading-aware chunking, idempotent content hashes, metadata, and namespaces
- **Retrieval:** Offline HashingEmbedder, Gemini production embedder, SQLite and Supabase/pgvector stores
- **Proof:** 14 local unit tests passed

### Architecture Chips

- **Model:** HashingEmbedder for offline demos; Gemini text-embedding-004 for production embeddings
- **Context:** Namespaced source text, chunks, metadata, embeddings, content hashes, and citation tags
- **Orchestration:** Ingest, chunk, embed, upsert, query, filter, rank, context-pack, then inject cited context
- **Governance:** Idempotent ingestion, namespace isolation, metadata filters, citations, and future retrieval evals
- **Human:** Corpus curation decides which sources deserve authority and which product namespace can retrieve them

---

## 1. Problem — What You Were Solving

Every AI product eventually needs product-specific memory. Dreamsea needs dream interpretation material. nsso needs profile and identity context. Qadam needs financial research notes. 24Seven needs travel and catalogue knowledge. Rebuilding chunk, embed, store, retrieve, and prompt-inject logic for every product creates duplicated plumbing and inconsistent retrieval quality.

The deeper product problem is authority. AI systems are only useful when they know which sources they are allowed to trust, which product namespace they are answering inside, and which retrieved chunks shaped the answer. One-off prompts and copy-pasted context cannot provide that discipline.

The opportunity was a shared ingestion-to-retrieval layer: add a source once, tag it with a namespace, and let multiple products query the right context without polluting each other. A shared namespace can carry reusable knowledge, while product namespaces preserve isolation.

The public repo is deliberately standalone. It is not pretending to be wired into private products; it is the reusable context layer extracted from the repeated need to build RAG infrastructure across several AI products.

---

## 2. Architecture - How You Built It

### Model

Unified RAG Pipeline is a Python 3.9+ package with a zero-dependency core, an offline default, and a production path for Gemini embeddings plus Supabase/pgvector. It exposes a Pipeline object that ties chunking, embedding, vector storage, retrieval, and context packing together. Each chunk is embedded through a pluggable embedder. HashingEmbedder is the offline default: deterministic feature hashing with L2 normalisation, no API key, no network, and reproducible tests. GeminiEmbedder uses text-embedding-004 for production and can report embedding token usage to a sink such as AI Costs Dashboard.

### Context

Ingestion starts with Pipeline.ingest(text, namespace, source_id). Text is split by a heading-aware chunker that keeps Markdown headings with their bodies, size-bounds each section, adds overlap, and tries to break on sentence or whitespace boundaries instead of cutting mid-word. The store interface has two implementations. SQLiteVectorStore stores JSON embeddings locally and performs brute-force cosine search in pure Python, which is enough for local development and modest corpora. SupabaseStore targets pgvector through a match_documents RPC, ivfflat cosine index, and the schema in supabase/schema.sql. Retrieval is namespace-scoped: Pipeline.query embeds the query, searches the selected namespaces, applies optional metadata filters, ranks by cosine score, and returns Hit objects with namespace, source_id, content, score, and metadata.

### Orchestration

Idempotency is built into the data model. Every chunk gets a content_hash and the store enforces uniqueness on namespace plus content_hash. Re-ingesting the same source becomes a no-op, so scheduled ingestion can run without duplicating near-identical chunks and weakening retrieval quality. context_pack is the prompt-injection boundary: it retrieves hits, greedily packs chunks under a token budget, and prefixes each chunk with a citation tag such as [dreamsea:jung-water]. That makes the context block attributable before it enters the generation prompt. The CLI exposes the whole workflow as urag ingest, query, namespaces, and stats.

### Governance

Namespace isolation and idempotent ingestion together form the pipeline's governance backbone. A chunk tagged for one product's namespace cannot silently leak into another product's retrieval results, and the content_hash uniqueness constraint stops scheduled re-ingestion from quietly duplicating near-identical chunks and degrading retrieval quality over time. Citations are enforced structurally rather than left to convention: every packed chunk carries the namespace and source_id it was ingested under, so a generation prompt can always be traced back to the source that shaped it. The offline demo exists partly to prove this governance holds - it runs three checks end to end: one source added once and queried across namespaces, product namespaces that do not pollute each other, and re-ingesting the same source that is correctly treated as a no-op.

### Human

The human layer is whoever decides what belongs in a namespace and which sources are trustworthy enough to shape another product's answers. The pipeline enforces isolation and idempotency mechanically, but it does not decide that a Dreamsea source belongs in the shared namespace, or that a given piece of research is credible enough to feed Qadam's corpus. Those are curation calls made once, at ingestion time, and the architecture is built to respect that judgment consistently afterward - every chunk carries the namespace and source_id it was assigned, so the trust decision made at ingestion is never silently overridden downstream.

---

## 3. Why This Approach - Your Reasoning

The most important product choice is namespaces. A shared RAG layer is only useful if different products can reuse infrastructure without sharing every source by default. Namespace scoping gives each product its own corpus while still allowing a shared knowledge layer.

The offline HashingEmbedder is not pretending to be production semantic retrieval. It exists so the package can be installed, tested, and demonstrated without keys, network access, or provider spend. That lowers adoption friction and makes the architecture inspectable.

The production path is intentionally pluggable rather than hard-coded. Gemini embeddings and Supabase/pgvector are supported, but the Pipeline interface can accept another embedder or store if a product later needs OpenAI embeddings, a different vector database, or a hosted retrieval service.

Idempotent ingestion is treated as a first-class product feature because retrieval systems degrade quietly when duplicate chunks accumulate. The content-hash key makes repeated ingestion operationally safe and reduces the maintenance burden on teams that sync sources on a schedule.

Citations are included in the context pack because a RAG pipeline should not just retrieve; it should preserve source accountability. The model prompt can then carry attributable context instead of anonymous pasted text.

---

## 4. Tradeoffs - What You Gave Up

The first tradeoff is the zero-dependency SQLite path's brute-force cosine search. It is clear and reliable for demos or modest corpora, but it is not the right retrieval engine for high-volume production search.

The second tradeoff is the HashingEmbedder. It makes tests deterministic and offline, but it cannot match the semantic quality of a production embedding model - it is a development default, not a claim of state-of-the-art retrieval.

Third, the current retrieval layer is vector-only. The roadmap correctly calls for reranking, MMR diversity, hybrid keyword/vector search, and incremental re-embedding when embedding models change.

Fourth, the context pack uses a simple greedy token budget approximation. That is enough to create prompt-ready context, but a mature product would need more precise token accounting, stronger source diversity, and task-specific packing rules.

Finally, namespaces prevent obvious corpus pollution, but they do not solve source authority by themselves. A real product still needs curation rules, freshness policies, deletion workflows, and evaluations for retrieval quality.

---

## 5. Demo / Proof - A Live, Clickable URL

- [GitHub](https://github.com/raminhoodeh/unified-rag-pipeline)

The public GitHub repository includes README, package source, CLI, examples, Supabase schema, architecture diagram, tests, pyproject metadata, and MIT license.

The local test suite was run against the cloned repository and passed 14 tests covering chunking, deterministic embeddings, L2 normalisation, relevance ranking, idempotent ingestion, namespace isolation, context-pack budgets, SQLite store idempotency, and cosine ranking.

The offline demo shows Dreamsea, shared, and 24Seven namespaces; re-ingesting the same Dreamsea source is skipped; querying dreamsea plus shared excludes the 24Seven travel source; context_pack returns cited chunks.

The production path is documented through GeminiEmbedder, SupabaseStore, and supabase/schema.sql, which defines the pgvector table, cosine index, and match_documents RPC expected by the store.

The README explicitly connects the pipeline to the AI Costs Dashboard by noting that GeminiEmbedder can report embedding spend, making the two tools part of a small shared backend platform.

---

## 6. What I Would Improve - Honest Self-Assessment

The first improvement is reranking and MMR diversity so retrieved context is not only similar but also varied and useful under a limited prompt budget.

The second improvement is hybrid search. Keyword and vector retrieval together would improve exact-name, identifier, and quote-heavy queries where embeddings alone can miss important terms.

The pipeline needs a retrieval evaluation harness: labelled queries, expected source chunks, precision/recall, citation coverage, hallucination-resistance tests, and regression runs when chunking or embedding settings change.

Incremental re-embedding should become explicit product behavior. When the embedding model changes, the system needs to know which chunks are stale, which namespaces are affected, and what cost the re-embedding job will create.

The context trace should become visual in the portfolio: query, namespaces searched, hits returned, chunks packed, citations injected, and answer generated. That would make the invisible context layer legible to non-engineering visitors.

---

## Asset Request

Needs architecture diagram crop, retrieval trace visual, and context-pack screenshot.

---

<a id="ai-native-product-os"></a>

# AI-Native Product OS

Source: `projects-section/ai-native-product-os-ramins-ai-product-management-thesis.md`

---

<aside>

**What is an AI Product Manager?**

An AI Product Manager is someone who uses AI to research, design, and build AI-native features - every single day.

That person is the architect of AI-native products. They start with *why this, why now*, and they validate a real use case before they write a line of anything. They design things like trust, cost efficiency, and defensibility into the product from day one, not as an afterthought.

They know how to evaluate models, balance infrastructure costs, and spot the scaling liabilities that will eat their margin in six months. They architect agentic flows, guardrails, and feedback loops - context, governance, and orchestration - directly into production systems. And they lead cross-functional teams through a kind of uncertainty that would make a traditional PM seize up.

</aside>

---

### 1. Context - *The operating system broke*

For over a decade, product teams ran a linear pipeline - **Idea → Design → Concept → Alpha/Beta → Live** - because the material was deterministic. You could specify behaviour, build it, QA it, and trust it to repeat. That process was a masterpiece of risk management.

Then the physics changed.

Large language models are not deterministic. They are **probabilistic** - same prompt, different output. Nobody, including the researchers who built them, can fully predict what the model will say before it says it. That one property - *probabilistic, not deterministic* - pulls the thread on every assumption the old pipeline was built on:

- A PRD cannot fully specify "correct" for a probabilistic system.
- Stage-gates cannot protect you when the model updates underneath you mid-sprint.
- Manual QA cannot scale when the failure modes are hallucination, prompt injection, and cost runaway - not regressions in a login form.
- "Ship" is no longer a finish line. It is the part of the loop where learning is most expensive if you stop moving.

The old process was not wrong. It was the right tool for deterministic material. The material changed. The process had to change with it - not as a preference, but as a physical consequence of what we are now building on top of.

---

### 2. Architecture - *The 5-Layer Stack the Loop runs on*

The AI-Native Product OS replaces the linear pipeline with a loop: **Talk → Decide → Build → Observe → Iterate**. The Loop is measured in hours, not quarters. It is not a productivity framework - it is the shape probabilistic material forces on any honest process.

The Loop runs on a **5-Layer Stack**:

| **Layer** | **What it is** | **Changes how fast** |
| --- | --- | --- |
| **Model** | The raw intelligence - GPT, Claude, Gemini. The fuel. | Fastest (months) |
| **Context** | Everything the model needs to act like a teammate: your company, product, users, voice, strategy. | Medium |
| **Orchestration** | Agents, MCPs, workflow wiring - the substrate that makes the Loop physically possible. | Medium |
| **Governance** | Evals, guardrails, observability, fallbacks, audit trails. The line between a demo and a product. | Slow |
| **Human** | Vision, empathy, taste, communication, judgment. The only layer that directs the rest. | Barely ever |

**Verb-to-layer mapping (canonical):**

- **Talk** - Human + Context. Asking, pulling on context, shaping what the model can see.
- **Decide** - Human + Governance. Making a judgment call against a standard of what's good.
- **Build** - Model + Orchestration. The model generates; orchestration makes it reach your data and tools.
- **Observe** - Governance. Measuring output against an eval set.
- **Iterate** - All five at once. Feeding what you learned back into the Context Layer so the next loop runs richer.

The Stack does not change. Only what sits inside each layer changes. That is what makes it durable - a cabinet that holds for the rest of your career, not a toolkit that decays in six months.

---

### 3. Why This Approach - *Four consequences, one property*

The Stack takes the shape it does because of one property: **outputs are probabilistic, not deterministic.** Everything else is a consequence of that single fact.

Four consequences fall out of it - each one maps directly to a layer of the Stack:

| **Consequence** | **What it forces** | **Layer** |
| --- | --- | --- |
| **One** | You can't prompt-and-hope. You have to understand the model and load your context. | Model + Context |
| **Two** | Probabilistic systems need loops, not straight lines. | Orchestration |
| **Three** | Probabilistic systems need guardrails and evals, not hope. | Governance |
| **Four** | Probabilistic systems change what being a professional means. | Human |

The alternative was to keep sprinkling AI on top of the old linear process - to build a faster horse. That approach treats AI as a shortcut on top of an existing workflow, not as a material with different physics. It produces impressive demos that do not survive contact with production. The OS rejects that approach not for ideological reasons, but because it does not match the material.

The old world valued **alignment, documentation, checklists, coordination, single source of truth, consensus, risk management**. These were the right values for deterministic software.

The new world values **decision velocity, prototypes, evals, orchestration, living systems, taste, intelligence management**. These are the right values for probabilistic software. The old values are not wrong - the new ones build upstairs from them.

---

### 4. Tradeoffs - *What this OS consciously gives up*

- **Speed over exhaustive documentation.** The OS bets that a clickable prototype on day three beats a thirty-page PRD on day thirty. This is right for probabilistic material and wrong for regulated, high-stakes deterministic systems (medical devices, air traffic control). Know your material.
- **Loops over stage-gates.** The OS eliminates handoffs between design, engineering, and product - but this requires the team to develop new muscles (taste, eval discipline, governance wiring) before they discard the old safeguards. A "rip and replace" without those muscles leads to fast, ungoverned shipping. **The recommended approach is Incremental Modular Adoption: swap out only what is broken or too slow, keep the rest of your linear process intact until the new muscle is stable.**
- **Measurement discipline over vibes.** Rule #5 - *Ship what you can measure. Hold what you cannot* - means some features stay on the shelf longer than a vibe-based culture would tolerate. That friction is the point. Features that can't be measured can't be governed. Features that can't be governed become the Air Canada chatbot story.
- **Human judgment is not delegatable.** The OS does not reduce the importance of the Human Layer - it increases it. When execution is cheap, the scarce resource is taste. *Delegation without comprehension is abdication.* The OS frees the PM from task administration so they can do the job that was always supposed to be theirs. It does not do the job for them.

---

### 5. How to Implement - *Making your company future-proof*

The strategy is **Incremental Modular Adoption**. Not a revolution - a systematic upgrade of interchangeable parts.

**Six rules, one per layer of the install:**

1. **Rule #1 - Build something small this week.** *(Diagnosis → motion)* The people who are going to be fine are not the ones who read the most about AI. They are the ones who have actually built with it. Once. Even badly.
2. **Rule #2 - Never confuse a Model Layer update with a Stack change.** *(Model Layer)* The news is loudest about this layer and your career depends on it the least. A new model drops? Fuel swap. The Stack is intact.
3. **Rule #3 - The model is rented. Your context is owned.** *(Context Layer)* Everyone rents the same models. Only you can write your Identity, Product, User, Strategy, Templates. That is the first private floor of the Stack - and the one that compounds.
4. **Rule #4 - You are not the builder. You are the conductor.** *(Orchestration Layer)* The PM orchestrates; the Stack executes. The failure modes are two: manual inside the OS (Ferrari pushed down the road), and over-orchestrated out of contact (taste lost).
5. **Rule #5 - Ship what you can measure. Hold what you cannot.** *(Governance Layer)* This is not risk management. It is intelligence management - measuring the distribution of outcomes and shipping the ones that clear the bar. Ship with measurement, not with hope.
6. **Rule #6 - You are the Context Layer.** *(Human Layer)* The industry is rented. Jobs are orchestration. Hiring standards are governance. What you shipped, what you saw fail, what you held, what you refused, what you decided against and lived with - that compounds. Own it.

**The implementation sequence:**

1. **Boot the Model Layer** - pick a default frontier model, stop agonising. Fluency with one beats theoretical knowledge of all.
2. **Load the Context Layer** - author your five context files (Identity & Voice, Product & Company, User, Strategy, Templates). This is the highest-leverage hour you will spend. Everything downstream consults it.
3. **Wire the Orchestration Layer** - connect your MCPs (Notion, Figma, your data warehouse). Run the Loop end-to-end on a real piece of work once. One Sunday morning is enough.
4. **Install the Governance Layer** - extend your eval suite with safety cases, wire the four guardrails, set up a trace dashboard and cost cap. Do not skip this step before pointing the feature at real users.
5. **Activate the Human Layer** - retire "task administrator." Adopt "outcome orchestrator." Point the Stack at an outcome. Hold the outcome.

---

### 6. What I Would Improve - *The honest version*

- **The Governance Layer is under-installed in most teams.** The most common gap is not a missing model or a thin context file - it is a Governance Layer that was never wired in, because the demo worked and it felt like enough. It is not enough. Governance cannot be retrofitted after an incident because bad outputs deposit into the Context Layer on every loop close. Wire it in alongside the build.
- **The Human Layer is the hardest to install.** Five durable skills - vision, empathy, taste, communication, judgment - are easy to name and hard to compound. The honest limitation of this OS is that it can give you the structure but not the reps. The reps come from shipping real things, reading the 8% of failures the dashboard flags, noticing the user subtext no eval suite would catch. The One-Hour Rule (one non-negotiable hour a week, one new thing) is the minimum viable habit. 52 hours a year of deliberate frontier exposure is enough to stay fluent without chasing.
- **The next meaningful improvement is better tooling for eval coverage.** Most eval suites sit at 12–50 cases - enough to catch regressions, not enough to cover edge cases across all failure categories. The target is a living suite that grows automatically: every bug seen in the wild becomes a permanent test case. The Iterate phase of the Loop is the mechanism. The discipline is the gap.

<aside>

**The handoff.** The Stack is anti-fragile (Taleb): shocks upgrade it rather than destabilising it. Every new model release lands as fuel, not as an earthquake. Every new governance tool is sharper instrumentation. A toolkit ages in six months. An architecture compounds for ten years. This OS was never really about AI. It was about installing a Stack that *survives* AI.

</aside>

---

## Ready to install the Stack?

<aside>
🗂️

**Explore the AI-Native Product OS**

The full OS — modules, commands, context library, and install guide — lives in Notion.

[Open the AI-Native Product OS →](<mention-page url="https://www.notion.so/cfa6fe2ecf3783649ab68152765cc260"/>)

</aside>

<aside>
🎓

**Take the course on Maven**

The AI-Native Product OS course — six lessons, a running build, and a working OS on your machine by the end.

[Enrol on Maven →](http://www.maven.com)

</aside>

---
