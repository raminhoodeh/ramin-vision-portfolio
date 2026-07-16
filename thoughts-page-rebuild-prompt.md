# THOUGHTS PAGE — COMPLETE STRUCTURAL REBUILD (READ THIS ENTIRE DOCUMENT BEFORE TOUCHING ANY FILE)

## CONTEXT YOU MUST UNDERSTAND FIRST

This is a React 19 + TypeScript + Framer Motion portfolio. The Thoughts page (`src/sections/TeachingWriting/`) currently renders **ten heavy editorial components stacked vertically**, producing a page 56,000px tall. Nobody reads it. Your task is to demolish that structure and replace it with a compact, interactive 6-beat grid.

The existing editorial components (`TalksStage`, `BooksShelf`, `ThoughtFoundationsSection`, etc.) are **not wrong** — they just must not be rendered on the Thoughts page anymore. Do not modify those component files. Do not delete them.

---

## YOU WILL CHANGE EXACTLY TWO FILES

1. **Gut** `src/sections/TeachingWriting/ThoughtsPage.tsx`
2. **Create** `src/sections/TeachingWriting/ThoughtsOverview.tsx`

Then **append CSS** to `src/index.css`.

No other files.

---

## FILE 1 — Replace `src/sections/TeachingWriting/ThoughtsPage.tsx` entirely

```tsx
import { AuroraBackground } from '@/components/ui/aurora-background';
import { portfolioContent } from '../../data/portfolio';
import { type CaseStudyEntry } from '../types';
import { ThoughtEditorialHero } from './Foundations';
import { ThoughtsOverview } from './ThoughtsOverview';

export function ThoughtsPage({ onOpen }: { onOpen: (item: CaseStudyEntry) => void }) {
  const { writing } = portfolioContent.teachingSpeakingWriting;

  return (
    <section id="thoughts" className="thoughts-editorial relative isolate overflow-hidden">
      <AuroraBackground className="thoughts-aurora-shell min-h-full items-stretch justify-start bg-zinc-50">
        <ThoughtEditorialHero />
        <div className="thoughts-editorial-body relative z-10 mx-auto max-w-[1440px] px-5 py-8 pb-32 sm:px-8 md:px-12 md:py-12 md:pb-32 lg:px-16">
          <ThoughtsOverview caseStudies={writing.caseStudies} onOpen={onOpen} />
        </div>
      </AuroraBackground>
    </section>
  );
}
```

That is the complete file. It imports nothing else. It renders nothing else. Do not add back any of the old components.

---

## FILE 2 — Create `src/sections/TeachingWriting/ThoughtsOverview.tsx`

This file must be created from scratch. Write it exactly as specified below, in order.

### 2a. Imports

```tsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { portfolioContent } from '../../data/portfolio';
import { type WritingCaseStudyEntry, type CaseStudyEntry } from '../types';
import { selfwareGeneratedArtwork, toolGeneratedArtwork } from '../Projects/index';
import { getProjectReader } from '../Projects/types';
import { CaseStudyWriteupIndex } from './CaseWriteups';
```

### 2b. Beat type definitions (put before the component, not inside it)

```tsx
type BeatCta =
  | { kind: 'link'; label: string; href: string }
  | { kind: 'button'; label: string; onClick: () => void };

type Beat = {
  index: string;         // '01' through '06'
  label: string;         // Short tag shown as a pill at top-left of each card
  title: string;         // Large heading text
  body: string;          // Detail text, hidden until card is expanded
  artwork: string | undefined;  // Image URL for background, or undefined for glass card
  ctas: BeatCta[];
};
```

### 2c. The `ThoughtsOverview` component

