// DOM-only proof rotation shared by the static maintenance page and React Hero.
// It never imports portfolio data, routing, measurement or provider clients.
const activeControllers = new WeakMap<HTMLElement, () => void>();

export function startProofTickers(root: HTMLElement) {
  activeControllers.get(root)?.();
  const groups = [...root.querySelectorAll<HTMLElement>('[data-proof-ticker]')].filter((element) => element.dataset.proofTicker === 'commercial').map((element) => ({
    element,
    slides: [...element.querySelectorAll<HTMLElement>('[data-proof-slide]')],
    index: 0,
  })).filter(({ slides }) => slides.length > 1);
  if (!groups.length) return () => {};

  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  let hovered = root.matches(':hover');
  let focused = root.contains(document.activeElement);
  let inView = true;
  let disposed = false;
  let cycle = 0;
  let timeout: ReturnType<typeof setTimeout> | undefined;

  function render() {
    for (const group of groups) {
      group.element.setAttribute('aria-live', 'off');
      group.slides.forEach((slide, index) => {
        const active = index === group.index;
        slide.dataset.active = String(active);
        slide.setAttribute('aria-hidden', String(!active));
        slide.toggleAttribute('inert', !active);
      });
    }
    root.dataset.proofCycle = String(cycle);
  }

  function schedule() {
    if (timeout !== undefined) clearTimeout(timeout);
    timeout = undefined;
    if (disposed) return;
    const state = media.matches ? 'reduced' : hovered || focused || !inView || document.visibilityState !== 'visible' ? 'paused' : 'running';
    root.dataset.proofMotionState = state;
    if (state !== 'running') return;
    timeout = setTimeout(() => {
      advance();
      schedule();
    }, 6500);
  }

  function advance() {
    for (const group of groups) group.index = (group.index + 1) % group.slides.length;
    cycle = 1 - cycle;
    render();
  }
  const enter = () => { hovered = true; schedule(); };
  const leave = () => { hovered = false; schedule(); };
  const focusIn = () => { focused = true; schedule(); };
  const focusOut = (event: FocusEvent) => {
    focused = event.relatedTarget instanceof Node && root.contains(event.relatedTarget);
    schedule();
  };
  const preference = () => { schedule(); };
  root.addEventListener('pointerenter', enter);
  root.addEventListener('pointerleave', leave);
  root.addEventListener('focusin', focusIn);
  root.addEventListener('focusout', focusOut);
  document.addEventListener('visibilitychange', schedule);
  media.addEventListener('change', preference);
  const observer = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver(([entry]) => {
    inView = entry?.isIntersecting ?? true;
    schedule();
  });
  observer?.observe(root);
  root.dataset.proofEnhanced = 'true';
  render();
  schedule();

  const stop = () => {
    if (disposed) return;
    disposed = true;
    if (timeout !== undefined) clearTimeout(timeout);
    root.removeEventListener('pointerenter', enter);
    root.removeEventListener('pointerleave', leave);
    root.removeEventListener('focusin', focusIn);
    root.removeEventListener('focusout', focusOut);
    document.removeEventListener('visibilitychange', schedule);
    media.removeEventListener('change', preference);
    observer?.disconnect();
    delete root.dataset.proofEnhanced;
    delete root.dataset.proofMotionState;
    root.dataset.proofCycle = '0';
    if (activeControllers.get(root) === stop) activeControllers.delete(root);
  };
  activeControllers.set(root, stop);
  return stop;
}
