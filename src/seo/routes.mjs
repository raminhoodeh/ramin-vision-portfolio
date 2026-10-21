export const CANONICAL_ORIGIN = 'https://www.ramin.vision';
export const DEFAULT_PREVIEW_IMAGE = '/social/home.png';

const page = (path, title, description, kind, key) => ({ path, title: `${title} | Ramin Hoodeh`, description, kind, key });

// Deliberately lightweight: runtime metadata and path validation never import case-study media or renderers.
export const publicPages = [
  page('/', 'AI Product Manager, Builder & Educator', 'AI product work, commercial product decisions, independent builds, teaching and writing by Ramin Hoodeh.', 'home'),
  page('/experience-education', 'Product Experience & Education', 'Eight-plus years of product delivery across payments, marketplaces and financial data, with qualifications and selected decisions.', 'experience'),
  page('/work/side', 'SIDE: AI-Assisted ERP Decisions', 'Product ownership, targeted internal tools, Finance approval boundaries and reported ERP outcomes at SIDE.', 'story', 'side'),
  page('/work/vivup', 'Vivup: Checkout & Monetisation', 'The checkout guidance and benefit-savings monetisation decisions, ownership, reported results and evidence limits.', 'story', 'vivup'),
  page('/projects', 'Products & Practical AI Builds', 'Explore independent products, their users, implementation choices, current state and available evidence.', 'projects'),
  page('/product-method', 'The AI-Native Product Method', 'Five areas of responsibility and a Talk, Decide, Build, Observe, Iterate loop for useful and accountable AI product work.', 'method'),
  page('/product-thesis', 'The AI-Native Product Thesis', 'The full reasoning behind the AI-Native Product OS, its applications, practical summary and limitations.', 'thesis'),
  page('/talks/disx-dubai', 'DISx Dubai: AI-Native Product OS', 'The 15 October 2026 talk, slide, full prepared script and hypothetical cross-border payment walkthrough.', 'disx'),
  page('/thoughts', 'Teaching, Speaking & Writing', 'Courses on Udemy and Coursera, DISx and TEDx speaking, fiction and the ideas behind Ramin’s product work.', 'thoughts'),
  page('/thoughts/courses', 'Product Management & AI Courses', 'Current, dated platform details for Ramin Hoodeh’s product management and AI product management courses.', 'courses'),
  page('/thoughts/books', 'Fiction & Writing', 'The Proposition and The Meaning of Life: fiction, metaphysical enquiry and the creative side of Ramin’s work.', 'books'),
  page('/thoughts/talks', 'Talks & Public Speaking', 'DISx Dubai, TEDx Imperial College London and university speaking, with public sources and reading material.', 'talks'),
  page('/thoughts/framework-of-metacognition', 'Framework of Metacognition', 'The personal decision framework connecting experience, values, vision, strategy and the things Ramin creates.', 'metacognition'),
  page('/contact', 'Contact Ramin', 'Get in touch about AI product roles, payments and embedded finance, teaching, speaking or collaboration.', 'contact'),
  page('/ai-ramin', 'Ask AI Ramin', 'Explore Ramin’s public portfolio evidence and relevant experience with the AI Ramin assistant.', 'assistant'),
  page('/bonus', 'Resources & Bonus', 'Explore the resources and offers shared with visitors to Ramin’s portfolio.', 'bonus'),
  ...[
    ['nsso', 'nsso', 'Reviewed AI profile changes, identity and commerce.'],
    ['dreamsea', 'Dreamsea', 'Voice-first dream capture, domain context and a released iPhone app.'],
    ['qadam', 'Qadam', 'Paper-only financial research, evidence records and guarded decision workflows.'],
    ['24seven-concierge', '24Seven Concierge', 'A catalogue-grounded concierge enhancement with a human booking handoff.'],
    ['razinflix', 'RazinFlix', 'A human-curated film library with AI-assisted enrichment.'],
    ['ai-native-product-manager-os', 'AI-Native Product Manager OS', 'The installable workspace, practical assets and integration boundaries.'],
    ['mass-social-wisdom-agent', 'Mass Social Wisdom Agent', 'Source-linked extraction, document output and human review of social knowledge.'],
    ['ai-costs-dashboard', 'AI Costs Dashboard', 'A standalone metering and routing core, illustrative demo and integration limits.'],
    ['rag-pipeline', 'RAG Pipeline', 'Reusable context infrastructure, cited retrieval and the boundary of the public demo.'],
  ].map(([slug, title, description]) => page(`/projects/${slug}`, `${title}: Product Case`, description, 'case', title)),
];

export const routeAliases = {
  '/home': '/', '/hero': '/', '/intro': '/',
  '/work': '/experience-education', '/experience': '/experience-education',
  '/method': '/product-method', '/disx': '/talks/disx-dubai',
  '/thesis': '/product-thesis', '/my-product-thesis': '/product-thesis',
  '/projects/ai-native-product-os': '/product-thesis', '/projects/product-thesis': '/product-thesis',
  '/thoughts/ai-native-product-os': '/product-thesis', '/thoughts/product-thesis': '/product-thesis', '/thoughts/thesis': '/product-thesis',
  '/teaching-speaking-writing': '/thoughts', '/ai': '/ai-ramin',
};

