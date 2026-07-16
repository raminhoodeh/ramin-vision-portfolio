import { portfolioContent } from '../data/portfolio';
import { isPlaceholderValue, type PlaceholderLike } from './placeholder';

// Paths are relative to src/lib/ — two levels up reaches the project root
export const companyLogoAssets = import.meta.glob<string>('../../work-section/**/*.{png,jpg,jpeg,webp}', {
  eager: true,
  import: 'default',
});
export const companyVideoAssets = import.meta.glob<string>('../../work-section/**/*.webm', {
  eager: true,
  import: 'default',
});

type WorkExperience = (typeof portfolioContent.productManagementWorkExperiences.companies)[number];

export function normalizeAssetKey(value: string) {
  return value
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/[^a-z0-9]+/g, '');
}

export function findImportedAsset(
  assets: Record<string, string>,
  candidates: readonly (string | undefined)[],
) {
  const assetEntries = Object.entries(assets).map(([path, url]) => ({
    normalizedPath: normalizeAssetKey(path),
    url,
  }));

  for (const candidate of candidates) {
    if (!candidate) continue;
    const normalizedCandidate = normalizeAssetKey(candidate);
    const match = assetEntries.find((asset) => asset.normalizedPath.endsWith(normalizedCandidate));
    if (match) return match.url;
  }

  return undefined;
}

export function resolveCompanyLogoSrc(value: string | PlaceholderLike | undefined) {
  if (!value || isPlaceholderValue(value)) return undefined;
  return companyLogoAssets[`../../${value}`] ?? findImportedAsset(companyLogoAssets, [value]);
}

export function displayWorkCompanyName(entry: WorkExperience) {
  return (entry as { fullCompanyName?: string }).fullCompanyName ?? entry.companyName;
}

export function workVideoPath(entry: WorkExperience) {
  if (!('productVideoAsset' in entry)) return undefined;
  return typeof entry.productVideoAsset.pathOrUrl === 'string'
    ? entry.productVideoAsset.pathOrUrl
    : undefined;
}

export function workVideoFileStem(entry: WorkExperience) {
  return normalizeAssetKey(displayWorkCompanyName(entry)) || normalizeAssetKey(entry.companyName);
}

export function resolveWorkVideoSrc(entry: WorkExperience) {
  const explicitVideo = typeof entry.productVideo === 'string' ? entry.productVideo : undefined;
  if (explicitVideo && /^https?:\/\//i.test(explicitVideo)) return explicitVideo;
  const previousCompanyName = 'previousCompanyName' in entry && typeof entry.previousCompanyName === 'string'
    ? entry.previousCompanyName
    : undefined;

  return findImportedAsset(companyVideoAssets, [
    explicitVideo,
    workVideoPath(entry),
    `work-section/company-videos/${workVideoFileStem(entry)}-work-video`,
    `work-section/company-videos/${entry.companyName}-work-video`,
    `work-section/company-videos/${displayWorkCompanyName(entry)}-work-video`,
    previousCompanyName ? `work-section/company-videos/${previousCompanyName}-work-video` : undefined,
    `work-section/${workVideoFileStem(entry)}`,
    `work-section/${entry.companyName}`,
    `work-section/${displayWorkCompanyName(entry)}`,
  ]);
}
