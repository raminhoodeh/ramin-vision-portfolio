# Portfolio Source Registry

Scraped and reviewed on 2026-05-14. This file is the Phase -1 source map for the portfolio rebuild.

## Working Rule

Ramin's own wording remains the primary voice and source of truth. Public pages should enrich the portfolio with proof, metadata, links, screenshots, thumbnails, and external validation. Do not let App Store, Udemy, Amazon, or company marketing copy replace the project write-ups unless it is being used as public corroboration.

## Source Quality Key

- **Primary local source:** user-provided wording in the repo. Prefer this for portfolio copy.
- **Public proof source:** public URL that verifies a product, talk, course, repo, article, or asset.
- **Asset lead:** public image, video, app thumbnail, product screenshot, or profile image candidate.
- **Manual/private:** useful but not safely scrapeable, likely authenticated, private, broken, or needing user confirmation.

## Scraped Public Sources

Saved Firecrawl outputs live in `.firecrawl/`.

| Source | URL | Output | Use |
| --- | --- | --- | --- |
| Dreamsea App Store | https://apps.apple.com/us/app/dreamsea/id6761101193 | `.firecrawl/dreamsea-app-store.json` | Public proof, app metadata, privacy/category, App Store link |
| 24Seven Concierge App Store | https://apps.apple.com/us/app/24seven-concierge/id6663954162 | `.firecrawl/24seven-app-store.json` | Public proof, app version history, AI concierge/Dubai proof |
| nsso homepage | https://nsso.me/ | `.firecrawl/nsso-home.json` | Public product positioning, Deity copy, YouTube/asset links |
| Ramin nsso profile | https://nsso.me/ramin | `.firecrawl/nsso-ramin.json` | Profile image, project image leads, public bio/project cards |
| Qadam | http://qadam.trade | `.firecrawl/qadam-trade.json` | Public landing page proof and waitlist copy |
| Mass Social Wisdom Agent GitHub | https://github.com/raminhoodeh/mass-social-wisdom-agent | `.firecrawl/mass-social-wisdom-github.json` | Public repo proof, README features, demo GIF |
| Udemy Product Course | https://www.udemy.com/course/the-fastest-way-to-become-a-product-manager/ | `.firecrawl/udemy-product-course.json` | Course proof, ratings/students, course thumbnail, AI PM update |
| Amazon book page | https://www.amazon.co.uk/Purpose-Ramin-Hoodeh/dp/1527286185 | `.firecrawl/amazon-purpose.json` | Book proof, cover lead, ISBN/page count/date |
| TEDx talk | https://www.ted.com/talks/ramin_hoodeh_existentially_viewing_your_existential_crisis/transcript | `.firecrawl/tedx-ramin.json` | Talk proof, thumbnail, plays, YouTube link |
| Green.org interview | https://green.org/2022/07/13/utilizing-media-to-build-a-sustainable-future/ | `.firecrawl/green-utilizing-media.json` | Public interview proof: GroupM, sustainability, fiction author |
| ZEX PR Wire book article | https://zexprwire.com/tedx-speaker-launches-best-book-to-find-your-purpose-in-2022/ | `.firecrawl/zexprwire-purpose.json` | Book/author positioning proof, lower-confidence PR source |
| Mi3 GroupM article | https://www.mi-3.com.au/20-07-2022/carbon-footprint-different-media-distribution-options-will-increasingly-influence-where | `.firecrawl/mi3-carbon-calculator.json` | External context for GroupM carbon calculator |
| Microsoft OS Places connector | https://docs.microsoft.com/en-gb/connectors/ordnancesurveyplaces/ | `.firecrawl/microsoft-ordnance-survey-places.json` | External proof the connector exists |

## Manual, Broken, or Low-Value Sources

