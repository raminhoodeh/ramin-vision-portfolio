# Thoughts Page — Full Overhaul Implementation Plan

**Audience target:** B2C hiring manager at Anthropic
**Goal:** Transform the Thoughts page from a list of achievements into a single, coherent argument in six parts
**Through-line:** *Clarity produces values. Values produce passions. Passions shape work. Work shapes the world.*
**Anchor quote (keep throughout):** "You are not defined by what you do. You are shaped by what you create."

---

## 0. Architectural Approach — Start From Scratch

The overhaul uses a **clean page shell** approach: write a new `ThoughtsPage.tsx` from scratch with 6 Beats as the primary mental model. Do not thread new components into the existing `index.tsx`. The existing shell was built around 3 Acts and will resist the new narrative at every junction — its CSS class assumptions, ActDivider positions, and import order all encode the old structure.

### What to discard

| File / key | Why |
|---|---|
| `src/sections/TeachingWriting/index.tsx` | The page shell. Designed for 3 Acts; will fight 6 Beats. Replace entirely with `ThoughtsPage.tsx`. |
| `thoughtPageFrame.thesisSpine[0/1/2]` | Names and shapes encode old Act labels. Replace with new keys. |
| `thoughtPageFrame.formatIntros.talks/books/courses` | Old categorisation. Remove or rename. |
| `ThoughtsBuildCrescendo` | Designed as the Act III climax. Demote to a bridge element in the new shell; do not preserve its current position. |
| `ThoughtArchitectureBridge` as a standalone section | Fold into Beat 5 context rather than treating it as a named beat. |

### What to keep (components are the raw material, not the structure)

| Keep | As |
|---|---|
| `ThoughtEditorialHero` | Drop into new shell — update its data, not its markup |
| `ThoughtFoundationsSection` | Beat 1 — drop in directly |
| `TalksStage` | Beat 2 — drop in directly |
| `BooksShelf` + `NssoExpressionBridge` | Evidence inside Beat 3 |
| `IntegrationStage` | Beat 4 — drop in directly |
| `CoursesCurriculum` | Beat 5 setup — drop in directly |
| All data in `portfolio.ts` / `content.ts` / `teaching.ts` | Keep, add new keys alongside |

### New file

`src/sections/TeachingWriting/ThoughtsPage.tsx` — the new page shell. Imports the reused components above plus the two new ones (`PassionManifest`, `WorkIntegrationNarrative`) and the wired-in `CaseStudyWriteupIndex`. When complete, `index.tsx` re-exports `ThoughtsPage` so no changes are needed upstream in `App.tsx`.

```tsx
// src/sections/TeachingWriting/index.tsx (after overhaul — just re-exports)
export { ThoughtsPage as TeachingWritingShelf } from './ThoughtsPage';
```

---

## 1. Strategic Framing — What the Anthropic Reader Is Looking For

A B2C PM hiring manager at Anthropic has a specific signal they're hunting for:

- **Ability to make the abstract legible.** Claude.ai's entire product challenge is making LLM capabilities understandable and useful to ordinary people. The Thoughts page needs to demonstrate this skill — not just claim it.
- **Systems thinking applied to human experience.** Not "I shipped a feature" but "here is the underlying structure I used to decide what to build, and why it generalised."
- **Communication craft.** Anthropic hires people who write well. Every heading, every transition sentence, every section opener is being read as evidence of this.
- **Teaching ability.** B2C product requires constant simplification — features explained in onboarding, models explained to non-technical users. The TEDx + university talk + courses prove this at scale.
- **Intellectual range that compounds.** Anthropic is a company where researchers become PMs and PMs write papers. A portfolio that shows storytelling + metacognition + AI development fluency + product process isn't dilettante range — it's compounding.
- **Authentic voice.** Anthropic has a strong internal culture. Performed authenticity reads immediately. The university talk transcript and the "my story" arc are the most authentic thing on this portfolio — they should be treated as the primary evidence, not supporting material.

**What the page currently signals:** "Here are things I have made."
**What it should signal:** "Here is how I think — and here is the inevitable evidence of that thinking in the world."

The anchor quote — *"You are not defined by what you do. You are shaped by what you create."* — is the page's thesis in one line. It must appear in the hero before the reader scrolls anywhere, and the case studies at the end must feel like proof of it, not illustration.

---

## 2. Narrative Architecture

### 3 Acts, 6 Beats

