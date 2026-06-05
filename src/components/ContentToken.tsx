import { isPlaceholderValue, contentValue, type PlaceholderLike } from '../lib/placeholder';

export function ContentToken({ value }: { value: string | PlaceholderLike }) {
  const isPlaceholder = isPlaceholderValue(value);

  return (
    <span
      className={`rounded-full px-3 py-1.5 text-xs ${
        isPlaceholder ? 'border border-dashed border-stroke/70 text-muted' : 'bg-white/45 text-text-primary'
      }`}
    >
      {contentValue(value)}
    </span>
  );
}
