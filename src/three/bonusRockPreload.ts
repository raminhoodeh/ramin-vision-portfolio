import { warmHashgraphRockAssetPipeline } from './hashgraphRockAssets';

export type BonusRockPreloadStatus = 'idle' | 'preloading' | 'ready' | 'failed';
export type BonusRockPreloadReason = 'idle' | 'intent' | 'navigate' | 'visible';

export type BonusRockPreloadSnapshot = {
  status: BonusRockPreloadStatus;
  reason?: BonusRockPreloadReason;
  startedAt?: number;
  completedAt?: number;
  error?: string;
};

type BonusRockPreloadListener = (snapshot: BonusRockPreloadSnapshot) => void;

let preloadSnapshot: BonusRockPreloadSnapshot = { status: 'idle' };
let preloadPromise: Promise<BonusRockPreloadSnapshot> | null = null;
const listeners = new Set<BonusRockPreloadListener>();

function now() {
  return typeof performance === 'undefined' ? Date.now() : performance.now();
}

function publish(nextSnapshot: BonusRockPreloadSnapshot) {
  preloadSnapshot = nextSnapshot;
  listeners.forEach((listener) => listener(preloadSnapshot));
  return preloadSnapshot;
}

async function preloadBonusRockModules() {
  await Promise.all([
    import('three'),
    import('three/examples/jsm/loaders/GLTFLoader.js'),
    import('three/examples/jsm/loaders/DRACOLoader.js'),
    import('three/examples/jsm/loaders/KTX2Loader.js'),
  ]);
}

export function getBonusRockPreloadSnapshot() {
  return preloadSnapshot;
}

export function subscribeBonusRockPreload(listener: BonusRockPreloadListener) {
  listeners.add(listener);
  listener(preloadSnapshot);
  return () => {
    listeners.delete(listener);
  };
}

export function preloadBonusRockAssets(reason: BonusRockPreloadReason = 'idle') {
  if (typeof window === 'undefined') return Promise.resolve(preloadSnapshot);
  if (preloadSnapshot.status === 'ready') return Promise.resolve(preloadSnapshot);
  if (preloadPromise) return preloadPromise;

  publish({
    status: 'preloading',
    reason,
    startedAt: now(),
  });

  preloadPromise = Promise.all([preloadBonusRockModules(), warmHashgraphRockAssetPipeline()])
    .then(() =>
      publish({
        status: 'ready',
        reason,
        startedAt: preloadSnapshot.startedAt,
        completedAt: now(),
      }),
    )
    .catch((error: unknown) => {
      const message = error instanceof Error ? error.message : String(error);
      preloadPromise = null;

      return publish({
        status: 'failed',
        reason,
        startedAt: preloadSnapshot.startedAt,
        completedAt: now(),
        error: message,
      });
    });

  return preloadPromise;
}