The three Act Dividers remain as structural caesurae. Within each act, two beats flow sequentially.

```
ACT I — METHOD & VALUES
  Beat 1 › The Stratetree: first-principles metacognition → product
  Beat 2 › TEDx: widening perspective until values become obvious

ACT II — FORMATION
  Beat 3 › Three passions: storytelling, teaching, building products
  Beat 4 › University talk: "My Story" — the middle way demonstrated

ACT III — INTEGRATION & PROOF
  Beat 5 › Work integration: what changed at real product orgs because of this
  Beat 6 › Case studies: eight products and tools, each traceable to the above
```

### Full Render Order in `TeachingWritingShelf` (`index.tsx`)

```
ThoughtEditorialHero
  └─ formation quote panel in hero: "You are not defined by what you do. You are shaped by what you create."

ActDivider — Act I: "Method & Values."
  ThoughtFoundationsSection        ← Beat 1
  TalksStage                       ← Beat 2

ActDivider — Act II: "Formation."
  PassionManifest                  ← Beat 3 [NEW COMPONENT]
  BooksShelf                       ← existing, sits inside Beat 3 as evidence
  IntegrationStage                 ← Beat 4

ActDivider — Act III: "Integration & Proof."
  CoursesCurriculum                ← Beat 5 setup (the systems)
  ThoughtsBuildCrescendo           ← OS bridge (moved earlier — thesis before proof)
  ThoughtArchitectureBridge        ← thinking → architecture connector
  WorkIntegrationNarrative         ← Beat 5 [NEW COMPONENT] (the personal narrative)
  CaseStudyWriteupIndex (compact)  ← Beat 6 [WIRE IN + new compact variant]
```

---

## 3. Data Changes — `src/data/content.ts`

### 3a. Hero frame (`thoughtPageFrame`)

```ts
kicker: 'Six things that explain how I think about product',
headline: ' — a coherent argument, not a list of achievements',
body: '',  // keep empty; heroBridge carries this
heroBridge: 'How I think, what I value, what I love, how I teach it, how I apply it at work, and what it built. Not separate achievements — one argument in six parts.',
// formationQuote: unchanged — "You are not defined by what you do. You are shaped by what you create."
```

### 3b. Act Divider labels (`thesisSpine`)

```ts
thesisSpine: [
  {
    label: 'Method & Values.',
    body: 'First principles produce the Stratetree. The Stratetree reveals values. Values become the lens through which everything else is chosen.',
  },
  {
    label: 'Formation.',
    body: 'Passions are not decoration — they are the materials. Storytelling, teaching, and building products show up in everything I make. The university talk is where I learned to say why.',
  },
  {
    label: 'Integration & Proof.',
    body: 'The thinking becomes courses. The courses become products. The products become the argument. Case studies close the loop.',
  },
],
```

### 3c. `foundations.intro` (Beat 1 section intro paragraph)

```ts
intro: 'The quality of a decision can be measured by the degree to which it achieved the goal it set out to do. To get where you want to go, you must first know where you are. To fulfil your potential, you must set a vision representing the maximum possible achievement out of your current and future capabilities. This requires knowledge of yourself, your capabilities, and your place in the world — which is exactly what metaphysics is. The Stratetree is that inquiry made operational for product.',
```

### 3d. New key — `passionManifest` (Beat 3)

Add to `portfolioContent.teachingSpeakingWriting`:

```ts
passionManifest: {
  eyebrow: 'What I love',
  title: 'Three passions. One career.',
  body: 'They look separate from the outside. From the inside, they compound.',
  passions: [
    {
      name: 'Storytelling',
      claim: 'I build story worlds to understand the real one.',
      body: 'The Proposition began as a feature film script, then became a novel because the story demanded interior space that film could not give it. nsso is where music, visual identity, and product logic live in the same surface.',
      artifacts: ['The Proposition', 'nsso'],
      projectName: 'nsso',
    },
    {
      name: 'Teaching',
      claim: 'The best teaching is a question the audience did not know they had.',
      body: 'I gave my first talk at Imperial College London before I had a formal framework to teach. What I found is that explaining something forces it to become simpler and truer. TEDx followed from that discipline.',
      artifacts: ['TEDx Imperial', 'University talks'],
      projectName: null,
    },
    {
      name: 'Building products',
      claim: 'I build tools I would actually use — then turn them into products.',
      body: 'Selfware began as a personal problem: the tools that existed did not match how I actually thought. Building them gave me an AI-native coding fluency that now lives in every product on this page.',
      artifacts: ['Selfware', 'Product Innovation Process'],
      projectName: 'Selfware',
    },
  ],
  bridge: 'The university talk below is the first time I put all three together — in front of an audience of students who had the same question I once had.',
},
```

