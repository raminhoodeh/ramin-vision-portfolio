import { homepageOutcomes, homepagePositioning, homepageProducts } from '../data/homepage';
import { portfolioContent } from '../data/portfolio';
import { aiProductCourseEvidence, disxTalkEvidence, productCourseEvidence } from '../data/teachingEvidence';
import { getProjectBrief } from '../data/projectBriefs';
import { getProjectReader } from '../sections/Projects/types';
import { ProfessionalStories } from '../sections/ProfessionalStories';
import { DisxTalkPage } from '../sections/DisxTalkPage';
import { ProductMethodSummary } from '../sections/ProductMethodSummary';
import { ThesisReadingCopy } from '../sections/Projects/ThesisDeepDive';
import { NotFoundPage } from './NotFoundPage';
import { publicWorkValue } from '../lib/placeholder';
import { Resources } from '../sections/Resources';
import { AboutWritingPage } from '../sections/TeachingWriting/AboutWritingPage';
import { CourseLearningDetails } from '../sections/TeachingWriting/CourseLearningDetails';
import { MetacognitionReadingCopy } from '../sections/TeachingWriting/MetacognitionDeepDive';
import { ProjectEntry } from '../sections/Projects/ProjectEntry';
import { getWorkEvidence } from '../data/workEvidence';
import { resourceContact } from '../data/resources';
import { portfolioDestinations } from '../data/nav';
import { publicPages } from './routes.mjs';

type PublicPage = { path: string; title: string; description: string; kind: string; key?: string };

function CourseList({ nested = false }: { nested?: boolean }) {
  const Heading = nested ? 'h2' : 'h1';
  return <><Heading>Product management and AI courses</Heading>{[aiProductCourseEvidence.udemy, productCourseEvidence].map((course) => (
    <section key={course.href}><h2>{course.title}</h2><p>Udemy: {course.rating}/5, {course.ratings} ratings, {course.students} students. {course.checkedLabel}.</p>
      {course.badges.length ? <p>{course.badges.join(' · ')}</p> : null}<CourseLearningDetails framework={course === productCourseEvidence ? 'Product Innovation Process' : 'AI-Native Product OS'} /><a href={course.href}>View on Udemy</a></section>
  ))}<section><h2>{aiProductCourseEvidence.coursera.title}</h2><p>Coursera · Offered by {aiProductCourseEvidence.coursera.provider} · {aiProductCourseEvidence.coursera.modules} modules. {aiProductCourseEvidence.coursera.checkedLabel}.</p><a href={aiProductCourseEvidence.coursera.href}>View on Coursera</a></section></>;
}

