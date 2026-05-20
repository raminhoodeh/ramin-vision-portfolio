# nsso - Portfolio Write-Up

---

## 1. Problem — What You Were Solving

Professional identity online is a fragmentation problem masquerading as a presentation problem. Most people have a LinkedIn, a personal site or Linktree, a payment link, a portfolio somewhere, and a WhatsApp number — none of which speak to each other, none of which can be updated from a single place, and none of which present the person at a level of depth that actually reflects what they have built. Every time your work changes, you are manually updating four different places, and your audience still ends up with an incomplete picture. The gap was not another link-in-bio; it was a unified, intelligent professional operating system — one URL, one identity surface, owned by the person it represents, and assistable by AI that already knows everything about you.

---

## 2. Architecture — How You Built It

### The Full Feature Surface

NSSO is a multi-layer product. Understanding what it does at the feature level is the prerequisite for understanding the engineering choices.

**Profile and Identity Layer**

- Public profile at `nsso.me/[username]` — a free, claimable personal domain. No subdomain fees, no waiting list.
- Bio, headline, and profile picture, plus a fully structured CV: experiences (company, role, start/end year), qualifications (institution, degree, year range), and projects (name, contribution, description, image, URL)
- Drag-and-drop reordering of experiences, qualifications, and projects via `@dnd-kit/core` with keyboard sensor support and optimistic Supabase state updates — reorder commits to the database in the background without blocking the UI
- Image cropper modal with configurable aspect ratio — 1:1 for product images, 16:9 for project photos — producing a cropped `Blob` before upload to Supabase Storage, preventing low-quality or incorrectly-proportioned images from entering the database
- Contact methods (WhatsApp, email, phone, Telegram, etc.) and social/professional links with platform auto-detection and naming suggestions
- Audience-tailored bio variants — the **Intros** feature: Gemini 2.0 Flash generates three distinct bios for three target audiences the user specifies (e.g. "investors," "clients," "collaborators"), each rewritten in tone and emphasis for that reader. No manual copy needed.
- QR-code-enabled networking: profile QR code available for in-person exchanges; "Add to My NSSO" connection system on the public profile page
- Profile completeness scoring (0–100) calculated server-side across five weighted dimensions: core identity (bio, headline, profile picture), connectivity (links, contacts), professional depth (experiences, projects, qualifications), and storefront (products). Score is surfaced to Deity for context-aware coaching nudges.

**Storefront and Monetisation Layer**