### 3e. `integrationStage` update on the university talk speaking entry (Beat 4)

The full talk transcript and bio are now available. Populate the `integrationStage` field on the university talk entry:

```ts
integrationStage: {
  eyebrow: 'The middle way',
  title: 'How passion and career mutually reinforce each other.',
  thesis: 'You need a vision for your 9-5 job and a personal vision you are actually passionate about — so the earnings from one can fuel the other. The world is now designed for this.',
  question: 'How do you turn a potentially boring existence into something beautiful?',
  bridge: 'The answer runs through a fruit shop in London, a rejection from the European Space Agency, and a 100-page document nobody asked me to write.',
  principles: [
    {
      label: 'The middle way',
      body: 'Personal projects and professional career mutually reinforce each other. They are not in competition — they are the same argument at different scales. Helping my dad\'s car business got me into Tesla. Working at start-ups for free got me into tech product. My book shows hiring managers I am a good storyteller.',
    },
    {
      label: 'Vision for the mundane',
      body: 'Just knowing what to do is not enough to make it enjoyable. Real work is hard, boring, and complex — that is why you get paid for it. The thing that sustains it is seeing how the boring task gets you closer to a more meaningful goal. My dad said: just think about the end result.',
    },
    {
      label: 'Clarity before strategy',
      body: 'Cut through the noise to three essentials: your core nature and values, where that places you in the world, and the vision that follows from both. Without this sequence, strategy is just motion.',
    },
  ],
  arc: [
    {
      label: 'Iran → Manchester',
      body: 'Life felt quieter before the internet. People seemed more present, more content. Growing up between Iran and Manchester is where the obsession with over-information started — I saw what life looked like with less of it.',
    },
    {
      label: 'Dad\'s conviction',
      body: 'His one-man automotive business looked like a corporation from the outside. The secret was one single-minded vision: make the most beautiful Porsche SUV on the market. Everything else was secondary. I wanted that kind of certainty for myself.',
    },
    {
      label: 'Tesla → TEDx',
      body: 'An email response from Elon Musk led to a TEDx invitation at Imperial. I spoke about how businesses like Tesla seek objective truth about their place in a market, but we do not apply that same clarity to our personal lives — even though we are, objectively, a magical consciousness on a floating blue ball.',
    },
    {
      label: 'Fruit shop epiphany',
      body: 'Stacking shelves while helping start-ups for free, I realised the work I had been doing for years had a name: Product Management. I started interviewing. I came second at the European Space Agency. I mopped the floor the next morning.',
    },
    {
      label: 'The imposter fix',
      body: 'At every new company, I felt like an imposter — there was no formal process for this job. So I wrote one. The Product Innovation Process has since been adopted by start-ups, SMEs, and large corporates to build products without me in the room.',
    },
  ],
  quote: 'Son… just think about the end result.',
  synthesis: {
    title: 'The gold.',
    body: 'If someone had given me the Product Innovation Process and a two-page summary of all metaphysics when I was graduating, I would have saved years. That is exactly what I gave the students in the room.',
  },
},
```

### 3f. New key — `workIntegration` (Beat 5)

Add to `portfolioContent.teachingSpeakingWriting`:

