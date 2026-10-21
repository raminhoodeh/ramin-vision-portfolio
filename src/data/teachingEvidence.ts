// Keep platform figures separate: course enrollments are not a count of unique learners.
// Refresh the checked date only after reviewing the linked platform page.
export const productCourseEvidence = {
  platform: 'Udemy',
  title: 'The Fastest Path to Product Management',
  href: 'https://www.udemy.com/course/the-fastest-way-to-become-a-product-manager/',
  checkedOn: '2026-10-22',
  checkedLabel: 'Checked 22 October 2026',
  rating: '4.8',
  ratings: '162',
  students: '4,881',
  badges: [],
} as const;

export const aiProductCourseEvidence = {
  udemy: {
    platform: 'Udemy',
    title: 'Transition from Product Manager to AI Product Manager',
    href: 'https://www.udemy.com/course/from-product-manager-to-ai-product-manager/',
    checkedOn: '2026-10-22',
    checkedLabel: 'Checked 22 October 2026',
    rating: '4.6',
    ratings: '387',
    students: '1,920',
    badges: ['Bestseller', 'Highest Rated'],
  },
  coursera: {
    platform: 'Coursera',
    title: 'From Product Manager to AI Product Manager',
    href: 'https://www.coursera.org/learn/ai-product-management/',
    provider: 'LearnKartS',
    modules: 10,
    checkedOn: '2026-10-22',
    checkedLabel: 'Checked 22 October 2026',
  },
} as const;

export const disxTalkEvidence = {
  title: 'AI Made Execution Cheap. High-Stakes Decisions Are Still Expensive.',
  event: 'Data Innovation Summit MEA 2026',
  date: '2026-10-15',
  dateLabel: '15 October 2026',
  location: 'Dubai',
  stage: 'M4 · Machine Learning, Generative & Agentic AI',
  summary:
    'I presented the AI-Native Product OS, then applied its Stack and Loop to a hypothetical $4.2 billion cross-border payment in a simulated bank workflow. The example shows why an ambiguous sanctions match needs an evaluation case and a system-enforced escalation rule, regardless of the model’s confidence.',
  sources: [
    {
      label: 'Organiser’s session announcement',
      href: 'https://www.linkedin.com/posts/disummitmea2030-share-7516413326176804866-Om0V/',
    },
    {
      label: 'Organiser’s speaker introduction',
      href: 'https://www.linkedin.com/feed/update/urn:li:activity:7507738452071890944/',
    },
  ],
} as const;
