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

type PublicPage = { path: string; title: string; description: string; kind: string; key?: string };

function CourseList({ nested = false }: { nested?: boolean }) {
  const Heading = nested ? 'h2' : 'h1';
  return <><Heading>Product management and AI courses</Heading>{[productCourseEvidence, aiProductCourseEvidence.udemy].map((course) => (
    <section key={course.href}><h2>{course.title}</h2><p>Udemy: {course.rating}/5, {course.ratings} ratings, {course.students} students. {course.checkedLabel}.</p>
      {course.badges.length ? <p>{course.badges.join(' · ')}</p> : null}<a href={course.href}>View on Udemy</a></section>
  ))}<section><h2>{aiProductCourseEvidence.coursera.title}</h2><p>Coursera · Offered by {aiProductCourseEvidence.coursera.provider} · {aiProductCourseEvidence.coursera.modules} modules. {aiProductCourseEvidence.coursera.checkedLabel}.</p><a href={aiProductCourseEvidence.coursera.href}>View on Coursera</a></section></>;
}

function CaseCopy({ title, nested = false }: { title: string; nested?: boolean }) {
  const Heading = nested ? 'h2' : 'h1';
  const brief = getProjectBrief(title);
  const reader = getProjectReader(title);
  return <><Heading>{title}</Heading>{reader?.summary ? <p>{reader.summary}</p> : null}
    {brief ? <section><h2>At a glance</h2><dl>{[['Who it serves', brief.who], ['What I owned', brief.owned], ['Key decision', brief.decision], ['Current state', brief.current], ['Evidence and gap', brief.evidence]].map(([label, text]) => <div key={label}><dt>{label}</dt><dd>{text}</dd></div>)}</dl><nav>{brief.links.map((link) => <a key={link.href} href={link.href}>{link.label}</a>)}</nav></section> : null}
    {reader?.sections.map((section) => <section key={section.label}><h2>{section.label}</h2>{section.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</section>)}
    <p><a href="/projects">Explore the other products</a></p></>;
}

function Body({ page }: { page: PublicPage }) {
  const teaching = portfolioContent.teachingSpeakingWriting;
  switch (page.kind) {
    case 'home': return <><h1>{homepagePositioning.name} · {homepagePositioning.role}</h1><p>{homepagePositioning.intro}</p><p>{homepagePositioning.experience}</p><section><h2>Selected commercial outcomes</h2>{homepageOutcomes.map((result) => <article key={result.id}><h3><a href={result.href}>{result.company}: {result.metric} {result.outcome}</a></h3><p>{result.responsibility} {result.measurementPeriod}.</p></article>)}</section><section><h2>Independent AI products</h2>{homepageProducts.map((product) => <article key={product.name}><h3><a href={product.href}>{product.name}</a></h3><p>{product.description}</p></article>)}</section><ProductMethodSummary compact /><CourseList nested /><p>{homepagePositioning.personalNote} <a href="/thoughts/books">Explore my writing</a>.</p></>;
    case 'story': return <ProfessionalStories activeSlug={page.key} />;
    case 'method': return <ProductMethodSummary />;
    case 'disx': return <DisxTalkPage />;
    case 'thesis': return <ThesisReadingCopy />;
    case 'case': return <CaseCopy title={page.key ?? ''} />;
    case 'courses': return <CourseList />;
    case 'projects': return <><h1>Products and practical AI work</h1>{Object.entries(portfolioContent.personalProjects).filter(([, value]) => Array.isArray(value)).flatMap(([, value]) => value as readonly { projectName: string; problem: string | object }[]).map((project) => <CaseCopy key={project.projectName} title={project.projectName} nested />)}</>;
    case 'experience': return <><h1>Product experience and education</h1><p>{portfolioContent.productManagementWorkExperiences.intro}</p><ProfessionalStories />{portfolioContent.productManagementWorkExperiences.companies.map((role) => <section key={role.companyName}><h2>{role.companyName} · {publicWorkValue(role.jobTitle)}</h2><p>{publicWorkValue(role.monthYearRangeWorked)} · {publicWorkValue(role.location)}</p><p>{publicWorkValue(role.companyDescription)}</p><ul>{role.mainAchievements.map((item) => publicWorkValue(item)).filter((item): item is string => typeof item === 'string' && item.trim().length > 0 && !/\[confidential\]|^confidential$/i.test(item.trim())).map((item) => <li key={String(item)}>{String(item)}</li>)}</ul></section>)}</>;
    case 'books': return <><h1>Fiction and writing</h1>{teaching.writing.books.map((book) => <section key={book.bookName}><h2>{book.bookName}</h2><p>{book.bookDescription}</p><p>{book.premise}</p><a href={book.purchaseLink}>Explore the book</a></section>)}</>;
    case 'talks': return <><h1>Talks and public speaking</h1>{teaching.speaking.map((talk) => <section key={talk.talkTitle}><h2>{talk.talkTitle}</h2><p>{talk.coreIdea}</p><p>{talk.audienceTakeaway}</p>{talk.sourceLinks.map((link) => <p key={link.href}><a href={link.href}>{link.label}</a></p>)}</section>)}<a href="/talks/disx-dubai">Read the DISx talk and hypothetical example</a></>;
    case 'thoughts': return <><h1>Teaching, speaking and writing</h1><p>{teaching.frame.headline}</p><CourseList nested /><section><h2>{disxTalkEvidence.title}</h2><p>{disxTalkEvidence.summary}</p><a href="/talks/disx-dubai">Read the DISx talk</a></section><p><a href="/thoughts/books">Explore the fiction books</a> · <a href="/thoughts/framework-of-metacognition">Framework of Metacognition</a></p></>;
    case 'metacognition': return <><h1>Framework of Metacognition</h1>{teaching.foundations.foundations.map((foundation) => <section key={foundation.id}><h2>{foundation.title}</h2><p>{foundation.thesis}</p><ol>{foundation.sequence.map((step) => <li key={step.label}><strong>{step.label}</strong>: {step.detail}</li>)}</ol><p>{foundation.application}</p></section>)}</>;
    case 'contact': return <><h1>{portfolioContent.contactCta.headline}</h1><p>{portfolioContent.contactCta.hook}</p><p><a href="mailto:raminhoodeh@gmail.com">raminhoodeh@gmail.com</a></p><a href="/cv">Read my CV</a><section id="privacy"><h2>Privacy and usage counts</h2><p>With JavaScript enabled, this portfolio counts broad actions without visitor identifiers, cookies, URLs, referrers, conversation text or job descriptions. Counts appear in the site’s hosting logs for a limited period. The interactive privacy control lets you disable these counts, and browser Do Not Track and Global Privacy Control signals are respected. AI Ramin questions and optional answer feedback are separate from these counts.</p></section></>;
    case 'bonus': return <><h1>Resources and bonus</h1>{portfolioContent.bonus.gifts.map((gift) => <section key={gift.title}><h2>{gift.title}</h2><p>{typeof gift.detail === 'string' ? gift.detail : ''}</p>{typeof gift.link === 'string' ? <a href={gift.link}>Open resource</a> : null}</section>)}</>;
    default: return <><h1>AI Ramin</h1><p>{page.description}</p><p>The interactive assistant needs JavaScript. You can also inspect the same portfolio evidence directly.</p><nav><a href="/experience-education">Professional experience</a><a href="/projects">Product cases</a><a href="/thoughts/courses">Teaching</a><a href="/contact">Contact</a></nav></>;
  }
}

export function InitialDocument({ page }: { page: PublicPage | null }) {
  return <div className="initial-document"><header className="initial-document-nav"><a href="/">Ramin Hoodeh</a><nav aria-label="Portfolio"><a href="/experience-education">Work</a><a href="/projects">Products</a><a href="/product-method">Method</a><a href="/thoughts/courses">Teaching</a><a href="/thoughts/books">Writing</a><a href="/contact">Contact</a></nav></header><main>{page ? <Body page={page} /> : <NotFoundPage />}</main><footer><a href="/cv">CV</a> · <a href="/presentation">Presentation</a> · <a href="/contact">Contact</a></footer></div>;
}