```tsx
export function ThoughtsOverview({
  caseStudies,
  onOpen,
}: {
  caseStudies: readonly WritingCaseStudyEntry[];
  onOpen: (item: CaseStudyEntry) => void;
}) {
  const [openBeat, setOpenBeat] = useState<string | null>(null);
  const { speaking, writing } = portfolioContent.teachingSpeakingWriting;

  // Pull artwork from existing data. media.path is a string URL resolved from imported assets.
  const tedxImagePath: string | undefined =
    typeof speaking[0].media.path === 'string' ? speaking[0].media.path : undefined;
  const uniTalkImagePath: string | undefined =
    typeof speaking[1].media.path === 'string' ? speaking[1].media.path : undefined;
  const bookCoverPath: string | undefined =
    typeof writing.books[0].bookImage === 'string' ? writing.books[0].bookImage : undefined;
  const osArtwork: string | undefined =
    toolGeneratedArtwork['AI Native Product OS'] ?? selfwareGeneratedArtwork['AI Native Product OS'];
  const workArtwork: string | undefined = toolGeneratedArtwork['AI Costs Dashboard'];

  const osReader = getProjectReader('AI Native Product OS');

  function toggleBeat(index: string) {
    setOpenBeat((prev) => (prev === index ? null : index));
  }

  const beats: Beat[] = [
    {
      index: '01',
      label: 'How I think',
      title: 'The Stratetree',
      body: 'A first-principles metacognitive framework — experience → values → vision → strategy → action. The lens behind every product decision on this page.',
      artwork: osArtwork,
      ctas: osReader
        ? [{ kind: 'button', label: 'Explore the OS →', onClick: () => onOpen(osReader) }]
        : [],
    },
    {
      index: '02',
      label: 'What I value',
      title: 'Existentially Viewing Your Existential Crisis',
      body: 'TEDx Imperial College London. Using cosmic perspective and guided meditation to help an audience rediscover what they actually care about — and make decisions from that place.',
      artwork: tedxImagePath,
      ctas: [
        {
          kind: 'link',
          label: 'Watch the talk →',
          href: 'https://www.ted.com/talks/ramin_hoodeh_existentially_viewing_your_existential_crisis',
        },
      ],
    },
    {
      index: '03',
      label: 'What I love',
      title: 'The Proposition & Selfware',
      body: 'A spiritual fiction novel, and nsso — a personal music identity product. Storytelling and building compound into one career. You are not defined by what you do. You are shaped by what you create.',
      artwork: bookCoverPath,
      ctas: [
        {
          kind: 'link',
          label: 'The Proposition →',
          href: 'https://www.amazon.co.uk/Proposition-Ramin-Hoodeh/dp/B0C7BFXQNM',
        },
        { kind: 'link', label: 'nsso →', href: 'https://nsso.me/ramin' },
      ],
    },
    {
      index: '04',
      label: 'How I teach it',
      title: 'My Story',
      body: 'A university talk: from Iran to Manchester, Tesla to the ESA shortlist to a fruit shop, and how to turn passion and career into fuel for each other — the middle way.',
      artwork: uniTalkImagePath,
      ctas: [
        {
          kind: 'link',
          label: 'Watch the talk →',
          href: 'https://www.youtube.com/watch?v=fpNNyHFUKzM',
        },
      ],
    },
    {
      index: '05',
      label: 'How I apply it',
      title: 'In the work',
      body: 'The Product Innovation Process at OS, GroupM, and Vivup. AI-native development building Selfware. Storytelling structuring every product brief. The framework does not stay theoretical.',
      artwork: workArtwork,
      ctas: [],
    },
  ];

  return (
    <div className="thoughts-overview-root">
      {/* Beats 01–05: 2-column grid of expandable cards */}
      <div className="thoughts-overview-grid">
        {beats.map((beat, i) => {
          const isOpen = openBeat === beat.index;
          const hasArtwork = Boolean(beat.artwork);

          return (
            <motion.article
              key={beat.index}
              layout
              className={[
                'thoughts-beat-card',
                hasArtwork ? 'thoughts-beat-card--artwork' : 'thoughts-beat-card--glass liquid-glass',
                isOpen ? 'thoughts-beat-card--open' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.55, delay: i * 0.06, ease: [0.25, 0.1, 0.25, 1] }}
            >
              {/* Artwork background layer — only renders when artwork is present */}
              {hasArtwork && (
                <div className="thoughts-beat-art" aria-hidden="true">
                  <img src={beat.artwork} alt="" loading="lazy" decoding="async" />
                  <div className="thoughts-beat-art-shade" />
                </div>
              )}

              {/* Clickable header — always visible */}
              <button
                type="button"
                className="thoughts-beat-header"
                onClick={() => toggleBeat(beat.index)}
                aria-expanded={isOpen}
              >
                <div className="thoughts-beat-header-top">
                  <span className="thoughts-beat-index">{beat.index}</span>
                  <span className="thoughts-beat-label">{beat.label}</span>
                </div>
                <div className="thoughts-beat-header-bottom">
                  <h3 className="thoughts-beat-title">{beat.title}</h3>
                  <span className="thoughts-beat-toggle" aria-hidden="true">
                    {isOpen ? '−' : '+'}
                  </span>
                </div>
              </button>

              {/* Expandable body — hidden when closed, revealed when open */}
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key="body"
                    className="thoughts-beat-body"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.32, ease: [0.25, 0.1, 0.25, 1] }}
                    style={{ overflow: 'hidden' }}
                  >
                    <p className="thoughts-beat-description">{beat.body}</p>
                    {beat.ctas.length > 0 && (
                      <div className="thoughts-beat-ctas">
                        {beat.ctas.map((cta) =>
                          cta.kind === 'link' ? (
                            <a
                              key={cta.label}
                              href={cta.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="thoughts-beat-cta"
                            >
                              {cta.label}
                            </a>
                          ) : (
                            <button
                              key={cta.label}
                              type="button"
                              onClick={cta.onClick}
                              className="thoughts-beat-cta"
                            >
                              {cta.label}
                            </button>
                          ),
                        )}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.article>
          );
        })}
      </div>

      {/* Beat 06 — always visible, full-width, case studies */}
      <motion.div
        className="thoughts-beat-wide liquid-glass-strong"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.55, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <div className="thoughts-beat-wide-head">
          <div className="thoughts-beat-header-top">
            <span className="thoughts-beat-index thoughts-beat-index--dark">06</span>
            <span className="thoughts-beat-label thoughts-beat-label--dark">What it built</span>
          </div>
          <h3 className="thoughts-beat-title thoughts-beat-title--dark">Eight products and tools.</h3>
          <p className="thoughts-beat-description thoughts-beat-description--dark">
            Each one a direct consequence of the thinking above. Click any to open the full write-up.
          </p>
        </div>
        <CaseStudyWriteupIndex caseStudies={caseStudies} onOpen={onOpen} compact />
      </motion.div>
    </div>
  );
}
```

