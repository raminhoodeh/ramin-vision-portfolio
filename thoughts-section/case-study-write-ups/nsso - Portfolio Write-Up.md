# nsso - Portfolio Write-Up

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
