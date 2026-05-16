# Projects Write-up Structure

Use this six-section README format for every app, agent, or side project in your portfolio. Each section maps to a durable human skill — this isn't documentation, it's a behavioural interview answer in written form.

---

### 🔴 1. Problem — *What you were solving*

**Skill it shows:** User Empathy

Anchor in a **lived specific** — a real frustration, a real Tuesday, not a pitch deck problem statement. The reader should feel like they were there.

**Prompt to write yours:**

> What was the exact moment or frustration that made you start this? What did the broken/missing version look like?
> 

**Format:**

1–2 sentences. Personal and precise. Name the gap, not the market.

> ✅ Example: *"Every morning Azin and I would wake up and talk about our dreams — but there was nowhere to put it that treated the meaning with seriousness. Notes apps felt clinical. Nothing had an interpretive layer."*
> 

> ❌ Avoid: *"There is no good app for X."*
> 

---

### 🏗️ 2. Architecture — *How you built it*

**Skill it shows:** Technical fluency (Builder credibility)

Map your project to the **5-Layer Stack**: Model → Context → Orchestration → Governance → Human. Name the actual tools, APIs, and data flow. For agents, describe the pipeline (e.g. Scan → Research → Reason → Output → Iterate).

**Prompt to write yours:**

> Which model(s) did you use and why? What does data flow look like end-to-end? What's in your Context Layer (prompts, files, RAG)? What orchestration or automation runs it?
> 

**Format:**

- Stack layer breakdown (even if partial — be honest about what's missing)
- Key tools/APIs/frameworks
- Optional: simple diagram or data-flow bullet list
- Link to public GitHub repo

---

### 🤔 3. Why This Approach — *Your reasoning*

**Skill it shows:** Product Taste + Judgment

Anyone can list tools. This section shows you made **deliberate choices** over obvious alternatives. It's taste made visible.

**Prompt to write yours:**

> What was the most obvious alternative approach you didn't take, and why? What was the core design decision that shaped everything else?
> 

**Format:**

2–4 sentences. Name the alternative, name your choice, name the reasoning.

> ✅ Example: *"I could have used a vector DB + RAG pipeline for the LLM Context Database, but the use case is curation, not retrieval — so a structured, human-vetted flat format beat semantic search for this stage."*
> 

---

### ⚖️ 4. Tradeoffs — *What you gave up*

**Skill it shows:** Judgment (Rule #5: Ship what you can measure. Hold what you cannot.)

Tradeoffs show a **professional judgment call**, not a default choice. Name what you deferred and why — especially any governance gaps you're aware of.

**Prompt to write yours:**

> What did you consciously leave out of v1? What would break if you scaled to 10× users tomorrow? What's the next thing you'd add and why haven't you yet?
> 

**Format:**

- 2–4 bullet points or short sentences
- Frame each as a deliberate decision: *Speed vs. accuracy / Cost vs. coverage / Flexibility vs. simplicity*
- For AI projects: name the governance gap explicitly (eval coverage, moderation, fallbacks)

> ✅ Example: *"Dreamsea Phase 1 omits social/sharing — the tradeoff is lower virality for higher interpretive depth. Sharing a dream publicly changes what you write. Phase 1 earns trust first."*
> 

---

### 🔗 5. Demo — *A live, clickable URL*

**Skill it shows:** Communication (you shipped something real)

**Not staging. Not the group chat.** A URL a stranger can click without asking you for a password or context.

**Options by project type:**

- **Web app / site:** Live deployed URL
- **iOS app:** TestFlight link or App Store link
- **Agent / pipeline:** Public GitHub repo with working README + sample output screenshot or Loom walkthrough
- **Data product:** Gumroad/Payhip page or a public preview
- **Course:** Landing page or Udemy listing

**Rule:** If a project doesn't have a public URL yet, that's the gap to close first. Lesson 6 homework: *ship one thing publicly in the next seven days.*

---

### 🔧 6. What I Would Improve — *Honest self-assessment*

**Skill it shows:** Judgment + Taste (you know what good looks like)

This is where most candidates lose points by being vague. Specific self-assessment signals that you can see the gap between where you are and where it should be — that's taste.

**Prompt to write yours:**

> What's the most honest limitation of this project right now? What failure mode have you seen in the wild? What would you build next if you had one more sprint?
> 

**Format:**

2–4 sentences. Name the actual limitation, not a polished version of it.

> ✅ Example: *"The eval suite has 12 cases — enough to catch regressions, not enough to cover edge cases across all five dream-philosophy frameworks. The next meaningful improvement is expanding to ~50 cases with at least 3 failure examples per tradition."*
> 

> ❌ Avoid: *"The UI could be improved."*
>