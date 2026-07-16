# THOUGHTS PAGE — FINAL POLISH IMPLEMENTATION PLAN

Two files change. Every edit is specified exactly. Read the full plan before touching any file.

**Files to edit:**
- `src/sections/TeachingWriting/Foundations.tsx`
- `src/sections/TeachingWriting/ThoughtsOverview.tsx`

**No other files.**

---

## PART 1 — `Foundations.tsx` — Hero fixes

### 1A — Fix the italic subtitle (lines 316–317)

The hero title currently has the manifesto quote hardcoded as the italic subtitle. Replace it with the argumentative framing.

**Find this exact code:**
```tsx
const headlineLines = ['You are not what you do.', 'You are shaped by what you create.'];
```

**Replace with:**
```tsx
const headlineLines = ['A coherent argument,', 'not a list of achievements.'];
```

- This makes "Thoughts / A coherent argument, not a list of achievements." the headline
- The manifesto quote moves to the panel card (see 1B below)

---

### 1B — Replace the "2222" debug panel with the manifesto quote card (lines 346–354)

The right-hand panel currently shows "2222" and "2 talks / 2 books / 2 courses". This is placeholder content. Replace the entire `<div className="thoughts-hero-panel ...">` block with a proper quote card.

**Find this entire block:**
```tsx
<div className="thoughts-hero-panel thoughts-hero-count-card rounded-[2rem] border border-white/12 bg-white/[0.055] p-5 shadow-[0_30px_90px_rgba(0,0,0,0.24)] backdrop-blur-2xl md:p-6">
  <span className="thoughts-hero-count-number" aria-label="Two two two two">2222</span>
  <div className="thoughts-hero-count-caption" aria-label="Two talks, two books, two courses">
    <span>2 talks</span>
    <span>2 books</span>
    <span>2 courses</span>
  </div>
</div>
```

**Replace with:**
```tsx
<div className="thoughts-hero-panel rounded-[2rem] border border-white/12 bg-white/[0.055] p-5 shadow-[0_30px_90px_rgba(0,0,0,0.24)] backdrop-blur-2xl md:p-6">
  <blockquote className="thoughts-hero-quote">
    <p>"You are not defined by what you do.</p>
    <p className="thoughts-hero-quote-serif">You are shaped by what you create."</p>
  </blockquote>
</div>
```

- Remove `thoughts-hero-count-card` class from the div — keep the other classes
- The first line renders in regular weight, the second in the serif/italic style
- No attribution needed — the quote stands alone

---

### 1C — Add CSS for the quote card (append to `src/index.css` after the last `.thoughts-hero` block)

```css
.thoughts-hero-quote {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin: 0;
}

.thoughts-hero-quote p {
  font-size: 1.05rem;
  font-weight: 600;
  line-height: 1.35;
  color: rgba(15, 23, 42, 0.9);
  margin: 0;
}

.thoughts-hero-quote-serif {
  font-style: italic;
  font-weight: 500 !important;
  color: rgba(15, 23, 42, 0.62) !important;
}
```

---

## PART 2 — `ThoughtsOverview.tsx` — Beat content and structure fixes

### 2A — Shorten Beat 01 proof text

The proof text is currently a multi-sentence paragraph. It renders always-visible in the collapsed card, making the card 600px tall. It must be a short subtitle — one line.

**Find the Beat 01 entry and change only the `proof` field:**

```
proof: 'Overcome over-information with first principles-derived thinking. The summary: understand where your values come from, focus on them and see how every decision flows from there.',
```

**Replace `proof` value with:**
```tsx
proof: 'Experience → values → vision → strategy → action',
```

- Do not change `label`, `title`, `body`, `artwork`, `ctas`, or `anchorIds`

---

### 2B — Shorten Beat 02 proof text and update label

**Find the Beat 02 entry. Change `label` and `proof`:**

```
label: 'How I find my values',
proof: 'Taking lessons from business strategy and space travel, I speak about a method to discover what we personally find important.',
```

**Replace with:**
```tsx
label: 'How I find my values',
proof: 'TEDx Imperial College London — a method to discover what we personally find important',
```

- The label stays the same
- The proof becomes one short line
- Do not change anything else in Beat 02

---

### 2C — Reframe Beat 03: label, title, proof, and body

Beat 03 is currently about "Fiction Books & Beautiful software" and its body mentions courses. The reframe: Beat 03 is about the love of storytelling and inspiring people. Courses are removed from this beat and live in Beat 04.

**Find the Beat 03 entry. Replace `label`, `title`, `proof`, and `body` entirely:**

