# Public site availability

Ramin requested maintenance mode on 22 October 2026. Keep it enabled until he explicitly asks to reopen the site.

The public homepage contains the existing name, role and bio, followed by **Under construction**, a precautionary security notice and three explicitly approved contact links: Email, LinkedIn and WhatsApp. The contact anchors use self-contained Tahoe glass styling and decorative inline SVG, with the email address also readable as text. There is no portfolio navigation, application script, analytics, external resource or public CV action. All other page, document, legacy, asset and API URLs return HTTP 503 with maintenance content. `robots.txt` is the only infrastructure exception: it returns `Disallow: /`. All responses are non-cacheable and marked noindex.

## Boundaries

- `site/maintenance.mjs` is the source-controlled availability policy. A query parameter or environment variable cannot unlock it.
- `npm run build` cleans generated `dist` and `.vercel/output` directories, then emits only the maintenance homepage and robots file. It emits no portfolio JavaScript, media, readers, manifests or functions.
- `vercel.json` has the same explicit root/robots allowlist and terminal 503 catchall, before any filesystem handling. Original redirects, including CV and presentation, do not run.
- `.vercelignore` excludes API build inputs during maintenance. All six API wrappers also stop at the maintenance guard before calling their core handlers. The Node server checks maintenance before any redirect, API dispatch or static file access; its response does not trust a stale build directory.
- `npm run verify` checks the actual output, stale artifact removal, all known page/alias routes, legacy document routes, API methods, API wrappers and removal of CV actions from both interactive and initial HTML.
- Contact access is limited to exactly `mailto:raminhoodeh@gmail.com`, `https://www.linkedin.com/in/raminhoodeh` and `https://wa.link/7g31wi`. Local and live verification share an independent allowlist assertion; 16 negative fixtures reject extra/internal/encoded URLs, missing contact labels, scripts and external resources. Contact styling does not require application code or a change to the content security policy.
- Vercel project Standard Protection was already `all_except_custom_domains`. An unauthenticated probe of a historical deployment URL and its `/cv` route redirected to Vercel authentication. No protection settings were changed.

## Edit privately

Use `npm run dev` on localhost to edit the full portfolio. The normal production build remains locked. The prior portfolio build and verification commands are retained as `build:portfolio` and `verify:portfolio`; they are developer workflows, not an instruction or authorization to publish.

For publication while locked, build and inspect `.vercel/output`, then deploy that exact artifact with `vercel deploy --prebuilt --prod --yes --scope ramin-hoodehs-projects`. It must contain only `config.json`, `static/index.html` and `static/robots.txt`. Run production path and method checks on both custom domains afterward.

Use `npm run check:maintenance-live -- --output /path/to/report.json` for that production check. Vercel itself completes OPTIONS preflights with an empty HTTP 204, retaining the maintenance headers; the verifier accepts only that specific empty platform response. GET/HEAD page requests and API data methods remain blocked with HTTP 503, and the deployment contains no functions to execute.

## Reopen only on request

Review the updated site first. Reopening requires an intentional source change to the maintenance policy and restoring the normal routing configuration from `config/vercel-portfolio.json` (which has **no CV redirect**). Remove the API deployment exclusion and review the full portfolio release checks together. Do not merely restore the old Vercel config from Git; that would restore the removed CV redirects. Remove any stale generated maintenance output before the normal build/deployment. CV buttons remain removed independently of maintenance.

Website maintenance does not revoke copies previously downloaded or change sharing permissions of independently hosted Google Drive documents.

## Initial lock release verification, 22 October 2026

- Runtime commit `7fff50b`, deployment `dpl_J7zXX8Nw7JqoQoyYZAyAkYu2dLVg`, READY. Prebuilt upload was 5.1 KB and contained only the allowlisted static artifact and routing file.
- `npm run verify` passed: clean homepage-only build; 177 actual local/edge blocked paths; stale generated-page/asset/function removal; six API wrappers with 24 real maintenance responses; public CV actions absent from Hero, Contact, stories, error fallback and initial HTML.
- Public verification: **372/372 checks passed** across apex and www, including both homepages, disabled document redirects, all published/legacy routes, old HTML/chunk/media/discovery paths, API data methods and two empty platform preflights. Initial strict-503 results were retained separately before documenting Vercel’s preflight behaviour.
- Browser verification: homepage name/bio followed by the notice, zero links/buttons/navigation/scripts, readable at desktop and actual 390×844 mobile, no horizontal overflow. Screenshot and full results are in the workspace `verification` directory. Browser viewport override was reset.
- Existing Standard Protection already guards historical generated deployment URLs with Vercel Authentication. No account/protection changes, provider requests or real feedback submissions were performed.

## Security notice and contact update, 22 October 2026

Ramin requested a public explanation of the precautionary lockdown following the recent PHP security incident, preparation for restoration on more secure infrastructure and particular care around the site's embedded AI features. The notice describes restoration as work still to be completed; it makes no claim of a confirmed compromise, a completed security audit or a completed infrastructure migration.

Context was checked against [ARN News Centre's Reuters report of 21 October 2026](https://www.arnnewscentre.ae/news/international/european-government-websites-go-dark-as-software-flaw-sparks-security-scramble/) and the [PHP project's critical CVE-2026-109618 advisory](https://github.com/php/php-src/security/advisories/GHSA-w8hw-w9fx-j79w), published the same day. These sources establish the incident being referenced; they do not establish that this portfolio was affected. The public maintenance artifact remains a static page with no PHP runtime or server functions.

The approved contact destinations were retained from `src/data/resources.ts` and `src/data/content.ts`. The private preview fork remains separate from this public notice update. Publication uses the same allowlisted prebuilt maintenance artifact and preserves the existing routing, security headers, API exclusions, CV removal and Vercel Authentication protection.
