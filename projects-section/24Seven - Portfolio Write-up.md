# 24Seven - Portfolio Write-up

---

## 1. Problem — What You Were Solving

Luxury travel operators had built their service inventory in Shopify — the operational backbone was already there — but the discovery layer was entirely broken. A client wanting to book a superyacht for a week in Ibiza followed by a villa in Marbella had to manually scroll through independent collection screens, cross-reference pricing, and then initiate a completely separate conversation with a concierge agent who had no record of the discovery session. The gap was not in the inventory; it was in the bridge between intent and transaction. High-net-worth users with high opportunity costs were being forced to do the work of a travel agent themselves before they could speak to an actual one.

---

## 2. Architecture — How You Built It

The application is a native iOS app built on **Expo SDK 54 (React Native 0.81.5)** with **Expo Router v6** for file-based navigation. The AI concierge is powered by **Google Gemini 2.5 Flash**, with the entire product catalog injected at inference time as structured context.

### 5-Layer Stack

| Layer | Implementation |
| --- | --- |
| **Model** | Google Gemini 2.5 Flash (`gemini-2.5-flash`), selected for JSON-native output mode (`responseMimeType: application/json`) and low latency on mobile |
| **Context** | The full Shopify Storefront catalog (up to 250 products) is fetched via a dedicated `ALL_PRODUCTS_AI_QUERY` GraphQL call and compressed to essential fields (handle, title, tags, description truncated to 150 chars, price, collections) before injection into the system prompt. Chat history is serialised as plain text and prepended on every turn. |
| **Orchestration** | Two Gemini call paths: (1) `generateConciergeResponse` — conversational planning with catalog-grounded product linking and structured itinerary generation; (2) `generateWhatsAppSummary` — a second, separate Gemini call that distills the full conversation into a clean, human-readable booking brief formatted for WhatsApp handoff. A third path, `generateBookingMessage`, powers per-product `Book Now` flows with Gemini 2.0 Flash via the REST endpoint, generating a contextual enquiry message from product metadata and selected dates. |
| **Governance** | Prompt-level constraints: the model is explicitly instructed not to hallucinate products outside the provided catalog JSON, to suppress all emoji output (the custom app font does not support them), to return strictly valid JSON with no markdown wrappers, and to maintain conversational state via the serialised history block rather than any server-side session. |
| **Human Layer** | The model's output is never treated as a booking confirmation. Every conversation concludes with a "Confirm Booking on WhatsApp" CTA that invokes the summary generation step and deep-links directly to the human concierge agent's WhatsApp number (`+447575383355`). The AI surfaces intent; the human closes the transaction. |

### Data Flow (End-to-End)

```
Shopify Storefront GraphQL API (2025-07)
  └── shopifyClient.ts        (raw POST fetch wrapper)
  └── shopify.ts              (named async functions per query type)
  └── useShopifyQueries.js    (TanStack React Query v5 hooks)
        ├── useAllProductsAI()        → catalog context for Gemini (24h stale time)
        ├── useAllCollections()       → home screen grid (30min stale time)
        ├── useProductByHandle()      → product detail screen
        └── useCollectionProductsInfinite() → paginated listing (10 per page)

Gemini API (Google Generative AI SDK v0.24.1)
  └── services/ai/geminiService.js
        ├── generateConciergeResponse(userQuery, compressedCatalog, chatHistory)
        │     → JSON { message: string, recommendedProductHandles: string[] }
        ├── generateWhatsAppSummary(chatHistory)
        │     → plain text WhatsApp brief
        └── generateBookingMessage(productTitle, dates, description)
              → plain text per-product enquiry (REST endpoint, Gemini 2.0 Flash)

Zustand Store (useAICierge.js)
  └── Persisted to device filesystem via expo-file-system (JSON)
  └── Drives AICiergeOverlay (glassmorphic full-screen chat modal)
  └── Drives AICiergeBar (persistent floating input trigger, mounted at root layout)

WhatsApp Deep Link
  └── whatsapp://send?phone=447575383355&text={encoded_summary}
  └── Fallback: <https://wa.me/447575383355?text={encoded_summary}>
```

### Key Tools and APIs

- **Shopify Storefront API** — product catalog, collection config metafields (filter definitions stored as per-collection JSON), highlighted product handle via shop-level metafield
- **Google Gemini** (2.5 Flash for chat/planning, 2.0 Flash for per-product booking messages)
- **@google/generative-ai** SDK v0.24.1
- **TanStack React Query v5** — server state management with differentiated stale times per data type
- **Zustand v5** with filesystem persistence — AI chat state, cross-session history
- **Expo Router v6** — file-based routing with literal route overrides for bespoke venue pages
- **Lodgify** — embedded booking calendar widget (WebView), with native interception of Lodgify checkout navigation to keep users in-app
- **expo-blur** — glassmorphic chat overlay
- **react-native-markdown-display** — renders Gemini's structured Markdown itinerary output including hyperlinked product handles
- **react-native-pager-view** — horizontal image gallery on product pages
- **NativeWind v4** — Tailwind utility classes layered over React Native StyleSheet

