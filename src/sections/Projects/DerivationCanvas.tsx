import { memo, useCallback, useEffect, useId, useRef, type ReactNode } from 'react';
import { motion, useMotionValueEvent, useTransform, type MotionValue } from 'framer-motion';

/**
 * One persistent SVG world that grows the thesis as an upright Stratetree.
 *
 * Every visual property is a pure function of `x`, the master scrub time in
 * beat units from useThesisScrub (0–9.8). Nothing is ever swapped or
 * remounted: elements live in one coordinate space and reveal inside their
 * window of master time, so the whole tree scrubs forward and backward.
 *
 * ORIENTATION — the Stratetree grows from the ground up, so this world is
 * upright: large y is the soil (bottom), small y is the crown (top). As the
 * reader scrolls DOWN the text, master time rises and the tree climbs UP; the
 * camera cranes upward with the growth. Climbing up the tree, each node is
 * forced by the one beneath it; descending, each is justified — the thesis's
 * "reads in both directions," made physical.
 *
 * Beat starts (cumulative SECTION_UNITS) and where each lands on the tree:
 *   thesis 0   — the seed, planted in the soil
 *   soil   0.8 — the new conditions (over-information; cheap, probabilistic)
 *   roots  2.0 — the five values
 *   trunk  3.2 — the vision: anti-fragility
 *   branch 4.2 — the mission: the trunk forks into the Stack and the Loop
 *   strat  5.4 — the limbs detail: layers, verbs, the hinge
 *   tactic 7.0 — the twigs: consequences and rules
 *   fruit  8.2 — the crown: the lotus of products
 *   end    9.8
 */

/* ----------------------------- palette (matches ThesisDeepDive) ----------- */

const STROKE = 'rgba(255,255,255,0.32)';
const STRONG = 'rgba(255,255,255,0.72)';
const ACCENT = '#a5b4fc';
const TXT = 'rgba(255,255,255,0.62)';
const TXT_STRONG = 'rgba(255,255,255,0.86)';
const ACCENT_TXT = '#e3e6ff';

/* ----------------------------- easings ------------------------------------ */

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

const easeInOutQuad = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);

// Anthropic's icon-pop overshoot.
const easeOutBack = (t: number) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2;
};

/** Progress through the window [t0, t1] of master time, eased, clamped. */
function useBeat(
  x: MotionValue<number>,
  t0: number,
  t1: number,
  ease: (t: number) => number = (t) => t,
) {
  return useTransform(x, (v) => ease(clamp01((v - t0) / (t1 - t0))));
}

function roundedRectPath(x: number, y: number, w: number, h: number, r: number) {
  return [
    `M${x + r},${y}`,
    `H${x + w - r}`,
    `A${r},${r} 0 0 1 ${x + w},${y + r}`,
    `V${y + h - r}`,
    `A${r},${r} 0 0 1 ${x + w - r},${y + h}`,
    `H${x + r}`,
    `A${r},${r} 0 0 1 ${x},${y + h - r}`,
    `V${y + r}`,
    `A${r},${r} 0 0 1 ${x + r},${y}`,
    'Z',
  ].join(' ');
}

/* ----------------------------- camera ------------------------------------- */

// [x, y, w, h] viewBox targets, rendered with preserveAspectRatio="…meet" so
// each rect shows IN FULL (never cropped) — the portrait rail letterboxes wide
// rects with transparent margins that read as the dark panel behind. This is a
// crane: y decreases as the beats rise, following the growth up the tree, then
// the finale pulls all the way back to the whole upright tree.
const CAMERA: { at: number; glide: number; rect: readonly number[] }[] = [
  { at: 0, glide: 0.01, rect: [215, 1331, 210, 287] }, // B0: the seed in the soil
  { at: 0.8, glide: 0.34, rect: [32, 1222, 588, 560] }, // B1: the soil — the new conditions
  { at: 2.0, glide: 0.34, rect: [112, 1172, 404, 478] }, // B2: the roots — the five values
  { at: 3.2, glide: 0.3, rect: [48, 936, 360, 462] }, // B3: the trunk — anti-fragility
  { at: 4.2, glide: 0.34, rect: [76, 596, 240, 327] }, // B4·B5a: zoom the Stack as it builds
  { at: 5.55, glide: 0.32, rect: [322, 566, 256, 349] }, // B5b: zoom the Loop as it builds
  { at: 6.55, glide: 0.3, rect: [86, 470, 448, 611] }, // B5c: both — the hinge joins them
  { at: 7.0, glide: 0.32, rect: [86, 470, 366, 499] }, // B6: consequences → the Stack layers
  { at: 8.2, glide: 0.3, rect: [140, 72, 360, 491] }, // B7: the crown — the lotus of products
  { at: 9.35, glide: 0.26, rect: [-232, 108, 1128, 1538] }, // finale: the whole upright tree
];

function cameraAt(xv: number): string {
  let current = CAMERA[0].rect;
  for (let i = 1; i < CAMERA.length; i += 1) {
    const { at, glide, rect } = CAMERA[i];
    if (xv < at) break;
    const t = easeOutCubic(clamp01((xv - at) / glide));
    current = current.map((value, axis) => value + (rect[axis] - value) * t);
  }
  return current.map((value) => value.toFixed(1)).join(' ');
}

/* ----------------------------- primitives --------------------------------- */

type BeatProps = { x: MotionValue<number>; t0: number; t1: number };

