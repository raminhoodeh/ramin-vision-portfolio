import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { portfolioContent } from '../../data/portfolio';
import { contentValue } from '../../lib/placeholder';
import { type CaseStudyEntry, type TeachingEntry, type WritingCaseStudyEntry } from '../types';
import { selfwareGeneratedArtwork, toolGeneratedArtwork } from '../Projects/index';
import { getProjectReader } from '../Projects/types';
import { CaseStudyWriteupIndex } from './CaseWriteups';
import { METACOGNITION_SENTINEL } from './MetacognitionDeepDive';
import { thoughtsAssets } from '../../assets/thoughts';
import { IPhone3D } from '../../components/IPhone3D';
import { TahoeGlassSurface } from '../../components/TahoeGlassSurface';
import dreamseaHomepageScreenUrl from '../../../projects-section/Project Images/dreamsea-images/dreamsea-homepage.PNG';
import dreamseaIphoneRecordingUrl from '../../../projects-section/Project Images/dreamsea-fixed-recording-3d-island.webm';
import propositionVideoUrl from '../../../thoughts-section/books/the-proposition-video.webm';
import aiNativeProductOsLightModeUrl from '../../../thoughts-section/courses/ai-native-product-os-light-mode.jpg';

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

const valueHomageWords = new Map([
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
};

function getCourseTitle(course: TeachingEntry) {
  return 'displayTitle' in course && typeof course.displayTitle === 'string' ? course.displayTitle : course.courseTitle;
}

function getCourseHref(course: TeachingEntry) {
  return typeof course.courseLink === 'string' && course.courseLink.startsWith('http') ? course.courseLink : undefined;
}

function orderCourses(courses: readonly TeachingEntry[]) {
  const productInnovation = courses.find((course) => course.framework.name === 'Product Innovation Process');
  const aiNative = courses.find((course) => course.framework.name === 'AI-Native Product OS');
  const ordered = [productInnovation, aiNative].filter((course): course is TeachingEntry => Boolean(course));
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
      title: 'AI-Native Product OS',
      description:
        'A practical AI product management course that installs the model, context, orchestration, governance, and human layers needed to work with probabilistic systems.',
      rating: '4.9',
      ratings: '70+ ratings',
      students: '220+ students',
      links: [
        { label: 'Maven', href: 'https://maven.com/raminhoodeh/ai-product' },
        {
          label: 'Udemy',
          href: 'https://www.udemy.com/course/from-product-manager-to-ai-product-manager/?couponCode=MT260622G3#reviews',
        },
      ],
    };
  }

  const href = getCourseHref(course);
  return {
    title: 'Product Innovation Process',
    description:
      'A start-to-finish product management course for aligning teams around one product story, one source of truth, and a clear path from idea to launch.',
    rating: '4.8',
    ratings: '160+ ratings',
    students: '4.8k+ students',
    links: href ? [{ label: 'Udemy', href }] : [],
  };
}