| Source | URL | Status | Recommendation |
| --- | --- | --- | --- |
| LinkedIn | http://bit.ly/raminlinkedin | Manual/private-ish | Keep as link only; don't scrape for copy. |
| Notion AI-Native Product OS | https://www.notion.so/AI-Native-Product-OS-cfa6fe2ecf3783649ab68152765cc260?pvs=21 | Manual/private | Use local thesis write-up as source. Ask for public link later. |
| Notion AI PM course structure | https://www.notion.so/AI-PM-Course-Structure-3476fe2ecf3780efb887d6b533c95974?pvs=21 | Manual/private | Ask for public course/landing page when ready. |
| Google Drive conversation mediator | https://drive.google.com/file/d/19Ln-UWxReuAFTFdDc4JBZHdDxzeBPmwt/view?usp=sharing | Manual/private | Keep as optional proof link if user confirms it is public. |
| Google Doc favourite AI tools | Google Docs URL in resume | Manual/private | Do not depend on it for site content. |
| Old portfolio home | http://www.ramin.vision/ | Broken scrape, Vercel 404 | Replace with new portfolio once this site is ready. |
| Old product process page | https://www.ramin.vision/product.html | Broken scrape, Vercel 404 | Do not use as public proof. |
| Old decision framework page | https://www.ramin.vision/decision | Broken scrape, Vercel 404 | Do not use as public proof. |
| nsso Dreamsea landing page | http://nsso.me/dreamsea | Scraped as 404 | Use App Store and local write-up instead. |
| WhatsApp deep link | `wa.me` / `wa.link` URLs | Action link, not content source | Keep only for contact/booking flows where appropriate. |
| `link-coming-soon.com` | http://link-coming-soon.com/ | Placeholder | Remove from public-facing site. |
| FT Urgentem article | https://www.ft.com/content/7b734848-1287-4106-b866-7d07bc9d7eb8 | Likely paywalled | Keep as external proof link only. |
| EC solar paper | EC PDF URL in resume/nsso profile | PDF/manual | Ask whether to parse PDF later; good proof for ERM section. |

## Seven Portfolio Content Types

### 1. Identity, Bio & AI PM Thesis

**Primary local sources**

- `ramin-hoodeh-exp-context.md`
- `overall-structure-context.md`
- `Project Write-ups/ai-native-product-os-ramins-ai-product-management-thesis.md`

**Public proof / enrichment**

- `nsso.me/ramin` confirms public identity as "Ramin Hoodeh", "AI Builder | Fiction Author", email, profile image, project cards, experience/qualification lists.
- `nsso.me` gives the nsso product positioning: future-proofing yourself, unified professional world, sovereign networking super app, AI-assisted profile creation.
- Udemy course page confirms the AI-Native Product OS is already being attached to the product course as a future-facing update.

**Implementation guidance**

- Use the user-provided hero wording: "A Product [Manager/Engineer/Teacher] and Fiction Author."
- For the thesis, stay close to the local write-up wording: "The operating system broke", deterministic vs probabilistic, the 5-Layer Stack, and the Talk → Decide → Build → Observe → Iterate loop.
- Public sources can add proof chips: `AI Builder | Fiction Author`, `Udemy AI PM update`, `nsso public identity`.

**Asset leads**

- Local profile image: `ramin-hoodeh-profile-pic.png`
- Public nsso profile avatar: `https://ymckairbwictbfsfpqzt.supabase.co/storage/v1/object/public/avatars/43b7d922-a559-4432-9eaa-89241fac64d1/1767032029933.jpg`
- nsso Deity assets: `https://www.nsso.me/nsso-agent-avatar.png`, `https://www.nsso.me/deity%20logo%20white.png`

**Missing / ask Ramin**

- Final preferred profile image.
- Whether to use `RH` monogram or a real personal logo.
- Public Notion/Maven/course link for the AI-Native Product OS when ready.

### 2. Product Management Experience

**Primary local source**

- `ramin-hoodeh-exp-context.md`

**Public proof / enrichment**

- Green.org interview confirms Ramin as Product Manager at GroupM and spiritual fiction writer.
- Mi3 article validates the GroupM carbon calculator industry context; use as context, not direct personal authorship proof.
- Microsoft Learn validates the Ordnance Survey Places connector existed on Power Platform.
- nsso profile gives an older public experience list and project cards for Carbon Calculator, Manheim Express, OS Maps API, Climate Risk Analytics Platform, TEDx, and EC paper.

