# Product Thesis — Scroll-Scrubbed Derivation Canvas (Plan)

Status: Implemented through fallback + polish. Full `npm run verify` passed.
Verified against the current ThesisDeepDive.tsx (Jun 11, post-Ramin copyedits): structure unchanged —
same 8 sections/ids/order, same 8 diagram keys, same block layout. Ramin's edits were copy-level only
(headings de-numbered + title case, em-dashes → hyphens, small rewordings, Rule 4 "not only builder",
Fruit links reduced to "Install the Product OS" + "Projects"). Every storyboard beat below still maps
1:1 to live content (PIP retirement ✓, five values ✓, anti-fragility fork ✓, two instruments ✓,
hinge ✓, consequences + six rules ✓, five products + infra + Bayut ✓, reads-both-directions line ✓).
Sources: reverse-engineered `LoopTimeline` from anthropic.com/institute/recursive-self-improvement
(saved bundle in `anthropic-animation-inspiration/`, pretty-printed at `/tmp/looptimeline.pretty.js`),
frame-by-frame study of the screen recording, and an audit of `src/sections/Projects/ThesisDeepDive.tsx`.

---

## 1. What Anthropic actually built (the verdict)

**It is not Lottie, not Rive, not canvas.** The "lottie" hits in the bundle are the header wordmark;
"rive" hits are substrings of `deRivedStateFromError`. The diagram is a single hand-rolled,
React-rendered inline SVG (`LoopTimeline`), where **every visual property is a pure function of one
smoothed scroll value**. That is the entire trick, and it is 1:1 portable to our stack.

Their machine, distilled:

1. **One persistent SVG world** — never swapped, never crossfaded. `viewBox="20 0 557 930"`, icons as
   `<symbol>/<use>`, all wires as computed path strings.
2. **Scroll → raw progress**: `-rect.top / (sectionHeight - innerHeight)`, clamped 0..1, from a passive
   scroll listener. Track = 650vh section with a 100svh sticky frame (≈5.5 viewports of scrub).
3. **Inertia**: a rAF loop lerps displayed progress toward raw progress at **0.15/frame**, snapping at
   |Δ| < 5e-4 (then idles). This "catch-up glide" is the single biggest contributor to the flowing feel.
4. **Segment windows with dead gaps**: `[0,.16] [.20,.36] [.40,.56] [.60,.76] [.80,1]` — 4% rest gaps
   between steps (breathing beats). Per-segment progress feeds a **virtual master timeline**
   `TL = [0, 1.4, 2.8, 4.2, 5.6, 7.85]` (1.4 units per era), `x = Σ uᵢ·ΔTLᵢ`.
5. **Within each era (1.2-unit reveal)**: pill sweeps open from the left (easeInOutQuad, 0→0.85) →
   wires draw behind the sweep front (`pathLength={1} strokeDasharray="1 1" strokeDashoffset={1-a}`) →
   icons pop with **easeOutBack** (1.70158 overshoot) as the front passes their x →
   labels fade last (0.85→1.0).
6. **Handoffs bleed across boundaries**: the red inter-row wire starts at local t=1.02 (85% through its
   era) and finishes 0.12 units into the NEXT era — transitions overlap instead of waiting.
7. **The camera is viewBox interpolation**: per-era targets grow the viewBox height to just below the
   newest row; with `preserveAspectRatio="xMidYMid meet"` in a fixed 88svh box, taller viewBox = zoom
   out. Camera glides in the first 30% of each window with easeOutCubic, then settles while the row draws.
