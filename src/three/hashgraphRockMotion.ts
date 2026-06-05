export type BonusRockStageId = 'sealed' | 'warming' | 'fracturing' | 'ruptured';
export type BonusGiftPreviewMode = 'hidden' | 'glint' | 'miniature' | 'revealed';

export type BonusRockAnimationTracks = {
  wakeProgress: number;
  fractureProgress: number;
  ruptureProgress: number;
  giftPeekProgress: number;
  giftRevealProgress: number;
};

export type BonusRockStageContract = {
  id: BonusRockStageId;
  clickCount: number;
  statusLabel: string;
  actionLabel: string;
  rockContract: {
    integrity: number;
    maxShardSpread: number;
    maxParticleOpacity: number;
    emissiveTarget: number;
    physicalRead: string;
  };
  giftPreview: {
    mode: BonusGiftPreviewMode;
    opacity: number;
    scale: number;
    blurPx: number;
    interactive: boolean;
    physicalRead: string;
  };
};

export const VENTURES_ROCK_REFERENCE = {
  source: 'Hashgraph Ventures intro rock',
  liveUrl: 'https://hashgraphvc.com/',
  localScrapeFiles: [
    'Hashgraph Ventures | AI & Blockchain Venture Capital.html',
    'main.js',
    'rock-state.js',
    'particles.js',
    'gl/intro/intro_compressed.glb',
    'gl/intro/texture_0.ktx2',
    'gl/intro/texture_1.ktx2',
    'gl/intro/texture_2.ktx2',
    'gl/intro/texture_3.ktx2',
  ],
  scrollStateMachine: [
    { state: 'IDLE', range: [0, 0.15], intent: 'whole rock, slow rotation, base inner glow' },
    { state: 'WARMING', range: [0.15, 0.28], intent: 'glow wakes without visible fragmentation' },
    { state: 'GLOWING', range: [0.28, 0.42], intent: 'stronger internal pressure and pulse' },
    { state: 'EXPLODING', range: [0.42, 0.55], intent: 'fast rupture, dissolve, particle release' },
    { state: 'DISSOLVED', range: [0.55, 1], intent: 'rock has cleared, particles own the scene' },
  ],
  materialBaseline: {
    emissiveIntensity: 1.35,
    roughness: 0.38,
    metalness: 0.56,
    baseScale: 1.3,
  },
} as const;

export const BONUS_ROCK_FINAL_CLICK_COUNT = 3;

export const BONUS_ROCK_STAGE_CONTRACTS: readonly BonusRockStageContract[] = [
  {
    id: 'sealed',
    clickCount: 0,
    statusLabel: 'Dormant core',
    actionLabel: 'Click rock',
    rockContract: {
      integrity: 1,
      maxShardSpread: 0,
      maxParticleOpacity: 0.02,
      emissiveTarget: 1.35,
      physicalRead: 'The rock is intact and quietly alive.',
    },
    giftPreview: {
      mode: 'hidden',
      opacity: 0,
      scale: 0.46,
      blurPx: 18,
      interactive: false,
      physicalRead: 'Gifts are fully occluded behind the sealed rock.',
    },
  },
  {
    id: 'warming',
    clickCount: 1,
    statusLabel: 'Cracks waking',
    actionLabel: '2 clicks left',
    rockContract: {
      integrity: 0.98,
      maxShardSpread: 0.025,
      maxParticleOpacity: 0.07,
      emissiveTarget: 2,
      physicalRead: 'The first click should read as pressure and glow, not explosion.',
    },
    giftPreview: {
      mode: 'glint',
      opacity: 0.34,
      scale: 0.56,
      blurPx: 7,
      interactive: false,
      physicalRead: 'Only small silver edges or light leaks are visible through cracks.',
    },
  },
  {
    id: 'fracturing',
    clickCount: 2,
    statusLabel: 'Core unstable',
    actionLabel: '1 click left',
    rockContract: {
      integrity: 0.86,
      maxShardSpread: 0.06,
      maxParticleOpacity: 0.18,
      emissiveTarget: 2.8,
      physicalRead: 'The rock is still one object, but selected seams separate enough to reveal depth.',
    },
    giftPreview: {
      mode: 'miniature',
      opacity: 0.68,
      scale: 0.74,
      blurPx: 1.5,
      interactive: false,
      physicalRead: 'Minimized gift shapes are visible behind the fractured rock but remain unreadable.',
    },
  },
  {
    id: 'ruptured',
    clickCount: 3,
    statusLabel: 'Gifts unlocked',
    actionLabel: 'Unlocked',
    rockContract: {
      integrity: 0,
      maxShardSpread: 5.4,
      maxParticleOpacity: 0.92,
      emissiveTarget: 3.4,
      physicalRead: 'The third click is the only true page-wide celestial explosion.',
    },
    giftPreview: {
      mode: 'revealed',
      opacity: 1,
      scale: 1,
      blurPx: 0,
      interactive: true,
      physicalRead: 'Gifts expand from behind the rupture into their final clickable layout.',
    },
  },
] as const;

export function getBonusRockStage(clickCount: number): BonusRockStageContract {
  const stageIndex = Math.max(0, Math.min(BONUS_ROCK_FINAL_CLICK_COUNT, Math.floor(clickCount)));
  return BONUS_ROCK_STAGE_CONTRACTS[stageIndex] ?? BONUS_ROCK_STAGE_CONTRACTS[0];
}

export function getBonusRockAnimationTargets(clickCount: number): BonusRockAnimationTracks {
  const stage = getBonusRockStage(clickCount);

  return {
    wakeProgress: stage.clickCount >= 1 ? 1 : 0,
    fractureProgress: stage.clickCount >= 2 ? 1 : 0,
    ruptureProgress: stage.clickCount >= 3 ? 1 : 0,
    giftPeekProgress: stage.giftPreview.mode === 'hidden' ? 0 : stage.giftPreview.mode === 'glint' ? 0.34 : 1,
    giftRevealProgress: stage.giftPreview.mode === 'revealed' ? 1 : 0,
  };
}
