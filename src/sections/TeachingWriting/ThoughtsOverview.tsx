import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { portfolioContent } from '../../data/portfolio';
import { aiProductCourseEvidence, disxTalkEvidence, productCourseEvidence } from '../../data/teachingEvidence';
import { contentValue } from '../../lib/placeholder';
import { type CaseStudyEntry, type TeachingEntry, type WritingCaseStudyEntry } from '../types';
import { selfwareGeneratedArtwork, toolGeneratedArtwork } from '../Projects/index';
import { getProjectReader } from '../Projects/types';
import { CaseStudyWriteupIndex } from './CaseWriteups';
import { METACOGNITION_SENTINEL } from './MetacognitionDeepDive';
import { thoughtsAssets } from '../../assets/thoughts';
import { IPhone3D } from '../../components/IPhone3D';
import { TahoeGlassSurface } from '../../components/TahoeGlassSurface';
import dreamseaHomepageScreenUrl from '../../assets/previews/dreamsea-homepage.webp';
import dreamseaIphoneRecordingUrl from '../../../projects-section/Project Images/dreamsea-fixed-recording-3d-island.webm';
import propositionVideoUrl from '../../../thoughts-section/books/the-proposition-video.webm';
import aiNativeProductOsLightModeUrl from '../../../thoughts-section/courses/ai-native-product-os-light-mode.jpg';
import { ProductMethodSummary } from '../ProductMethodSummary';
import { CourseLearningDetails } from './CourseLearningDetails';
import './TeachingWriting.css';

type BeatCta =
  | { kind: 'link'; label: string; href: string }
  | { kind: 'button'; label: string; onClick: () => void };

type Beat = {
  index: string;
  label: string;
  title: string;
  proof: string;
  body: string;
  artwork: string | undefined;
  expandedArtwork?: string;
  ctas: BeatCta[];
  anchorIds?: string[];
  wide?: boolean;
  sectionHead?: string;
  onDeepDive?: () => void;
  quoteParagraphs?: string[];
  sideImage?: string;
  sideImageAlt?: string;
};

type CourseProofScrollState = {
  canScroll: boolean;
  atEnd: boolean;
};

const defaultCourseProofScrollState: CourseProofScrollState = {
  canScroll: false,
  atEnd: false,
};

const valueHomageWords = new Map<string, string>([
  ['vision', 'Vision'],
  ['taste', 'Taste'],
  ['clarity', 'Clarity'],
  ['judgment', 'Judgement'],
  ['judgement', 'Judgement'],
  ['empathy', 'Empathy'],
] as const);

const beatAnchors: Record<string, string> = {
  '01': 'thoughts-foundations',
  '02': 'thoughts-talks',
  '03': 'thoughts-passions',
  '04': 'thoughts-integration',
  '05': 'thoughts-work-narrative',
  DISx: 'thoughts-disx',
};

function getCourseTitle(course: TeachingEntry) {
  if (course.framework.name === 'Product Innovation Process') return productCourseEvidence.title;
  return 'displayTitle' in course && typeof course.displayTitle === 'string' ? course.displayTitle : course.courseTitle;
}

function getCourseHref(course: TeachingEntry) {
  return typeof course.courseLink === 'string' && course.courseLink.startsWith('http') ? course.courseLink : undefined;
}

function orderCourses(courses: readonly TeachingEntry[]) {
  const productInnovation = courses.find((course) => course.framework.name === 'Product Innovation Process');
  const aiNative = courses.find((course) => course.framework.name === 'AI-Native Product OS');
  const ordered = [aiNative, productInnovation].filter((course): course is TeachingEntry => Boolean(course));
  const remaining = courses.filter((course) => !ordered.includes(course));

  return [...ordered, ...remaining];
}

function getCourseProofScrollState(element: HTMLElement | null): CourseProofScrollState {
  if (!element) {
    return defaultCourseProofScrollState;
  }

  const canScroll = element.scrollHeight > element.clientHeight + 4;
  const atEnd = !canScroll || element.scrollTop + element.clientHeight >= element.scrollHeight - 8;

  return { canScroll, atEnd };
}

function setCreationPreviewPlayback(container: HTMLElement, shouldPlay: boolean) {
  container.querySelectorAll<HTMLVideoElement>('[data-creation-preview-video]').forEach((video) => {
    if (shouldPlay) {
      void video.play().catch(() => undefined);
      return;
    }

    video.pause();
    video.currentTime = 0;
  });
}

