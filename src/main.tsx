import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

async function startApp() {
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