```ts
workIntegration: {
  eyebrow: 'The practice',
  title: 'How the thinking enters the work.',
  thesis: 'Frameworks are only useful if they change what you do in a room. Here is specifically what changed at real product orgs — at OS, GroupM, and Vivup — because of the thinking, the passions, and the courses on this page.',
  threads: [
    {
      index: '01',
      label: 'Product Innovation Process — giving teams a single source of truth',
      eyebrow: 'Process',
      summary: 'Used by start-ups, SMEs, and large corporates — without me in the room.',
      body: [
        'The PIP started as a 100-page document I wrote for myself because there was no formal process for product management. I felt like an imposter at every new company, and realised everyone else was also improvising. So I distilled best practices from OS, GroupM, and Vivup into one step-by-step guide.',
        'At GroupM, the process shaped how the global innovation team built what became the most widely used carbon calculator in the media sector. At OS, it ran alongside geospatial product work with UK and European Space Agency ambassadors. It has since been adopted independently by start-ups, SMEs, and large corporates — to build products without me being there.',
      ],
      stat: 'Most widely used carbon calculator in the UK media sector — built at GroupM',
      link: '[PIP document or product page URL]',
    },
    {
      index: '02',
      label: 'AI-native development — from Selfware to production specs',
      eyebrow: 'AI development',
      // ↓ THIS IS THE MOST IMPORTANT THREAD FOR ANTHROPIC — FILL IN BAYUT SPECIFICS
      summary: '[Replace: one-line outcome from your current role — the most specific thing you can say]',
      body: [
        'Building Selfware introduced me to the discipline I now call AI-native development: treating the model as a collaborator with a known failure profile, not a magic box. I learned to read diffs, write evaluation criteria, and own the technical specification at the level where product decisions and engineering decisions converge.',
        '[Replace: Bayut-specific example. What you prototyped or shipped using LLMs, Claude, or Cursor. What outcome it produced. The specific technical decision you made that a non-AI-native PM would not have made. One paragraph. This is the highest-signal content on the entire page for an Anthropic hire — be as specific as possible.]',
      ],
      stat: '[Replace: e.g. "Prototyped [X] in [Y] days using Claude / Cursor"]',
      link: '[GitHub link or live URL if available]',
    },
    {
      index: '03',
      label: 'Storytelling — why every strategy document starts with a scene',
      eyebrow: 'Communication',
      summary: 'Writing fiction taught me to open with a person in a moment, not a requirement.',
      body: [
        'Writing The Proposition taught me that a story which does not open with a specific person in a specific situation loses the reader in the first paragraph. I apply the same rule to product briefs. The TEDx talk is structured identically: it opens with Iran, a smell of trees, and a feeling of belonging — before it says a single word about decision quality or metaphysics.',
        'At GroupM and OS, I used the same technique in internal strategy documents: begin with the user\'s moment, not the requirements list. Teams align faster when the brief is a story, not a spec. The Product Innovation Process formalises this in its Discover phase — a brief that forces the team to articulate who the user is before deciding what to build.',
      ],
      stat: null,
      link: null,
    },
  ],
},
```

---

## 4. Navigation Rail Changes — `src/sections/Projects/types.ts:236`

Replace `thoughtFormatNavGroups`:

```ts
export const thoughtFormatNavGroups = [
  {
    index: '01',
    label: 'Method',
    items: [
      {
        id: 'thoughts-foundations',
        label: 'Stratetree',
        detail: 'First-principles metacognition mapped to product.',
      },
      {
        id: 'thoughts-talks',
        label: 'Values',
        detail: 'How a cosmic perspective produces clear values.',
      },
    ],
  },
  {
    index: '02',
    label: 'Formation',
    items: [
      {
        id: 'thoughts-passions',
        label: 'Passions',
        detail: 'Storytelling, teaching, and building — the materials.',
      },
      {
        id: 'thoughts-integration',
        label: 'Teaching it',
        detail: 'How I help others integrate passions into career.',
      },
    ],
  },
  {
    index: '03',
    label: 'Integration',
    items: [
      {
        id: 'thoughts-work-narrative',
        label: 'In the work',
        detail: 'What changed at OS, GroupM, and Vivup.',
      },
      {
        id: 'thoughts-case-studies',
        label: 'Case studies',
        detail: 'Eight products — the argument made physical.',
      },
    ],
  },
] as const;
```

---

## 5. New Component Specs

### 5a. `PassionManifest.tsx` (Beat 3)

**File:** `src/sections/TeachingWriting/PassionManifest.tsx`

**Purpose:** Introduce the three passions as materials, not hobbies. Static — no interaction.

**Layout:**
- Section wrapper: `id="thoughts-passions"`, `thought-format-section`
- Heading block: eyebrow + H3 + body (same heading pattern as all other format sections)
- Card grid: 3-column desktop (`grid-cols-3`), 2-column tablet (`md:grid-cols-2`), 1-column mobile
- Each card: `liquid-glass` background, rounded-[1.75rem], padding 1.5rem–2rem
  - Eyebrow: `0.62rem uppercase tracking-[0.22em] text-muted`
  - H4: `1.5rem font-semibold tracking-[-0.04em] text-text-primary` (desktop), `1.25rem` mobile
  - Body: `0.875rem leading-7 text-muted` (2 sentences, hard limit)
  - Artifact strip: flex-wrap gap-2, each artifact as a pill `rounded-full bg-white/35 px-3 py-1 text-[0.65rem] uppercase tracking-[0.16em] text-muted`
  - Optional thumbnail: 48×48 rounded-[0.75rem] from `caseWriteupArtwork(passion.projectName)`, if available
