# Private portfolio preview

This is the isolated `codex/site-preview` branch, forked from maintenance commit `d618619`. The public `ramin.vision` / `www.ramin.vision` domains stay on their maintenance deployment. This branch opens the full portfolio only in a protected Vercel Preview. CV links and redirects remain removed.

Latest tested preview (22 October 2026): https://portfolio-3m0lxozla-ramin-hoodehs-projects.vercel.app/ — includes the homepage glass carousel and approved revenue, payments and teaching positioning. The latest refresh was checked for build success and authentication protection; its hosted private UI was not rechecked in a browser. See `docs/glass-carousel.md` for the carousel implementation and earlier verification. Earlier preview URLs below are historical snapshots.

## Edit and test

Use this checkout, separate from the public-site checkout:

`/Users/raminhoodeh/.codex/worktrees/portfolio-preview/raminhoodeh`

- `npm run dev` opens the development site at `http://127.0.0.1:4183` with live updates.
- `npm run verify:preview` runs the content, accessibility, claims, offline AI, navigation, complete build, HTTP and performance checks. It requires the full site; a maintenance response cannot satisfy it.
- `npm start` serves the most recent built site at the same local address. Stop a development server on that port first.
- Commit reviewed edits on `codex/site-preview`, then use `npm run deploy:preview` to refresh the hosted preview. It always targets Preview in the existing `ramin-hoodehs-projects/portfolio` project. It checks the account's Vercel Authentication protection before upload and confirms the Production deployment remains unchanged afterward.

The linked `.vercel/project.json` is local and ignored. A new clone can use `vercel link --project portfolio --scope ramin-hoodehs-projects` to recreate it. Never commit local environment files or credentials.

## Access and indexing

Open the generated Preview URL and sign in with the Vercel account that owns this project. Existing Standard Protection requires authentication on generated deployment URLs. Do not disable this setting or make a public bypass link to share unfinished work.

Preview responses, static HTML and client navigation use noindex/nofollow/noarchive; robots disallows every path. Production canonicals remain in place, and social images are served from the preview itself. Preview journey events are classified as QA by the existing server handler. The Gemini account issue is still deferred: provider-backed AI answers are not certified by the offline checks.

## Publish when Ramin requests it

This branch deliberately refuses a normal Vercel Production build. A protected Preview is not a release authorization. Keep editing and deploying Preview until Ramin explicitly asks to publish.

At release, review the final commit; turn off `portfolioPreview` in `src/seo/routes.mjs`; intentionally disable maintenance in the production release; restore `config/vercel-portfolio.json` (which has no CV redirects) as the production configuration; retain API inputs and the CV removal; restore the normal verification/build workflow. Rebuild with Production settings and run the release gates. Then deploy that reviewed production build and verify both custom domains, deep links, assets, redirects, removed CV access, APIs and indexing. Do not promote this Preview artifact directly: its noindex settings are part of the built JavaScript and HTML.

The historical maintenance design and its production evidence are retained in `docs/site-availability.md`. That file describes the public branch, not the availability of this Preview fork.

## Homepage positioning refresh

22 October 2026: Preview deployment `dpl_FQRKaBq4Kr6PxymEE2WraRp2kEtf` is READY at the latest URL above, with runtime commit `b38f6f0`. The update adds the approved revenue headline without an em dash, the same-line payments and embedded-finance specialism in lighter Instrument Serif, the money-movement line, and the three connected strengths. Only four shared homepage files changed; the carousel, Preview configuration and protection were retained.

`check:content`, `check:next-priority` (including 53 parser route/anchor cases), `check:accessibility`, `check:glass-carousel` (47 behavioural cases), `git diff --check` and `build:portfolio` passed. The build prerendered 27 readable noindex Preview pages. Existing asset and large-chunk warnings remain. The matching public maintenance homepage was browser-tested at 390px and 320px: the title remained on one line, the serif suffix used weight 400, and there was no horizontal overflow. These public-page observations are not a new hosted private-browser check. The complete `verify:preview` suite was not rerun for this refresh.

The guarded `npm run deploy:preview` command confirmed the Production target remained unchanged after deployment. A separate project check confirmed Production was still `dpl_5B1CxGrCdJqVZsjo2n5S2TnaWwof` and Vercel Authentication remained `all_except_custom_domains`. An anonymous request to the new immutable Preview URL returned HTTP 302 to `vercel.com/sso-api` with `X-Robots-Tag: noindex`; no bypass was used. No live AI provider requests or feedback submissions were made. The deployment log is `/tmp/homepage-positioning-preview-deploy.log`.

## Initial verification

22 October 2026: `npm run verify:preview` passed, including 27 readable routes, aliases and section routes; no CV links; Preview noindex in metadata/headers; robots; real 404s; same-origin social images; content/accessibility/claims and offline AI checks. A negative Production-build preflight was rejected as intended. Existing Vite asset/chunk warnings remain. No provider generation or real feedback was submitted.

Hosted Preview: https://portfolio-9qy9p2xt0-ramin-hoodehs-projects.vercel.app/ — READY, Preview target, deployment `dpl_GJYWZ5wpaJsJabL8UZqmEgYuiN6J`, runtime commit `2705e09`.

Vercel sign-in succeeded through the existing Google session. Hosted browser checks passed for Home, Products, project-reader open/close, a cold `/projects/nsso` deep link, Contact, mobile menu navigation at 390×844 without horizontal overflow, Preview robots metadata after navigation, and the unavailable `/cv` address. Anonymous requests were denied on all 35 tested Preview paths, including all 27 pages, assets, APIs and CV paths. The public-site maintenance verifier passed 372/372 checks, and the deployment helper confirmed the production target was unchanged. Temporary browser viewport settings were reset. The public domains were never aliased to this Preview.

Screenshot and machine-readable protection/production checks are in `/Users/raminhoodeh/Desktop/website/verification`. Future refreshes print a new immutable Preview URL; this initial link remains a snapshot of the tested version.
