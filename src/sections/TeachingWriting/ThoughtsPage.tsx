import { AuroraBackground } from '@/components/ui/aurora-background';
import { portfolioContent } from '../../data/portfolio';
import { type CaseStudyEntry } from '../types';
import { ThoughtEditorialHero } from './Foundations';
import { ThoughtsOverview } from './ThoughtsOverview';

export function ThoughtsPage({ onOpen }: { onOpen: (item: CaseStudyEntry) => void }) {
  const { writing } = portfolioContent.teachingSpeakingWriting;

  return (
    <section id="thoughts" className="thoughts-editorial relative isolate overflow-hidden">
      <AuroraBackground
        backgroundMode="fixed"
        className="thoughts-aurora-shell min-h-full items-stretch justify-start bg-zinc-50"
      >
        <ThoughtEditorialHero />
        <div className="thoughts-editorial-body relative z-10 mx-auto max-w-[1440px] px-5 py-8 pb-8 sm:px-8 md:px-12 md:py-12 md:pb-8 lg:px-16">
          <ThoughtsOverview caseStudies={writing.caseStudies} onOpen={onOpen} />
        </div>
      </AuroraBackground>
    </section>
  );
}
