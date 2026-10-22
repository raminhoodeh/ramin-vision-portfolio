export type GlassPose = { x: number; y: number; z: number; rotateY: number; opacity: number };

export function wrapIndex(index: number, count: number) {
  return ((Math.round(index) % count) + count) % count;
}

export function relativeIndex(index: number, position: number, count: number) {
  return ((index - position + count / 2) % count + count) % count - count / 2;
}

export function nearestTarget(position: number, index: number, count: number) {
  return position + relativeIndex(index, position, count);
}

export function carouselSize(width: number) {
  const mobile = width < 640;
  return {
    width,
    cardWidth: Math.min(mobile ? 340 : 360, width * (mobile ? 0.84 : 0.37)),
    cardHeight: mobile ? 470 : 446,
    height: mobile ? 590 : 566,
  };
}

export function carouselPoses(position: number, count: number, cardWidth: number): GlassPose[] {
  return Array.from({ length: count }, (_, index) => {
    const distance = relativeIndex(index, position, count);
    const depth = Math.abs(distance);
    return {
      x: Math.sin(distance * 0.78) * cardWidth * 1.32,
      y: 16 * depth - 14,
      z: 34 - Math.pow(depth, 1.35) * 174,
      rotateY: -distance * 0.33,
      // The rear card crosses behind the arc, hidden at the wrap boundary.
      opacity: Math.max(0, Math.min(1, (1.5 - depth) / 0.2)),
    };
  });
}

/** Visibility is deliberate loading here; 3G/4GB devices get the capped renderer. */
export function canRenderGlass(preferences: { saveData: boolean; reducedMotion: boolean; effectiveType?: string; deviceMemory?: number }) {
  return !preferences.saveData && !preferences.reducedMotion
    && !/^(slow-2g|2g)$/i.test(preferences.effectiveType ?? '')
    && (preferences.deviceMemory === undefined || preferences.deviceMemory > 2);
}
