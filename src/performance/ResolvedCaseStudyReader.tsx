import type { CaseStudyEntry } from '../sections/types';
import { caseStudyByDeepDiveSlug, projectCaseStudyEntries } from '../sections/Projects/types';
import { CaseStudyOverlay } from '../sections/Projects/CaseStudyOverlay';

export function ResolvedCaseStudyReader({ item, onClose }: { item: CaseStudyEntry; onClose: () => void }) {
  const resolved = item.id.startsWith('writeup-')
    ? caseStudyByDeepDiveSlug.get(item.id.slice('writeup-'.length))
    : projectCaseStudyEntries.find((entry) => entry.id === item.id);
  if (!resolved) return <section role="alert"><h1>This reader could not be found.</h1><button type="button" onClick={onClose}>Return to the portfolio</button></section>;
  return <CaseStudyOverlay item={resolved} onClose={onClose} />;
}
