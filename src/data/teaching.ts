import type { TeachingWritingItem } from './shared';

export const teachingWritingItems = [
  {
    type: 'Course',
    title: 'The Fastest Path to Product Management',
    subtitle: 'Best-selling product course for making PM craft teachable',
    proof:
      'Udemy proof: created by Ramin Hoodeh, 4.8 rating, 4,871 students, 162 ratings/reviews, and last updated 6/2025 at scrape time.',
    whyItMatters:
      'Shows the Teacher side of the portfolio: product judgment is not just practiced, it can be structured, explained, and transferred to a broad audience.',
    href: 'https://www.udemy.com/course/the-fastest-way-to-become-a-product-manager/',
    assetSlot: 'Needs preferred course thumbnail or preview image.',
    sourceStatus: 'public-proof',
    chips: ['Teaching', 'Product craft', '4,871 students', 'AI PM update'],
  },
  {
    type: 'Course',
    title: 'Transition from Product Manager to AI Product Manager',
    subtitle: 'AI-Native Product OS packaged as a practical course',
    proof:
      'Planned for release June 2026; based on the 5-layer stack and AI-native loop from the core thesis.',
    whyItMatters:
      'Turns the thesis into a repeatable training product: six lessons, a running build, and a working operating system by the end.',
    href: '/product-thesis',
    assetSlot: 'Needs launch link, title lockup, and syllabus proof.',
    sourceStatus: 'manual-needed',
    chips: ['AI PM', '5-layer stack', 'AI-native loop', 'Maven link needed'],
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
