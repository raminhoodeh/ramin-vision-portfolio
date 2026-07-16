const pathByElementId: Record<string, string> = {
  hero: '/',
  'experience-education': '/experience-education',
  projects: '/projects',
  'projects-featured': '/projects/featured',
  'projects-selfware': '/projects/selfware',
  'projects-selfware-stack': '/projects/selfware',
  'projects-tools': '/projects/tools',
  'projects-architecture': '/projects/architecture',
  thoughts: '/thoughts',
  'thoughts-foundations': '/thoughts/foundations',
  'thoughts-act-method-values': '/thoughts/method-values',
  'thoughts-talks': '/thoughts/talks',
  'thoughts-passions': '/thoughts/passions',
  'thoughts-act-formation': '/thoughts/formation',
  'thoughts-books': '/thoughts/books',
  'thoughts-integration': '/thoughts/integration',
  'thoughts-act-integration-proof': '/thoughts/integration-proof',
  'thoughts-courses': '/thoughts/courses',
  'thoughts-os': '/thoughts/os',
  'thoughts-architecture-bridge': '/thoughts/architecture',
  'thoughts-work-narrative': '/thoughts/work-narrative',
  'thoughts-case-studies': '/thoughts/case-studies',
  contact: '/contact',
  bonus: '/bonus',
  'ai-ramin': '/ai-ramin',
};

function pushPathForElementId(target: string) {
  const path = pathByElementId[target];
  if (!path || window.location.pathname === path) return;

  window.history.pushState(null, '', `${path}${window.location.search}`);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

export function scrollToId(target: string) {
  const targetElement = document.getElementById(target);
  if (!targetElement) return;
  pushPathForElementId(target);

  const scrollContainer = targetElement.closest<HTMLElement>('.portfolio-stage-scroll, .portfolio-stage');
  if (scrollContainer) {
    const targetRect = targetElement.getBoundingClientRect();
    const containerRect = scrollContainer.getBoundingClientRect();

    scrollContainer.scrollTo({
      top: Math.max(scrollContainer.scrollTop + targetRect.top - containerRect.top, 0),
      behavior: 'smooth',
    });
    return;
  }

  targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