/** A wire that draws on behind an invisible sweep front (pathLength scrub). */
function Wire({
  x,
  t0,
  t1,
  d,
  color = STROKE,
  width = 1.4,
  to = 1,
}: BeatProps & { d: string; color?: string; width?: number; to?: number }) {
  const draw = useBeat(x, t0, t1, easeInOutQuad);
  return (
    <motion.path
      d={d}
      stroke={color}
      strokeWidth={width}
      fill="none"
      strokeLinecap="round"
      opacity={to}
      style={{ pathLength: draw }}
    />
  );
}

/**
 * A dashed wire that draws on. framer's pathLength owns strokeDasharray, so a
 * dashed path can't scrub directly — instead the dashed path is revealed by a
 * white copy of itself drawing inside a mask.
 */
function DashedWire({
  x,
  t0,
  t1,
  d,
  color = STROKE,
  width = 1.4,
  dash = '5 5',
  to = 1,
}: BeatProps & { d: string; color?: string; width?: number; dash?: string; to?: number }) {
  const maskId = `thesis-dw-${useId().replace(/[^a-zA-Z0-9-]/g, '')}`;
  const draw = useBeat(x, t0, t1, easeInOutQuad);
  return (
    <g>
      <mask id={maskId} maskUnits="userSpaceOnUse" x={-80} y={100} width={860} height={1620}>
        <motion.path
          d={d}
          stroke="#fff"
          strokeWidth={width + 6}
          fill="none"
          strokeLinecap="round"
          style={{ pathLength: draw }}
        />
      </mask>
      <path
        d={d}
        stroke={color}
        strokeWidth={width}
        fill="none"
        strokeDasharray={dash}
        opacity={to}
        mask={`url(#${maskId})`}
      />
    </g>
  );
}

/**
 * Arrowhead that pops in as its wire's draw front arrives. Placement lives on a
 * plain SVG attribute transform (user-space semantics); only the pop is a
 * motion style. framer forces transform-box:fill-box + transform-origin:50% 50%
 * on SVG motion elements, so a motion `scale` means "scale around your own bbox
 * center" — never bake translate-to-origin sandwiches into motion transforms.
 */
function ArrowTip({
  x,
  t0,
  t1,
  px,
  py,
  angle,
  color = STROKE,
}: BeatProps & { px: number; py: number; angle: number; color?: string }) {
  const t = useBeat(x, t0, t1);
  const scale = useTransform(t, (v) => 0.5 + 0.5 * easeOutBack(v));
  return (
    <g transform={`translate(${px} ${py}) rotate(${angle})`}>
      <motion.path d="M0,0 L-9,4.2 L-9,-4.2 Z" fill={color} style={{ scale, opacity: t }} />
    </g>
  );
}

/** Scale-pop in place (easeOutBack) around the group's own bbox centre. */
function PopGroup({ x, t0, t1, children }: BeatProps & { children: ReactNode }) {
  const t = useBeat(x, t0, t1);
  const scale = useTransform(t, (v) => 0.55 + 0.45 * easeOutBack(v));
  const opacity = useTransform(t, (v) => Math.min(1, v * 2.2));
  return <motion.g style={{ scale, opacity }}>{children}</motion.g>;
}

/** Simple opacity window, for grouped reveals. */
function FadeGroup({ x, t0, t1, children }: BeatProps & { children: ReactNode }) {
  const opacity = useBeat(x, t0, t1);
  return <motion.g style={{ opacity }}>{children}</motion.g>;
}

function FadeText({
  x,
  t0,
  t1,
  px,
  py,
  size = 9,
  color = TXT,
  anchor = 'middle',
  tracking = '0.14em',
  weight,
  to = 1,
  children,
}: BeatProps & {
  px: number;
  py: number;
  size?: number;
  color?: string;
  anchor?: 'start' | 'middle' | 'end';
  tracking?: string;
  weight?: number;
  to?: number;
  children: string;
}) {
  const t = useBeat(x, t0, t1);
  const opacity = useTransform(t, (v) => v * to);
  return (
    <motion.text
      x={px}
      y={py}
      textAnchor={anchor}
      fontSize={size}
      fill={color}
      fontWeight={weight}
      style={{ letterSpacing: tracking, opacity }}
    >
      {children}
    </motion.text>
  );
}