function CaseCopy({ title, nested = false, summaryOnly = false }: { title: string; nested?: boolean; summaryOnly?: boolean }) {
  const Heading = nested ? 'h3' : 'h1';
  const Subheading = nested ? 'h4' : 'h2';
  const brief = getProjectBrief(title);
  const reader = getProjectReader(title);
  const detailHref = publicPages.find((entry) => entry.kind === 'case' && entry.key === title)?.path;
  return <><Heading>{title}</Heading>{reader?.summary ? <p>{reader.summary}</p> : null}
    {brief ? <section><Subheading>At a glance</Subheading><dl>{[['Who it serves', brief.who], ['What I owned', brief.owned], ['Key decision', brief.decision], ['Current state', brief.current], ['Evidence and gap', brief.evidence]].map(([label, text]) => <div key={label}><dt>{label}</dt><dd>{text}</dd></div>)}</dl><nav>{detailHref ? <a href={detailHref}>Read the case</a> : null}{brief.links.map((link) => <a key={link.href} href={link.href}>{link.label}</a>)}</nav></section> : null}
    {!summaryOnly ? reader?.sections.map((section) => <section key={section.label}><Subheading>{section.label}</Subheading>{section.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</section>) : null}
    {!summaryOnly ? <p><a href="/projects">Explore the other products</a></p> : null}</>;
}

function ProjectCollections() {
  const projects = portfolioContent.personalProjects;
  return <>
    <section id="projects-featured"><ProjectEntry /></section>
    <section id="projects-selfware-stack" aria-labelledby="initial-products-title">
      <span id="projects-selfware" />
      <h2 id="initial-products-title">Product walkthroughs</h2>
      {projects.selfware.map((project) => <article key={project.projectName}><CaseCopy title={project.projectName} nested summaryOnly /></article>)}
    </section>
    <section id="projects-tools" aria-labelledby="initial-tools-title">
      <h2 id="initial-tools-title">Tools &amp; systems</h2>
      {projects.tools.map((project) => <article key={project.projectName}><CaseCopy title={project.projectName} nested summaryOnly /></article>)}
    </section>
    <section id="projects-architecture" aria-labelledby="initial-architecture-title">
      <h2 id="initial-architecture-title">Architecture &amp; method</h2>
      <p>{projects.architectureAcrossTools.title}</p>
      <ProductMethodSummary compact />
      <p><a href="/product-thesis">Read the full product thesis</a></p>
    </section>
  </>;
}

function TalkItems({ currentOnly = false, earlierOnly = false }: { currentOnly?: boolean; earlierOnly?: boolean }) {
  const talks = [...portfolioContent.teachingSpeakingWriting.speaking].sort((a, b) =>
    Number(b.talkTitle === disxTalkEvidence.title) - Number(a.talkTitle === disxTalkEvidence.title));
  return <>{talks.filter((talk) => currentOnly ? talk.talkTitle === disxTalkEvidence.title : earlierOnly ? talk.talkTitle !== disxTalkEvidence.title : true).map((talk) => {
    const current = talk.talkTitle === disxTalkEvidence.title;
    return <section key={talk.talkTitle} id={current ? 'thoughts-disx' : undefined}>
      <h2>{talk.talkTitle}</h2>
      {current ? <p>{disxTalkEvidence.event} · {disxTalkEvidence.dateLabel} · {disxTalkEvidence.location} · {disxTalkEvidence.stage}</p> : null}
      <p>{talk.coreIdea}</p><p>{talk.audienceTakeaway}</p>
      {current ? <p><a href="/talks/disx-dubai">Read the DISx talk and hypothetical example</a></p> : null}
      {talk.sourceLinks.map((link) => <p key={link.href}><a href={link.href}>{link.label}</a></p>)}
    </section>;
  })}</>;
}

function Body({ page }: { page: PublicPage }) {
  const teaching = portfolioContent.teachingSpeakingWriting;
  switch (page.kind) {
    case 'home': return <><h1>{homepagePositioning.name} · {homepagePositioning.role}</h1><p>{homepagePositioning.intro}</p><p>{homepagePositioning.experience}</p><section><h2>Selected commercial outcomes</h2>{homepageOutcomes.map((result) => <article key={result.id}><h3><a href={result.href}>{result.company}: {result.metric} {result.outcome}</a></h3><p>{result.responsibility} {result.measurementPeriod}.</p></article>)}</section><section><h2>Selected AI products</h2>{homepageProducts.map((product) => <article key={product.name}><h3><a href={product.href}>{product.name}</a></h3><p>{product.kind}</p><p>{product.description}</p></article>)}</section><ProductMethodSummary compact /><CourseList nested /><p>{homepagePositioning.personalNote} <a href="/thoughts/books">Explore my writing</a>.</p></>;
    case 'story': return <ProfessionalStories activeSlug={page.key} />;
    case 'method': return <ProductMethodSummary />;
    case 'disx': return <DisxTalkPage />;
    case 'thesis': return <ThesisReadingCopy />;
    case 'case': return <CaseCopy title={page.key ?? ''} />;
    case 'courses': return <CourseList />;
    case 'projects': return <ProjectCollections />;
    case 'experience': return <><h1>Product experience and education</h1><p>{portfolioContent.productManagementWorkExperiences.intro}</p><ProfessionalStories />{portfolioContent.productManagementWorkExperiences.companies.map((role) => <section key={role.companyName}><h2>{role.companyName} · {publicWorkValue(role.jobTitle)}</h2><p>{publicWorkValue(role.monthYearRangeWorked)} · {publicWorkValue(role.location)}</p><p>{publicWorkValue(role.companyDescription)}</p><p>{getWorkEvidence(role.companyName)?.summary}</p><p>{getWorkEvidence(role.companyName)?.scopeNote}</p><ul>{role.mainAchievements.map((item) => publicWorkValue(item)).filter((item): item is string => typeof item === 'string' && item.trim().length > 0 && !/\[confidential\]|^confidential$/i.test(item.trim())).map((item) => <li key={String(item)}>{String(item)}</li>)}</ul></section>)}</>;
    case 'about': case 'books': return <AboutWritingPage />;
    case 'resources': return <Resources />;
    case 'talks': return <><h1>Talks and public speaking</h1><TalkItems /></>;
    case 'thoughts': return <><h1>Teaching &amp; speaking</h1><p>I turn product practice into ideas and tools other people can use. Start with the current AI course, the DISx example and a concise view of my method.</p><nav aria-label="Teaching and speaking sections"><a href="#thoughts-courses">Courses</a><a href="#thoughts-disx">DISx Dubai</a><a href="#thoughts-method">The method</a><a href="/about">About &amp; writing</a></nav><section id="thoughts-courses"><CourseList nested /></section><TalkItems currentOnly /><div id="thoughts-method"><ProductMethodSummary compact /></div><section><h2>Earlier talks</h2><TalkItems earlierOnly /></section><section><h2>Writing and intellectual foundations</h2><p>I’m interested in how people find clarity in complex systems. In product work, that means making decisions traceable. In teaching, it means making ideas usable. In fiction, it means making them felt.</p><p><a href="/about">About &amp; writing</a> · <a href="/thoughts/books">Explore both books</a> · <a href="/thoughts/framework-of-metacognition">Framework of Metacognition</a></p></section></>;
    case 'metacognition': return <MetacognitionReadingCopy />;
    case 'contact': return <><h1>{portfolioContent.contactCta.headline}</h1><p>{portfolioContent.contactCta.hook}</p><p>{resourceContact.purpose}</p><p>{resourceContact.timezoneLabel}</p><p><a href="mailto:raminhoodeh@gmail.com">raminhoodeh@gmail.com</a></p><nav><a href="/cv">Read my CV</a><a href={resourceContact.linkedin}>LinkedIn</a><a href="/resources">Resources</a></nav><section id="privacy"><h2>Privacy and usage counts</h2><p>With JavaScript enabled, this portfolio counts broad actions without visitor identifiers, cookies, URLs, referrers, conversation text or job descriptions. Counts appear in the site’s hosting logs for a limited period. The interactive privacy control lets you disable these counts, and browser Do Not Track and Global Privacy Control signals are respected. AI Ramin questions and optional answer feedback are separate from these counts.</p></section></>;
    case 'bonus': return <><h1>Resources and bonus</h1>{portfolioContent.bonus.gifts.map((gift) => <section key={gift.title}><h2>{gift.title}</h2><p>{typeof gift.detail === 'string' ? gift.detail : ''}</p>{typeof gift.link === 'string' ? <a href={gift.link}>Open resource</a> : null}</section>)}</>;
    default: return <><h1>AI Ramin</h1><p>{page.description}</p><p>The interactive assistant needs JavaScript. You can also inspect the same portfolio evidence directly.</p><nav><a href="/experience-education">Professional experience</a><a href="/projects">Product cases</a><a href="/thoughts/courses">Teaching</a><a href="/contact">Contact</a></nav></>;
  }
}

export function InitialDocument({ page }: { page: PublicPage | null }) {
  return <div className="initial-document"><header className="initial-document-nav"><a href="/">Ramin Hoodeh</a><nav aria-label="Portfolio">{portfolioDestinations.map((link) => <a key={link.href} href={link.href}>{link.label}</a>)}</nav></header><main>{page ? <Body page={page} /> : <NotFoundPage />}</main><footer><a href="/cv">CV</a> · <a href="/presentation">Presentation</a> · <a href="/resources">Resources</a> · <a href="/contact">Contact</a></footer></div>;
}