function getCourseProof(course: TeachingEntry) {
  if (course.framework.name === 'AI-Native Product OS') {
    return {
      ...aiProductCourseEvidence.udemy,
      description:
        'A practical AI product management course about model choice, context, orchestration, governance and human judgment.',
      coursera: aiProductCourseEvidence.coursera,
      links: [
        { label: 'Udemy', href: aiProductCourseEvidence.udemy.href },
        { label: 'Coursera', href: aiProductCourseEvidence.coursera.href },
      ],
    };
  }

  return {
    ...productCourseEvidence,
    description:
      'A start-to-finish product management course for aligning teams around one product story, one source of truth, and a clear path from idea to launch.',
    coursera: undefined,
    links: [{ label: 'Udemy', href: productCourseEvidence.href }],
  };
}

function CourseProofMiniCard({ course }: { course: TeachingEntry }) {
  const proof = getCourseProof(course);
  const heroMedia = course.media[0];
  const isProductInnovationCourse = course.framework.name === 'Product Innovation Process';
  const content = (
    <>
      <div
        className={`thoughts-course-proof-mini-media ${
          isProductInnovationCourse ? 'thoughts-course-proof-mini-media--product-innovation' : ''
        }`}
        aria-hidden="true"
      >
        {heroMedia ? <img src={heroMedia.path} alt="" loading="lazy" decoding="async" /> : null}
      </div>
      <div className="thoughts-course-proof-mini-copy">
        {proof.badges.length > 0 ? (
          <div className="thoughts-course-proof-mini-top">
            {proof.badges.map((badge) => (
              <span key={badge} className="thoughts-course-proof-mini-badge">{badge}</span>
            ))}
          </div>
        ) : null}
        <h4>{proof.title}</h4>
        <p>{proof.description}</p>
        <div className="thoughts-course-proof-mini-stats">
          <span>
            <strong>{proof.rating}/5</strong>
          </span>
          <span>
            <strong>{proof.ratings} ratings</strong>
          </span>
          <span>
            <strong>{proof.students} students</strong>
          </span>
        </div>
        <p>
          {proof.platform} · <time dateTime={proof.checkedOn}>{proof.checkedLabel}</time>
        </p>
        {proof.coursera ? (
          <p>
            On Coursera: <em>{proof.coursera.title}</em>, offered by {proof.coursera.provider} · {proof.coursera.modules} modules.
            {' '}<time dateTime={proof.coursera.checkedOn}>{proof.coursera.checkedLabel}</time>.
          </p>
        ) : null}
        <CourseLearningDetails framework={course.framework.name === 'AI-Native Product OS' ? 'AI-Native Product OS' : 'Product Innovation Process'} />
        {proof.links.length > 0 ? (
          <div className="thoughts-course-proof-mini-links">
            <span className="thoughts-course-proof-mini-links-label">Learn on</span>
            {proof.links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="thoughts-course-proof-mini-link thoughts-beat-cta--watch card-glass-attachment card-glass-attachment--deep-dive"
              >
                <span className="card-glass-attachment__label">{link.label}</span>
              </a>
            ))}
          </div>
        ) : null}
      </div>
    </>
  );

  return <article className="thoughts-course-proof-mini-card">{content}</article>;
}

