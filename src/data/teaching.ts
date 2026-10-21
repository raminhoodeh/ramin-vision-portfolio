import type { TeachingWritingItem } from './shared';
import { aiProductCourseEvidence, disxTalkEvidence, productCourseEvidence } from './teachingEvidence';

export const teachingWritingItems = [
  {
    type: 'Course',
    title: productCourseEvidence.title,
    subtitle: 'A practical product course for making PM craft teachable',
    proof:
      `Udemy: created by Ramin Hoodeh, ${productCourseEvidence.rating}/5 from ${productCourseEvidence.ratings} ratings, ${productCourseEvidence.students} students. ${productCourseEvidence.checkedLabel}.`,
    whyItMatters:
      'Shows the Teacher side of the portfolio: product judgment is not just practiced, it can be structured, explained, and transferred to a broad audience.',
    href: productCourseEvidence.href,
    assetSlot: 'Needs preferred course thumbnail or preview image.',
    sourceStatus: 'public-proof',
    chips: ['Teaching', 'Product craft', `${productCourseEvidence.students} students`, 'Product Innovation Process'],
  },
  {
    type: 'Course',
    title: aiProductCourseEvidence.udemy.title,
    subtitle: 'AI-Native Product OS packaged as a practical course',
    proof:
      `Live on Udemy and Coursera. Udemy: ${aiProductCourseEvidence.udemy.rating}/5 from ${aiProductCourseEvidence.udemy.ratings} ratings, ${aiProductCourseEvidence.udemy.students} students; Bestseller and Highest Rated. ${aiProductCourseEvidence.udemy.checkedLabel}. Coursera provider: ${aiProductCourseEvidence.coursera.provider}.`,
    whyItMatters:
      'Turns the thesis into a practical training product: model choice, context, orchestration, governance, and human judgment, with platform-specific curricula.',
    href: aiProductCourseEvidence.udemy.href,
    assetSlot: 'AI Product Manager course thumbnail.',
    sourceStatus: 'public-proof',
    chips: ['AI PM', '5-layer stack', 'Udemy', 'Coursera'],
  },
  {
    type: 'Talk',
    title: disxTalkEvidence.title,
    subtitle: `${disxTalkEvidence.event} · ${disxTalkEvidence.stage}`,
    proof: `Delivered in ${disxTalkEvidence.location}, ${disxTalkEvidence.dateLabel}; supported by the organiser’s session announcement and speaker introduction.`,
    whyItMatters: disxTalkEvidence.summary,
    href: disxTalkEvidence.sources[0].href,
    assetSlot: 'AI-Native Product OS diagram; no conference recording represented.',
    sourceStatus: 'public-proof',
    chips: ['DISx Dubai', 'AI-Native Product OS', 'Speaking', 'Hypothetical payment scenario'],
  },
  {
    type: 'Talk',
    title: 'Existentially viewing your existential crisis',
    subtitle: 'TEDxImperialCollege',
    proof:
      'TED proof: public TEDxImperialCollege talk from June 2018 with 42,969 plays at scrape time.',
    whyItMatters:
      'Carries the broader worldview behind the work: cosmic perspective, mindfulness, meaning, and making large abstract ideas feel human.',
    href: 'https://www.ted.com/talks/ramin_hoodeh_existentially_viewing_your_existential_crisis',
    assetSlot: 'Needs preferred TEDx thumbnail or speaker frame.',
    sourceStatus: 'public-proof',
    chips: ['Speaking', 'Worldview', 'TEDx', '42,969 plays'],
  },
  {
    type: 'Book',
    title: 'The Proposition: Purpose',
    subtitle: 'Spiritual fiction and metaphysical enquiry',
    proof:
      'Amazon proof: paperback published 6 Dec 2021, 385 pages, ISBN-10 1527286185, ISBN-13 978-1527286184, 5.0 rating with 14 ratings at scrape time.',
    whyItMatters:
      'Shows long-form creative discipline: philosophy, consciousness, and the nature of reality carried through story rather than only argument.',
    href: 'https://www.amazon.co.uk/Purpose-Ramin-Hoodeh/dp/1527286185',
    assetSlot: 'Needs high-resolution book cover.',
    sourceStatus: 'public-proof',
    chips: ['Fiction', 'Metaphysics', '385 pages', 'Author'],
  },
  {
    type: 'Essay',
    title: 'Framework of Metacognition',
    subtitle: 'Organising thinking into usable inner architecture',
    proof:
      'Local write-up defines a hierarchy for thinking and presenting information: Experience, Who, Why, How, What.',
    whyItMatters:
      'Bridges Manager, Engineer, Teacher, and Author by turning messy experience into values, vision, strategy, and tactics.',
    href: '/thoughts',
    assetSlot: 'Needs final essay copy.',
    sourceStatus: 'manual-needed',
    chips: ['Framework', 'Experience', 'Values', 'Strategy'],
  },
] as const satisfies readonly TeachingWritingItem[];
