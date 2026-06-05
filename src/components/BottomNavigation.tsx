import { TahoeGlassTabNav } from './TahoeGlassTabNav';
import type { SectionTarget } from '../lib/text';

const bottomNavigationLinks = [
  { label: 'Intro', target: 'hero', icon: 'intro' },
  { label: 'Work', target: 'experience-education', icon: 'work' },
  { label: 'Projects', target: 'projects', icon: 'projects' },
  { label: 'Thoughts', target: 'teaching-speaking-writing', icon: 'thoughts' },
  { label: 'Contact', target: 'contact', icon: 'contact' },
  { label: 'Bonus', target: 'bonus', icon: 'bonus' },
  { label: 'AI Ramin', target: 'ai-ramin', icon: 'ai' },
] as const;

export function BottomNavigation({
  active,
  currentSection,
  onNavigate,
  onNavIntent,
}: {
  active: SectionTarget;
  currentSection: SectionTarget;
  onNavigate: (target: string) => void;
  onNavIntent?: (target: string) => void;
}) {
  const isDarkPage = currentSection === 'bonus' || currentSection === 'projects';

  return (
    <nav
      aria-label="Portfolio navigation"
      className={`portfolio-bottom-navigation ${active === 'ai-ramin' ? 'has-ai-ramin-active' : ''}`}
    >
      <TahoeGlassTabNav
        active={active}
        navLinks={bottomNavigationLinks}
        onNavigate={onNavigate}
        onNavIntent={onNavIntent}
        isDarkPage={isDarkPage}
        className="portfolio-bottom-navigation-liquid-shell"
        navLabel="Portfolio navigation"
      />
    </nav>
  );
}