function CourseProofPanel({ courses }: { courses: readonly TeachingEntry[] }) {
  const orderedCourses = orderCourses(courses);

  return (
    <motion.section
      id="thoughts-courses"
      className="thoughts-course-proof liquid-glass-strong"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.55, delay: 0.18, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <div className="thoughts-course-proof-head">
        <div>
          <div className="thoughts-beat-header-top">
            <span className="thoughts-beat-index thoughts-beat-index--dark">Courses</span>
            <span className="thoughts-beat-label thoughts-beat-label--dark">How I teach it</span>
          </div>
          <h3 className="thoughts-course-proof-title">The thinking becomes transferable.</h3>
        </div>
        <p>
          Two courses turn product judgment into loops, templates, operating systems, and practical assets
          someone else can use without me in the room.
        </p>
      </div>

      <div className="thoughts-course-grid">
        {orderedCourses.map((course) => {
          const heroMedia = course.media[0];
          const href = getCourseHref(course);

          return (
            <article key={course.courseTitle} className="thoughts-course-card">
              <div className="thoughts-course-card-media" aria-hidden="true">
                {heroMedia ? <img src={heroMedia.path} alt="" loading="lazy" decoding="async" /> : null}
              </div>
              <div className="thoughts-course-card-copy">
                <div className="thoughts-course-card-top">
                  {getCourseProof(course).badges.map((badge) => (
                    <span key={badge} className="thoughts-course-badge">{badge}</span>
                  ))}
                  <span>{course.framework.name}</span>
                </div>
                <h4>{getCourseTitle(course)}</h4>
                <p>{contentValue(course.courseDescription)}</p>
                <div className="thoughts-course-stat-row">
                  {course.stats.slice(0, 3).map((stat) => (
                    <span key={`${course.courseTitle}-${stat.label}`}>
                      <strong>{stat.value}</strong>
                      {stat.label}
                    </span>
                  ))}
                </div>
                {href ? (
                  <a href={href} target="_blank" rel="noopener noreferrer" className="thoughts-course-link">
                    View course -&gt;
                  </a>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>
    </motion.section>
  );
}

export function ThoughtsOverview({
  caseStudies,
  onOpen,
}: {
  caseStudies: readonly WritingCaseStudyEntry[];
  onOpen: (item: CaseStudyEntry) => void;
}) {
  const [openBeat, setOpenBeat] = useState<string | null>(null);
  const [courseProofScrollState, setCourseProofScrollState] =
    useState<CourseProofScrollState>(defaultCourseProofScrollState);
  const { speaking, teaching, writing } = portfolioContent.teachingSpeakingWriting;

  const tedxImagePath: string | undefined =
    typeof speaking[0].media.path === 'string' ? speaking[0].media.path : undefined;
  const uniTalkImagePath: string | undefined =
    typeof speaking[1].media.path === 'string' ? speaking[1].media.path : undefined;
  const bookCoverPath: string | undefined =
    typeof writing.books[0].bookImage === 'string' ? writing.books[0].bookImage : undefined;
  const osArtwork: string | undefined =
    toolGeneratedArtwork['AI Native Product OS'] ?? selfwareGeneratedArtwork['AI Native Product OS'];
  const workArtwork: string | undefined = toolGeneratedArtwork['AI Costs Dashboard'];

  const osReader = getProjectReader('AI Native Product OS');
  const aiNativeProductManagerOsReader = getProjectReader('AI-Native Product Manager OS');
  const productInnovationCourse = teaching.find((course) => course.framework.name === 'Product Innovation Process');
  const productInnovationProcessHref = productInnovationCourse ? getCourseHref(productInnovationCourse) : undefined;

  useEffect(() => {
    if (openBeat !== '05') {
      setCourseProofScrollState(defaultCourseProofScrollState);
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      const scrollElement = document.querySelector<HTMLElement>('.thoughts-course-proof-scroll');
      syncCourseProofScrollState(scrollElement);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [openBeat]);

  function syncCourseProofScrollState(element: HTMLElement | null) {
    const nextScrollState = getCourseProofScrollState(element);

    setCourseProofScrollState((prevScrollState) =>
      prevScrollState.canScroll === nextScrollState.canScroll && prevScrollState.atEnd === nextScrollState.atEnd
        ? prevScrollState
        : nextScrollState,
    );
  }

  function toggleBeat(index: string) {
    if (index === '05') {
      setCourseProofScrollState(defaultCourseProofScrollState);
    }

    setOpenBeat((prev) => (prev === index ? null : index));
  }

  function ctaLabel(label: string) {
    return label.replace(/\s*->\s*$/, '');
  }

  const beats: Beat[] = [
    {
      index: '01',
      label: 'How I gain clarity',
      title: 'Framework of metacognition',
      proof: 'How I connect experience, values and strategy to a decision, while leaving room for new evidence to change the direction.',
      body: 'The framework starts by reducing the noise. When there is too much information, I go back to first principles: what is true, what matters, where those values came from, and what decision naturally follows. That is how experience turns into values, values turn into vision, and vision turns into action.',
      artwork: thoughtsAssets.metacognitionTree,
      ctas: osReader
        ? [{ kind: 'button', label: 'Explore the OS ->', onClick: () => onOpen(osReader) }]
        : [],
      anchorIds: ['thoughts-act-method-values', 'thoughts-os', 'thoughts-architecture-bridge'],
      sectionHead: 'How I think about thinking',
      onDeepDive: () => onOpen(METACOGNITION_SENTINEL),
    },
    {
      index: '02',
      label: 'How I find my values',
      title: 'TEDx talk',
      proof: 'Taking lessons from business strategy and space travel, I explore a way to discover what we personally find important.',
      body: '',
      artwork: tedxImagePath,
      ctas: [
        {
          kind: 'link',
          label: 'Watch on TEDx ->',
          href: 'https://www.ted.com/talks/ramin_hoodeh_existentially_viewing_your_existential_crisis',
        },
      ],
      sectionHead: 'How I find my values',
      quoteParagraphs: [
        'Think about yourselves and your lives. Logic would follow that to plan for a positive future - a future that you want - you need a clear understanding of where and what you are now.',
        "That's how business works - the best businesses have a mission statement, a crystal-clear vision of what they want to achieve, but the only way they get there is through a clear understanding of where they are now, what resources they have, and what they're capable of. This allows them to strategise and, step by step, cater every decision to get them to where they want to be.",
        'In the same way that businesses do this existential analysis of where they are, we need to do this, too. We need an understanding of where and what we are, what resources we have, and what we\'re capable of, so that we can prioritise and step-by-step get to where we want to be.',
      ],
      sideImage: thoughtsAssets.talks.tedxScreenshot,
      sideImageAlt: 'TEDx talk page',
    },
    {
      index: '03',
      label: 'What I love',
      title: 'Fiction books & "selfware"',
      proof: 'I find meaning in writing stories with deeper life questions and making software that is enjoyable and useful.',
      body: '',
      artwork: bookCoverPath,
      ctas: [{ kind: 'link', label: 'Both books & my writing →', href: '/about#thoughts-books' }],
      anchorIds: ['thoughts-books', 'thoughts-act-formation'],
      sectionHead: 'What I value',
    },
    {
      index: '04',
      label: 'How I teach it',
      title: 'University talk',
      proof: 'The “Middle Way”: how personal projects and a professional career can inform and reinforce one another.',
      body: '',
      artwork: uniTalkImagePath,
      ctas: [
        {
          kind: 'link',
          label: 'Watch the talk ->',
          href: 'https://www.youtube.com/watch?v=fpNNyHFUKzM',
        },
      ],
      sectionHead: 'How I integrate this into my work',
      quoteParagraphs: [
        'Whether you’re an employee or an independent professional or creative, the most important skill is to be able to overcome over-information (which also is the best way to reduce stress). This could either mean not scrolling so much on your phone, or meditating in space, and in business it’s knowing what data or insights are actually useful for you, or having a single source of truth with an agreed-upon process.',
        'Because when you cut through the noise, you’re able to focus on these three essential things:',
        '1. Your true or core nature, values, and competencies,',
        '2. Where that puts you as your place in existence either in the universe or in the market, and then',
        '3. What, therefore, your vision or purpose should be that you can use to guide your decisions.',
      ],
      sideImage: thoughtsAssets.talks.universityTalkPhoto,
      sideImageAlt: 'University talk',
    },
    {
      index: 'DISx',
      label: 'How I teach AI product thinking',
      title: 'DISx Dubai · AI-Native Product OS',
      proof: `${disxTalkEvidence.event} · ${disxTalkEvidence.dateLabel} · ${disxTalkEvidence.location} · ${disxTalkEvidence.stage}. ${disxTalkEvidence.title}`,
      body: disxTalkEvidence.summary,
      artwork: aiNativeProductOsLightModeUrl,
      ctas: [
        { kind: 'link', label: 'Read the talk & worked example →', href: '/talks/disx-dubai' },
        ...disxTalkEvidence.sources.map((source) => ({ kind: 'link' as const, ...source })),
      ],
      wide: true,
      sectionHead: 'On the agentic AI stage',
    },
    {
      index: '05',
      label: 'How I apply it',
      title: 'Product management & AI product management frameworks',
      proof: 'The Product Innovation Process and AI-Native Product OS are ways I make my product practice teachable, rather than guarantees of an outcome.',
      body: [
        'My Product Innovation Process brings discovery, design and release decisions into a shared account that a team can inspect. The AI-Native Product OS adds a way to organise model behaviour, context, action authority and continuing evaluation.',
        'AI can make a first prototype cheaper without making integration, customer understanding or release controls disappear. I use the Stack and Loop alongside those disciplines, with checks proportionate to the consequences of failure.',
        'My professional work and independent builds are applications of these ideas. Their results, ownership and evidence limits belong in the individual cases; they do not establish that a framework caused every outcome.',
      ].join('\n\n'),
      artwork: osArtwork,
      expandedArtwork: aiNativeProductOsLightModeUrl,
      ctas: [{ kind: 'link', label: 'Professional decisions →', href: '/experience-education' }, { kind: 'link', label: 'Independent products →', href: '/projects' }],
      anchorIds: ['thoughts-act-integration-proof'],
      wide: true,
      sectionHead: 'How that shows up in practice',
    },
  ];

  function buildCard(beat: Beat, globalIndex: number) {
    const isOpen = openBeat === beat.index;
    const artworkSrc = isOpen && beat.expandedArtwork ? beat.expandedArtwork : beat.artwork;
    const hasArtwork = Boolean(artworkSrc);
    const renderCourseProofParagraph = (paragraph: string) => {
      const parts = paragraph.split(/(Product Innovation Process|AI-Native Product OS|AI-Native OS|vision|taste|clarity|judg(?:e)?ment|empathy)/gi);
      if (parts.length === 1) return paragraph;

      return (
        <>
          {parts.map((part, index) => {
            const valueWord = valueHomageWords.get(part.toLowerCase());
            if (valueWord) {
              return (
                <span key={`${part}-${index}`} className="thoughts-value-homage">
                  {valueWord}
                </span>
              );
            }

            if (part === 'Product Innovation Process' && productInnovationProcessHref) {
              return (
                <a
                  key={`${part}-${index}`}
                  href={productInnovationProcessHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="thoughts-inline-project-link"
                >
                  {part}
                </a>
              );
            }

            if ((part === 'AI-Native Product OS' || part === 'AI-Native OS') && aiNativeProductManagerOsReader) {
              return (
                <button
                  key={`${part}-${index}`}
                  type="button"
                  className="thoughts-inline-project-link"
                  onClick={() => onOpen(aiNativeProductManagerOsReader)}
                >
                  {part}
                </button>
              );
            }

            return part;
          })}
        </>
      );
    };

    return (
      <motion.article
        key={beat.index}
        id={beatAnchors[beat.index]}
        data-beat-index={beat.index}
        layout
        className={[
          'thoughts-beat-card',
          hasArtwork ? 'thoughts-beat-card--artwork' : 'thoughts-beat-card--glass liquid-glass',
          beat.sideImage ? 'thoughts-beat-card--talk-artwork' : '',
          beat.index === '03' ? 'thoughts-beat-card--fiction-selfware' : '',
          beat.index === '05' ? 'thoughts-beat-card--course-proof' : '',
          isOpen ? 'thoughts-beat-card--open' : '',
          beat.wide ? 'thoughts-beat-card--wide' : '',
          isOpen && beat.sideImage ? 'thoughts-beat-card--split-open' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.55, delay: globalIndex * 0.06, ease: [0.25, 0.1, 0.25, 1] }}
      >
        {beat.anchorIds?.map((anchorId) => (
          <span key={anchorId} id={anchorId} className="thoughts-route-anchor" aria-hidden="true" />
        ))}
        {hasArtwork && (
          <div className="thoughts-beat-art" aria-hidden="true">
            <img src={artworkSrc} alt="" loading="lazy" decoding="async" />
            <div className="thoughts-beat-art-shade" />
          </div>
        )}

        <button
          type="button"
          className="thoughts-beat-header"
          onClick={() => (beat.onDeepDive ? beat.onDeepDive() : toggleBeat(beat.index))}
          aria-expanded={beat.onDeepDive ? undefined : isOpen}
          aria-haspopup={beat.onDeepDive ? 'dialog' : undefined}
        >
          <div className="thoughts-beat-header-bottom">
            <h3 className="thoughts-beat-title">{beat.title}</h3>
            <span className="thoughts-beat-toggle" aria-hidden="true">
              {beat.onDeepDive ? '+' : isOpen ? '-' : '+'}
            </span>
          </div>
          {!(beat.index === '05' && isOpen) ? <p className="thoughts-beat-proof">{beat.proof}</p> : null}
          {isOpen && beat.sideImage ? (
            <div className="thoughts-beat-split-media-row" aria-hidden="true">
              <div className="thoughts-beat-split-right">
                <img src={beat.sideImage} alt="" loading="lazy" decoding="async" />
              </div>
            </div>
          ) : null}
        </button>

        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              key="body"
              className={['thoughts-beat-body', beat.sideImage ? 'thoughts-beat-body--split' : ''].filter(Boolean).join(' ')}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.32, ease: [0.25, 0.1, 0.25, 1] }}
              style={{ overflow: 'hidden' }}
            >
              {beat.sideImage ? (
                <div className="thoughts-beat-split-inner">
                  <div className="thoughts-beat-split-left">
                    {beat.quoteParagraphs && (
                      <blockquote className="thoughts-beat-split-quote">
                        {beat.quoteParagraphs.map((para, i) => (
                          <p key={i}>{para}</p>
                        ))}
                      </blockquote>
                    )}
                    {beat.ctas.length > 0 && (
                      <div className="thoughts-beat-ctas">
                        {beat.ctas.map((cta) =>
                          cta.kind === 'link' ? (
                            <a
                              key={cta.label}
                              href={cta.href}
                              target={cta.href.startsWith('http') ? '_blank' : undefined}
                              rel={cta.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                              className="thoughts-beat-cta thoughts-beat-cta--watch card-glass-attachment card-glass-attachment--deep-dive"
                            >
                              <span className="card-glass-attachment__label">{ctaLabel(cta.label)}</span>
                            </a>
                          ) : (
                            <button
                              key={cta.label}
                              type="button"
                              onClick={cta.onClick}
                              className="thoughts-beat-cta thoughts-beat-cta--watch card-glass-attachment card-glass-attachment--deep-dive"
                            >
                              <span className="card-glass-attachment__label">{ctaLabel(cta.label)}</span>
                            </button>
                          ),
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <>
              {beat.index === '05' ? (
                <div className="thoughts-course-proof-inline">
                  <div
                    className="thoughts-course-proof-inline-copy"
                    data-can-scroll={courseProofScrollState.canScroll ? 'true' : 'false'}
                    data-scroll-end={courseProofScrollState.atEnd ? 'true' : 'false'}
                  >
                    <div
                      className="thoughts-course-proof-scroll"
                      tabIndex={0}
                      aria-label="Frameworks narrative"
                      onFocus={(event) => syncCourseProofScrollState(event.currentTarget)}
                      onMouseEnter={(event) => syncCourseProofScrollState(event.currentTarget)}
                      onScroll={(event) => syncCourseProofScrollState(event.currentTarget)}
                    >
                      <p className="thoughts-beat-proof thoughts-course-proof-scroll-proof">{beat.proof}</p>
                      {beat.body
                        ? beat.body.split('\n\n').map((paragraph) => (
                            <p key={paragraph} className="thoughts-beat-description">
                              {renderCourseProofParagraph(paragraph)}
                            </p>
                          ))
                        : null}
                    </div>
                    {beat.ctas.length > 0 && (
                      <div className="thoughts-beat-ctas">
                        {beat.ctas.map((cta) =>
                          cta.kind === 'link' ? (
                            <a
                              key={cta.label}
                              href={cta.href}
                              target={cta.href.startsWith('http') ? '_blank' : undefined}
                              rel={cta.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                            className="thoughts-beat-cta thoughts-beat-cta--watch card-glass-attachment card-glass-attachment--deep-dive"
                          >
                              <span className="card-glass-attachment__label">{ctaLabel(cta.label)}</span>
                            </a>
                          ) : (
                            <button
                              key={cta.label}
                              type="button"
                              onClick={cta.onClick}
                              className="thoughts-beat-cta thoughts-beat-cta--watch card-glass-attachment card-glass-attachment--deep-dive"
                            >
                              <span className="card-glass-attachment__label">{ctaLabel(cta.label)}</span>
                            </button>
                          ),
                        )}
                      </div>
                    )}
                  </div>
                  <p className="thoughts-beat-description"><a href="#thoughts-courses">Return to the courses and sample exercises ↑</a></p>
                </div>
              ) : (
                <>
                  {beat.body && <p className="thoughts-beat-description">{beat.body}</p>}
                  {beat.ctas.length > 0 && (
                    <div className="thoughts-beat-ctas">
                      {beat.ctas.map((cta) =>
                        cta.kind === 'link' ? (
                          <a
                            key={cta.label}
                            href={cta.href}
                            target={cta.href.startsWith('http') ? '_blank' : undefined}
                            rel={cta.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                            className="thoughts-beat-cta thoughts-beat-cta--watch card-glass-attachment card-glass-attachment--deep-dive"
                          >
                            <span className="card-glass-attachment__label">{ctaLabel(cta.label)}</span>
                          </a>
                        ) : (
                          <button
                            key={cta.label}
                            type="button"
                            onClick={cta.onClick}
                            className="thoughts-beat-cta thoughts-beat-cta--watch card-glass-attachment card-glass-attachment--deep-dive"
                          >
                            <span className="card-glass-attachment__label">{ctaLabel(cta.label)}</span>
                          </button>
                        ),
                      )}
                    </div>
                  )}
                </>
              )}
              {beat.index === '03' && (
                <div className="thoughts-beat-creation-grid">
                  <a
                    href="https://author.vision/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="thoughts-beat-creation-card thoughts-beat-creation-card--proposition"
                    onMouseEnter={(event) => setCreationPreviewPlayback(event.currentTarget, true)}
                    onMouseLeave={(event) => setCreationPreviewPlayback(event.currentTarget, false)}
                    onFocus={(event) => setCreationPreviewPlayback(event.currentTarget, true)}
                    onBlur={(event) => setCreationPreviewPlayback(event.currentTarget, false)}
                  >
                    <img
                      className="thoughts-beat-proposition-image"
                      src={thoughtsAssets.books.proposition.bookCover}
                      alt=""
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="thoughts-beat-proposition-video-scene" aria-hidden="true">
                      <video
                        className="thoughts-beat-proposition-video thoughts-beat-proposition-video--backdrop"
                        src={propositionVideoUrl}
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="auto"
                        data-creation-preview-video
                      />
                      <div className="thoughts-beat-proposition-video-frame">
                        <video
                          className="thoughts-beat-proposition-video thoughts-beat-proposition-video--main"
                          src={propositionVideoUrl}
                          autoPlay
                          muted
                          loop
                          playsInline
                          preload="auto"
                          data-creation-preview-video
                        />
                      </div>
                    </div>
                    <div className="thoughts-beat-creation-card-info">
                      <span className="thoughts-beat-creation-card-title">The Proposition</span>
                      <span className="thoughts-beat-cta thoughts-beat-cta--watch card-glass-attachment card-glass-attachment--deep-dive">
                        <span className="card-glass-attachment__label">Visit author site</span>
                      </span>
                    </div>
                  </a>
                  <div className="thoughts-beat-creation-card thoughts-beat-creation-card--selfware-preview">
                    <div className="thoughts-beat-selfware-preview">
                      <div className="thoughts-beat-selfware-page-head">
                        <span>03 / PROJECTS</span>
                        <strong>Selfware stack</strong>
                      </div>
                      <div className="thoughts-beat-selfware-rail" aria-hidden="true">
                        <span>Dreamsea</span>
                        <span>nsso</span>
                        <span>Qadam</span>
                        <span>24Seven</span>
                        <span>RazinFlix</span>
                      </div>
                      <div className="thoughts-beat-selfware-feature-shell">
                        <div className="thoughts-beat-selfware-eyebrow">
                          <span aria-hidden="true">★</span>
                          Featured Build
                        </div>
                        <div className="thoughts-beat-selfware-feature-card">
                          <span className="thoughts-beat-selfware-chip">Mobile App</span>
                          <div className="thoughts-beat-selfware-phone-stage">
                            <IPhone3D
                              className="thoughts-beat-selfware-iphone"
                              screenSrc={dreamseaHomepageScreenUrl}
                              screenVideoSrc={dreamseaIphoneRecordingUrl}
                              poster={selfwareGeneratedArtwork['Dreamsea']}
                              ariaLabel="Dreamsea iPhone preview"
                              autoRotate
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="thoughts-beat-creation-card-info thoughts-beat-creation-card-info--selfware">
                      <a
                        href="/projects/selfware"
                        className="thoughts-beat-cta thoughts-beat-cta--watch card-glass-attachment card-glass-attachment--deep-dive"
                      >
                        <span className="card-glass-attachment__label">Explore projects</span>
                      </a>
                    </div>
                  </div>
                </div>
              )}
              {beat.index === '04' && (
                <div className="thoughts-beat-course-strip">
                  {orderCourses(teaching).map((course) => {
                    const href = getCourseHref(course);
                    const heroMedia = course.media[0];

                    return (
                      <a
                        key={course.courseTitle}
                        href={href ?? '#'}
                        target={href ? '_blank' : undefined}
                        rel="noopener noreferrer"
                        className="thoughts-beat-course-mini"
                      >
                        {heroMedia ? (
                          <img src={heroMedia.path} alt="" loading="lazy" decoding="async" />
                        ) : null}
                        <div>
                          <strong>{getCourseTitle(course)}</strong>
                          {getCourseProof(course).badges.map((badge) => (
                            <span key={badge} className="thoughts-beat-course-badge">{badge}</span>
                          ))}
                          {course.stats[0] ? (
                            <span>
                              {course.stats[0].value} {course.stats[0].label}
                            </span>
                          ) : null}
                        </div>
                      </a>
                    );
                  })}
                </div>
              )}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.article>
    );
  }

  function buildSectionHead(beat: Beat) {
    if (!beat.sectionHead) return null;
    return (
      <div
        key={`head-${beat.index}`}
        data-beat-index={beat.index}
        className={[
          'thoughts-beat-section-head',
          beat.wide ? 'thoughts-beat-section-head--wide' : '',
          beat.index === '03' || beat.index === '04' || beat.index === '05'
            ? 'thoughts-beat-section-head--spaced'
            : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <span className="thoughts-beat-section-head-index">{beat.index}</span>
        {beat.sectionHead}
      </div>
    );
  }

  return (
    <div className="thoughts-overview-root">
      <header className="teaching-entry">
        <h1>Teaching &amp; speaking</h1>
        <p>I turn product practice into ideas and tools other people can use. Start with the current AI course, the DISx example and a concise view of my method.</p>
        <nav aria-label="Teaching and speaking sections"><a href="#thoughts-courses">Courses</a><a href="#thoughts-disx">DISx Dubai</a><a href="#thoughts-method">The method</a><a href="/about">About &amp; writing</a></nav>
      </header>
      <section id="thoughts-courses" className="teaching-current" aria-labelledby="current-courses-title">
        <h2 id="current-courses-title">Learn the product method.</h2>
        <div className="thoughts-course-proof-mini-grid">
          {orderCourses(teaching).map((course) => <CourseProofMiniCard key={course.courseTitle} course={course} />)}
        </div>
      </section>
      <div className="thoughts-overview-grid">
        {buildSectionHead(beats[4])}
        {buildCard(beats[4], 0)}
      </div>
      <div id="thoughts-method" className="teaching-current-method"><ProductMethodSummary compact /></div>
      <section aria-labelledby="earlier-talks-title">
        <h2 id="earlier-talks-title" className="sr-only">Earlier talks</h2>
        <div className="thoughts-overview-grid">
          {[beats[1], beats[3]].map((beat) => buildSectionHead(beat))}
          {[beats[1], beats[3]].map((beat, index) => buildCard(beat, index))}
        </div>
      </section>
      <section aria-labelledby="personal-thinking-title">
        <header className="teaching-entry">
          <h2 id="personal-thinking-title">Writing and intellectual foundations</h2>
          <p>I’m interested in how people find clarity in complex systems. In product work, that means making decisions traceable. In teaching, it means making ideas usable. In fiction, it means making them felt.</p>
          <a href="/about">Explore both books and the personal side of my work →</a>
        </header>
        <div className="thoughts-overview-grid">
          {[beats[0], beats[2]].map((beat) => buildSectionHead(beat))}
          {[beats[0], beats[2]].map((beat, index) => buildCard(beat, index))}
          {buildSectionHead(beats[5])}
          {buildCard(beats[5], 0)}
        </div>
      </section>

      <div className="thoughts-beat-wide thoughts-proof-wall">
        <TahoeGlassSurface
          className="thoughts-proof-wall-glass"
          contentClassName="thoughts-proof-wall-glass-content"
        >
          <div className="thoughts-beat-wide-head">
            <div className="thoughts-beat-header-top thoughts-proof-wall-title-row">
              <span className="thoughts-beat-index thoughts-beat-index--dark">06</span>
              <h3 className="thoughts-beat-title thoughts-beat-title--dark thoughts-case-study-section-title">
                Case studies
              </h3>
            </div>
            <p className="thoughts-beat-description thoughts-beat-description--dark">
              Each write-up follows the arc of real AI product work. For each practice, tool or product I've outlined
              the lived problem, the architecture (structured via the AI-Native PM OS stack), the choices made, the
              tradeoffs accepted, the live links you can check out, and the next improvements I'd make.
            </p>
          </div>
          <CaseStudyWriteupIndex caseStudies={caseStudies} onOpen={onOpen} compact />
        </TahoeGlassSurface>
      </div>
    </div>
  );
}
