import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

async function startApp() {
  if (import.meta.env.DEV && new URLSearchParams(window.location.search).has('iphonePreview')) {
    const { IPhone3DPreview } = await import('./components/IPhone3DPreview');
    createRoot(document.getElementById('root')!).render(<IPhone3DPreview />);
    return;
  }

  if (import.meta.env.DEV) {
    const { installPortfolioPerformanceBaseline } = await import('./performance/portfolioPerformanceBaseline');
    installPortfolioPerformanceBaseline();
  }

  createRoot(document.getElementById('root')!).render(
    <BrowserRouter>
      <App />
    </BrowserRouter>,
  );
}

void startApp();