---

## STEP 3 — Append CSS to `src/index.css`

Search `src/index.css` for the line `.thoughts-editorial-body`. Append the following CSS block **after all existing `.thoughts-*` rules** (i.e. after the last `.thoughts-*` selector in the file). Do not add it at the top of the file. Do not replace any existing rule.

```css
/* ─── ThoughtsOverview: 6-beat expandable grid ─── */

.thoughts-overview-root {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.thoughts-overview-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
  align-items: start;
}

@media (max-width: 640px) {
  .thoughts-overview-grid {
    grid-template-columns: 1fr;
  }
}

/* ── Base card ── */
.thoughts-beat-card {
  position: relative;
  border-radius: 1.75rem;
  overflow: hidden;
  cursor: pointer;
  transition: box-shadow 0.2s ease;
}

/* ── Artwork variant: dark card with image background ── */
.thoughts-beat-card--artwork {
  background: rgba(8, 10, 18, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 2px 24px rgba(8, 13, 42, 0.18);
}

.thoughts-beat-card--artwork:hover {
  box-shadow: 0 6px 40px rgba(8, 13, 42, 0.28);
}

/* ── Glass variant: uses .liquid-glass class already defined in this file ── */
.thoughts-beat-card--glass {
  /* .liquid-glass handles background, border, blur */
}

/* ── Artwork background layer ── */
.thoughts-beat-art {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}

.thoughts-beat-art img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.28;
}

.thoughts-beat-art-shade {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(4, 6, 18, 0.25) 0%,
    rgba(4, 6, 18, 0.72) 100%
  );
}

/* ── Clickable header (always visible inside a card) ── */
.thoughts-beat-header {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  padding: 1.5rem;
  text-align: left;
  background: transparent;
  border: none;
  cursor: pointer;
}

.thoughts-beat-header-top {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.thoughts-beat-header-bottom {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 0.75rem;
}

/* ── Index number (small mono label) ── */
.thoughts-beat-index {
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.38);
}

.thoughts-beat-index--dark {
  color: var(--thought-faint);
}

/* ── Label pill ── */
.thoughts-beat-label {
  font-size: 0.6rem;
  font-weight: 500;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.55);
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 999px;
  padding: 0.18rem 0.65rem;
  white-space: nowrap;
}

.thoughts-beat-label--dark {
  color: var(--thought-faint);
  background: rgba(15, 23, 42, 0.06);
  border-color: var(--thought-hairline);
}

/* ── Card title ── */
.thoughts-beat-title {
  font-size: 1.35rem;
  font-weight: 600;
  letter-spacing: -0.04em;
  line-height: 1.2;
  color: rgba(255, 255, 255, 0.95);
  margin: 0;
  flex: 1;
}

.thoughts-beat-title--dark {
  color: var(--thought-strong);
}

/* ── Toggle indicator (+ / −) ── */
.thoughts-beat-toggle {
  font-size: 1.1rem;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.45);
  line-height: 1;
  flex-shrink: 0;
  width: 1.5rem;
  text-align: right;
  user-select: none;
}

/* ── Expandable body (inside AnimatePresence) ── */
.thoughts-beat-body {
  position: relative;
  z-index: 1;
  padding: 0 1.5rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
}

/* ── Description text ── */
.thoughts-beat-description {
  font-size: 0.78rem;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.58);
  margin: 0;
}

.thoughts-beat-description--dark {
  color: var(--thought-muted);
}

/* ── CTA row ── */
.thoughts-beat-ctas {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.thoughts-beat-cta {
  display: inline-block;
  font-size: 0.65rem;
  font-weight: 500;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  text-decoration: none;
  color: rgba(255, 255, 255, 0.85);
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 999px;
  padding: 0.3rem 0.85rem;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease;
  white-space: nowrap;
  line-height: 1.4;
}

.thoughts-beat-cta:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
}

/* ── Beat 06: full-width case study card ── */
.thoughts-beat-wide {
  border-radius: 1.75rem;
  overflow: hidden;
  /* .liquid-glass-strong provides background, border, backdrop-filter */
}

.thoughts-beat-wide-head {
  padding: 2rem 2rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  border-bottom: 1px solid var(--thought-hairline);
}
```