- Bridge sentence: `mt-6 text-sm italic text-muted text-center` — below the grid

**Animation:** `framer-motion` `whileInView`, `initial={{ opacity: 0, y: 24 }}`, stagger the 3 cards by `delay: index * 0.06`.

**Data source:** `portfolioContent.teachingSpeakingWriting.passionManifest`

---

### 5b. `WorkIntegrationNarrative.tsx` (Beat 5)

**File:** `src/sections/TeachingWriting/WorkIntegration.tsx`

**Purpose:** Answer the question every hiring manager asks: *what specifically changed in a real org because you were there?*

**Layout:**
- Section wrapper: `id="thoughts-work-narrative"`, `thought-format-section`
- Heading block: eyebrow + H3 + thesis paragraph
- 3 thread panels, stacked vertically, gap-3

**Thread panel — closed state (~72px):**
```
[THREAD 01]  [bold label text]  [1-line summary, muted, truncated]  [chevron]
```
- Background: `liquid-glass`
- Rounded: `rounded-[1.5rem]`
- Padding: `px-6 py-5`
- Uses native `<details>/<summary>` (same pattern as `thought-foundation-module` in Foundations.tsx — no JS needed, CSS handles the chevron rotation)

**Thread panel — open state:**
- Expand below summary into body paragraphs
- Body: `0.875rem leading-7 text-muted`, `max-w-3xl`
- Optional stat chip: `rounded-full bg-white/35 px-3 py-1.5 text-[0.65rem] uppercase tracking-[0.16em] text-muted` — appears below body
- Optional link: `ProjectLink` component
- Transition: CSS `details[open]` animation (match existing `thought-foundation-module` open/close)

**Thread 01 / 02 / 03 eyebrow chips:** `text-[0.62rem] uppercase tracking-[0.18em]`, coloured distinctly:
- 01 Process: `text-[color:var(--thought-faint)]`
- 02 AI development: accent colour (match AI/product chip colour in portfolio)
- 03 Communication: `text-[color:var(--thought-faint)]`

**Data source:** `portfolioContent.teachingSpeakingWriting.workIntegration`

---

### 5c. `CaseStudyWriteupIndex` — compact variant (Beat 6)

**File:** `src/sections/TeachingWriting/CaseWriteups.tsx` (modify existing)

**Changes:**
1. Add `compact?: boolean` prop to `CaseStudyWriteupIndex` and pass down to `CaseStudyWriteupRow`
2. In `CaseStudyWriteupRow`, when `compact === true`:
   - Apply `data-compact="true"` to the article
   - Render only: artwork thumbnail, type chip, title, reader summary line, "Read →" button
   - Skip: `CaseWriteupInsightDeck`, `CaseWriteupLineageStrip`, `CaseWriteupActionLinks`
3. Update section heading inside `CaseStudyWriteupIndex`:
   - eyebrow: `'06 / What it builds'`
   - H3: `'The argument made physical.'`
   - body: `'Eight products and tools — each one a direct consequence of the thinking above. Click any to open the full write-up.'`

**Compact card CSS (add to thoughts stylesheet):**
```css
.case-writeup-row[data-compact='true'] {
  height: 88px;
  align-items: center;
  overflow: hidden;
}
.case-writeup-row[data-compact='true'] .case-writeup-proof,
.case-writeup-row[data-compact='true'] .case-writeup-actions > :not(button) {
  display: none;
}
.case-writeup-row[data-compact='true'] .case-writeup-main h4 {
  font-size: 1.05rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 0;
}
.case-writeup-row[data-compact='true'] .case-writeup-main p {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
```

**Compact artwork thumbnail:**
```tsx
// In CaseWriteupVisual, when compact:
<div className="case-writeup-visual-compact">
  <img src={image} alt="" className="h-14 w-14 rounded-[0.75rem] object-cover" />
</div>
```

**Wire into `ThoughtsPage.tsx`:**
```tsx
import { CaseStudyWriteupIndex } from './CaseWriteups';
// In ThoughtsPage render (Beat 6):
<CaseStudyWriteupIndex caseStudies={writing.caseStudies} onOpen={onOpen} compact />
```

