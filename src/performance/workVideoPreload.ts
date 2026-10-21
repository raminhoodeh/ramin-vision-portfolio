import type { portfolioContent } from '../data/portfolio';
import { resolveWorkVideoSrc } from '../lib/assets';
import { canSpeculativelyLoad } from './loadingPolicy';

export type WorkVideoPreloadReason = 'idle' | 'intent' | 'navigate' | 'visible' | 'activate';
type WorkExperience = (typeof portfolioContent.productManagementWorkExperiences.companies)[number];
const hints = new Map<string, HTMLLinkElement>();

// Warm only a selected entry on intent. Importing this helper installs no hidden
// decoders, timers, all-company requests, or resource hints.
export function preloadWorkVideoForEntry(entry: WorkExperience, reason: WorkVideoPreloadReason = 'intent') {
  if (typeof document === 'undefined' || reason === 'idle' || !canSpeculativelyLoad()) return;
  const url = resolveWorkVideoSrc(entry);
  if (!url || hints.has(url)) return;
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.as = 'video';
  link.href = url;
  link.setAttribute('data-work-video-preload', reason);
  document.head.appendChild(link);
  hints.set(url, link);
}

// Compatibility API: section entry never downloads the whole company catalogue.
// Actual selected/manual playback is owned by the visible media component.
export function preloadWorkVideos(_reason: WorkVideoPreloadReason = 'idle') {}
export function getWorkVideoUrls() { return [...hints.keys()]; }
export function cancelScheduledWorkVideoPreloads() {
  hints.forEach((hint) => hint.remove());
  hints.clear();
}