**Implementation guidance**

- The resume remains the canonical source for roles, dates, and metrics.
- Use public sources as external "proof links" on right-side cards in the expanded Experience deep dive.
- Do not scrape or depend on company homepages except for logos/domain context.
- Treat old `ramin.vision` proof links as broken and replace/remove in the new portfolio.

**Missing / ask Ramin**

- Company logos or permission to use public logos.
- Which metrics are safe to mention publicly for Bayut and Side.inc.
- Whether to include Urgentem and Merdad Collection in the new portfolio timeline.
- Whether the current Bayut title should be `AI Product Manager` or `Product Manager`.

### 3. Personal Projects / Selfware

**Primary local sources**

- `Project Write-ups/nsso - Portfolio Write-Up.md`
- `Project Write-ups/Dreamsea - Portfolio Write-up.md`
- `Project Write-ups/Qadam - Portfolio Write-Up.md`
- `Project Write-ups/24Seven - Portfolio Write-up.md`
- `Project Write-ups/RazinFlix - Portfolio-Write-up.md`
- `Project Write-ups/Mass Social Wisdom Agent - Portfolio Write-up.md`

**Public proof / enrichment by project**

| Project | Primary wording to preserve | Public proof | Asset leads |
| --- | --- | --- | --- |
| nsso | "Professional identity online is a fragmentation problem masquerading as a presentation problem." | https://nsso.me/ and https://nsso.me/ramin | `premium-bezel.png`, Deity avatar, nsso project image from profile |
| Dreamsea | "Every morning I'd wake from a vivid dream and immediately lose it..." | App Store page, nsso profile card | App Store link, nsso project image |
| Qadam | "Qadam was built to occupy that window: the gap between physical reality and market awareness." | http://qadam.trade | Needs real screenshot/diagram; current public page has no images |
| 24Seven Concierge | "The gap was not in the inventory; it was in the bridge between intent and transaction." | App Store page | App Store link, nsso project image |
| RazinFlix | "I had been maintaining a personal film library as a spreadsheet for years..." | nsso profile card / `nsso.me/film/razinflix` link | nsso project image |
| Mass Social Wisdom Agent | "The existing tools treated every piece of content as a link to preserve, not knowledge to extract and organise." | GitHub repo | README badges, demo GIF, repo link |

**Public metadata to use**

- Dreamsea App Store: Health & Fitness, developer Ramin Hoodeh, version 2.5, privacy says data not collected, iPhone/iPad availability.
- 24Seven App Store: Travel, developer Ramin Hoodeh, version 1.2.4, Dubai launch, AI Concierge Chatbot, calendar booking system.
- Qadam public page: early access from July 23, 2026; "A hedge fund team that fits inside your laptop"; Python COO, local LLM Research Analyst, frontier LLM Strategy Lead, quantum Head of Quant; 500+ data feeds.
- Mass Social Wisdom Agent GitHub: public repo, Flask/Gemini/SociaVault, demo animation, folders for Scan/Processed/Results, `.docx` exports.

**Missing / ask Ramin**

- Live screenshots or short videos for nsso, Dreamsea, Qadam, 24Seven, RazinFlix.
- Project logos if they exist.
- Public repo links for nsso, Dreamsea, Qadam, 24Seven, RazinFlix if any are safe to share.
- Demo links or Loom walkthroughs for projects without public apps.

### 4. Tools & Systems

**Primary local sources**

- `Project Write-ups/ai-native-product-os-ramins-ai-product-management-thesis.md`
- nsso and Dreamsea project write-ups for RAG/context/orchestration examples.
- Mass Social Wisdom Agent write-up for autonomous workflow example.

**Public proof / enrichment**

- Udemy page confirms the product course now includes access to the AI-Native Product OS update.
- GitHub repo proves an actual agent workflow exists for Mass Social Wisdom Agent.
- nsso public copy proves Deity and AI-assisted profile creation are live enough to explain.

**Implementation guidance**

