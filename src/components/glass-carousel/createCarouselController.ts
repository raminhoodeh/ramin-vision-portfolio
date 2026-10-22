import { carouselPoses, carouselSize, nearestTarget, wrapIndex, canRenderGlass } from './layout';
import { getLoadingPreferences } from '../../performance/loadingPolicy';
import type { createGlassScene } from './createGlassScene';

export type CarouselMode = 'static' | 'loading' | 'ready' | 'fallback';
export type CarouselController = { step(delta: number): void; select(index: number): void; dispose(): void };
type Scene = Awaited<ReturnType<typeof createGlassScene>>;

/** One event-driven animation loop updates both real HTML and its glass meshes. */
export function createCarouselController({
  stage, mount, cards, initialIndex, onSelect, onMode,
}: {
  stage: HTMLDivElement;
  mount: HTMLDivElement;
  cards: HTMLElement[];
  initialIndex: number;
  onSelect(index: number): void;
  onMode(mode: CarouselMode): void;
}): CarouselController {
  let disposed = false;
  let scene: Scene | null = null;
  let loading = false;
  let failed = false;
  let visible = false;
  let frame = 0;
  let lastTime = 0;
  let position = initialIndex;
  let target = initialIndex;
  let light = 0;
  let lightTarget = 0;
  let size = carouselSize(Math.max(1, stage.clientWidth));
  let skipClickUntil = 0;
  let pointer: { id: number; x: number; y: number; start: number; dragging: boolean } | null = null;
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  const connection = (navigator as Navigator & { connection?: EventTarget }).connection;
  const allowed = () => {
    const preferences = { ...getLoadingPreferences(), visible: true };
    stage.dataset.glassFallback = media.matches ? 'reduced-motion' : preferences.saveData ? 'save-data'
      : /^(slow-2g|2g)$/i.test(preferences.effectiveType ?? '') ? 'connection'
      : preferences.deviceMemory !== undefined && preferences.deviceMemory <= 2 ? 'device-memory' : '';
    return !media.matches && canRenderGlass(preferences);
  };
  const cancelFrame = () => { if (frame) cancelAnimationFrame(frame); frame = 0; lastTime = 0; };
  const running = () => !disposed && visible && document.visibilityState === 'visible' && !!scene;
  const paint = () => {
    if (!scene) return;
    const poses = carouselPoses(position, cards.length, size.cardWidth);
    poses.forEach((pose, index) => {
      const card = cards[index];
      card.style.transform = `translate3d(calc(-50% + ${pose.x}px), calc(-50% + ${pose.y}px), ${pose.z}px) rotateY(${pose.rotateY}rad)`;
      card.style.opacity = String(pose.opacity);
      card.style.zIndex = String(1000 + Math.round(pose.z));
      card.style.setProperty('--glass-shine', `${50 + light * 32 - pose.rotateY * 45}%`);
    });
    scene.render(poses, light);
    stage.dataset.glassPosition = position.toFixed(3);
  };
  function tick(time: number) {
    frame = 0;
    if (!running()) { lastTime = 0; return; }
    const delta = lastTime ? Math.min(0.05, (time - lastTime) / 1000) : 1 / 60;
    lastTime = time;
    const blend = 1 - Math.exp(-13 * delta);
    position += (target - position) * blend;
    light += (lightTarget - light) * blend;
    if (Math.abs(target - position) < 0.0005) position = target;
    if (Math.abs(lightTarget - light) < 0.001) light = lightTarget;
    paint();
    if (!running()) return;
    if (position !== target || light !== lightTarget) frame = requestAnimationFrame(tick);
    else lastTime = 0;
  }
  function wake() { if (!frame && running()) frame = requestAnimationFrame(tick); }
  const announce = () => onSelect(wrapIndex(target, cards.length));
  function setTarget(value: number) {
    target = value;
    announce();
    wake();
  }
  const resetStyles = () => {
    cards.forEach((card) => { card.style.removeProperty('transform'); card.style.removeProperty('opacity'); card.style.removeProperty('z-index'); });
  };
  function releaseDrag() {
    const current = pointer;
    pointer = null;
    delete stage.dataset.dragging;
    if (current && stage.hasPointerCapture(current.id)) stage.releasePointerCapture(current.id);
    return current?.dragging === true;
  }
  function interruptDrag() {
    if (releaseDrag() && !disposed) {
      skipClickUntil = performance.now() + 350;
      target = Math.round(target);
      announce();
    }
  }
  function stop(mode: CarouselMode) {
    cancelFrame();
    interruptDrag();
    scene?.dispose();
    scene = null;
    resetStyles();
    onMode(mode);
  }
  function measure() {
    size = carouselSize(Math.max(1, stage.clientWidth));
    // Keep every word/link visible with narrow viewports or enlarged text.
    size.cardHeight = Math.max(size.cardHeight, ...cards.map((card) => Math.ceil(card.offsetHeight + Math.max(0, card.scrollHeight - card.clientHeight))));
    size.height = size.cardHeight + 120;
    stage.style.setProperty('--glass-card-width', `${size.cardWidth}px`);
    stage.style.setProperty('--glass-card-height', `${size.cardHeight}px`);
    stage.style.setProperty('--glass-stage-height', `${size.height}px`);
    scene?.resize(size.width, size.height, size.cardWidth, size.cardHeight);
    wake();
  }
  async function start() {
    if (disposed || !visible || document.visibilityState !== 'visible' || !allowed() || scene || loading || failed) return;
    loading = true;
    onMode('loading');
    try {
      const { createGlassScene: create } = await import('./createGlassScene');
      if (disposed || !allowed() || !visible || document.visibilityState !== 'visible') { loading = false; if (!disposed) onMode('static'); return; }
      const next = await create(mount, () => {
        failed = true;
        if (!disposed) stop('fallback');
      });
      if (disposed || failed || !allowed() || !visible || document.visibilityState !== 'visible') { next.dispose(); loading = false; if (!disposed) onMode(failed ? 'fallback' : 'static'); return; }
      scene = next;
      loading = false;
      measure();
      if (failed || !scene) return;
      onMode('ready');
      wake();
    } catch {
      loading = false;
      failed = true;
      if (!disposed) stop('fallback');
    }
  }
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) { void start(); wake(); }
    else { interruptDrag(); cancelFrame(); }
  }, { rootMargin: '120px 0px' });
  observer.observe(stage);
  const resize = new ResizeObserver(measure);
  resize.observe(stage);
  const visibility = () => {
    if (document.visibilityState === 'visible') { void start(); wake(); }
    else { interruptDrag(); cancelFrame(); }
  };
  const preference = () => {
    if (!allowed()) stop('static');
    else { failed = false; void start(); }
  };
  const down = (event: PointerEvent) => {
    if (!scene || pointer || event.isPrimary === false || (event.pointerType === 'mouse' && event.button !== 0)) return;
    const element = event.target as Element;
    if (element.closest('a,button,input,textarea,select')) return;
    // Keep desktop copy selectable; touch can swipe across the same text.
    if (event.pointerType === 'mouse' && element.closest('[data-glass-selectable]')) return;
    pointer = { id: event.pointerId, x: event.clientX, y: event.clientY, start: position, dragging: false };
  };
  const move = (event: PointerEvent) => {
    if (!scene) return;
    if (!pointer) {
      if (event.pointerType === 'mouse') {
        const bounds = stage.getBoundingClientRect();
        lightTarget = Math.max(-1, Math.min(1, ((event.clientX - bounds.left) / bounds.width - 0.5) * 2));
        wake();
      }
      return;
    }
    if (pointer.id !== event.pointerId) return;
    const x = event.clientX - pointer.x;
    const y = event.clientY - pointer.y;
    if (!pointer.dragging) {
      if (Math.abs(y) > 10 && Math.abs(y) > Math.abs(x)) { pointer = null; return; }
      if (Math.abs(x) < 8 || Math.abs(x) < Math.abs(y) * 1.15) return;
      pointer.dragging = true;
      stage.dataset.dragging = 'true';
      stage.setPointerCapture(event.pointerId);
    }
    event.preventDefault();
    target = pointer.start - x / (size.cardWidth * 0.85);
    lightTarget = Math.max(-1, Math.min(1, -x / size.cardWidth));
    wake();
  };
  const up = (event: PointerEvent) => {
    if (!pointer || pointer.id !== event.pointerId) return;
    const dragged = releaseDrag();
    if (dragged) {
      skipClickUntil = performance.now() + 350;
      setTarget(Math.round(target));
    }
  };
  const lostCapture = (event: PointerEvent) => {
    if (pointer?.id === event.pointerId) { interruptDrag(); wake(); }
  };
  const leave = () => { if (!pointer) { lightTarget = 0; wake(); } };
  const click = (event: MouseEvent) => {
    if (performance.now() < skipClickUntil) { event.preventDefault(); event.stopPropagation(); return; }
    const element = event.target as Element;
    if (element.closest('button')) return;
    if (!element.closest('a') && window.getSelection()?.toString()) return;
    const card = element.closest<HTMLElement>('[data-glass-index]');
    if (card && scene) setTarget(nearestTarget(target, Number(card.dataset.glassIndex), cards.length));
  };
  const keyboard = (event: KeyboardEvent) => {
    if (!scene || event.target !== stage || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || event.isComposing) return;
    const value = event.key === 'ArrowRight' ? target + 1 : event.key === 'ArrowLeft' ? target - 1
      : event.key === 'Home' ? nearestTarget(target, 0, cards.length) : event.key === 'End' ? nearestTarget(target, cards.length - 1, cards.length) : null;
    if (value !== null) { event.preventDefault(); setTarget(value); }
  };
  stage.addEventListener('pointerdown', down);
  stage.addEventListener('pointermove', move, { passive: false });
  stage.addEventListener('pointerup', up);
  stage.addEventListener('pointercancel', up);
  stage.addEventListener('pointerleave', leave);
  stage.addEventListener('lostpointercapture', lostCapture);
  stage.addEventListener('click', click, true);
  stage.addEventListener('keydown', keyboard);
  document.addEventListener('visibilitychange', visibility);
  media.addEventListener('change', preference);
  connection?.addEventListener('change', preference);
  measure();
  return {
    step(delta) { setTarget(Math.round(target) + delta); },
    select(index) { setTarget(nearestTarget(Math.round(target), index, cards.length)); },
    dispose() {
      disposed = true;
      cancelFrame();
      releaseDrag();
      observer.disconnect(); resize.disconnect();
      document.removeEventListener('visibilitychange', visibility);
      media.removeEventListener('change', preference);
      connection?.removeEventListener('change', preference);
      stage.removeEventListener('pointerdown', down);
      stage.removeEventListener('pointermove', move);
      stage.removeEventListener('pointerup', up);
      stage.removeEventListener('pointercancel', up);
      stage.removeEventListener('pointerleave', leave);
      stage.removeEventListener('lostpointercapture', lostCapture);
      stage.removeEventListener('click', click, true);
      stage.removeEventListener('keydown', keyboard);
      scene?.dispose(); scene = null;
      resetStyles();
    },
  };
}