---

## EXACT VERIFIED IMPORT PATHS (do not guess, use these)

| What | Path |
|---|---|
| `portfolioContent` | `'../../data/portfolio'` |
| `WritingCaseStudyEntry`, `CaseStudyEntry` | `'../types'` |
| `selfwareGeneratedArtwork`, `toolGeneratedArtwork` | `'../Projects/index'` |
| `getProjectReader` | `'../Projects/types'` |
| `CaseStudyWriteupIndex` | `'./CaseWriteups'` |
| `ThoughtEditorialHero` | `'./Foundations'` |
| `AuroraBackground` | `'@/components/ui/aurora-background'` |

---

## EXACT VERIFIED DATA ACCESS (do not infer, use these)

| What | Access expression |
|---|---|
| TEDx image URL | `portfolioContent.teachingSpeakingWriting.speaking[0].media.path` |
| University talk image URL | `portfolioContent.teachingSpeakingWriting.speaking[1].media.path` |
| Proposition book cover URL | `portfolioContent.teachingSpeakingWriting.writing.books[0].bookImage` |
| AI Native OS artwork | `toolGeneratedArtwork['AI Native Product OS']` |
| Work artwork (fallback) | `toolGeneratedArtwork['AI Costs Dashboard']` |
| Case study list | `portfolioContent.teachingSpeakingWriting.writing.caseStudies` (passed as prop) |

For `bookImage` and `media.path`: wrap each in `typeof x === 'string' ? x : undefined` before assigning to `artwork`. This handles any `PlaceholderLike` values without importing placeholder utilities.

---

## EXACT VERIFIED CSS VARIABLES IN SCOPE

These already exist on `.thoughts-editorial` in `src/index.css`. Use them for the `--dark` modifier classes:

