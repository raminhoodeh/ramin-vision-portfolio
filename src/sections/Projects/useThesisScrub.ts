import { useEffect, useRef, useState, type MutableRefObject, type RefObject } from 'react';
import { useMotionValue, useReducedMotion, useSpring, type MotionValue } from 'framer-motion';

/**
 * Master scroll-scrub for the thesis deep dive.
 *
 * Converts the reader's position in the right-hand text column into a single
 * "master time" value measured in beat units (each section contributes a fixed
 * number of units regardless of its pixel height). Every visual in the
 * DerivationCanvas keys off windows of this value, which is what makes the
 * animation fully scrubbed and reversible.
 *
 * - `progress` is the raw value (snappy; drives discrete UI like dimming/dots).
 * - `smooth` is the spring-smoothed value (drives the canvas; the spring sleeps
 *   when settled, so no free-running rAF).
 * - The window/body never scroll in this app: on lg the inner column scrolls,
 *   below lg the overlay root scrolls — both are bound here.
 * - Dev override (headless previews throttle scroll/rAF):
 *   `window.__thesisScrub.set(0..1 | null)` / `.get()`, dispatch
 *   `new CustomEvent('thesis-scrub:set', { detail: 0..1 | null })`, or load
 *   the page with `?thesisScrub=0..1`.
 */

export type ThesisScrub = {
  /** Raw master time in beat units [0, totalUnits]. */
  progress: MotionValue<number>;
  /** Spring-smoothed master time for the canvas. Mirrors `progress` under reduced motion. */
  smooth: MotionValue<number>;
  /** Index of the section currently under the read line. */
  activeIndex: number;
  /** Sum of all section units (the end of the master timeline). */
  totalUnits: number;
};

const READ_LINE_FRACTION = 0.3;

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

export function useThesisScrub(
  scrollRef: RefObject<HTMLElement | null>,
  rootRef: RefObject<HTMLElement | null>,
  sectionRefs: MutableRefObject<(HTMLElement | null)[]>,
  units: readonly number[],
): ThesisScrub {
  const totalUnits = units.reduce((sum, u) => sum + u, 0);
  const progress = useMotionValue(0);
  // The spring follows a dedicated source that compute() only feeds when
  // motion is allowed: under reduced motion `smooth` mirrors `progress` and
  // nothing reads the spring, but framer's attachFollow would still run dead
  // spring physics on every change of a followed value. A quiet source keeps
  // the frame loop asleep. (Swapping the useSpring source itself is not safe:
  // useFollowValue doesn't re-attach when the source identity changes.)
  const springSource = useMotionValue(0);
  const spring = useSpring(springSource, { stiffness: 90, damping: 30, restDelta: 0.0005 });
  const reducedMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const overrideRef = useRef<number | null>(null);
  const computeRef = useRef<() => void>(() => {});

  useEffect(() => {
    const indexAt = (x: number) => {
      let start = 0;
      let index = 0;
      for (let i = 0; i < units.length; i += 1) {
        if (x >= start) index = i;
        start += units[i];
      }
      return index;
    };

    // Whichever container actually scrolls: the inner column on lg, the overlay root below lg.
    const activeScroller = (): HTMLElement | null => {
      const inner = scrollRef.current;
      if (inner && inner.scrollHeight > inner.clientHeight + 1) return inner;
      const root = rootRef.current;
      if (root && root.scrollHeight > root.clientHeight + 1) return root;
      return inner ?? root;
    };

    const compute = () => {
      if (overrideRef.current !== null) {
        const x = overrideRef.current * totalUnits;
        progress.set(x);
        if (!reducedMotion) springSource.set(x);
        const idx = indexAt(x);
        setActiveIndex((prev) => (prev === idx ? prev : idx));
        return;
      }

      const line = window.innerHeight * READ_LINE_FRACTION;
      const scroller = activeScroller();
      const scrolled = scroller ? scroller.scrollTop : 0;
      const remaining = scroller
        ? Math.max(0, scroller.scrollHeight - scroller.clientHeight - scrolled)
        : 0;

      let sum = 0;
      let sumAtMin = 0;
      let sumAtMax = 0;
      let active = 0;
      for (let i = 0; i < units.length; i += 1) {
        const node = sectionRefs.current[i];
        if (!node) continue;
        const rect = node.getBoundingClientRect();
        const height = Math.max(rect.height, 1);
        sum += clamp01((line - rect.top) / height) * units[i];
        // Where this section sits at zero / maximum scroll — anchoring the
        // normalization at both ends so the timeline spans exactly [0, totalUnits].
        sumAtMin += clamp01((line - (rect.top + scrolled)) / height) * units[i];
        sumAtMax += clamp01((line - (rect.top - remaining)) / height) * units[i];
        if (rect.top <= line) active = i;
      }

      const span = sumAtMax - sumAtMin;
      const next = span > 0 ? clamp01((sum - sumAtMin) / span) * totalUnits : 0;
      progress.set(next);
      if (!reducedMotion) springSource.set(next);
      setActiveIndex((prev) => (prev === active ? prev : active));
    };
    computeRef.current = compute;

    const targets = new Set<HTMLElement>();
    if (scrollRef.current) targets.add(scrollRef.current);
    if (rootRef.current) targets.add(rootRef.current);
    targets.forEach((target) => target.addEventListener('scroll', compute, { passive: true }));
    window.addEventListener('resize', compute);
    compute();

    return () => {
      targets.forEach((target) => target.removeEventListener('scroll', compute));
      window.removeEventListener('resize', compute);
    };
  }, [progress, springSource, reducedMotion, scrollRef, rootRef, sectionRefs, totalUnits, units]);

  useEffect(() => {
    if (!import.meta.env.DEV) return undefined;
    const devWindow = window as Window & { __thesisScrub?: { set: (t: number | null) => void; get: () => number } };
    const setOverride = (t: number | null) => {
      overrideRef.current = t === null ? null : clamp01(t);
      computeRef.current();
      // Snap the spring too: headless previews throttle rAF, so a trailing
      // spring would leave the canvas behind the forced progress value.
      if (t !== null) spring.jump(progress.get());
    };
    devWindow.__thesisScrub = {
      set: setOverride,
      get: () => progress.get(),
    };
    const handleScrubEvent = (event: Event) => {
      setOverride((event as CustomEvent<number | null>).detail ?? null);
    };
    window.addEventListener('thesis-scrub:set', handleScrubEvent);
    const queryOverride = new URLSearchParams(window.location.search).get('thesisScrub');
    if (queryOverride !== null) {
      const parsed = Number(queryOverride);
      setOverride(Number.isFinite(parsed) ? parsed : null);
    }
    return () => {
      window.removeEventListener('thesis-scrub:set', handleScrubEvent);
      delete devWindow.__thesisScrub;
    };
  }, [progress, spring]);

  return {
    progress,
    smooth: reducedMotion ? progress : spring,
    activeIndex,
    totalUnits,
  };
}
