import { useLayoutEffect } from 'react';

// Mount only after the requested route's Suspense boundary resolves.
export function PortfolioAppReady() {
  useLayoutEffect(() => {
    document.getElementById('portfolio-initial')?.remove();
    document.documentElement.dataset.portfolioReady = 'true';
  }, []);
  return null;
}