```tsx
label: 'What I love',
title: 'Storytelling & inspiring people',
proof: 'The Proposition · The Meaning of Life · nsso',
body: 'I find the most meaning in making things that move people. The Proposition is a spiritual fiction novel. The Meaning of Life is its philosophical companion. nsso is a music identity product for artists. Three projects. One underlying drive: creation as the way a person\'s values become visible to others.',
```

**Keep unchanged:** `index`, `artwork` (book cover), `ctas` (The Proposition link + nsso link), `anchorIds`

---

### 2D — Update Beat 04: title, proof, and body

Beat 04 is "How I teach it." The title stays "My Story" (the university talk). The proof and body are updated to make clear the talk and the courses are both expressions of the same teaching drive.

**Find the Beat 04 entry. Replace `proof` and `body`:**

```tsx
proof: 'A university talk · Two highest-rated Udemy courses',
body: 'The university talk teaches the middle way through a lived story: how to build a career around what you love rather than against it. The two courses do the same structurally — the Full Product Development Process course packages product judgment into a repeatable system, and the AI Product Management course turns AI-native thinking into a teachable operating framework.',
```

**Keep unchanged:** `index`, `label`, `title`, `artwork` (university talk image), `ctas` (Watch the talk link), `anchorIds`

- The course mini-cards still render in expanded state (already implemented via `beat.index === '04'` check — do not remove this)

---

### 2E — Rewrite Beat 05 body with specific company-framework links

Beat 05 is the commercial proof. The body must name exactly which course framework went to which company.

**Find the Beat 05 entry. Replace `body` and `proof`:**

```tsx
proof: 'OS · GroupM · WLP · Side.inc · Bayut',
body: 'The Product Innovation Process — built with no mandate at OS — became the operating framework at GroupM and WLP (later acquired into Vivup Perkbox). The AI-Native Product OS — the framework taught in the AI PM course — became the product architecture at Side.inc and Bayut. The coding expertise built through Selfware entered both roles directly as shipped infrastructure, not as a talking point.',
```

**Keep unchanged:** `index`, `label`, `title`, `artwork`, `ctas` (AI-Native OS reader button), `anchorIds`, `wide: true`

---

### 2F — Add a second causal connector before Beat 05

Currently there is one connector between Beat 02 and Beat 03 (inserted when `i === 2` in the `flatMap`). Add a second connector before Beat 05 to complete the argument chain: teaching → work integration.

**Find this block in the `flatMap`:**
```tsx
if (i === 2) {
  return [
    <div key="connector-1-2" className="thoughts-beat-connector">
      <span className="thoughts-beat-connector-line" aria-hidden="true" />
      <span className="thoughts-beat-connector-text">
        Which revealed three things worth building toward.
      </span>
      <span className="thoughts-beat-connector-line" aria-hidden="true" />
    </div>,
    card,
  ];
}

return [card];
```

**Replace with:**
```tsx
if (i === 2) {
  return [
    <div key="connector-1-2" className="thoughts-beat-connector">
      <span className="thoughts-beat-connector-line" aria-hidden="true" />
      <span className="thoughts-beat-connector-text">
        Which revealed three things worth building toward.
      </span>
      <span className="thoughts-beat-connector-line" aria-hidden="true" />
    </div>,
    card,
  ];
}

if (i === 4) {
  return [
    <div key="connector-3-4" className="thoughts-beat-connector">
      <span className="thoughts-beat-connector-line" aria-hidden="true" />
      <span className="thoughts-beat-connector-text">
        The frameworks I taught became the ones I implemented.
      </span>
      <span className="thoughts-beat-connector-line" aria-hidden="true" />
    </div>,
    card,
  ];
}

return [card];
```

- Beat 05 has `wide: true` so it is already `grid-column: 1 / -1` — the connector above it will also span both columns (it also has `grid-column: 1 / -1` in the CSS)
- This connector reads: "The frameworks I taught became the ones I implemented." — directly linking the courses (Beat 04) to the company integrations (Beat 05)

---

### 2G — Fix the Beat 06 heading and description

The wide case study card currently says "Case studies." and "Here are the write-ups for what I have been building and built." Both are too vague.

**Find inside the wide card's `<div className="thoughts-beat-wide-head">`:**

```tsx
<h3 className="thoughts-beat-title thoughts-beat-title--dark">
  Case studies.
</h3>
<p className="thoughts-beat-description thoughts-beat-description--dark">
  Here are the write-ups for what I have been building and built.
</p>
```