8. **The narrative grammar**: each row repeats the previous row plus exactly ONE new element; the red
   elbow wire drops each era's output (the spark) into the next era's new tool — causation drawn as ink.
   The spark bitmap grows denser per era (7→9→13→17→19). The final row closes the loop on itself.
   **Red encodes exactly one thing** (AI's share of the work); everything else is neutral.
9. **Text column never moves** — active step flips `data-state`, dimming is pure CSS
   (`opacity .5`, `transition .25s`). The eye stays on the diagram.
10. **Fallback**: below 992px OR `prefers-reduced-motion` → `data-static` renders the **completed**
    diagram as a normal figure, no track, no sticky. SVG is `role="img"` + aria-label.
11. A CSS "ant-trail" current-flow animation along wires exists (dasharray 4 10, speeds accelerating
    per era 1.8s→0.2s — speed itself encoding acceleration) but **shipped disabled**.

## 2. What this means against our current rail

Our rail today is the anti-pattern this design exists to avoid: 8 unrelated diagrams swapped by
keyed remount (a slideshow). The redesign: **one DerivationCanvas** that accumulates the whole thesis
flowchart beat by beat, scrubbed by reading progress, ending on the complete "MY AI PRODUCT THESIS"
flowchart as the zoomed-out money shot — the visual equivalent of "read it in both directions."

Codebase audit verdicts (full detail in workflow output):

- **framer-motion 12.38** has everything: `useScroll({container})`, `useTransform`, `useSpring`
  (sleeps when settled — guardrail-friendly inertia), `useMotionValueEvent`, motion SVG elements,
  built-in `pathLength` (it implements Anthropic's exact dasharray trick internally).
- **CRITICAL**: window never scrolls in this app. Master progress must bind to
  `.project-deep-dive-scroll` (scrollRef) on lg. The four `useScroll` usages in Projects/index.tsx
  omit `container` — do NOT copy them.
- **No setState per frame** (guardrail + 1467-line component): continuous values live in MotionValues
  bound straight to SVG attrs; React state only for the discrete activeIndex (existing bail-out kept).
- **No free-running rAF**: use `useSpring` (auto-sleeps) instead of a hand rAF lerp loop.
- **Keyed remount must go**: all beats render once, stacked, each element windowed on master time.
  The current keyed crossfade survives only as the reduced-motion fallback.
- **Mobile** (rail scrolls away, not sticky): render the static completed flowchart, exactly like
  Anthropic's `data-static`. Scrub is lg-only (`matchMedia(min-width:1024px) && !prefers-reduced-motion`).
- AnimatePresence unmount: all motion values created inside hooks → disposed with component. No GSAP needed.
- Headless preview throttles rAF/scroll: add a dev-only progress override (e.g. `window.__thesisProgress`)
  so states can be screenshot-verified.

## 3. Master progress: reading-driven, not track-driven

Anthropic uses an artificial 650vh empty track. We don't need one — **the right text column IS the
track**. Master time derives from the reader's actual position:

- Per-section fraction fᵢ ∈ [0,1] from each section's rect vs the 30% viewport line (machinery we
  already have), made continuous.
- `x = Σ over sections (eased fᵢ × unitsᵢ)` — each section contributes fixed timeline units regardless
  of its pixel height, so long sections (Strategy, Fruit) don't starve the animation and short ones
  don't rush it. This is their segment-window idea, anchored to real content boundaries.
- Smooth with `useSpring(x, { stiffness ~90, damping ~30, restDelta 5e-4 })` ≈ their 0.15 lerp glide.
- Reversibility is free: everything is a pure function of x.

Section units (tunable): thesis 0.8 · soil 1.2 · roots 1.2 · trunk 1.0 · branches 1.2 ·
strategy 1.6 · tactics 1.2 · fruit 1.6 → x_end ≈ 9.8. Insert 0.05-unit dead gaps at boundaries.

## 4. The storyboard — eight beats, one growing flowchart

World: one tall SVG (~600×1700 virtual units). Camera = animated `viewBox` (per-beat targets,
monotonic zoom-out; glide on the first 30% of each beat, easeOutCubic). Accent (#a5b4fc) encodes
exactly one thing: **the live edge of the derivation** (what the conditions force / the chosen path).
Everything settled turns neutral. Micro-grammar per beat (standardized): pill/band sweep (easeInOutQuad)
→ wires draw behind the front (pathLength) → nodes pop (easeOutBack) as the front passes → small-caps
labels fade last → handoff wire bleeds 15% into the next beat.

| Beat | Section | x-window | What accumulates (in logic order) |
|---|---|---|---|
| B0 | The thesis | 0–0.8 | "Advancement in AI Technology" node sweeps in alone, centered. A faint soil hairline hints below (0.5–0.8). |
| B1 | ① Soil | 0.8–2.0 | "WHICH CAUSES…" wires draw to **Overinformation** (left) and **Evolution in execution** (right); Evolution splits → **Probabilistic** + **Cheap & Fast** pop. Then the kill: the old pipeline `Idea→Design→Concept→Alpha/Beta→Live` draws in gray to the side (1.7) and **fades to 25% with a strike** (1.85–2.0) — the retired PIP, visualized. Handoff wire toward the values band starts at 1.9. |
| B2 | ② Roots | 2.0–3.2 | Dashed **HUMAN LAYER** band sweeps open; five value capsules (clarity, judgement, vision, taste, empathy) pop staggered as the front passes, each fed by its condition wire (overinfo→clarity; execution→the rest). Band label fades last. Trunk wire bleeds at 3.1. |
| B3 | ③ Trunk | 3.2–4.2 | Fork dot pops. Dashed gray wire → **"Max output now"** draws first (3.25–3.55)… then *withers* — both fade to 30% (3.8–4.0), the one deliberate disappearance in the whole piece (the road not taken). Accent wire → **Anti-fragility ★** draws (3.5–3.85), pops, and stays accent forever — the chosen trunk everything else now passes through. |
| B4 | ④ Branches | 4.2–5.4 | From Anti-fragility, two branch wires draw to a **pyramid silhouette** (Stack — pill sweep + outline) and a **ring** (Loop — arc sweeps 0→360°). Captions: *structure · where you think* / *motion · what you do*. Layer dividers begin to bleed in at 5.3. |
| B5 | ⑤ Strategy | 5.4–7.0 | Detail pass at constant scale (no zoom-in — history stays visible): pyramid dividers + labels pop **bottom-up** Model→Human (0.14 units each); ring verbs **1. Talk → 5. Iterate** pop in sequence with direction arrowheads drawing between them; then the signature move — the dashed accent **hinge wire** draws from the Orchestration layer into the ring (6.4–6.7), label "the hinge". Optional garnish: CSS ant-trail current starts flowing around the ring only (fast = "hours, not quarters"). |
| B6 | ⑥ Tactics | 7.0–8.2 | Four consequence ticks+tags draw onto their layers in order (C1→Model+Context … C4→Human), each tick 0.12 + tag fade 0.05; then six rule chips stamp in a row, staggered 0.06 — strategy becoming practice. |
| B7 | ⑦ Fruit | 8.2–9.8 | A branch arc grows from the ring; five fruit circles pop with stems (nsso, Dreamsea, Qadam, RazinFlix, 24Seven); infra chips slide beneath ("runs on"); Bayut node. **Finale (9.35–9.8)**: camera zooms all the way out — the complete flowchart, every beat still on canvas; "▲ forced" / "▼ justified" markers fade in along the edge. The full tree is the last frame. |

Right column: adopt Anthropic's dimming — active section card at full strength, others at ~0.55
opacity, 0.25s CSS transitions, driven by the existing activeIndex. Rail caption + numeral keep
their discrete swap (text, not canvas).

## 5. Component architecture

```
ThesisDeepDive.tsx
├─ useThesisScrub(scrollRef, sectionRefs)   // raw fractions → master time x (MotionValue)
│    ├─ useSpring(x)                        // inertia, sleeps when settled
│    ├─ useMotionValueEvent → activeIndex   // discrete, for dimming/caption/dots
│    └─ dev override: window.__thesisProgress
├─ ThesisRail
│    └─ DerivationCanvas (NEW — replaces the 8 swapped diagrams on lg)
│         ├─ <motion.svg viewBox={cameraVB}>            // useTransform(x) → "x y w h" string
│         ├─ TIMELINE manifest: per-element {window:[t0,t1], kind, easing}  // the derivation order, as data
│         ├─ primitives: <DrawWire> (motion.path pathLength), <PopNode> (easeOutBack scale),
│         │              <SweepPill> (clip/scaleX), <FadeLabel>
│         └─ reuses Box/Arrow/RingFlowArrow geometry + color constants
└─ static fallback (mobile / reduced-motion / non-lg): DerivationCanvas frozen at x_end
```

The TIMELINE manifest is the deliverable that "respects the rigid flow of logic": it is literally the
derivation, expressed as ordered windows — reviewable as data before any pixel moves.

## 6. Build phases (when approved)

1. **Plumbing** — ✅ DONE (Jun 11). What exists now:
   - `src/sections/Projects/useThesisScrub.ts` — master scrub hook. Returns `{ progress, smooth,
     activeIndex, totalUnits }`. `progress` = raw master time in beat units (MotionValue);
     `smooth` = `useSpring(progress, { stiffness: 90, damping: 30, restDelta: 5e-4 })`, mirrors raw
     under reduced motion. Binds scroll on BOTH the inner column (lg) and overlay root (mobile);
     per-section fractions from rects vs the 30% read line; normalization anchored at both ends
     (x ∈ [0, 9.8] exactly — verified: top=0, bottom=9.8). Dev override:
     `window.__thesisScrub.set(0..1|null)` / `.get()` (DEV only) — verified driving activeIndex.
   - `ThesisDeepDive.tsx`: `units` field on every section (0.8/1.2/1.2/1.0/1.2/1.6/1.2/1.6 =
     9.8 total) + `SECTION_UNITS` export-ready constant; old scroll-spy effect REPLACED by the hook;
     `rootRef` added to the overlay root (fixes dead mobile spy); Anthropic-style section dimming
     (active card `opacity-100`, others `opacity-[0.55]`, 300ms transition, `data-state` attr).
   - NOT yet consumed: `progress`/`smooth` (destructure them from the hook in phase 2 —
     currently only `activeIndex` is used). Old 8 swapped diagrams untouched, still keyed-remount.
   - Phase 2 starts by: building `DerivationCanvas` (stacked beats, camera viewBox), consuming
     `smooth`, computing beat windows from cumulative `SECTION_UNITS` starts:
     thesis 0 · soil 0.8 · roots 2.0 · trunk 3.2 · branches 4.2 · strategy 5.4 · tactics 7.0 ·
     fruit 8.2 · end 9.8.
2. **Canvas skeleton** — ✅ DONE (Jun 12). What exists now:
   - `src/sections/Projects/DerivationCanvas.tsx` — one persistent `<svg>` world (≈640×710 used so
     far), memo'd (ThesisRail re-renders on activeIndex; the canvas never reconciles after mount).
     Beats B0–B3 fully implemented as windows of master time `x`:
     B0 thesis node draws alone + soil hairline hint (fades when B1's real wires arrive);
     B1 "which causes…" wires → Overinformation + Evolution in execution → split → Probabilistic +
     Cheap & fast pop; the retired PIP draws as a vertical gray waterfall column (Idea→…→Live),
     gets struck through and withers to 30% ("RETIRED");
     B2 condition wires hand off into the dashed HUMAN LAYER band (sweeps open via self-mask),
     five value capsules pop staggered, band label fades last, trunk wire bleeds at 3.08;
     B3 fork dot → dashed gray "Max output now" (withers to 32%, "NOT CHOSEN") vs accent
     "Anti-fragility ★ CHOSEN" (stays accent forever).
   - Primitives: `Wire` (framer `pathLength` draw-on), `DashedWire` (dashed path revealed by a white
     self-copy drawing inside a per-instance `<mask>` — framer's pathLength owns dasharray, so
     dashed paths can't scrub directly), `ArrowTip` (pops at the wire's end, rotated to the end
     tangent), `NodeDraw` (outline draws around, fill+label settle), `NodePop`/`Capsule`/`PopGroup`
     (easeOutBack scale via CSS transform string — px = SVG user units), `FadeText`/`FadeGroup`.
   - Camera: `cameraAt(x)` piecewise-interpolates viewBox rect targets
     `[140,-60,360,300] → [10,-10,620,430] → [10,-10,620,530] → [10,-10,620,710]` at beat starts
     (easeOutCubic over the first ~30% of each beat), written imperatively via
     `useMotionValueEvent` + `setAttribute('viewBox')` — zero React renders per frame.
   - `ThesisDeepDive.tsx`: `smooth` now consumed; `USE_DERIVATION_CANVAS` flag (legacy keyed
     diagrams remain the reduced-motion fallback and escape hatch); rail center swaps to the canvas.
   - `useThesisScrub.ts`: dev override now `spring.jump()`s so `smooth` is deterministic in
     headless previews.
   - Verified in-browser (desktop 1440px + mobile 375px): all beats at forced stops, camera glides,
     reverse scrub unwinds, real scroll + spring drives it, mobile mounts and scrubs via overlay
     root, zero console errors, tsc clean for these files. Past x=4.2 the canvas holds the B3 frame
     (B4–B7 are phase 3/4 — they extend the same world downward and add CAMERA entries).
   - Adversarial review pass (verified against installed motion-dom 12.38 sources) found and fixed:
     (1) MAJOR — framer forces `transform-box:fill-box; transform-origin:50% 50%` on SVG motion
     elements, so origin-(0,0) translate-sandwich transform strings double the origin shift: pops
     slid in diagonally from outside the camera mid-window, arrowheads rested ~6–9 units off their
     wire ends. Fix: PopGroup animates framer's own `scale` (fill-box center = pop-in-place);
     ArrowTip places via a plain SVG *attribute* transform (user-space semantics) wrapping a
     motion `scale` pop. RULE FOR B4–B7: never bake translate-to-origin sandwiches into motion
     transform strings on SVG; use attribute transforms for placement + motion `scale`/`opacity`
     for animation. Verified: mid-pop Empathy renders on the band row exactly (screen-y identical
     to settled capsules). (2) minor — under reduced motion the unused spring still ran dead
     physics per scroll event (attachFollow animates regardless of subscribers): spring now follows
     a dedicated `springSource` that compute() only feeds when motion is allowed (swapping the
     useSpring source itself is unsafe — useFollowValue doesn't re-attach on source identity
     change). (3) minor — rail panel's unconditional `min-h-[34rem]` clipped caption + dots on
     short lg viewports: added `lg:min-h-0`. Also: DerivationCanvas is memo'd (ThesisRail
     re-renders per activeIndex; the canvas must not reconcile).
3. **B4–B6** — ✅ DONE (Jun 12). What exists now:
   - World extended downward to ≈ 690×1075 (camera entries at 4.2 → `[-20,-10,690,1010]` and
     7.0 → `[-20,-10,690,1075]`; B5 deliberately adds NO entry — detail pass at constant scale).
     DashedWire mask bounds widened to x[-40..730] y[-100..1200].
   - **B4 (4.2–5.4)** restores the original hand-drawn chart's causal wiring (Ramin's catch — the
     storyboard had both instruments growing only from Anti-fragility): the Stack pyramid
     (apex 175,745 · base y 925 · half 115) is fed by the branch from Anti-fragility AND by a long
     recall wire from **Overinformation** down the left edge, labeled "THEREFORE YOU NEED / A
     FRAMEWORK OF INFORMATION", its arrow timed to land together with the pyramid outline
     completing (wire 4.22–4.78). The Loop ring (c 505,855 · r 78 · guides 96/48) is fed by the
     branch ("RUNS AS A LOOP") AND a recall wire from **Cheap & fast** down the right edge
     ("A PROCESS WHERE DECIDING / AND BUILDING COMES SOONER"). Captions: THE STACK · structure ·
     where you think / THE LOOP · motion · what you do.
   - **B5 (5.4–7.0)**: pyramid dividers + labels pop bottom-up Model→Human (0.14 units each,
     divider bleeds at 5.3; Orchestration in #cdd5ff); ring verbs 1. Talk → 5. Iterate pop
     clockwise with ArrowTip flow arrows at midpoint angles (tangent = a+90); "AI-Native Loop"
     center label; dashed accent hinge wire from Orchestration's right edge (240,841) dipping
     UNDER the consequence column into the ring's lower-left (433,896), label "the hinge" at the
     curve's belly (310,954) — routed below to avoid the C-tag rows.
   - **B6 (7.0–8.2)**: header "FOUR CONSEQUENCES - ONE PER LAYER"; dashed spine x=300 y 756→893;
     ticks + tags land bottom-up C1→C4 (C1 ticks the Model/Context divider, covering both; C1 t0
     7.18 = the moment the spine's eased front reaches y 889). Then "SIX STANDING RULES - ONE PER
     LAYER, PLUS INITIATION" + six chips stamp staggered 0.06 (Initiation accent); last chip
     bleeds to 8.28 past the fruit boundary — the established handoff idiom.
   - `applyCamera` now dedupes identical viewBox strings (no attribute writes between glides).
     FadeText gained an optional `weight` prop (ring center label).
   - Layout solved the cramped middle: consequence tags sit right of the pyramid (x 306+) with the
     Iterate/Observe labels pulled up/down out of their rows; hinge routed under the column.
   - Verified in-browser (1440px + 375px): forced stops at x = 4.7, 5.2, 6.1, 6.9, 7.55, 8.35;
     camera lands both new rects exactly; reverse scrub to 3.5 fully unwinds B4–B6; chip mid-pop
     screen-y identical to settled neighbors (fill-box scale rule holds); live-scroll geometry
     recomputes correctly (x=7.05 at 62% scroll); zero console errors; tsc clean.
   - Adversarial review (2 resumed runs; timeline + perf dimensions complete, all findings
     refuted or fixed): fixed C1-tick-before-spine-front (7.15→7.18), recall-wire-lands-late
     (4.3–4.85→4.22–4.78), viewBox rewrite dedupe. Refuted as designed: chip boundary bleed,
     spine-as-annotation-rail (no incoming wire by design — caption carries the cause),
     DashedWire mask headroom (phase-4 concern). NOTE for phase 4: if B7 adds a camera entry at
     8.2 it is harmless (chips pop in place under viewBox glides), and any DashedWire below
     y=1200 needs the mask constant grown.
4. **B7 + finale** — ✅ DONE (Jun 12): fruit, infra, Bayut, full zoom-out, forced/justified markers.
5. **Fallbacks + polish** — ✅ DONE (Jun 12): mobile/reduced-motion now renders the completed static
   `DerivationCanvas` frame; legacy keyed diagram components deleted; boundary/dead-gap pass kept the
   established B6→B7 bleed and the B7→finale pullback; ant-trail garnish intentionally left disabled
   for legibility; perf path remains MotionValue-driven with no new scroll listener/rAF or per-frame
   React render; `npm run verify` passed. Forced-stop previews saved in
   `artifacts/thesis-scrub-previews/`.
6. **Dolly camera** — narrated per-beat zoom replaced the early monotonic zoom-out (CAMERA grew from 4
   to 15 entries: B1b, B5a/b/c, B6a/b, B7a/b/c, finale) so each beat fills the rail at a readable scale
   instead of sitting tiny in a wide frame. Fixed (Jun 13):
   - **`slice` → `meet`.** `slice` cropped near-square frames in the portrait rail (~0.733) —
     "Cheap & fast" rendered as "Cheap & f", and the crop shifted with viewport size. `meet` shows
     each rect in full at any aspect ratio; the transparent margin reads as the dark panel behind it,
     so there are no visible letterbox bars. The dolly rule is now simply: **the rect at any x must
     contain everything animating at that x.**
   - **B5 content re-sequenced to match the pan.** The Stack dividers/labels and Loop verbs used to
     animate concurrently (5.3–6.4) while the camera moved Stack→Loop sequentially, so each instrument's
     reveal happened off-screen while the camera held on the other (Ramin's report: "when zoomed in I
     can't see the other moving bit — the triangle and the loop"). Now: Stack details 5.42–5.90 while
     the camera holds on it → Loop verbs 6.04–6.62 while the camera holds on it → the hinge draws
     6.68–7.0 while the camera (B5c `[55,487,540,737]`) frames **both** instruments — the "one system,
     two aspects" reveal where you watch the line bridge the Stack and the Loop together.
   - **B4 widened left** to x=8 (recall-wire tip) and **B7a widened** to `[108,728,524,715]` so the
     left product (nsso) and its branch wire are no longer cut while they animate.
   - Verified on desktop (1440×900) at every beat + transition (B1 Cheap&fast whole; B5a Stack-only,
     B5b Loop-only, B5c both-at-hinge; B7a full fruit fan; finale full tree), forward and reverse
     scrub, and live scroll (progress→spring→camera). Console + tsc clean. Mobile camera could not be
     stepped in the headless preview (rAF-throttled spring + dev-override binds to a non-visible hook
     instance after a resize), but the camera/timeline is a pure function of `x` and `meet` is
     ratio-agnostic, so mobile inherits the same framing; real mobile scroll produced correct progress.

Risks already mitigated in design: container-bound scroll (not window), no setState per frame,
no free rAF, no keyed remounts mid-scrub, sticky architecture unchanged (Safari-safe), motion values
hook-scoped (HMR/AnimatePresence-safe).

---

## 7. Addendum - implementation plan to finish the remaining work

Status at this addendum: phases 1-3 are implemented. The current live canvas covers B0-B6 and holds at
the tactics/rules frame after `x=8.2`. The remaining job is not to redesign the system. It is to extend
the same persistent SVG world downward for B7, finish the final zoom-out frame, and then replace the
remaining legacy fallback path with a completed static canvas.

### 7.1 Principles for the finish

- Do not introduce a new animation system. Continue using `MotionValue`, `useTransform`, `useBeat`,
  `Wire`, `DashedWire`, `ArrowTip`, `PopGroup`, `FadeGroup`, and the existing imperative `viewBox`
  camera.
- Do not add React state for continuous animation. The only state that should move while scrolling is
  the existing discrete `activeIndex`.
- Do not use SVG motion transform sandwiches. Keep the phase-2 rule: placement uses plain SVG
  attribute transforms or baked geometry coordinates; motion elements only animate `scale`, `opacity`,
  and `pathLength`.
- Treat B7 as a conclusion, not another dense detail pass. The final frame must read as the whole
  thesis in one picture.
- If a visual idea is clever but makes the final diagram harder to read, cut it.

### 7.2 B7 geometry and camera

1. Extend the world below the B6 rule chips. First pass target: add roughly 260-340 SVG units of
   vertical space beneath the current y≈1075 world.
2. Increase the `DashedWire` mask bounds before adding any dashed wires below y=1200. Safe target:
   `x=-80`, `y=-120`, `width=860`, `height=1700`.
3. Add two camera entries:
   - `at: 8.2`, glide `0.36`, rect large enough to reveal the fruit row without losing the stack/loop.
   - `at: 9.35`, glide `0.45`, final rect large enough to show the complete derivation, including
     forced/justified markers.
4. Keep the B7 camera monotonic: it may zoom out, but it should not zoom back in. The ending must feel
   like the camera finally understands the whole system.

Exact rects should be chosen after the first B7 layout pass, not guessed upfront. The verification
criteria are: no clipped fruit, stack and loop still legible, final frame not cramped at 1440px.

### 7.3 B7 narrative implementation

Implement B7 in this order, using windows inside `8.2-9.8`:

1. **Branch wire from the Loop**
   - Draw an accent branch from the loop ring outward/downward.
   - It should originate from the ring rather than from the consequence/rule chips, because the
     products are outputs of the operating loop.
   - Window target: `8.20-8.55`.

2. **Fruit row**
   - Add five product fruit nodes: `nsso`, `Dreamsea`, `Qadam`, `RazinFlix`, `24Seven`.
   - Use compact circles or rounded capsules with short stems from the branch.
   - Keep all product nodes neutral once settled; only the live branch/front should carry the accent.
   - Window target: staggered pops from `8.45-8.95`.

3. **Infrastructure row**
   - Add a small "runs on" layer beneath or beside the fruit row, not competing with it.
   - Candidate chips: `AI-Native PM OS`, `RAG Pipeline`, `AI Costs Dashboard`, `Mass Social Wisdom Agent`.
   - These should read as support infrastructure, not as another set of products. Smaller type,
     lower opacity, and thinner strokes.
   - Window target: `8.85-9.18`.

4. **Bayut node**
   - Add Bayut as the applied/professional proof node after the product fruit, visually distinct from
     the independent product fruit.
   - It can sit as a final applied branch or a grounded rectangle under the fruit layer.
   - The label should communicate "portfolio/product practice applied at company scale", not imply
     Bayut is one of the five independent products.
   - Window target: `9.02-9.28`.

5. **Final read-both-directions markers**
   - Add `UPWARD: FORCED` and `DOWNWARD: JUSTIFIED` markers or edge labels.
   - They should not be decorative. Place them where the final frame teaches the reading method:
     upward from conditions to fruit, downward from fruit back to conditions.
   - Window target: `9.35-9.70`.

6. **Final title/caption**
   - Add a restrained final label such as `MY AI PRODUCT THESIS` or `THE DERIVATION COMPLETE`.
   - It should appear late and softly. The diagram itself is the money shot.
   - Window target: `9.55-9.80`.

### 7.4 B7 code shape

Add B7 as another grouped block inside `DerivationCanvas`, after the B6 section. Keep the code in the
same local style as B4-B6:

- Define B7 coordinates as local constants near the render block so they can be tuned quickly.
- Prefer existing primitives over new ones.
- Add at most one new primitive if necessary: likely a small `FruitNode` wrapper around `PopGroup`
  and SVG circle/capsule geometry.
- Reuse `FadeText` for labels and `Wire`/`ArrowTip` for stems.
- Avoid importing project images or logos. The canvas should remain a diagram, not a product gallery.
- Keep text short enough that the final viewBox can remain readable.

### 7.5 Static fallback completion

After B7 is in place, replace the remaining legacy keyed-diagram fallback with a static completed
`DerivationCanvas` frame:

1. Create a frozen `MotionValue` at `totalUnits` or add an explicit `staticX` path for the canvas.
2. On mobile and reduced motion, render the completed canvas at `x=9.8`.
3. The fallback should show the final full diagram, not a half-built B0-B6 frame.
4. Keep the old diagram components only until this static fallback is verified. Then delete dead
   diagram code in a separate cleanup patch.

### 7.6 Verification plan

Use the existing dev override for deterministic checks:

```js
window.__thesisScrub.set(0)
window.__thesisScrub.set(0.08)
window.__thesisScrub.set(0.2)
window.__thesisScrub.set(0.33)
window.__thesisScrub.set(0.43)
window.__thesisScrub.set(0.55)
window.__thesisScrub.set(0.72)
window.__thesisScrub.set(0.84)
window.__thesisScrub.set(0.94)
window.__thesisScrub.set(1)
```

Translate those normalized values into the actual master time by multiplying by `9.8`. Required visual
screenshots:

- `x=8.2`: B6 complete, B7 not yet active.
- `x≈8.55`: branch wire partially drawn, first fruit beginning.
- `x≈8.95`: fruit row mostly visible.
- `x≈9.2`: infrastructure and Bayut visible.
- `x≈9.55`: final zoom-out in progress, forced/justified markers beginning.
- `x=9.8`: complete final frame.

Also verify:

- reverse scrub from `x=9.8` to `x=7.8` unwinds B7 cleanly;
- mobile/reduced-motion shows the completed static frame;
- no console errors;
- no clipped text at 1440px desktop and a short-height desktop viewport;
- no per-frame React re-render path is introduced;
- `npm run build` passes before any visual handoff.

### 7.7 Cleanup and polish after B7

Only after B7 and the static fallback are verified:

- Delete or park the legacy keyed diagram components that are no longer reachable.
- Update the top status of this document from "PLAN ONLY" to "Implemented through B7" or similar.
- Decide whether the ant-trail garnish is worth enabling. Default recommendation: keep it disabled
  unless the final frame feels too static; legibility matters more than motion flourish.
- Tune dead gaps at boundaries if any transition feels rushed, especially B6→B7 and B7→finale.
- Run a small performance pass: confirm the canvas remains memoized, camera viewBox writes are deduped,
  and no new scroll listener or rAF loop was added.
