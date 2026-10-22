# Public site availability

Ramin requested maintenance mode on 22 October 2026. Keep it enabled until he explicitly asks to reopen the site.

The public homepage contains only the existing name, role and bio, followed by **Under construction**. There are no links, buttons, application scripts, analytics, external resources or public CV actions. All other page, document, legacy, asset and API URLs return HTTP 503 with maintenance content. `robots.txt` is the only infrastructure exception: it returns `Disallow: /`. All responses are non-cacheable and marked noindex.

## Boundaries

- `site/maintenance.mjs` is the source-controlled availability policy. A query parameter or environment variable cannot unlock it.
- `npm run build` cleans generated `dist` and `.vercel/output` directories, then emits only the maintenance homepage and robots file. It emits no portfolio JavaScript, media, readers, manifests or functions.
- `vercel.json` has the same explicit root/robots allowlist and terminal 503 catchall, before any filesystem handling. Original redirects, including CV and presentation, do not run.
- `.vercelignore` excludes API build inputs during maintenance. All six API wrappers also stop at the maintenance guard before calling their core handlers. The Node server checks maintenance before any redirect, API dispatch or static file access; its response does not trust a stale build directory.
- `npm run verify` checks the actual output, stale artifact removal, all known page/alias routes, legacy document routes, API methods, API wrappers and removal of CV actions from both interactive and initial HTML.
- Vercel project Standard Protection was already `all_except_custom_domains`. An unauthenticated probe of a historical deployment URL and its `/cv` route redirected to Vercel authentication. No protection settings were changed.

## Edit privately

Use `npm run dev` on localhost to edit the full portfolio. The normal production build remains locked. The prior portfolio build and verification commands are retained as `build:portfolio` and `verify:portfolio`; they are developer workflows, not an instruction or authorization to publish.

For publication while locked, build and inspect `.vercel/output`, then deploy that exact artifact with `vercel deploy --prebuilt --prod --yes --scope ramin-hoodehs-projects`. It must contain only `config.json`, `static/index.html` and `static/robots.txt`. Run production path and method checks on both custom domains afterward.

## Reopen only on request

Review the updated site first. Reopening requires an intentional source change to the maintenance policy and restoring the normal routing configuration from `config/vercel-portfolio.json` (which has **no CV redirect**). Remove the API deployment exclusion and review the full portfolio release checks together. Do not merely restore the old Vercel config from Git; that would restore the removed CV redirects. Remove any stale generated maintenance output before the normal build/deployment. CV buttons remain removed independently of maintenance.

Website maintenance does not revoke copies previously downloaded or change sharing permissions of independently hosted Google Drive documents.