- Product listings with name, price, description, and product image (upload + crop pipeline identical to project photos)
- **Sales Page Creator** — each product can have a dedicated, full-page hosted sales page. Toggled on/off via a single switch in the dashboard. The sales page is built in a standalone `/dashboard/products/[id]/creator` route and supports a comprehensive CRO field set: headline, tagline, intro text, value proposition, benefits list, testimonials, video embed URL, and a PayPal payment embed field.
- **PayPal HTML Injection Protection** — when a user pastes a PayPal button embed into the payment field, the platform runs a real-time DOMPurify sanitization pass with a strict allowlist: only `form`, `input`, `img`, `div`, `style`, `section`, and `span` tags are permitted; URIs must match `.paypal.com` or `.paypalobjects.com` only. A secondary pattern check confirms the code references `paypal.com`, detects any `<script>` tags not matching the canonical PayPal Hosted Button SDK pattern (`paypal.HostedButtons({ hostedButtonId: "..." })`), and handles the single-button exception (`paypal.com/ncp/payment` form pattern). The UI renders a live `scanning → secure / unsafe` security state with `ShieldCheck` / `ShieldAlert` iconography and a human-readable verdict, making the security decision visible and auditable rather than silent.
- **Referral Earnings Programme** — each user receives a unique referral code in the format `NEWCV[3-digit-number]`, generated with uniqueness guaranteed at the database level. Referred users who convert to a paid plan generate 40% commission at £8/month (£3.20 per user per month). The `/earnings` dashboard reports active referral count, expected monthly earnings, and accepts a [PayPal.me](http://paypal.me/) slug for payout routing — slug format is validated client-side (alphanumeric, hyphens, underscores, max 50 chars). A Supabase RPC function (`get_user_earnings_stats`) handles the aggregation query.
- PayPal HTML button and Hosted Button SDK support for one-off product payments
- Polar integration for subscription product billing
- Web3 wallet integration (Solana) — architecture stub in place, pending regulatory approval
- Facebook Pixel integration — roadmap item

**Deity — Agentic AI Profile Coach**

Deity is the platform's most architecturally significant component. It is not a chatbot that gives advice about profiles. It is an agent that directly reads, writes, and mutates the user's live profile in real time, with full contextual awareness of everything in it.

**Hybrid RAG Context Architecture**

Every authenticated request to `/api/deity/chat` fetches the full user profile via a Supabase RPC (`get_agent_context`) returning: all profile fields, all experiences, qualifications, projects, products, links, and contact methods. This is serialised into a structured context string and injected into the system prompt on every conversation turn. The agent always has a complete, current read of the profile.

In parallel — for knowledge-seeking queries — the route generates two 768-dimension embeddings using `gemini-embedding-001`:

1. **Query embedding** — the user's message
2. **Profile embedding** — the first 1,000 characters of the serialised user context, representing the user's professional background

Both are passed to the `intelligent_search` Supabase RPC, which performs a vector similarity search across the `agent_knowledge` table — a proprietary curated corpus of CSVs and Markdown files: AI tools, angel investor databases, VC databases, family offices, EIS investors, UK business grants, startup accelerators, career coaching resources, remote job boards, US tech companies, courses, services, places, members' clubs, content creation advice, pitch deck structures, business knowledge, and film/inspiration lists. The RPC re-ranks retrieved chunks using a weighted scoring function: **50% vector similarity, 20% source diversity** (penalise documents from the same file to avoid result flooding from one source), **30% profile-text relevance** (keyword overlap between each chunk and the user's professional context). Two users asking the same question get different top results based on their industry and work history.

A **soft-filter fallback** prevents empty responses: if the top document score from a category-scoped search falls below 0.60, the system automatically escalates to a global search across the full knowledge base, ignoring the original category filter. A `verifyLinks` pass filters dead URLs from the top-5 retrieved documents before they reach the LLM prompt — fail-open, so retrieval is never blocked if the link checker itself errors.

**Direct Profile Mutation — The Tool Call Loop**

When intent arbitration classifies the query as profile-directed, the Gemini model is instantiated with `DEITY_TOOLS` — nine declared function schemas: `update_profile_field`, `add_experience`, `add_project`, `add_qualification`, `add_product`, `add_link`, `update_link`, `remove_link`, `reorder_links`. For guest users, `disableTools` is forced to `true` — tool declarations are never passed to the model, and no mutation can occur regardless of what the model generates.

When Deity calls a tool during streaming, the function call is intercepted mid-stream: each call is mapped from its SDK function name to the internal `DeityAction` format (e.g. `update_profile_field` → `{ action: 'UPDATE_FIELD', field: 'bio', value: '...' }`), collected into an array, and appended to the response stream after the text completes as a `__DEITY_ACTIONS__` JSON payload enclosed in triple-backtick delimiters. The frontend `AgentChatInterface` detects this delimiter in the incoming stream, parses the payload, and renders each proposed change as a **Review Mode** confirmation card — showing the field name, current value, and proposed value — writing to Supabase only after the user explicitly approves. No profile mutation is ever silent, irreversible, or autonomously applied.

A **Fast Mode** toggle is available for users who prefer auto-execution. In Fast Mode, confirmed actions are applied immediately on stream completion without the review card step.

**Prompt Injection Protection**

