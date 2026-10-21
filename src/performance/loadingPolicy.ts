export type LoadingPreferences = {
  saveData: boolean;
  effectiveType?: string;
  deviceMemory?: number;
  reducedMotion: boolean;
  visible: boolean;
};

export function getLoadingPreferences(): LoadingPreferences {
  if (typeof window === 'undefined') return { saveData: false, reducedMotion: true, visible: false };
  const device = navigator as Navigator & {
    connection?: { saveData?: boolean; effectiveType?: string };
    deviceMemory?: number;
  };
  return {
    saveData: device.connection?.saveData === true,
    effectiveType: device.connection?.effectiveType,
    deviceMemory: device.deviceMemory,
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    visible: document.visibilityState !== 'hidden',
  };
}

// Optional speculation never gates content required by explicit navigation.
export function canSpeculativelyLoad(preferences = getLoadingPreferences()) {
  return preferences.visible && !preferences.saveData && !preferences.reducedMotion &&
    !/^(slow-2g|2g|3g)$/i.test(preferences.effectiveType ?? '') &&
    (preferences.deviceMemory === undefined || preferences.deviceMemory > 4);
}

export function shouldAnimate(preferences = getLoadingPreferences()) {
  return !preferences.reducedMotion;
}
