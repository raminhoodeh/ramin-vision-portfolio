// DOM-only proof rotation shared by the static maintenance page and React Hero.
// It never imports portfolio data, routing, measurement or provider clients.
const activeControllers = new WeakMap<HTMLElement, () => void>();

export function startProofTickers(root: HTMLElement) {
  activeControllers.get(root)?.();
  const groups = [...root.querySelectorAll<HTMLElement>('[data-proof-ticker]')].map((element) => ({
    element,
    slides: [...element.querySelectorAll<HTMLElement>('[data-proof-slide]')],
    index: 0,
  })).filter(({ slides }) => slides.length > 1);
  const control = root.querySelector<HTMLButtonElement>('[data-proof-motion]');
  if (!groups.length || !control) return () => {};

  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  let paused = false;
  let hovered = false;
  let focused = false;
  let inView = true;
  let disposed = false;
  let timeout: ReturnType<typeof setTimeout> | undefined;

  function render(manual = false) {
    for (const group of groups) {
      group.element.setAttribute('aria-live', manual ? 'polite' : 'off');
      group.slides.forEach((slide, index) => {
        const active = index === group.index;
        slide.dataset.active = String(active);
        slide.setAttribute('aria-hidden', String(!active));
        slide.toggleAttribute('inert', !active);
      });
    }
    control!.dataset.motionMode = media.matches ? 'manual' : paused ? 'paused' : 'playing';
    const label = media.matches ? 'Show next proof' : paused ? 'Resume proof rotation' : 'Pause proof rotation';
    control!.setAttribute('aria-label', label);
    control!.title = label;
    if (media.matches) control!.removeAttribute('aria-pressed');
    else control!.setAttribute('aria-pressed', String(paused));
  }

  function schedule() {
    if (timeout !== undefined) clearTimeout(timeout);
    timeout = undefined;
    if (disposed || paused || hovered || focused || !inView || media.matches || document.visibilityState !== 'visible') return;
    timeout = setTimeout(() => {
      advance(false);
      schedule();
    }, 6500);
  }

  function advance(manual: boolean) {
    for (const group of groups) group.index = (group.index + 1) % group.slides.length;
    render(manual);
  }
  const click = () => {
    if (media.matches) advance(true);
    else { paused = !paused; render(); }
    schedule();
  };
  const enter = () => { hovered = true; schedule(); };
  const leave = () => { hovered = false; schedule(); };
  const focusIn = () => { focused = true; schedule(); };
  const focusOut = (event: FocusEvent) => {
    focused = event.relatedTarget instanceof Node && root.contains(event.relatedTarget);
    schedule();
  };
  const preference = () => { render(); schedule(); };
  control.addEventListener('click', click);
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
    control.removeEventListener('click', click);
    root.removeEventListener('pointerenter', enter);
    root.removeEventListener('pointerleave', leave);
    root.removeEventListener('focusin', focusIn);
    root.removeEventListener('focusout', focusOut);
    document.removeEventListener('visibilitychange', schedule);
    media.removeEventListener('change', preference);
    observer?.disconnect();
    delete root.dataset.proofEnhanced;
    if (activeControllers.get(root) === stop) activeControllers.delete(root);
  };
  activeControllers.set(root, stop);
  return stop;
}
