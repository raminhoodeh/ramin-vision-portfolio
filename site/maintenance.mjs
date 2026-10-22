// This isolated preview branch opens the full portfolio behind Vercel Authentication.
// The production branch keeps its independent, source-controlled maintenance lock.
export const maintenanceEnabled = false;

export const maintenanceHeaders = {
  'Cache-Control': 'no-store, max-age=0, must-revalidate',
  'CDN-Cache-Control': 'no-store',
  'Vercel-CDN-Cache-Control': 'no-store',
  'X-Robots-Tag': 'noindex, nofollow, noarchive, nosnippet',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'no-referrer',
  'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
  'X-Portfolio-Availability': 'maintenance',
};

export const maintenanceRobots = 'User-agent: *\nDisallow: /\n';

export function maintenanceResponse(pathname, method = 'GET') {
  const canRead = method === 'GET' || method === 'HEAD';
  if (canRead && pathname === '/') return { status: 200, file: 'index.html', contentType: 'text/html; charset=utf-8' };
  if (canRead && pathname === '/robots.txt') return { status: 200, file: 'robots.txt', contentType: 'text/plain; charset=utf-8' };
  return { status: 503, file: 'index.html', contentType: 'text/html; charset=utf-8', retryAfter: '86400' };
}

export function maintenanceRoutes() {
  return [
    { src: '^/$', methods: ['GET', 'HEAD'], dest: '/index.html', headers: maintenanceHeaders },
    { src: '^/robots\\.txt$', methods: ['GET', 'HEAD'], dest: '/robots.txt', headers: maintenanceHeaders },
    // Deliberately before any filesystem phase: no API, old asset, document,
    // encoded/legacy URL or query parameter can bypass the maintenance page.
    { src: '^/.*$', status: 503, dest: '/index.html', headers: { ...maintenanceHeaders, 'Retry-After': '86400' } },
  ];
}