**Replace with:**
```tsx
<h3 className="thoughts-beat-title thoughts-beat-title--dark">
  Nine products and tools.
</h3>
<p className="thoughts-beat-description thoughts-beat-description--dark">
  Each one a direct consequence of the thinking above. Click any to open the full write-up.
</p>
```

---

### 2H — Add `overflow: hidden` to the AnimatePresence motion div

The expandable body animation currently does not clip overflow during the height transition, which can cause content to appear outside the card boundary during open/close.

**Find the motion.div inside `<AnimatePresence initial={false}>`:**
```tsx
<motion.div
  key="body"
  className="thoughts-beat-body"
  initial={{ opacity: 0, height: 0 }}
  animate={{ opacity: 1, height: 'auto' }}
  exit={{ opacity: 0, height: 0 }}
  transition={{ duration: 0.32, ease: [0.25, 0.1, 0.25, 1] }}
>
```

**Replace with:**
```tsx
<motion.div
  key="body"
  className="thoughts-beat-body"
  initial={{ opacity: 0, height: 0 }}
  animate={{ opacity: 1, height: 'auto' }}
  exit={{ opacity: 0, height: 0 }}
  transition={{ duration: 0.32, ease: [0.25, 0.1, 0.25, 1] }}
  style={{ overflow: 'hidden' }}
>
```

---

## PART 3 — Final verification checklist

After making all changes, verify every item before declaring done.

### Hero (Foundations.tsx)
- [ ] The large italic text under "Thoughts" reads "A coherent argument, not a list of achievements." — not the manifesto quote
- [ ] The panel card on the right shows the manifesto quote: "You are not defined by what you do. You are shaped by what you create."
- [ ] The panel card shows NO debug text ("2222", "Two two two two", "2 talks / 2 books / 2 courses")
- [ ] The hero body paragraph (below the heading) is the existing `frame.body` text — do not change it

### Beat cards collapsed state
- [ ] Beat 01 card is approximately 140–160px tall when collapsed. Proof text reads: "Experience → values → vision → strategy → action" (one line)
- [ ] Beat 02 card is approximately 140–160px tall when collapsed. Proof text is one short line referencing TEDx
- [ ] Beat 03 card is approximately 140–160px tall when collapsed. Proof text reads: "The Proposition · The Meaning of Life · nsso" (one line)
- [ ] Beat 04 card is approximately 140–160px tall when collapsed
- [ ] Beat 05 spans both columns (full width), approximately 140–160px tall when collapsed

### Beat cards expanded state
- [ ] Clicking Beat 01 reveals description about the Stratetree + "Explore the OS →" button
- [ ] Clicking Beat 02 reveals description about the TEDx talk + "Watch the talk →" link
- [ ] Clicking Beat 03 reveals description about storytelling, The Proposition, The Meaning of Life, nsso — NO mention of courses in this body text
- [ ] Clicking Beat 04 reveals description about the university talk + the two courses + "Watch the talk →" link + two course mini-cards (thumbnail + course name + one stat each)
- [ ] Clicking Beat 05 reveals body text that explicitly names: Product Innovation Process → GroupM and WLP; AI-Native Product OS → Side.inc and Bayut; plus "AI-Native Product OS →" button that opens the reader overlay
- [ ] Only one card can be open at a time — clicking a new card closes the previous one

### Connectors
- [ ] A connector line appears between Beat 02 and Beat 03 reading: "Which revealed three things worth building toward."
- [ ] A connector line appears between the Beat 03/04 row and Beat 05 reading: "The frameworks I taught became the ones I implemented."

### Case studies section
- [ ] Heading reads "Nine products and tools." (not "Case studies.")
- [ ] Sub-text reads "Each one a direct consequence of the thinking above. Click any to open the full write-up."
- [ ] All 9 case study rows are present with thumbnails and READ → buttons

### Technical
- [ ] TypeScript compiles with zero errors
- [ ] No console errors in the browser
- [ ] Page total height is under 5,000px at 1440px viewport with all cards collapsed
- [ ] The expand/collapse animation clips cleanly — no content overflows outside the card boundary during transition

---

## DO NOT

- Do not remove the `CourseProofPanel` component definition from the file — it is already not being rendered and can stay as dead code
- Do not change the `beatAnchors` map — the rail navigation depends on it
- Do not change the order of beats
- Do not touch `ThoughtsPage.tsx`, `CaseWriteups.tsx`, `Talks.tsx`, `Books.tsx`, or `Courses.tsx`
- Do not add any sections between the beat grid and the wide case study card
- Do not change the course mini-card render logic inside `beat.index === '04'` — only the surrounding beat content changes
- Do not modify the `CaseStudyWriteupIndex` compact prop call — it is correct