### Dubai Expansion — Hybrid Data Layer

The codebase contains a deliberate hybrid: Ibiza and Marbella inventory is fully live via Shopify; the Dubai expansion uses a **client-side mock data layer** (`mockDubaiData.ts`) that injects mock collections and products directly into the same `fetchAllCollections` and `fetchProductsByCollectionHandle` functions. Dubai universal-category collections (Yachts, Cars, etc.) dynamically clone their Ibiza counterparts at the data layer, rewriting collection handles and titles before the UI consumes them. This allowed the Dubai market to ship as a visible destination in the app before full Shopify catalog onboarding was complete.

---

## 3. Why This Approach — Your Reasoning

The obvious alternative was a standard semantic search or vector RAG pipeline over product embeddings — retrieve top-k products by cosine similarity, inject only those into the prompt. That approach was ruled out deliberately: the catalog is small enough (250 products maximum) that full injection costs less than the latency and infrastructure overhead of a vector database, while guaranteeing the model sees every product that might legitimately match a multi-criteria query. A user asking for "something in Ibiza with capacity for 12, a yacht and a villa in the same week" requires cross-collection reasoning across sparse constraints — retrieval systems optimized for single-query similarity would systematically underperform here.

The decision to use Gemini's native JSON output mode (`responseMimeType: application/json`) rather than parsing freeform text was a deliberate governance choice: structured output makes the `recommendedProductHandles` array machine-reliable, which is what drives the product card carousel in the UI. Freeform parsing introduces a class of silent failures that are difficult to test and degrade user experience without error states.

---

## 4. Tradeoffs — What You Gave Up

- **Catalog injection vs. privacy and token cost.** Injecting the full compressed catalog on every inference turn means that as inventory grows beyond approximately 500 products, prompt length becomes a cost and latency problem. The current compression strategy (150-char description truncation, field stripping) is a mitigation, not a solution. At scale, the correct answer is either a retrieval pre-filter step or moving to a model with a larger context window at lower cost. The tradeoff in v1 was simplicity and reliability over marginal cost.
- **No server-side session management.** Chat history is serialised client-side and re-injected on every API call. This means there is no server audit trail of AI interactions, no ability to retrospectively improve the model via conversation logs, and no fallback if the device storage is cleared. The tradeoff was zero backend infrastructure cost and instant stateful chat across app sessions, at the expense of observability and data flywheel potential.
- **Governance gap: no evaluation suite.** The production AI system has no automated eval coverage — no regression tests for hallucination, no coverage of edge cases (e.g., requests for services outside the catalog, date conflicts, multi-location itineraries with contradictory constraints). The prompt instructs the model not to hallucinate products, but this is enforced only at the instruction level with no mechanical verification. This is the most significant known governance debt.
- **Dubai market launched as mock data.** The client-side mock layer was the correct call to unblock a market launch, but it means Dubai inventory exists outside the Shopify CMS — a content editing workflow is missing, and the Dubai mock products are not accessible to the AI concierge context (the `ALL_PRODUCTS_AI_QUERY` fetches from Shopify only). Dubai products are invisible to the AI planner until full Shopify catalog migration is completed.

---

## 5. Demo — A Live, Clickable URL

**App Store:** [24Seven Concierge on the App Store](https://apps.apple.com/us/app/24seven-concierge/id6663954162)

Live on the App Store as of version 1.2.4. Download on any iPhone, navigate to any location, and use the AI Concierge bar at the bottom of every screen to initiate a planning session.

---

## 6. What I Would Improve — Honest Self-Assessment

The most significant limitation is the absence of any structured evaluation framework for the AI concierge. In production today, the only signal that the model is performing correctly is human observation — there is no automated coverage of the failure modes that matter most: hallucinated products (model references an item not in the catalog), itinerary date conflicts (model fails to flag overlapping availability windows), or degraded output when the catalog JSON exceeds token limits. The next meaningful engineering investment is building a lightweight eval suite of approximately 30–50 test cases covering at least three systematic failure types: out-of-catalog references, multi-destination constraint satisfaction, and graceful degradation when Gemini returns malformed JSON despite the structured output mode instruction.

The second honest limitation is the WhatsApp handoff as the only conversion path. Every AI-generated itinerary terminates in a message to a human agent — there is no async slot reservation, no price lock, and no structured booking intake beyond free-text. A user who completes a planning session at 2am gets no acknowledgment until a human agent reads their WhatsApp in the morning. The architectural fix is a Shopify checkout integration that can at minimum capture a structured hold or enquiry form against specific product variants, converting the AI output into a structured booking record rather than a prose message.