---

## 6. Existing Component Updates

### Beat 1 — `ThoughtFoundationsSection` (`Foundations.tsx`)

Add a third paragraph to the hardcoded synthesis copy (~line 241):
```tsx
<p className="thought-foundations-synthesis-route">
  The same three moves work at every scale. A person overwhelmed by choices, a company lost in its market, a product team buried in requirements. Reduce over-information → know where you are and what you are → find the vision that follows. The Stratetree is the map that runs that sequence.
</p>
```

### Beat 2 — `TalksStage` (`Talks.tsx`)

Verify these data fields are populated (not placeholder):
- `entry.youtubeEmbeddedLink` — real TEDx YouTube URL
- `valueStage.eyebrow` → `'What do I value?'`
- `valueStage.title` → real TEDx title or thesis
- `valueStage.bridge` → connector sentence
- `valueStage.outcome` → what the talk produces in the audience
- `getTalkSourceLinks(tedxTalk)` → at least one real link

No structural changes to the component.

### Beat 4 — `IntegrationStage` (`Talks.tsx`)

No structural changes. Populate the `integrationStage` data field with the content from section 3e above. Verify:
- `entry.youtubeEmbeddedLink` → `https://www.youtube.com/watch?v=fpNNyHFUKzM`
- `getTalkSourceLinks(integrationTalk)` → YouTube link

All of these components are dropped directly into `ThoughtsPage.tsx` — they do not need to know about the shell change.

---

## 7. Implementation Stages

Build in this order. Each stage is independently testable. Stages 1 and 2 have no visual output — they are safe to run before the new shell exists.

### Stage 1 — Data & navigation (zero visual risk)
**Files:** `src/data/content.ts`, `src/sections/Projects/types.ts`
- [ ] Update `thoughtPageFrame`: kicker, headline, heroBridge
- [ ] Replace `thesisSpine[0/1/2]` with new Act labels (see section 3b)
- [ ] Remove or deprecate `formatIntros.talks/books/courses` keys
- [ ] Update `foundations.intro` (see section 3c)
- [ ] Add `passionManifest` data key (see section 3d)
- [ ] Add `workIntegration` data key with Thread 01, 02 (placeholder), 03 (see section 3f)
- [ ] Populate `integrationStage` on university talk entry (full content in section 3e)
- [ ] Update `thoughtFormatNavGroups` — 3 groups, 6 items, new labels and IDs (see section 4)

### Stage 2 — Existing component content updates (low risk, no shell needed)
**Files:** `src/sections/TeachingWriting/Foundations.tsx`, speaking data entries
- [ ] Add third synthesis paragraph in `ThoughtFoundationsSection` (see section 6)
- [ ] Verify / populate all `valueStage` fields on the TEDx speaking entry
- [ ] Add real YouTube link to TEDx entry: `entry.youtubeEmbeddedLink`
- [ ] Add real YouTube link to university talk entry: `https://www.youtube.com/watch?v=fpNNyHFUKzM`

### Stage 3 — New page shell
**File:** `src/sections/TeachingWriting/ThoughtsPage.tsx` (new)
- [ ] Create `ThoughtsPage.tsx` with the 6-Beat render order from section 2
- [ ] Import all reused components: `ThoughtEditorialHero`, `ThoughtFoundationsSection`, `TalksStage`, `BooksShelf`, `IntegrationStage`, `CoursesCurriculum`
- [ ] Import `AuroraBackground` and replicate the outer shell from current `index.tsx`
- [ ] Stub out Beat 3 and Beat 5 positions with `{/* PassionManifest — Stage 4 */}` and `{/* WorkIntegrationNarrative — Stage 5 */}`
- [ ] Add the `ThoughtsBuildCrescendo` and `ThoughtArchitectureBridge` in their new positions (before Beat 5)
- [ ] Update `index.tsx` to simply re-export: `export { ThoughtsPage as TeachingWritingShelf } from './ThoughtsPage'`
- [ ] Smoke test: page loads, all existing sections render, nav rail scrolls work

### Stage 4 — New component: `PassionManifest`
**Files:** `src/sections/TeachingWriting/PassionManifest.tsx`, `ThoughtsPage.tsx`
- [ ] Build `PassionManifest` component (spec in section 5a)
- [ ] Replace stub in `ThoughtsPage.tsx` with `<PassionManifest />`
- [ ] Section ID `thoughts-passions` must match nav rail entry
- [ ] Visual QA: 3-column → 2-column → 1-column at 1440px / 768px / 375px