// These addresses carry UI scroll intent. Serve them without redirecting away from that intent.
export const sectionPathAliases = {
  ...Object.fromEntries(['featured', 'product', 'products', 'selfware', 'apps', 'tools', 'systems', 'architecture', 'thesis'].map((slug) => [`/projects/${slug}`, '/projects'])),
  ...Object.fromEntries(['foundations', 'clarity', 'think', 'method', 'method-values', 'values', 'passions', 'formation', 'storycraft', 'express', 'integration', 'systems', 'build', 'proof', 'integration-proof', 'os', 'architecture', 'work', 'work-narrative', 'case-studies'].map((slug) => [`/thoughts/${slug}`, '/thoughts'])),
};

for (const [from, to] of Object.entries({
  'projects-featured': '/projects/featured', 'projects-selfware': '/projects/selfware', 'projects-selfware-stack': '/projects/selfware', 'projects-tools': '/projects/tools', 'projects-architecture': '/projects/architecture',
  'thoughts-foundations': '/thoughts/foundations', 'thoughts-act-method-values': '/thoughts/method-values', 'thoughts-talks': '/thoughts/talks', 'thoughts-passions': '/thoughts/passions', 'thoughts-act-formation': '/thoughts/formation', 'thoughts-books': '/thoughts/books', 'thoughts-integration': '/thoughts/integration', 'thoughts-courses': '/thoughts/courses', 'thoughts-act-integration-proof': '/thoughts/integration-proof', 'thoughts-os': '/thoughts/os', 'thoughts-architecture-bridge': '/thoughts/architecture', 'thoughts-work-narrative': '/thoughts/work-narrative', 'thoughts-case-studies': '/thoughts/case-studies',
})) routeAliases[`/${from}`] = to;

const byPath = new Map(publicPages.map((entry) => [entry.path, entry]));
for (const entry of publicPages.filter((item) => item.kind === 'case')) {
  const slug = entry.path.split('/').pop();
  routeAliases[`/thoughts/${slug}`] = entry.path;
  routeAliases[`/${slug}`] = entry.path;
  routeAliases[`/case-studies/project-${slug}`] = entry.path;
  routeAliases[`/case-studies/writeup-${slug}`] = entry.path;
}
routeAliases['/ai-native-product-os'] = '/product-thesis';
routeAliases['/case-studies/writeup-ai-native-product-os'] = '/product-thesis';
routeAliases['/case-studies/metacognition-deep-dive'] = '/thoughts/framework-of-metacognition';
for (const [slug, target] of Object.entries({ 'product-experience': '/experience-education', 'selected-builds': '/projects', 'tools-systems': '/projects', 'credential-stack': '/experience-education', 'teaching-writing': '/thoughts', 'ai-ramin': '/ai-ramin' })) {
  for (const prefix of ['', '/thoughts', '/projects']) {
    const alias = `${prefix}/${slug}`;
    if (!byPath.has(alias)) routeAliases[alias] = target;
  }
  routeAliases[`/case-studies/writeup-${slug}`] = target;
}

export function previewImagePath(path) {
  return `/social/${path === '/' ? 'home' : path.slice(1).replaceAll('/', '-')}.png`;
}

export function normalizePublicPath(value) {
  try {
    const path = decodeURIComponent(value.split(/[?#]/, 1)[0]);
    if (path.includes('\\') || path.includes('\0') || !path.startsWith('/')) return null;
    return path.length > 1 ? path.replace(/\/+$/, '') : path;
  } catch { return null; }
}

export function getPublicPage(value) {
  const path = normalizePublicPath(value);
  if (!path) return null;
  const destination = routeAliases[path] ?? path;
  return byPath.get(sectionPathAliases[destination] ?? destination) ?? null;
}

export function isKnownPortfolioPath(value) {
  return Boolean(getPublicPage(value));
}

export function getPageMetadata(value) {
  const entry = getPublicPage(value);
  return entry ? { ...entry, canonical: CANONICAL_ORIGIN + entry.path, image: CANONICAL_ORIGIN + previewImagePath(entry.path), robots: 'index,follow' }
    : { path: '/404', title: 'Page not found | Ramin Hoodeh', description: 'This portfolio page could not be found. Explore the selected work, products and contact page.', canonical: null, image: CANONICAL_ORIGIN + DEFAULT_PREVIEW_IMAGE, robots: 'noindex,follow', kind: 'not-found' };
}

export function getStructuredData(value) {
  const metadata = getPageMetadata(value);
  if (!metadata.canonical) return null;
  const root = `${CANONICAL_ORIGIN}/`;
  const personId = `${root}#person`;
  const websiteId = `${root}#website`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'Person', '@id': personId, name: 'Ramin Hoodeh', jobTitle: 'AI Product Manager', url: root },
      { '@type': 'WebSite', '@id': websiteId, name: 'Ramin Hoodeh · Portfolio', url: root, publisher: { '@id': personId } },
      {
        '@type': 'WebPage', '@id': `${metadata.canonical}#webpage`, name: metadata.title,
        description: metadata.description, url: metadata.canonical,
        isPartOf: { '@id': websiteId }, about: { '@id': personId },
      },
    ],
  };
}

export function serializeStructuredData(value) {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
}