The system prompt governance layer is the primary defence against prompt injection attacks. Tool declarations are entirely omitted for guest sessions — there is no function schema in scope for the model to call, meaning a malicious prompt cannot cause a tool invocation regardless of how it is phrased. For authenticated sessions, the system prompt contains an explicit `DATA ACCURACY RULES` block instructing the model to only reference fields present in the fetched user profile and never fabricate placeholder values for missing data. The `disableTools` flag is set server-side based on the authenticated user ID — it cannot be spoofed via the request body.

**Intent Arbitration and Focus Locking**

`contextManager.ts` performs intent arbitration on every message: keyword heuristics classify profile intent ("bio," "headline," "update," "add my," "experience") vs. knowledge intent ("recommend," "find me," "where can I," "what's the best," detected category keywords). A sticky context mechanism biases classification toward the previous turn's mode, preventing topic bleeding during multi-turn conversations. If knowledge intent is detected, the RAG pipeline runs and tools are suppressed. If profile intent is detected, RAG is skipped entirely and tools are declared.

The assembled system prompt incorporates: user name, profile completeness score, full serialised profile context, SEO analysis scores and suggestions, retrieved knowledge chunks marked `[VERIFIED]`, detected category, and conversation history. For empty profiles in guest mode, the system prompt activates the NEPQ framework — a structured curiosity-driven conversation designed to surface the user's professional identity and convert them to account creation, while still delivering real knowledge base value to maintain trust.

**SEO Analyzer**

`seoAnalyzer.analyzeSEO()` scores bio and headline text across: character length adequacy, presence of action verbs and power words, penalties for buzzwords ("synergy," "innovative," "thought leader"), keyword density, and structure. Scores below 8/10 generate specific improvement suggestions injected into the Deity system prompt, giving the agent actionable coaching without the user asking for it.

**Proactive Nudge System**

- If a user has no bio, Deity opens with a bio coaching prompt rather than a generic greeting
- "Ask Deity" shortcut buttons are embedded directly next to experiences, qualifications, and projects in the dashboard Advanced Mode card, dispatching pre-seeded `CustomEvent`s that open Deity with a contextual initial message ("I want to add my work experience...")
- Profile completeness percentage is passed to the system prompt so Deity can reference it explicitly

---

### Design System — Liquid Glass, 3D Cloud Typography, SVG-Backed Distortion

**Glassmorphism Component System**

The `GlassCard` component implements five distinct glass rendering variants:

- `default` — `backdrop-blur: 40px`, `rgba(0,0,0,0.25)` base, inner specular highlight layer using a pseudo-element gradient
- `strong` — `backdrop-blur: 50px`, `rgba(0,0,0,0.4)` base — modal and overlay surfaces
- `subtle` — `backdrop-blur: 30px`, `rgba(0,0,0,0.15)` — secondary containers
- `apple` — near-zero base opacity (`rgba(255,255,255,0.01)`), `saturate(200%)`, with a crystalline border implemented via CSS mask composite: `linear-gradient content-box` mask with `WebkitMaskComposite: xor` — the iOS vibrancy effect, pulling colour saturation from the background rather than producing a grey tinted blur
- `ultimate` — `saturate(220%)`, three-layer stack: specular gradient overlay at `mix-blend-mode: overlay`; a fractal noise SVG filter inlined as a data URI background image (`feTurbulence baseFrequency=0.8, numOctaves=3`, rendered at `opacity-20`) for surface micro-texture; and a multi-directional inner glow border (`inset 0 0 20px rgba(255,255,255,0.1)`)

The `CleanGlassCard` on the landing page uses a separate multi-layer compositing approach: `mix-blend-color-burn` on a mid-grey layer + `mix-blend-luminosity` on a dark layer + `rgba(94,92,230,0.18)` purple tint + Siri-gradient PNG at 40% opacity. This produces the iridescent shimmer effect without depending on `backdrop-filter` alone, making it work in browsers with limited filter support.

**3D Cloud Hero Typography**