- This section should not look like project thumbnails. It should look like architecture: stack cards, workflow diagrams, eval/governance slots, and tool-call loops.
- Use the AI-Native Product OS as the anchor, then show real examples beneath it: Deity, Dreamsea generation pipeline, 24Seven AI concierge, Mass Social Wisdom Agent.

**Missing / ask Ramin**

- AI Costs Dashboard description and screenshots.
- RAG Pipeline screenshots/diagrams for nsso/Dreamsea.
- Any architecture diagrams already drawn in Notion/Figma.

### 5. Qualifications

**Primary local source**

- `ramin-hoodeh-exp-context.md`

**Canonical qualification groups**

- AI credentials: IBM AI Engineering Professional Certificate, Google Professional Machine Learning Engineer, Google Generative AI Leader, Anthropic MCP Protocols Advanced Topics.
- Education: MSc Environmental Technology with Distinction, Imperial College London; BA Business and Marketing with 1st Class Honours, University of Northampton.
- Leadership: MBTi Leadership Development Programme.

**Public proof / enrichment**

- nsso profile has a public qualification list, but it does not include the newer 2026 AI credentials. Treat it as stale or partial.
- No public certificate verification links were discovered in this scrape set.

**Implementation guidance**

- Qualifications deserve their own `Credential Stack`, not a generic stat row.
- Public proof should be optional badges/links when supplied; the resume is the canonical source for now.

**Missing / ask Ramin**

- Certificate images or verification links for IBM, Google AI School, Anthropic Academy, MBTi.
- Institution logos for Imperial and University of Northampton.
- Whether to include Nuclio, Personal Trainer Level 3, Renewable Energy Finance, and other older nsso-profile qualifications.

### 6. Teaching, Speaking & Writing

**Primary local sources**

- `ramin-hoodeh-exp-context.md`
- `overall-structure-context.md`
- `Project Write-ups/Framework of Metacognition.md`

**Public proof / enrichment**

- Udemy course: `The Fastest Path to Product Management`, created by Ramin Hoodeh, 4.8 rating, 162 ratings/reviews, 4,871 students, last updated 6/2025, includes AI-Native Product OS update.
- TED page: `Existentially viewing your existential crisis`, Ramin Hoodeh, TEDxImperialCollege, June 2018, 42,969 plays at scrape time, YouTube link available.
- Amazon: `The Proposition: Purpose`, paperback, 6 Dec. 2021, author Ramin Hoodeh, 385 pages, ISBN-10 1527286185, ISBN-13 978-1527286184, 5.0 rating with 14 ratings at scrape time.
- Green.org interview: Product Manager at GroupM, spiritual fiction author, sustainability framing.
- ZEX PR Wire: lower-confidence PR source for book positioning and author bio.

**Implementation guidance**

- This section should prove "Teacher" and "Fiction Author" from the hero.
- Keep the public metrics as proof chips, not the main story.
- Prefer Ramin's own framing for The Proposition: spiritual fiction / metaphysical enquiry / philosophical consciousness.

**Asset leads**

- Udemy course thumbnail from scrape.
- TED thumbnail from scrape.
- Amazon cover image from scrape.
- nsso project images for TEDx and fiction book advertisement.

**Missing / ask Ramin**

- Final AI PM course link.
- Book cover image if a higher-quality file exists.
- TEDx thumbnail preference.
- Framework of Metacognition final/public version.

### 7. AI Ramin Chatbot

**Primary local sources**

- `overall-structure-context.md`
- `ramin-hoodeh-exp-context.md`
- All project write-ups after enrichment.

**Public proof / enrichment**

- nsso homepage and nsso write-up provide the strongest adjacent precedent via Deity: an agentic AI profile coach with profile context and controlled mutations.

**Implementation guidance**

- For now, build as a polished prototype panel with strict source/guardrail copy.
- Do not imply the chatbot is live unless it is actually wired.
- Allowed future knowledge sources should be this repo's curated content files, not raw scraped pages.

**Missing / ask Ramin**

- Allowed sources for AI Ramin.
- Disallowed claims and sensitive topics.
- Preferred answer tone.
- Model/provider preference when implementation begins.

