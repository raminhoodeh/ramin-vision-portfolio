import { useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { portfolioContent } from '../../data/portfolio';
import { type TeachingEntry } from '../types';
import { isPlaceholderValue, contentValue } from '../../lib/placeholder';
import { ContentToken } from '../../components/ContentToken';
import { ProjectLink } from '../Projects/index';

const valueHomageWords = new Map([
  ['vision', 'Vision'],
  ['taste', 'Taste'],
  ['clarity', 'Clarity'],
  ['judgment', 'Judgement'],
  ['judgement', 'Judgement'],
  ['empathy', 'Empathy'],
] as const);

function renderValueHomageText(text: string): ReactNode {
  const pattern = /\b(vision|taste|clarity|judg(?:e)?ment|empathy)\b/gi;
  const pieces: ReactNode[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(pattern)) {
    const matchText = match[0];
    const index = match.index ?? 0;

    if (index > lastIndex) pieces.push(text.slice(lastIndex, index));

    pieces.push(
      <span key={`${index}-${matchText}`} className="courses-curriculum-value-homage">
        {valueHomageWords.get(matchText.toLowerCase()) ?? matchText}
      </span>,
    );

    lastIndex = index + matchText.length;
  }

  if (lastIndex < text.length) pieces.push(text.slice(lastIndex));

  return pieces.length ? pieces : text;
}

function CourseModuleTrack({ course }: { course: TeachingEntry }) {
  return (
    <ol className="courses-curriculum-track">
      {course.courseModules.map((module, moduleIndex) => (
        <li key={`${course.courseTitle}-module-${moduleIndex}`}>
          <span>{String(moduleIndex + 1).padStart(2, '0')}</span>
          <p>{renderValueHomageText(contentValue(module))}</p>
        </li>
      ))}
    </ol>
  );
}

function getCourseTitle(course: TeachingEntry) {
  return 'displayTitle' in course && typeof course.displayTitle === 'string' ? course.displayTitle : course.courseTitle;
}

function CourseTagStrip({ course }: { course: TeachingEntry }) {
  return (
    <div className="courses-curriculum-tag-strip">
      {course.tags.map((tag) => (
        <span key={`${course.courseTitle}-${tag}`}>{tag}</span>
      ))}
    </div>
  );
}

function CourseStatGrid({ course }: { course: TeachingEntry }) {
  return (
    <div className="courses-curriculum-stat-grid">
      {course.stats.map((stat) => (
        <div key={`${course.courseTitle}-${stat.label}`}>
          <span>{stat.value}</span>
          <p>{stat.label}</p>
        </div>
      ))}
    </div>
  );
}

function CourseTrailerPanel({ course }: { course: TeachingEntry }) {
  const isPlaceholder = isPlaceholderValue(course.courseTrailer);
  const heroMedia = course.media[0];
  const supportingMedia = course.media[1];
  const isProductInnovationCourse = course.framework.name === 'Product Innovation Process';

  return (
    <div
      className={`courses-curriculum-trailer ${
        isProductInnovationCourse ? 'courses-curriculum-trailer--product-innovation' : ''
      }`}
    >
      {heroMedia ? (
        <img
          className="courses-curriculum-trailer-image"
          src={heroMedia.path}
          alt={heroMedia.alt}
          loading="eager"
          decoding="async"
          onError={(event) => {
            event.currentTarget.style.display = 'none';
          }}
        />
      ) : null}
      {supportingMedia ? (
        <img
          className="courses-curriculum-trailer-secondary"
          src={supportingMedia.path}
          alt={supportingMedia.alt}
          loading="lazy"
          decoding="async"
          onError={(event) => {
            event.currentTarget.style.display = 'none';
          }}
        />
      ) : null}
      <div className="courses-curriculum-trailer-shade" aria-hidden="true" />
      <div className="courses-curriculum-trailer-grid" aria-hidden="true" />
      <div className="courses-curriculum-trailer-content">
        <p className="text-[0.62rem] uppercase tracking-[0.22em] text-white/42">Course trailer</p>
        <h5>{getCourseTitle(course)}</h5>
        <p>{renderValueHomageText(isPlaceholder ? contentValue(course.courseTrailer) : course.framework.name)}</p>
        <div className="mt-4">
          <ProjectLink label="Course trailer" value={course.courseTrailer} />
        </div>
      </div>
    </div>
  );
}

function CourseFrameworkMap({ course }: { course: TeachingEntry }) {
  return (
    <div className="courses-curriculum-framework">
      <div className="courses-curriculum-framework-head">
        <span>Framework</span>
        <strong>{course.framework.name}</strong>
        <p>{renderValueHomageText(course.framework.durableClaim)}</p>
      </div>

      <div className="courses-curriculum-loop" aria-label={`${course.framework.name} loop`}>
        {course.framework.loop.map((step, index) => (
          <span key={`${course.courseTitle}-loop-${step}`}>
            <em>{String(index + 1).padStart(2, '0')}</em>
            {renderValueHomageText(step)}
          </span>
        ))}
      </div>

      <div className="courses-curriculum-stack" aria-label={`${course.framework.name} stack`}>
        {course.framework.stack.map((layer) => (
          <span key={`${course.courseTitle}-stack-${layer}`}>{renderValueHomageText(layer)}</span>
        ))}
      </div>
    </div>
  );
}

function CourseAssetGrid({ course }: { course: TeachingEntry }) {
  return (
    <div className="courses-curriculum-assets">
      <p>Included assets</p>
      <div>
        {course.includedAssets.map((asset) => (
          <span key={`${course.courseTitle}-${asset}`}>{asset}</span>
        ))}
      </div>
    </div>
  );
}

function CourseLinkCluster({ course }: { course: TeachingEntry }) {
  return (
    <div className="courses-curriculum-source-links">
      <ProjectLink label="Course link" value={course.courseLink} />
      {course.sourceLinks.map((link) => (
        <ProjectLink key={`${course.courseTitle}-${link.href}`} label={link.label} value={link.href} />
      ))}
    </div>
  );
}

function CourseRowSnapshot({ course }: { course: TeachingEntry }) {
  const media = course.media[0];

  return (
    <div className="courses-curriculum-row-snapshot">
      {media ? (
        <img
          src={media.path}
          alt=""
          loading="lazy"
          decoding="async"
          onError={(event) => {
            event.currentTarget.style.display = 'none';
          }}
        />
      ) : null}
      <div>
        {course.stats.slice(0, 2).map((stat) => (
          <span key={`${course.courseTitle}-row-${stat.label}`}>
            <strong>{stat.value}</strong>
            <em>{stat.label}</em>
          </span>
        ))}
      </div>
    </div>
  );
}

function orderSystemCourses(courses: readonly TeachingEntry[]) {
  const productInnovation = courses.find((course) => course.framework.name === 'Product Innovation Process');
  const aiNative = courses.find((course) => course.framework.name === 'AI-Native Product OS');
  const ordered = [productInnovation, aiNative].filter((course): course is TeachingEntry => Boolean(course));
  const remaining = courses.filter((course) => !ordered.includes(course));

  return [...ordered, ...remaining];
}

function CoursesEvolutionBridge({
  courses,
  stage,
}: {
  courses: readonly TeachingEntry[];
  stage: typeof portfolioContent.teachingSpeakingWriting.frame.formatIntros.courses.systemsStage;
}) {
  return (
    <motion.article
      className="courses-evolution"
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.68 }}
      viewport={{ once: true, margin: '-100px' }}
    >
      <div className="courses-evolution-thesis">
        <p>The question</p>
        <blockquote>{stage.question}</blockquote>
        <span>{stage.thesis}</span>
      </div>

      <div className="courses-evolution-lanes">
        {stage.evolution.map((item, index) => {
          const course = courses[index];

          return (
            <div key={item.name}>
              <span>{item.label}</span>
              <strong>{item.name}</strong>
              <em>{item.shape}</em>
              <p>{renderValueHomageText(item.body)}</p>
              <small>{renderValueHomageText(item.humanEmphasis)}</small>
              {course ? (
                <div className="courses-evolution-links">
                  <ProjectLink label="Course" value={course.courseLink} />
                  {course.sourceLinks.slice(0, 1).map((link) => (
                    <ProjectLink key={`${item.name}-${link.href}`} label={link.label} value={link.href} />
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="courses-evolution-comparison" aria-label="Old product process and AI-native product OS comparison">
        {stage.comparison.map((row) => (
          <div key={row.axis}>
            <span>{row.axis}</span>
            <p>{renderValueHomageText(row.before)}</p>
            <p>{renderValueHomageText(row.after)}</p>
          </div>
        ))}
      </div>

      <div className="courses-evolution-synthesis">
        <span>{stage.synthesis.title}</span>
        <p>{renderValueHomageText(stage.synthesis.body)}</p>
      </div>
    </motion.article>
  );
}

export function CoursesCurriculum({ courses }: { courses: readonly TeachingEntry[] }) {
  const systemCourses = orderSystemCourses(courses);
  const [activeCourseIndex, setActiveCourseIndex] = useState(0);
  const activeCourse = systemCourses[activeCourseIndex] ?? systemCourses[0];
  const totalModules = systemCourses.reduce((total, course) => total + course.courseModules.length, 0);
  const totalAssets = systemCourses.reduce((total, course) => total + course.includedAssets.length, 0);
  const coursesFrame = portfolioContent.teachingSpeakingWriting.frame.formatIntros.courses;
  const systemsStage = coursesFrame.systemsStage;

  return (
    <section id="thoughts-courses" className="thought-format-section courses-curriculum">
      <div className="courses-curriculum-heading">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-[color:var(--thought-faint)]">
            {systemsStage.eyebrow}
          </p>
          <h3 className="mt-4 max-w-5xl text-5xl font-semibold tracking-[-0.065em] text-[color:var(--thought-strong)] md:text-7xl">
            {systemsStage.title}
          </h3>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[color:var(--thought-muted)]">{coursesFrame.body}</p>
        </div>
        <span className="rounded-full border border-[color:var(--thought-hairline)] bg-white/45 px-3 py-1.5 text-xs uppercase tracking-[0.16em] text-[color:var(--thought-muted)]">
          {systemCourses.length} systems
        </span>
      </div>

      <CoursesEvolutionBridge courses={systemCourses} stage={systemsStage} />

      {activeCourse ? (
        <div className="courses-curriculum-stage">
          <div className="courses-curriculum-command">
            <p className="text-xs uppercase tracking-[0.26em] text-[color:var(--thought-faint)]">Active curriculum</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-full border border-[color:var(--thought-hairline)] bg-white/42 px-3 py-1.5 text-xs uppercase tracking-[0.16em] text-[color:var(--thought-muted)]">
                Course
              </span>
              <ContentToken value={activeCourse.tag} />
            </div>
            <h4 className="mt-6 max-w-3xl text-4xl font-semibold tracking-[-0.06em] text-[color:var(--thought-strong)] md:text-6xl">
              {getCourseTitle(activeCourse)}
            </h4>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-[color:var(--thought-muted)] md:text-base md:leading-8">
              {renderValueHomageText(contentValue(activeCourse.courseDescription))}
            </p>
            <p className="courses-curriculum-positioning">{renderValueHomageText(activeCourse.positioning)}</p>

            <div className="courses-curriculum-signals" aria-label="Course structure">
              {activeCourse.framework.loop.map((signal) => (
                <span key={signal}>{renderValueHomageText(signal)}</span>
              ))}
            </div>

            <CourseTagStrip course={activeCourse} />
            <CourseLinkCluster course={activeCourse} />
          </div>

          <div className="courses-curriculum-board">
            <div className="courses-curriculum-board-summary">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--thought-faint)]">
                  Operating system
                </p>
                <p className="mt-3 text-sm leading-6 text-[color:var(--thought-muted)]">
                  {renderValueHomageText(coursesFrame.body)}
                </p>
              </div>
              <CourseStatGrid course={activeCourse} />
            </div>

            <div className="courses-curriculum-board-main">
              <CourseTrailerPanel course={activeCourse} />
              <div className="courses-curriculum-system-column">
                <CourseFrameworkMap course={activeCourse} />
                <CourseAssetGrid course={activeCourse} />
              </div>
            </div>

            <div className="courses-curriculum-module-panel">
              <div>
                <p>Module map</p>
                <span>
                  {activeCourse.courseModules.length} modules / {totalModules} total modules / {totalAssets} included assets
                </span>
              </div>
              <CourseModuleTrack course={activeCourse} />
            </div>
          </div>
        </div>
      ) : null}

      <div className="courses-curriculum-index">
        {systemCourses.map((course, index) => (
          <motion.button
            key={course.courseTitle}
            type="button"
            className="courses-curriculum-row"
            data-active={index === activeCourseIndex ? 'true' : 'false'}
            onClick={() => setActiveCourseIndex(index)}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.58, delay: index * 0.05 }}
            viewport={{ once: true, margin: '-80px' }}
          >
            <span className="courses-curriculum-row-index">{String(index + 1).padStart(2, '0')}</span>
            <div>
              <div className="flex flex-wrap gap-2">
                <ContentToken value={course.tag} />
              </div>
              <h4 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-[color:var(--thought-strong)] md:text-4xl">
                {getCourseTitle(course)}
              </h4>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-[color:var(--thought-muted)]">
                {renderValueHomageText(contentValue(course.courseDescription))}
              </p>
              <CourseTagStrip course={course} />
            </div>
            <CourseRowSnapshot course={course} />
            <span className="courses-curriculum-row-action">{index === activeCourseIndex ? 'Selected' : 'View track'}</span>
          </motion.button>
        ))}
      </div>
    </section>
  );
}