function CourseProofMiniCard({ course }: { course: TeachingEntry }) {
  const proof = getCourseProof(course);
  const heroMedia = course.media[0];
  const isAiNativeCourse = course.framework.name === 'AI-Native Product OS';
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
        <div className="thoughts-course-proof-mini-top">
          {isAiNativeCourse ? <span className="thoughts-course-proof-mini-badge">Bestseller</span> : null}
          <span className="thoughts-course-proof-mini-badge">Highest-rated</span>
        </div>
        <h4>{proof.title}</h4>
        <p>{proof.description}</p>
        <div className="thoughts-course-proof-mini-stats">
          <span>
            <strong>{proof.rating} Stars</strong>
          </span>
          <span>
            <strong>{proof.ratings}</strong>
          </span>
          <span>
            <strong>{proof.students}</strong>
          </span>
        </div>
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
                  <span className="thoughts-course-badge">Highest-rated</span>
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
      proof:
        'OVERCOME OVER-INFORMATION WITH FIRST PRINCIPLES-DERIVED THINKING. THE SUMMARY: UNDERSTAND WHERE YOUR VALUES COME FROM, FOCUS ON THEM AND SEE HOW EVERY DECISION FLOWS FROM THERE.',
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
      proof:
        'TAKING LESSONS FROM BUSINESS STRATEGY AND SPACE TRAVEL, I SPEAK ABOUT A METHOD TO DISCOVER WHAT WE PERSONALLY FIND IMPORTANT.',
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
      proof:
        "I FIND THE MOST MEANING IN MAKING BEAUTIFUL THINGS THAT THE WORLD REALLY NEEDS. FOR MY SKILLSET, THAT MEANS WRITING INSPIRING STORIES WITH DEEPER LIFE LESSONS, AND MAKING SOFTWARE THAT'S ENJOYABLE TO USE AND GENUINELY SOLVES PROBLEMS.",
      body: '',
      artwork: bookCoverPath,
      ctas: [],
      anchorIds: ['thoughts-books', 'thoughts-act-formation'],
      sectionHead: 'What I value',
    },
    {
      index: '04',
      label: 'How I teach it',
      title: 'University talk',
      proof:
        'INTRODUCING THE "MIDDLE WAY" - AN EMERGING APPROACH TO PERSONAL AND PROFESSIONAL LIFE: HOW TO ENSURE YOUR PERSONAL PROJECTS AND PROFESSIONAL CAREER ACTIVELY SYNERGISE, AND MUTUALLY REINFORCE EACH OTHER.',
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
      index: '05',
      label: 'How I apply it',
      title: 'Product management & AI product management frameworks',
      proof:
        'PRACTICING WHAT I TEACH: A NATURAL PULL TOWARD METAPHYSICS, STORYTELLING, AND SYSTEMS THINKING BECAME THE PRODUCT INNOVATION PROCESS AND THE AI-NATIVE PRODUCT OS; FUTURE-PROOF, EFFECTIVE SYSTEMS FOR BUILDING BEAUTIFUL, USEFUL PRODUCTS WITH THE LATEST BEST PRACTICES AND TECHNOLOGY.',
      body: [
        "There's a feeling you get when a story is built right. You don't always know why it works, you just feel it. The same thing happens with a great product. Something in the clarity of how it was thought through, the vision behind it, the empathy for the person using it, the taste that decided what stays and what goes. The elegant simplicity of the copy, the thoughtfulness of the design. Holding it all together is yet another invisible essentiality that we call Judgement; the art of knowing what to do next.",
        "Spend enough time thinking like this, work with enough teams, naturally you want to turn those five things into a process that a team could actually run on. This took a mix of three inclinations I've always had. And systems thinking is what let it scale beyond me into something repeatable. That combination is the Product Innovation Process.",
        "It started at GroupM's Global Innovation team, where it gave other PMs a standardised way to manage products and align stakeholders. It also became the fastest path I found for turning a junior PM into someone trusted with real ownership, since the steps were clear enough to run without me in the room. And it shipped the carbon calculator still used to measure £1billion+ of media investment, the most widely adopted tool of its kind in the sector.",
        "Carried into Work & Life Partners at its start-up stage, the same process built their product from the ground up on sound PM principles. That discipline helped get WLP's product and its start-up acquired by Vivup. After the acquisition, I used the same process to fold WLP's product into Vivup's wider portfolio, and it ended up shaping the core Vivup app too, (now Perkbox Vivup). The App Store rating climbed 1.2 points and Google Play 0.6 in three months. A new monetisation model grew customer lifetime value by 19%, and a checkout redesign cut abandonment by a third.",
        "Then execution, the exact thing the process existed to make reliable, itself changed. AI democratised the build process, making it both cheap and probabilistic. Therefore, the old process of specifying behaviour once and repeating it stopped matching how the work actually happened. What mattered now was judgement, catching the moments an output looked right but wasn't, and taste, knowing which version was actually worth shipping. So I built what came next, the AI-Native Product OS, designed around those human skills that an automated spec sheet can't hand you.",
        "At Side.inc, the OS revamped internal tools and ERP systems on AI-coded, in-house tooling. It shifted engineering's time split from 60% maintenance to 60% innovation, cut opex 20%, cut idea-to-feature time 90%, and cut manual reporting by a third, all within four months. The same OS is now shaping more customer-facing AI features I'm building next at Bayut.",
      ].join('\n\n'),
      artwork: osArtwork,
      expandedArtwork: aiNativeProductOsLightModeUrl,
      ctas: [],
      anchorIds: ['thoughts-courses', 'thoughts-act-integration-proof'],
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
                              target="_blank"
                              rel="noopener noreferrer"
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
                              target="_blank"
                              rel="noopener noreferrer"
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
                  <div className="thoughts-course-proof-mini-grid">
                    {orderCourses(teaching)
                      .slice(0, 2)
                      .map((course) => (
                        <CourseProofMiniCard key={course.courseTitle} course={course} />
                      ))}
                  </div>
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
                            target="_blank"
                            rel="noopener noreferrer"
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
                        <span className="card-glass-attachment__label">Buy on Amazon</span>
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
                          <span className="thoughts-beat-course-badge">Highest-rated</span>
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
      <div className="thoughts-overview-grid">
        {/* Group 1 - section heads above their cards in the same columns */}
        {[beats[0], beats[1]].map((beat) => buildSectionHead(beat))}
        {[beats[0], beats[1]].map((beat, j) => buildCard(beat, j))}

        {/* Group 2 */}
        {[beats[2], beats[3]].map((beat) => buildSectionHead(beat))}
        {[beats[2], beats[3]].map((beat, j) => buildCard(beat, j + 2))}

        {/* Group 3 - full-width */}
        {buildSectionHead(beats[4])}
        {buildCard(beats[4], 4)}
      </div>

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
