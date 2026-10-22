// Public availability is source-controlled. Keep enabled until Ramin explicitly
// asks to reopen the portfolio. Private localhost editing can still use Vite.
export const maintenanceEnabled = true;

// The only files exposed while the portfolio is locked. These are reviewed,
// decorative homepage assets; no application entry, router or API is emitted.
export const maintenanceAssets = Object.freeze({
  '/_maintenance/background.js': { file: '_maintenance/background.js', contentType: 'text/javascript; charset=utf-8' },
  '/_maintenance/inter-latin.woff2': { file: '_maintenance/inter-latin.woff2', contentType: 'font/woff2' },
  '/_maintenance/instrument-serif-italic-latin.woff2': { file: '_maintenance/instrument-serif-italic-latin.woff2', contentType: 'font/woff2' },
});

export const maintenanceHeaders = {
  'Cache-Control': 'no-store, max-age=0, must-revalidate',
  'CDN-Cache-Control': 'no-store',
  'Vercel-CDN-Cache-Control': 'no-store',
  'X-Robots-Tag': 'noindex, nofollow, noarchive, nosnippet',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'no-referrer',
  'Content-Security-Policy': "default-src 'none'; script-src 'self'; connect-src 'none'; style-src 'unsafe-inline'; font-src 'self'; img-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
  'X-Portfolio-Availability': 'maintenance',
};

export const maintenanceRobots = 'User-agent: *\nDisallow: /\n';

export function maintenanceResponse(pathname, method = 'GET') {
  const canRead = method === 'GET' || method === 'HEAD';
  if (canRead && pathname === '/') return { status: 200, file: 'index.html', contentType: 'text/html; charset=utf-8' };
  if (canRead && pathname === '/robots.txt') return { status: 200, file: 'robots.txt', contentType: 'text/plain; charset=utf-8' };
  if (canRead && Object.hasOwn(maintenanceAssets, pathname)) return { status: 200, ...maintenanceAssets[pathname], asset: true };
  return { status: 503, file: 'index.html', contentType: 'text/html; charset=utf-8', retryAfter: '86400' };
}

export function maintenanceRoutes() {
  return [
    { src: '^/$', caseSensitive: true, methods: ['GET', 'HEAD'], dest: '/index.html', headers: maintenanceHeaders },
    { src: '^/robots\\.txt$', caseSensitive: true, methods: ['GET', 'HEAD'], dest: '/robots.txt', headers: maintenanceHeaders },
    ...Object.entries(maintenanceAssets).map(([pathname, asset]) => ({
      src: `^${pathname.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`,
      caseSensitive: true,
      methods: ['GET', 'HEAD'], dest: `/${asset.file}`, headers: { ...maintenanceHeaders, 'Content-Type': asset.contentType },
    })),
    // Deliberately before any filesystem phase: no API, old asset, document,
    // encoded/legacy URL or query parameter can bypass the maintenance page.
    { src: '^/.*$', status: 503, dest: '/index.html', headers: { ...maintenanceHeaders, 'Retry-After': '86400' } },
  ];
}
