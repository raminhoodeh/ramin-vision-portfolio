import { Component, useEffect, useState, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { ShaderGradientBackground } from '../src/components/ShaderGradientBackground';

// This entry owns the original decoration only. It never imports App, navigation, career
// content, measurement, API clients, credentials or AI provider handlers.
class VisualBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { document.documentElement.dataset.maintenanceBackground = 'fallback'; }
  render() { return this.state.failed ? null : this.props.children; }
}

function OriginalBackground() {
  const [active, setActive] = useState(false);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const connection = (navigator as Navigator & { connection?: EventTarget & { saveData?: boolean } }).connection;
    const update = () => {
      const allowed = document.visibilityState === 'visible' && !media.matches && !connection?.saveData;
      document.documentElement.dataset.maintenanceBackground = allowed ? 'original-shader' : 'static';
      setActive(allowed);
    };
    update();
    document.addEventListener('visibilitychange', update);
    media.addEventListener('change', update);
    connection?.addEventListener('change', update);
    return () => {
      document.removeEventListener('visibilitychange', update);
      media.removeEventListener('change', update);
      connection?.removeEventListener('change', update);
    };
  }, []);
  return active ? <VisualBoundary><ShaderGradientBackground /></VisualBoundary> : null;
}

function mountBackground() {
  const mount = document.getElementById('maintenance-background');
  if (mount) createRoot(mount).render(<OriginalBackground />);
}

// The decoration downloads independently of the small proof controller. An
// async cache hit may arrive before parsing has reached its mount point.
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mountBackground, { once: true });
else mountBackground();