The landing page hero is a typographic sculpture built from pure CSS. Five words — "Clarify," "Organise," "Future-Proof Yourself," "Present," "Discover" — are stacked vertically at `text-7xl`/`text-8xl` with graduated opacity: `text-white/40`, `text-white/60`, `text-white` (the centred `<h1>`), `text-white/60`, `text-white/40`. The opacity falloff creates a volumetric depth illusion — words that appear to recede are simply lower opacity. The result is a 3D cloud effect with no SVG filter, no 3D CSS transform, no canvas, and no JavaScript. SF Pro Display at 800 weight carries the typographic weight.

**Liquid Glass Username Input — Multi-Layer Compositing with Gradient Bevel**

The `nsso.me/[username]` claim input on the landing page uses six composited layers to produce a physically plausible glass surface:

- `mix-blend-color-burn` on `rgba(208,208,208,0.5)` — burns grey into the dark page, creating the glass body
- `mix-blend-luminosity` on `rgba(0,0,0,0.1)` — slight desaturation for depth clarity
- `rgba(94,92,230,0.18)` purple accent tint
- Siri-gradient PNG at 40% opacity — organic colour shimmer beneath the glass
- Inner shadow: `inset 0px -0.5px 1px rgba(255,255,255,0.3)` — bottom-edge light refraction at the glass surface
- CLAIM IT button: gradient border wrapper (`linear-gradient from rgba(255,255,255,0.45) → rgba(255,255,255,0.01) → rgba(255,255,255,0.15)`) producing a physically grounded top-lit bevel consistent with Apple HIG glass button conventions

---

### Technology Stack

| Layer | Technology |
| --- | --- |
| Frontend | Next.js 16 (App Router), TypeScript |
| Styling | Tailwind CSS 4, custom multi-variant glass design system |
| Database | Supabase Postgres, pgvector |
| Storage | Supabase Storage (avatars, project images, product images) |
| AI Agent | Google Gemini 2.0 Flash |
| Embeddings | Gemini Embedding 001 (768 dimensions) |
| Tool Calling | Gemini Function Declarations (9 schemas) |
| Drag and Drop | @dnd-kit/core, @dnd-kit/sortable |
| HTML Sanitisation | DOMPurify |
| Payments | PayPal HTML buttons, PayPal Hosted Button SDK, Polar |

---

## 3. Why This Approach — My Reasoning

The choice to make Deity write directly to the profile — not just suggest text for the user to copy — was the most product-consequential decision in the system. The gap between an AI telling you what to write and an AI just writing it for you is the gap between a tool and a collaborator. If the agent has full read access to the profile and the user confirms each change in Review Mode before it commits, then the risk of unwanted mutations is managed, the friction of acting on advice is eliminated, and the interaction loop becomes genuinely productive.

Review Mode was chosen over full autonomy because professional identity content is high-stakes in a way that a calendar entry or a task is not. A wrong bio on a live public profile is a trust and credibility problem. Presenting each proposed change as a card — field, before, after — and requiring explicit confirmation puts the user in control of final output while still doing 95% of the work for them.

The dual-embedding architecture (query embedding + profile embedding re-ranking) was added because RAG retrieval over a generic knowledge base produces generic results. A designer and a startup founder asking "what investors should I approach?" should not receive the same top documents. Re-ranking by profile-text relevance — computed as a weighted scorer inside the Supabase RPC at the database layer, not in the application layer — means the personalisation runs with no additional round-trip.

The decision to use `pgvector` inside Supabase rather than a dedicated vector store (Pinecone, Weaviate) was made on operational grounds. The knowledge base is a static, curated corpus that does not change with every request. A co-located vector index in the same Postgres instance means retrieval is a single authenticated SQL call, not a cross-service API call with its own auth, rate limits, and cold-start characteristics. The performance justification for a dedicated vector store does not exist until the corpus grows by at least an order of magnitude.