### Stage 5 — New component: `WorkIntegrationNarrative`
**Files:** `src/sections/TeachingWriting/WorkIntegration.tsx`, `ThoughtsPage.tsx`
- [ ] Build `WorkIntegrationNarrative` component (spec in section 5b)
- [ ] Replace stub in `ThoughtsPage.tsx` with `<WorkIntegrationNarrative />`
- [ ] Section ID `thoughts-work-narrative` must match nav rail entry
- [ ] **Fill in Thread 02 with Bayut-specific content** (see section 8 — this is the hire-critical paragraph)
- [ ] Visual QA: expand/collapse all 3 threads, stat chips, links

### Stage 6 — Case study compact cards + wire-in
**Files:** `src/sections/TeachingWriting/CaseWriteups.tsx`, `ThoughtsPage.tsx`
- [ ] Add `compact?: boolean` prop to `CaseStudyWriteupIndex` and `CaseStudyWriteupRow`
- [ ] Add compact card CSS (see section 5c)
- [ ] Update section heading in `CaseStudyWriteupIndex` (eyebrow, H3, body)
- [ ] Import and add `<CaseStudyWriteupIndex compact />` to `ThoughtsPage.tsx` at Beat 6
- [ ] Visual QA: all cards at 88px, titles truncate, "Read →" opens overlay

### Stage 7 — Full scroll QA
- [ ] Read the page from top to bottom as a first-time visitor with fresh eyes
- [ ] The narrative arc must be legible without reading any code: Method → Formation → Integration → Proof
- [ ] Every nav rail button scrolls to the correct section ID
- [ ] Formation quote visible in hero on desktop and mobile
- [ ] No orphaned `id` attributes from the old shell (old sections that no longer exist)

---

## 8. The One Gap That Changes the Hire Outcome

Everything in this plan strengthens the page. One thing determines whether it lands with an Anthropic hiring manager:

**Thread 02 body in `WorkIntegrationNarrative` — the AI-native development example from Bayut.**

The rest of the page demonstrates intellectual range, communication skill, and product process. Thread 02 is the only place where "AI PM who has actually worked at the model level" becomes legible. It needs:

1. A specific thing you prototyped or shipped using LLMs, Claude, or Cursor at Bayut
2. The actual outcome (shipped feature, became an engineering spec, saved X weeks of back-and-forth, enabled Y capability that wasn't possible before)
3. One sentence on the specific technical decision you made that a non-AI-native PM would not have made — a prompt engineering choice, an eval criterion you wrote, a model selection you argued for, a context window constraint you worked around

That one paragraph is worth more than every framework diagram on the page.

---

## 9. Quick Reference — File Map

| What | File | Action |
|---|---|---|
| **Page shell** | `src/sections/TeachingWriting/ThoughtsPage.tsx` | **Create** |
| Old shell (re-export only) | `src/sections/TeachingWriting/index.tsx` | Replace body with single re-export |
| Hero copy, Act labels, formation quote | `src/data/content.ts` → `thoughtPageFrame` | Update |
| Beat 1 intro paragraph | Data → `foundations.intro` | Update |
| Beat 1 synthesis paragraph | `src/sections/TeachingWriting/Foundations.tsx` ~line 241 | Add paragraph |
| Beat 2 TEDx data + YouTube link | Speaking entry → `valueStage` | Populate |
| Beat 3 passion data | Data → `passionManifest` (new key) | Add |
| Beat 3 component | `src/sections/TeachingWriting/PassionManifest.tsx` | **Create** |
| Beat 4 university talk data | Speaking entry → `integrationStage` | Populate |
| Beat 4 YouTube link | `entry.youtubeEmbeddedLink` → `https://www.youtube.com/watch?v=fpNNyHFUKzM` | Set |
| Beat 5 work narrative data | Data → `workIntegration` (new key) | Add |
| Beat 5 component | `src/sections/TeachingWriting/WorkIntegration.tsx` | **Create** |
| Beat 6 compact cards | `src/sections/TeachingWriting/CaseWriteups.tsx` | Add `compact` prop |
| Nav rail | `src/sections/Projects/types.ts:236` → `thoughtFormatNavGroups` | Replace |