/** Primary node: outline draws around the box, then fill + label settle in. */
function NodeDraw({
  x,
  t0,
  t1,
  bx,
  by,
  bw,
  bh,
  label,
  sub,
  accent = false,
}: BeatProps & {
  bx: number;
  by: number;
  bw: number;
  bh: number;
  label: string;
  sub?: string;
  accent?: boolean;
}) {
  const dur = t1 - t0;
  const draw = useBeat(x, t0, t1, easeInOutQuad);
  const settle = useBeat(x, t0 + dur * 0.5, t1 + dur * 0.3);
  return (
    <g>
      <motion.rect
        x={bx}
        y={by}
        width={bw}
        height={bh}
        rx={9}
        fill={accent ? 'rgba(165,180,252,0.13)' : 'rgba(255,255,255,0.045)'}
        style={{ opacity: settle }}
      />
      <motion.path
        d={roundedRectPath(bx, by, bw, bh, 9)}
        stroke={accent ? ACCENT : STRONG}
        strokeWidth={1.5}
        fill="none"
        style={{ pathLength: draw }}
      />
      <motion.text
        x={bx + bw / 2}
        y={sub ? by + bh / 2 - 6 : by + bh / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={13.5}
        fill={accent ? ACCENT_TXT : TXT_STRONG}
        style={{ letterSpacing: '0.02em', opacity: settle }}
      >
        {label}
      </motion.text>
      {sub ? (
        <motion.text
          x={bx + bw / 2}
          y={by + bh / 2 + 9}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={9.5}
          fill={TXT}
          style={{ opacity: settle }}
        >
          {sub}
        </motion.text>
      ) : null}
    </g>
  );
}

/** Derived/leaf node: pops in whole (the draw front has already passed it). */
function NodePop({
  x,
  t0,
  t1,
  bx,
  by,
  bw,
  bh,
  label,
  sub,
  accent = false,
  dashed = false,
}: BeatProps & {
  bx: number;
  by: number;
  bw: number;
  bh: number;
  label: string;
  sub?: string;
  accent?: boolean;
  dashed?: boolean;
}) {
  return (
    <PopGroup x={x} t0={t0} t1={t1}>
      <rect
        x={bx}
        y={by}
        width={bw}
        height={bh}
        rx={9}
        fill={accent ? 'rgba(165,180,252,0.13)' : 'rgba(255,255,255,0.045)'}
        stroke={accent ? ACCENT : STRONG}
        strokeWidth={1.4}
        strokeDasharray={dashed ? '5 5' : undefined}
      />
      <text
        x={bx + bw / 2}
        y={sub ? by + bh / 2 - 6 : by + bh / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={12.5}
        fill={accent ? ACCENT_TXT : TXT_STRONG}
        style={{ letterSpacing: '0.02em' }}
      >
        {label}
      </text>
      {sub ? (
        <text
          x={bx + bw / 2}
          y={by + bh / 2 + 9}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={9.5}
          fill={TXT}
        >
          {sub}
        </text>
      ) : null}
    </PopGroup>
  );
}

function MiniChip({
  x,
  t0,
  t1,
  bx,
  by,
  bw,
  label,
}: BeatProps & { bx: number; by: number; bw: number; label: string }) {
  return (
    <PopGroup x={x} t0={t0} t1={t1}>
      <rect
        x={bx}
        y={by}
        width={bw}
        height={23}
        rx={11.5}
        fill="rgba(255,255,255,0.035)"
        stroke="rgba(255,255,255,0.3)"
        strokeWidth={1}
      />
      <text
        x={bx + bw / 2}
        y={by + 11.5}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={7.4}
        fill="rgba(255,255,255,0.68)"
        style={{ letterSpacing: '0.02em' }}
      >
        {label}
      </text>
    </PopGroup>
  );
}

/* ----------------------------- tree geometry ------------------------------ */

// Vertical anchors (large y = soil floor, small y = crown). The trunk axis is
// x = 320. The two limbs splay to the Stack (left) and the Loop (right).
const TRUNK_X = 320;

// The Stack pyramid — apex UP (Human), base DOWN (Model). Grown as the left limb.
const PYR = { ax: 196, apexY: 650, baseY: 838, half: 98 } as const;
const pyrHalf = (y: number) => ((y - PYR.apexY) / (PYR.baseY - PYR.apexY)) * PYR.half;
const PYR_PATH = `M${PYR.ax},${PYR.apexY} L${PYR.ax + PYR.half},${PYR.baseY} L${PYR.ax - PYR.half},${PYR.baseY} Z`;

// Layers detail bottom-up: Model (base) first, Human (apex) last.
const STACK_DIVIDERS = [
  { y: 800, t0: 4.96 },
  { y: 762, t0: 5.06 },
  { y: 724, t0: 5.16 },
  { y: 686, t0: 5.26 },
];
const STACK_LABELS = [
  { label: 'Model', y: 818, size: 8, color: TXT_STRONG, t0: 5.0 },
  { label: 'Context', y: 781, size: 8, color: TXT_STRONG, t0: 5.1 },
  { label: 'Orchestration', y: 743, size: 7.5, color: '#cdd5ff', t0: 5.2 },
  { label: 'Governance', y: 705, size: 7.5, color: TXT_STRONG, t0: 5.3 },
  { label: 'Human', y: 670, size: 7.5, color: TXT_STRONG, t0: 5.36 },
];

// The Loop ring — grown as the right limb.
const RING = { cx: 452, cy: 726, r: 70 } as const;
const ringPt = (deg: number, radius: number) => ({
  x: Number((RING.cx + Math.cos((deg * Math.PI) / 180) * radius).toFixed(1)),
  y: Number((RING.cy + Math.sin((deg * Math.PI) / 180) * radius).toFixed(1)),
});
const RING_PATH = `M${RING.cx},${RING.cy - RING.r} A${RING.r} ${RING.r} 0 0 1 ${RING.cx},${RING.cy + RING.r} A${RING.r} ${RING.r} 0 0 1 ${RING.cx},${RING.cy - RING.r}`;

const STATIONS: { label: string; a: number; lx: number; ly: number; anchor: 'start' | 'middle' | 'end'; t0: number }[] = [
  { label: '1. Talk', a: -90, lx: 452, ly: 642, anchor: 'middle', t0: 6.04 },
  { label: '2. Decide', a: -18, lx: 540, ly: 700, anchor: 'start', t0: 6.14 },
  { label: '3. Build', a: 54, lx: 506, ly: 808, anchor: 'start', t0: 6.24 },
  { label: '4. Observe', a: 126, lx: 398, ly: 808, anchor: 'end', t0: 6.34 },
  { label: '5. Iterate', a: 198, lx: 364, ly: 700, anchor: 'end', t0: 6.44 },
];

const FLOW_ARROWS = [
  { a: -54, t0: 6.1 },
  { a: 18, t0: 6.2 },
  { a: 90, t0: 6.3 },
  { a: 162, t0: 6.4 },
  { a: 234, t0: 6.5 },
];

// The five values, grown as roots: each tendril reaches down from the trunk
// base into the soil, ending at a label.
const ROOTS = [
  { label: 'Clarity', ex: 150, ey: 1278, lx: 134, ly: 1258, anchor: 'middle' as const, t0: 2.2 },
  { label: 'Judgement', ex: 234, ey: 1284, lx: 224, ly: 1264, anchor: 'middle' as const, t0: 2.34 },
  { label: 'Vision', ex: 320, ey: 1288, lx: 320, ly: 1268, anchor: 'middle' as const, t0: 2.48 },
  { label: 'Taste', ex: 406, ey: 1284, lx: 416, ly: 1264, anchor: 'middle' as const, t0: 2.62 },
  { label: 'Empathy', ex: 490, ey: 1278, lx: 506, ly: 1258, anchor: 'middle' as const, t0: 2.76 },
];

// B6: probabilism forces four consequences, listed as bullets between the two
// limbs with an arrow from each to the Stack layer it lands on. Ordered to
// mirror the pyramid — Human (apex) at the top, Model + Context (base) at the
// bottom — so the arrows fan down without crossing. `by` is the bullet row,
// `ty`/`tx` the target point on the pyramid's right edge for that layer.
const CONSEQUENCES = [
  { n: 4, tag: 'Human', desc: 'redefines the professional', ty: 670, tx: 206, by: 544, t0: 7.18 },
  { n: 3, tag: 'Governance', desc: 'guardrails & evals, not hope', ty: 705, tx: 225, by: 568, t0: 7.3 },
  { n: 2, tag: 'Orchestration', desc: 'loops, not straight lines', ty: 743, tx: 245, by: 592, t0: 7.42 },
  { n: 1, tag: 'Model + Context', desc: 'know it, own the context', ty: 800, tx: 274, by: 616, t0: 7.54 },
];

const PIP_STAGES = ['Idea', 'Design', 'Concept', 'Alpha/Beta', 'Live'];

// B7 fruit: five products, blooming as the petals of the crown lotus. Each
// petal is the tall/short path rotated about the crown base (320, 470).
const CROWN_BASE = { x: 320, y: 415 } as const;
const PETAL_TALL = 'M320,415 C292,341 292,245 320,197 C348,245 348,341 320,415 Z';
const PETAL_SHORT = 'M320,415 C300,353 298,275 320,235 C342,275 340,353 320,415 Z';
// Bayut's own petal — a different, more elegant shape that rises straight up
// from the middle, taller and narrower than the rest.
const PETAL_BAYUT = 'M320,415 C300,330 304,196 320,150 C336,196 340,330 320,415 Z';
// Bayut alone at the centre as the flagship — taller, accent-bright, its own
// petal shape (blooms last). The five apps balance around it: a mirrored inner
// pair (±28°) flanking Bayut and a mirrored outer pair (±66°), with the odd
// fifth eased out to the mid-right so Bayut's flanks and the envelope both read
// symmetric. (5 apps round one centre can't be a perfect mirror — odd count.)
const PETALS: { label: string; path: string; rot: number; t0: number; accent?: boolean; sub?: string }[] = [
  { label: 'Dreamsea', path: PETAL_TALL, rot: -28, t0: 8.58 },
  { label: 'Qadam', path: PETAL_TALL, rot: 28, t0: 8.66 },
  { label: 'nsso', path: PETAL_SHORT, rot: -66, t0: 8.5 },
  { label: '24Seven', path: PETAL_SHORT, rot: 66, t0: 8.82 },
  { label: 'RazinFlix', path: PETAL_SHORT, rot: 47, t0: 8.74 },
  { label: 'Bayut', path: PETAL_BAYUT, rot: 0, t0: 8.92, accent: true, sub: 'at company scale' },
];

const INFRA_CHIPS = (() => {
  const labels = ['AI-Native PM OS', 'RAG Pipeline', 'AI Costs', 'Social Wisdom Agent'];
  let bx = 168;
  return labels.map((label, i) => {
    const bw = Math.round(22 + label.length * 4.3);
    const chip = { label, bx, bw, t0: 9.0 + i * 0.07 };
    bx += bw + 9;
    return chip;
  });
})();

/* ----------------------------- the canvas --------------------------------- */

// memo: ThesisRail re-renders on every activeIndex change, but `x` is a stable
// MotionValue — the canvas subtree never needs to reconcile after mount.
export const DerivationCanvas = memo(function DerivationCanvas({ x }: { x: MotionValue<number> }) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Dedupe: between camera glides cameraAt() returns the same string for every
  // x change — skip the attribute write (and any engine-side invalidation).
  const lastViewBox = useRef('');
  const applyCamera = useCallback((v: number) => {
    const vb = cameraAt(v);
    if (vb === lastViewBox.current) return;
    lastViewBox.current = vb;
    svgRef.current?.setAttribute('viewBox', vb);
  }, []);
  useMotionValueEvent(x, 'change', applyCamera);
  useEffect(() => {
    applyCamera(x.get());
  }, [applyCamera, x]);

  // The genesis seed (rest state) yields the instant the reader scrolls — the
  // core hardens into the Advancement node germinating just above it.
  const genesisFade = useTransform(x, [0, 0.05], [1, 0]);
  // The "max output now" offshoot withers after anti-fragility is chosen.
  const maxWither = useTransform(x, [3.9, 4.1], [1, 0.32]);

  return (
    <svg
      ref={svgRef}
      viewBox="215 1331 210 287"
      preserveAspectRatio="xMidYMid meet"
      className="h-full w-full"
      fill="none"
      role="img"
      aria-label="The AI-Native Product Thesis, growing as an upright Stratetree from soil to bloom as you read"
      style={{ fontFamily: 'inherit', overflow: 'hidden' }}
    >
      {/* ================= rest state · the seed in the soil ================ */}
      {/* One advance, planted in the layered soil, about to grow the tree.
          Breathes (compositor CSS, not rAF) to invite the scroll; fades by 0.05
          as the core hardens into the Advancement node germinating above. */}
      <style>{`
        .thsd-ring{transform-box:fill-box;transform-origin:center;animation:thsd-breathe 6s ease-in-out infinite}
        .thsd-ring-b{animation-delay:1.2s}
        .thsd-pulse{transform-box:fill-box;transform-origin:center;animation:thsd-pulse 4.6s ease-in-out infinite}
        .thsd-dot{animation:thsd-tw 7s ease-in-out infinite}
        .thsd-cue{animation:thsd-fade 3.6s ease-in-out infinite}
        @keyframes thsd-breathe{0%,100%{transform:scale(1);opacity:.18}50%{transform:scale(1.08);opacity:.4}}
        @keyframes thsd-pulse{0%,100%{transform:scale(1);opacity:.85}50%{transform:scale(1.13);opacity:1}}
        @keyframes thsd-tw{0%,100%{opacity:.12}50%{opacity:.42}}
        @keyframes thsd-fade{0%,100%{opacity:.3}50%{opacity:.6}}
      `}</style>
      <motion.g style={{ opacity: genesisFade }}>
        {/* the soil: a low mound the seed is planted in */}
        <path d="M236,1536 Q320,1516 404,1536" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth={1.1} strokeLinecap="round" />
        <path d="M258,1550 Q320,1538 382,1550" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={1} strokeLinecap="round" />
        {/* the taproot and two side roots, feeling down into the soil */}
        <path d="M320,1502 C312,1518 302,1528 292,1542" fill="none" stroke="rgba(165,180,252,0.26)" strokeWidth={1} strokeLinecap="round" />
        <path d="M320,1502 L320,1548" stroke="rgba(165,180,252,0.26)" strokeWidth={1} strokeLinecap="round" />
        <path d="M320,1502 C328,1518 338,1528 348,1542" fill="none" stroke="rgba(165,180,252,0.26)" strokeWidth={1} strokeLinecap="round" />
        {/* the shoot, rising toward the light */}
        <path d="M320,1500 L320,1452" stroke="rgba(165,180,252,0.5)" strokeWidth={1.4} strokeLinecap="round" fill="none" />
        {/* the first two leaves */}
        <g className="thsd-pulse">
          <g transform="rotate(-34 320 1466)">
            <path d="M320,1466 C310,1452 310,1436 320,1426 C330,1436 330,1452 320,1466 Z" fill="rgba(165,180,252,0.12)" stroke={ACCENT} strokeOpacity={0.6} strokeWidth={1.1} />
          </g>
          <g transform="rotate(34 320 1466)">
            <path d="M320,1466 C310,1452 310,1436 320,1426 C330,1436 330,1452 320,1466 Z" fill="rgba(165,180,252,0.12)" stroke={ACCENT} strokeOpacity={0.6} strokeWidth={1.1} />
          </g>
        </g>
        {/* the seed itself, glowing at the soil line */}
        <circle className="thsd-pulse" cx={320} cy={1500} r={10} fill="rgba(165,180,252,0.12)" />
        <circle className="thsd-pulse" cx={320} cy={1500} r={5} fill="rgba(165,180,252,0.3)" />
        <circle cx={320} cy={1500} r={2.4} fill="#d4dbff" />
        {/* motes drifting up toward the light */}
        <circle className="thsd-dot" cx={256} cy={1456} r={1.1} fill="#fff" />
        <circle className="thsd-dot" style={{ animationDelay: '1.6s' }} cx={388} cy={1448} r={1.1} fill="#fff" />
        <circle className="thsd-dot" style={{ animationDelay: '2.8s' }} cx={274} cy={1414} r={1.1} fill="#fff" />
        <circle className="thsd-dot" style={{ animationDelay: '3.8s' }} cx={372} cy={1408} r={1.1} fill="#fff" />
        {/* the invitation */}
        <path d="M314,1402 L320,1396 L326,1402" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" />
        <text className="thsd-cue" x={320} y={1382} textAnchor="middle" fontSize={9} fill="rgba(255,255,255,0.34)" style={{ letterSpacing: '0.24em' }}>
          SCROLL THESIS TO GROW
        </text>
      </motion.g>

      {/* ================= B0 · the thesis — the seed (0 – 0.8) ============= */}
      <NodeDraw x={x} t0={0.06} t1={0.45} bx={240} by={1474} bw={160} bh={40} label="Advancement in AI" accent />
      <FadeText x={x} t0={0.42} t1={0.56} px={320} py={1532} size={8} color={ACCENT} tracking="0.18em">
        PRIMARY DRIVER
      </FadeText>

      {/* ================= B1 · soil — the conditions (0.8 – 2.0) =========== */}
      {/* the advance creates the new conditions: the makeup of the soil */}
      <Wire x={x} t0={0.84} t1={1.08} d="M276,1474 C250,1450 220,1438 196,1428" color={STRONG} />
      <ArrowTip x={x} t0={1.04} t1={1.14} px={196} py={1428} angle={205} color={STRONG} />
      <Wire x={x} t0={0.9} t1={1.14} d="M364,1474 C392,1450 422,1438 446,1428" color={STRONG} />
      <ArrowTip x={x} t0={1.1} t1={1.2} px={446} py={1428} angle={335} color={STRONG} />
      <FadeText x={x} t0={0.98} t1={1.1} px={320} py={1440} size={8}>WHICH CAUSES…</FadeText>

      <NodePop x={x} t0={1.06} t1={1.3} bx={106} by={1392} bw={150} bh={38} label="Overinformation" />
      <NodePop x={x} t0={1.12} t1={1.36} bx={366} by={1390} bw={186} bh={40} label="Evolution in execution" />

      {/* execution becomes probabilistic, cheap & fast */}
      <Wire x={x} t0={1.42} t1={1.58} d="M430,1390 C424,1372 418,1358 414,1346" color={STRONG} />
      <ArrowTip x={x} t0={1.54} t1={1.62} px={414} py={1346} angle={246} color={STRONG} />
      <Wire x={x} t0={1.46} t1={1.62} d="M486,1390 C500,1372 510,1358 518,1346" color={STRONG} />
      <ArrowTip x={x} t0={1.58} t1={1.66} px={518} py={1346} angle={294} color={STRONG} />
      <NodePop x={x} t0={1.56} t1={1.74} bx={350} by={1306} bw={128} bh={34} label="Probabilistic" />
      <NodePop x={x} t0={1.62} t1={1.8} bx={490} by={1306} bw={118} bh={34} label="Cheap & fast" />

      {/* the retired linear process now lives beside the new Loop (B5), as the
          thing the Loop replaces — see the strategy beat below */}

      {/* ================= B2 · roots — the five values (2.0 – 3.2) ========= */}
      {/* the conditions force the values; they grow as the roots that anchor
          everything above. (handoff bleeds from B1) */}
      {ROOTS.map((root) => (
        <g key={root.label}>
          <Wire
            x={x}
            t0={root.t0}
            t1={root.t0 + 0.16}
            d={`M${TRUNK_X},1232 C${(TRUNK_X + root.ex) / 2},1262 ${root.ex},${root.ey - 26} ${root.ex},${root.ey}`}
          />
          <FadeText
            x={x}
            t0={root.t0 + 0.12}
            t1={root.t0 + 0.24}
            px={root.lx}
            py={root.ly}
            size={9}
            color={ACCENT_TXT}
            anchor={root.anchor}
            tracking="0.02em"
          >
            {root.label}
          </FadeText>
        </g>
      ))}
      <FadeText x={x} t0={2.95} t1={3.15} px={320} py={1216} size={8} color="#cdd5ff" tracking="0.16em">
        NEW VALUES TO FOCUS ON
      </FadeText>

      {/* ================= B3 · trunk — the vision (3.2 – 4.2) ============== */}
      {/* the trunk rises from the roots: anti-fragility, the chosen vision.
          (trunk wire bleeds in from B2) */}
      <Wire x={x} t0={3.08} t1={3.34} d="M320,1232 L320,1130" color={STRONG} width={1.6} />
      <NodeDraw x={x} t0={3.3} t1={3.66} bx={232} by={1066} bw={176} bh={42} label="To be anti-fragile" accent />
      <FadeText x={x} t0={3.62} t1={3.76} px={320} py={1128} size={8} color={ACCENT} tracking="0.16em">
        ★ THE CHOSEN VISION
      </FadeText>

      {/* the road not taken: a withered offshoot, low on the trunk */}
      <motion.g style={{ opacity: maxWither }}>
        <DashedWire x={x} t0={3.34} t1={3.58} d="M306,1120 C268,1106 232,1092 206,1082" />
        <ArrowTip x={x} t0={3.54} t1={3.62} px={206} py={1082} angle={208} />
        <NodePop x={x} t0={3.5} t1={3.68} bx={52} by={1058} bw={148} bh={44} label="Maximise" sub="short-term output" dashed />
      </motion.g>
      <FadeText x={x} t0={3.62} t1={3.74} px={126} py={1124} size={8}>NOT CHOSEN</FadeText>

      {/* ============ B4·B5 · the two instruments, one after the other ====== */}
      {/* the trunk forks LEFT into the Stack; the pyramid draws, then its
          layers — the camera holds zoomed on the Stack throughout (4.2–5.5) */}
      <Wire x={x} t0={4.12} t1={4.46} d="M308,1064 C272,1006 232,940 200,852" color={STRONG} width={1.5} />
      <Wire x={x} t0={4.5} t1={4.9} d={PYR_PATH} color={STRONG} width={1.4} />
      <FadeGroup x={x} t0={4.72} t1={4.96}>
        <path d={PYR_PATH} fill="rgba(255,255,255,0.04)" />
      </FadeGroup>
      <FadeText x={x} t0={5.34} t1={5.48} px={196} py={862} size={7.5} tracking="0.16em">THE STACK</FadeText>
      <FadeText x={x} t0={5.4} t1={5.54} px={196} py={874} size={7} tracking="0.02em">A structure for organising information</FadeText>

      {/* …then the trunk forks RIGHT into the Loop; the ring draws, then its
          verbs — the camera pans and holds zoomed on the Loop (5.55–6.5) */}
      <Wire x={x} t0={5.6} t1={5.9} d="M332,1064 C372,1006 420,948 448,800" color={STRONG} width={1.5} />
      <Wire x={x} t0={5.88} t1={6.24} d={RING_PATH} color={STRONG} width={1.4} />
      <FadeGroup x={x} t0={6.06} t1={6.26}>
        <circle cx={RING.cx} cy={RING.cy} r={88} stroke={STROKE} strokeWidth={0.9} opacity={0.5} />
        <circle cx={RING.cx} cy={RING.cy} r={44} stroke={STROKE} strokeWidth={0.9} opacity={0.5} />
      </FadeGroup>
      <FadeText x={x} t0={6.44} t1={6.58} px={452} py={830} size={7.5} tracking="0.16em">THE LOOP</FadeText>
      <FadeText x={x} t0={6.5} t1={6.64} px={452} py={842} size={7} tracking="0.02em">New non-linear process</FadeText>

      {/* the retired linear process, sitting just above the new Loop as the
          thing it replaces — a dashed, dimmed chain (Idea → … → Live) */}
      <FadeText x={x} t0={5.74} t1={5.94} px={452} py={584} size={7} color={TXT} tracking="0.12em">
        RETIRED · LINEAR PROCESS
      </FadeText>
      <FadeGroup x={x} t0={5.62} t1={5.9}>
        <g opacity={0.5}>
          {PIP_STAGES.map((stage, i) => {
            const bw = 42;
            const gap = 5;
            const bx = 337 + i * (bw + gap);
            const by = 596;
            return (
              <g key={stage}>
                <rect
                  x={bx}
                  y={by}
                  width={bw}
                  height={16}
                  rx={4}
                  fill="rgba(255,255,255,0.03)"
                  stroke={STROKE}
                  strokeWidth={1}
                  strokeDasharray="4 4"
                />
                <text x={bx + bw / 2} y={by + 8} textAnchor="middle" dominantBaseline="central" fontSize={6.4} fill={TXT}>
                  {stage}
                </text>
                {i < PIP_STAGES.length - 1 ? (
                  <line x1={bx + bw} y1={by + 8} x2={bx + bw + gap} y2={by + 8} stroke={STROKE} strokeWidth={1} />
                ) : null}
              </g>
            );
          })}
        </g>
      </FadeGroup>

      {/* ================= B5 · strategy — the limbs detail (5.4 – 7.0) ===== */}
      {/* the Stack details bottom-up: dividers draw, layer labels fade */}
      {STACK_DIVIDERS.map((div) => (
        <Wire
          key={div.y}
          x={x}
          t0={div.t0}
          t1={div.t0 + 0.14}
          d={`M${(PYR.ax - pyrHalf(div.y)).toFixed(1)},${div.y} L${(PYR.ax + pyrHalf(div.y)).toFixed(1)},${div.y}`}
        />
      ))}
      {STACK_LABELS.map((layer) => (
        <FadeText
          key={layer.label}
          x={x}
          t0={layer.t0}
          t1={layer.t0 + 0.14}
          px={PYR.ax}
          py={layer.y}
          size={layer.size}
          color={layer.color}
          tracking="0.03em"
        >
          {layer.label}
        </FadeText>
      ))}

      {/* the Loop details clockwise: verbs pop with flow arrows between them */}
      {STATIONS.map((station) => {
        const p = ringPt(station.a, RING.r);
        return (
          <g key={station.label}>
            <PopGroup x={x} t0={station.t0} t1={station.t0 + 0.14}>
              <circle cx={p.x} cy={p.y} r={4} fill={ACCENT} />
            </PopGroup>
            <FadeText
              x={x}
              t0={station.t0 + 0.04}
              t1={station.t0 + 0.18}
              px={station.lx}
              py={station.ly}
              size={8.5}
              color={TXT_STRONG}
              anchor={station.anchor}
              tracking="0.02em"
            >
              {station.label}
            </FadeText>
          </g>
        );
      })}
      {FLOW_ARROWS.map((flow) => {
        const p = ringPt(flow.a, RING.r);
        return (
          <ArrowTip key={flow.a} x={x} t0={flow.t0} t1={flow.t0 + 0.1} px={p.x} py={p.y} angle={flow.a + 90} color={STRONG} />
        );
      })}
      <FadeText x={x} t0={6.34} t1={6.48} px={452} py={719} size={9.5} color={ACCENT_TXT} weight={600} tracking="0.02em">AI-Native</FadeText>
      <FadeText x={x} t0={6.38} t1={6.52} px={452} py={735} size={9.5} color={ACCENT_TXT} weight={600} tracking="0.02em">Loop</FadeText>

      {/* the hinge: Orchestration is where the static Stack becomes the running
          Loop — a horizontal arrow running left from the Loop into the Stack,
          its tip touching the right edge of the pyramid */}
      <DashedWire x={x} t0={6.62} t1={6.88} d="M383,740 L245,740" color={ACCENT} width={1.3} />
      <ArrowTip x={x} t0={6.84} t1={6.92} px={244} py={740} angle={180} color={ACCENT} />
      <FadeText x={x} t0={6.86} t1={6.98} px={326} py={776} size={8} color="#cdd5ff" tracking="0.06em">The stack in motion</FadeText>

      {/* ================= B6 · tactics — the consequences (7.0 – 8.2) ====== */}
      {/* probabilism forces four consequences, listed between the limbs, each
          with an arrow down to the Stack layer it lands on */}
      {CONSEQUENCES.map((c) => (
        <g key={c.n}>
          <Wire
            x={x}
            t0={c.t0}
            t1={c.t0 + 0.16}
            d={`M244,${c.by + 2} C${((244 + c.tx) / 2).toFixed(0)},${c.by + 16} ${c.tx + 18},${c.ty - 18} ${c.tx + 2},${c.ty}`}
          />
          <ArrowTip x={x} t0={c.t0 + 0.13} t1={c.t0 + 0.21} px={c.tx + 2} py={c.ty} angle={150} />
          <FadeText x={x} t0={c.t0 + 0.05} t1={c.t0 + 0.19} px={252} py={c.by} size={7.4} anchor="start" color={TXT_STRONG} tracking="0.01em">
            {`C${c.n} · ${c.tag} — ${c.desc}`}
          </FadeText>
        </g>
      ))}

      {/* ================= B7 · fruit — the crown (8.2 – 9.8) =============== */}
      {/* the limbs reach up and the tree blooms: the products are the petals */}
      <Wire x={x} t0={8.2} t1={8.46} d="M212,650 C200,558 232,468 300,421" color={ACCENT} width={1.4} />
      <Wire x={x} t0={8.24} t1={8.5} d="M450,646 C462,558 430,468 340,421" color={ACCENT} width={1.4} />
      <FadeText x={x} t0={8.34} t1={8.5} px={320} py={434} size={7.2} color="#cdd5ff" tracking="0.14em">
        EACH PRODUCT IS A TURN OF THE LOOP
      </FadeText>

      {PETALS.map((petal) => (
        <g key={petal.label} transform={`rotate(${petal.rot} ${CROWN_BASE.x} ${CROWN_BASE.y})`}>
          <PopGroup x={x} t0={petal.t0} t1={petal.t0 + 0.16}>
            <path
              d={petal.path}
              fill={petal.accent ? 'rgba(165,180,252,0.22)' : 'rgba(165,180,252,0.08)'}
              stroke={petal.accent ? '#cdd5ff' : ACCENT}
              strokeOpacity={petal.accent ? 1 : 0.55}
              strokeWidth={petal.accent ? 1.6 : 1.1}
            />
            {petal.accent ? (
              <path
                d="M320,406 L320,164"
                stroke="#e3e6ff"
                strokeWidth={1}
                strokeOpacity={0.62}
                strokeLinecap="round"
                fill="none"
              />
            ) : null}
          </PopGroup>
        </g>
      ))}
      {/* product names, fanned around the bloom */}
      {PETALS.map((petal) => {
        const a = (petal.rot - 90) * (Math.PI / 180);
        const rr = petal.path === PETAL_BAYUT ? 282 : petal.path === PETAL_TALL ? 234 : 196;
        const lx = Number((CROWN_BASE.x + Math.cos(a) * rr).toFixed(1));
        const ly = Number((CROWN_BASE.y + Math.sin(a) * rr).toFixed(1));
        const anchor: 'start' | 'middle' | 'end' = petal.rot <= -55 ? 'start' : petal.rot >= 55 ? 'end' : 'middle';
        return (
          <g key={petal.label}>
            <FadeText x={x} t0={petal.t0 + 0.12} t1={petal.t0 + 0.24} px={lx} py={ly} size={petal.accent ? 9 : 7.6} color={ACCENT_TXT} weight={petal.accent ? 700 : 600} anchor={anchor} tracking="0.02em">
              {petal.label}
            </FadeText>
            {petal.sub ? (
              <FadeText x={x} t0={petal.t0 + 0.18} t1={petal.t0 + 0.3} px={lx} py={ly + 12} size={6.4} color="#cdd5ff" anchor={anchor} tracking="0.04em">
                {petal.sub}
              </FadeText>
            ) : null}
          </g>
        );
      })}
      {/* the heart of the bloom */}
      <PopGroup x={x} t0={8.46} t1={8.6}>
        <circle cx={CROWN_BASE.x} cy={CROWN_BASE.y} r={9} fill="rgba(165,180,252,0.22)" />
        <circle cx={CROWN_BASE.x} cy={CROWN_BASE.y} r={4} fill="#cdd5ff" />
      </PopGroup>
      <FadeText x={x} t0={8.9} t1={9.04} px={320} py={112} size={9} color={ACCENT} tracking="0.2em">
        PRODUCTS &amp; SERVICES
      </FadeText>

      {/* the products run on shared infrastructure — the canopy's support */}
      <FadeText x={x} t0={8.96} t1={9.08} px={150} py={462} size={6.6} anchor="start" tracking="0.16em">RUNS ON</FadeText>
      <DashedWire x={x} t0={8.98} t1={9.16} d="M150,466 C260,482 420,482 520,466" color={STRONG} width={1} dash="3 5" to={0.7} />
      {INFRA_CHIPS.map((chip) => (
        <MiniChip key={chip.label} x={x} t0={chip.t0} t1={chip.t0 + 0.14} bx={chip.bx} by={472} bw={chip.bw} label={chip.label} />
      ))}

      {/* ================= finale — the whole tree, read both ways ========= */}
      <FadeGroup x={x} t0={9.4} t1={9.64}>
        <path d="M-26,1560 L-26,300" stroke="rgba(255,255,255,0.32)" strokeWidth={1.1} strokeLinecap="round" />
        <path d="M-26,300 L-33,314 L-19,314 Z" fill="rgba(255,255,255,0.6)" />
        <text x={-16} y={400} textAnchor="start" fontSize={9} fill={TXT_STRONG} style={{ letterSpacing: '0.16em' }}>
          UP: FORCED
        </text>
        <path d="M666,300 L666,1560" stroke="rgba(255,255,255,0.32)" strokeWidth={1.1} strokeLinecap="round" />
        <path d="M666,1560 L659,1546 L673,1546 Z" fill="rgba(255,255,255,0.6)" />
        <text x={656} y={1500} textAnchor="end" fontSize={9} fill={TXT_STRONG} style={{ letterSpacing: '0.16em' }}>
          DOWN: JUSTIFIED
        </text>
      </FadeGroup>
      <FadeText x={x} t0={9.55} t1={9.8} px={320} py={1632} size={12} color={TXT_STRONG} tracking="0.16em" weight={650}>
        GROWN FROM THE GROUND UP
      </FadeText>
    </svg>
  );
});
