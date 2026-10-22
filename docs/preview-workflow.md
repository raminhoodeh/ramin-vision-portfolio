# Private portfolio preview

This is the isolated `codex/site-preview` branch, forked from maintenance commit `d618619`. The public `ramin.vision` / `www.ramin.vision` domains stay on their maintenance deployment. This branch opens the full portfolio only in a protected Vercel Preview. CV links and redirects remain removed.

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

## Initial verification

22 October 2026: `npm run verify:preview` passed, including 27 readable routes, aliases and section routes; no CV links; Preview noindex in metadata/headers; robots; real 404s; same-origin social images; content/accessibility/claims and offline AI checks. A negative Production-build preflight was rejected as intended. Existing Vite asset/chunk warnings remain. No provider generation or real feedback was submitted.
