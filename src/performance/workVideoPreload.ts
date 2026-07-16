import { portfolioContent } from '../data/portfolio';
import { resolveWorkVideoSrc } from '../lib/assets';

export type WorkVideoPreloadReason = 'idle' | 'intent' | 'navigate' | 'visible' | 'activate';

type WorkExperience = (typeof portfolioContent.productManagementWorkExperiences.companies)[number];
type ConnectionLike = {
  effectiveType?: string;
  saveData?: boolean;
};

const WORK_VIDEO_PRELOAD_ATTR = 'data-work-video-preload';
const IDLE_EAGER_VIDEO_COUNT = 1;
const INTENT_EAGER_VIDEO_COUNT = 2;
const VISIBLE_EAGER_VIDEO_COUNT = 3;
const MAX_HIDDEN_VIDEO_WARMERS = 4;
const RESOURCE_HINT_STAGGER_MS = 70;
const VIDEO_WARM_STAGGER_MS = 220;

const installedResourceHints = new Set<string>();
const warmVideoElements = new Map<string, HTMLVideoElement>();
const scheduledTimers = new Set<number>();

let workVideoUrls: string[] | null = null;

function getConnection() {
  if (typeof navigator === 'undefined') return undefined;
  return (navigator as Navigator & { connection?: ConnectionLike }).connection;
}

function shouldLimitHeavyPreload(reason: WorkVideoPreloadReason) {
  const connection = getConnection();
  if (!connection) return false;
  if (connection.saveData) return reason !== 'activate';

  const effectiveType = connection.effectiveType?.toLowerCase();
  if (!effectiveType) return false;

  if (effectiveType.includes('2g')) return reason !== 'activate';
  if (effectiveType === '3g') return reason === 'idle';

  return false;
}

function videoMimeType(url: string) {
  if (/\.webm(?:\?|$)/i.test(url)) return 'video/webm';
  if (/\.mp4(?:\?|$)/i.test(url)) return 'video/mp4';
  if (/\.mov(?:\?|$)/i.test(url)) return 'video/quicktime';
  return 'video/mp4';
}

function schedule(delayMs: number, callback: () => void) {
  if (typeof window === 'undefined') return;

  const timer = window.setTimeout(() => {
    scheduledTimers.delete(timer);
    callback();
  }, delayMs);

  scheduledTimers.add(timer);
}

function installVideoResourceHint(url: string, rel: 'preload' | 'prefetch') {
  if (typeof document === 'undefined') return;

  const hintId = `${rel}:${url}`;
  if (installedResourceHints.has(hintId)) return;

  installedResourceHints.add(hintId);

  const link = document.createElement('link') as HTMLLinkElement & { fetchPriority?: 'high' | 'low' };
  link.rel = rel;
  link.as = 'video';
  link.href = url;
  link.type = videoMimeType(url);
  link.fetchPriority = rel === 'preload' ? 'high' : 'low';
  link.setAttribute(WORK_VIDEO_PRELOAD_ATTR, rel);
  document.head.appendChild(link);
}

function removeOldestHiddenWarmer() {
  const oldest = warmVideoElements.entries().next();
  if (oldest.done) return;

  const [url, video] = oldest.value;
  video.pause();
  video.removeAttribute('src');
  video.load();
  video.remove();
  warmVideoElements.delete(url);
}

function warmVideoElement(url: string) {
  if (typeof document === 'undefined') return;
  if (warmVideoElements.has(url)) return;

  while (warmVideoElements.size >= MAX_HIDDEN_VIDEO_WARMERS) {
    removeOldestHiddenWarmer();
  }

  const video = document.createElement('video');
  video.src = url;
  video.preload = 'auto';
  video.muted = true;
  video.playsInline = true;
  video.loop = true;
  video.setAttribute('aria-hidden', 'true');
  video.setAttribute(WORK_VIDEO_PRELOAD_ATTR, 'video');
  video.style.position = 'fixed';
  video.style.left = '-1px';
  video.style.top = '-1px';
  video.style.width = '1px';
  video.style.height = '1px';
  video.style.opacity = '0';
  video.style.pointerEvents = 'none';
  video.style.clipPath = 'inset(50%)';
  document.body.appendChild(video);

  warmVideoElements.set(url, video);
  video.load();
}

function eagerVideoCount(reason: WorkVideoPreloadReason) {
  if (shouldLimitHeavyPreload(reason)) return 0;

  switch (reason) {
    case 'idle':
      return IDLE_EAGER_VIDEO_COUNT;
    case 'intent':
      return INTENT_EAGER_VIDEO_COUNT;
    case 'navigate':
    case 'visible':
      return VISIBLE_EAGER_VIDEO_COUNT;
    case 'activate':
      return 1;
  }
}

export function getWorkVideoUrls() {
  if (workVideoUrls) return workVideoUrls;

  workVideoUrls = Array.from(
    new Set(
      portfolioContent.productManagementWorkExperiences.companies
        .map((entry) => resolveWorkVideoSrc(entry))
        .filter((url): url is string => Boolean(url)),
    ),
  );

  return workVideoUrls;
}

export function preloadWorkVideoForEntry(entry: WorkExperience, reason: WorkVideoPreloadReason = 'intent') {
  if (typeof window === 'undefined') return;

  const url = resolveWorkVideoSrc(entry);
  if (!url) return;

  installVideoResourceHint(url, reason === 'idle' ? 'prefetch' : 'preload');
  if (!shouldLimitHeavyPreload(reason)) warmVideoElement(url);
}

export function preloadWorkVideos(reason: WorkVideoPreloadReason = 'idle') {
  if (typeof window === 'undefined') return;

  const urls = getWorkVideoUrls();
  const eagerCount = eagerVideoCount(reason);

  urls.forEach((url, index) => {
    const rel = index < eagerCount && reason !== 'idle' ? 'preload' : 'prefetch';
    schedule(index * RESOURCE_HINT_STAGGER_MS, () => installVideoResourceHint(url, rel));
  });

  urls.slice(0, eagerCount).forEach((url, index) => {
    schedule(120 + index * VIDEO_WARM_STAGGER_MS, () => warmVideoElement(url));
  });
}

export function cancelScheduledWorkVideoPreloads() {
  if (typeof window === 'undefined') return;

  scheduledTimers.forEach((timer) => window.clearTimeout(timer));
  scheduledTimers.clear();
}
