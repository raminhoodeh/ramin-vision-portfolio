export function scrollToId(target: string) {
  const targetElement = document.getElementById(target);
  if (!targetElement) return;

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
