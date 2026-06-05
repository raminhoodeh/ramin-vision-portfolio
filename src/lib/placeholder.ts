export type PlaceholderLike = { kind: 'placeholder'; label: string };

export function isPlaceholderValue(value: unknown): value is PlaceholderLike {
  return Boolean(
    value && typeof value === 'object' && 'kind' in value && (value as PlaceholderLike).kind === 'placeholder',
  );
}

export function contentValue(value: string | PlaceholderLike | undefined) {
  if (!value) return 'Detail needed';
  return isPlaceholderValue(value) ? value.label : value;
}

export function countPlaceholders(value: unknown): number {
  if (isPlaceholderValue(value)) return 1;
  if (Array.isArray(value)) return value.reduce((total, item) => total + countPlaceholders(item), 0);

  if (value && typeof value === 'object') {
    return Object.values(value).reduce((total, item) => total + countPlaceholders(item), 0);
  }

  return 0;
}

export function contentItemsToText(items: readonly (string | PlaceholderLike)[], limit = 2) {
  return items
    .slice(0, limit)
    .map((item) => contentValue(item))
    .join(', ');
}

export function publicWorkValue(value: string | PlaceholderLike | undefined) {
  if (!value || isPlaceholderValue(value)) return undefined;
  return value;
}