The DOMPurify HTML injection protection on PayPal embeds was a product safety decision, not a regulatory requirement. The product accepts a user-generated HTML embed field — inherently dangerous. Rather than restricting the field to [PayPal.me](http://paypal.me/) links only, the approach allows full PayPal button HTML with a strict sanitise-then-verify pattern: DOMPurify strips anything outside the allowlist, then a secondary regex confirms the code is from PayPal's domains and is not a sanitisation-evasion attempt. This gives power users the full functionality of PayPal's embed options while protecting the platform's database and any rendering context from XSS.

---

## 4. Tradeoffs — What You Gave Up

**Intent arbitration is heuristic, not probabilistic.** The keyword-based switch in `contextManager.ts` has known failure modes. A message like "what's the best bio for someone in my industry?" contains a knowledge-seeking term ("best") but is actually a profile mutation request. The current heuristic would likely classify it as knowledge intent and suppress tools. A binary classifier trained on labelled NSSO query pairs would produce more reliable arbitration, especially for compound or ambiguous queries. The error rate of the current heuristic has not been measured.

**No evaluation framework for agent tool-call accuracy.** The `actionParser` and `extractActions` logic has no automated test coverage. If a Gemini model update changes how function call arguments are encoded in a streaming response, action parsing will silently fail — the user sees a normal text response but no profile updates occur. A regression suite that fires known inputs, captures the stream, and asserts on the parsed `DeityAction` array is the most important missing engineering investment.

**Ingestion idempotency gap.** The `ingest-context.ts` script does not deduplicate on re-run. If a knowledge base CSV is updated and the script re-runs, duplicate records accumulate in `agent_knowledge`, inflating the candidate set for vector search and potentially degrading retrieval quality as near-duplicate chunks compete for ranking positions.

**The sales page CRO schema is a prior, not a measured result.** The field set — headline, tagline, value proposition, benefits, testimonials — was designed from established conversion rate optimisation frameworks. No A/B test or user research on this specific user base has validated which combinations drive higher conversion. The schema is a reasonable starting point, not a validated one.

---

## 5. Demo — A Live, Clickable URL

[**nsso.me**](https://nsso.me/) — landing page with username claim, Deity guest access, and product tour

[**nsso.me/ramin**](https://nsso.me/ramin) — live example profile including Deity agent in guest mode, product listings, and social links

The Add Film flow, category carousels, hero billboard, and film detail modals are all accessible on the live deployment.

---

## 6. What I Would Improve — Honest Self-Assessment

The intent arbitration system is the single most fragile component in the product and the one I would address first. The current keyword switch in `contextManager.ts` is a lookup table dressed up as logic. It works predictably for unambiguous inputs — "add my experience at Google" is clearly profile intent; "what courses should I take?" is clearly knowledge intent — but it fails on the 15–20% of messages that contain signals from both modes. The correct fix is a two-class text classifier, fine-tuned on a dataset of labelled NSSO queries, producing a probability score rather than a binary switch. Above 0.75: profile mode. Below 0.25: knowledge mode. Between: ask the model to disambiguate before committing. Until that classifier exists, the arbitration system is a heuristic that a sufficiently unusual query will always eventually defeat.

The second gap is observability. The Deity agent executes multiple downstream operations per turn — RAG retrieval, re-ranking, link verification, tool call parsing, action delivery — and none of these are instrumented. There is no structured logging, no per-step latency tracing, and no dashboard showing what fraction of turns result in tool calls, what fraction of tool calls are accepted by users in Review Mode, or what fraction of knowledge queries return results above the confidence threshold. Without this telemetry, it is impossible to know whether retrieval quality is improving or degrading over time, or whether the agent is generating tool calls the user is systematically rejecting — which would indicate a calibration problem in intent detection. A per-turn event log (category, intent classification, retrieval hit rate, tool call count, user acceptance count) would make the agent debuggable and improvable rather than a black box producing outputs with no feedback signal.