| Variable | Approximate value |
|---|---|
| `--thought-strong` | `rgba(2, 6, 14, 0.98)` — near-black for headings |
| `--thought-muted` | `rgba(30, 41, 59, 0.68)` — body text |
| `--thought-faint` | `rgba(51, 65, 85, 0.48)` — labels and small text |
| `--thought-hairline` | `rgba(15, 23, 42, 0.14)` — borders |
| `--thought-panel` | `rgba(255, 255, 255, 0.62)` — panel background |

---

## `liquid-glass` CLASS BEHAVIOR (already defined, do not redefine)

`.liquid-glass` and `.liquid-glass-strong` are fully defined in `src/index.css` starting at line 263. They provide backdrop-filter blur, semi-transparent white background, and border. Apply them as extra class names on the relevant elements — do not write competing background or border properties that would override them.

---

## WHAT THE PAGE SHOULD LOOK LIKE WHEN DONE

**At rest (no card open):** The grid renders 5 compact cards (~140–160px each depending on title length), all showing index + label pill + title + a `+` indicator. Below the grid, the full-width Beat 06 card shows the compact case study list. Entire page height should be **under 4,500px** at 1440px viewport width.

**When Beat 01 is clicked:** It expands in-place via AnimatePresence, revealing the description text and "Explore the OS →" button. Other cards are unchanged. The `+` becomes `−`. Click again to collapse.

**Only one card can be open at a time.** When you click a different card, the currently open card closes and the new one opens.

**Beat 06 never collapses.** It is always fully visible.

---

## DO NOT

- Do not modify `Foundations.tsx`, `Talks.tsx`, `Books.tsx`, `Courses.tsx`, `ArchitectureBridge.tsx`, `PassionManifest.tsx`, `WorkIntegration.tsx`, or `CaseWriteups.tsx`
- Do not add `ActDivider`, `TalksStage`, `ThoughtFoundationsSection`, `BooksShelf`, `IntegrationStage`, `CoursesCurriculum`, `ThoughtsBuildCrescendo`, `ThoughtArchitectureBridge`, `WorkIntegrationNarrative`, or `PassionManifest` anywhere in the render tree
- Do not create a separate CSS file — all CSS goes into `src/index.css`
- Do not use inline `style={{}}` props for layout — use the CSS classes specified above
- Do not use `useRef` or `ResizeObserver` for the expand animation — Framer Motion's `AnimatePresence` with `height: 0 → 'auto'` handles it
- Do not add error boundaries, suspense, or fallback loading states — these components are synchronous
- Do not hardcode asset paths as string literals — always pull from the data objects as shown above
- Do not rename `ThoughtsOverview` or its export — `ThoughtsPage.tsx` imports it by that exact name

---

## VERIFICATION CHECKLIST

Run through this after implementing. Every item must pass.

1. TypeScript compiles with zero errors (`tsc --noEmit` or equivalent)
2. `ThoughtsPage.tsx` imports only: `AuroraBackground`, `portfolioContent`, `CaseStudyEntry`, `ThoughtEditorialHero`, `ThoughtsOverview`
3. `ThoughtsPage.tsx` renders only two direct children inside AuroraBackground: `<ThoughtEditorialHero />` and a div containing `<ThoughtsOverview />`
4. In the browser: the page is under 5,000px tall at 1440px viewport width with no cards open (check DevTools → Elements → `.thoughts-editorial` → scrollHeight)
5. All 5 beat cards (`01`–`05`) are visible without scrolling or with minimal scroll at 1440px wide
6. Clicking beat `01` expands it smoothly to show description text and a "Explore the OS →" button
7. Clicking beat `01` again collapses it back to its compact height
8. Clicking beat `02` while beat `01` is open: beat `01` closes and beat `02` opens
9. The TEDx card (beat `02`) shows the TEDx talk image as a dim background — not a broken `<img>` src — and white text on top
10. Beat `06` is always visible, full-width, and shows at least one row of the case study list
11. Clicking "Read →" on a case study row inside beat `06` triggers the `onOpen` handler (the reader overlay opens)
12. On a 375px wide mobile viewport: cards stack to single column, all cards readable, no horizontal overflow
