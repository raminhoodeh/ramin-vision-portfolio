# 02 Experience & Education

## Purpose

Present professional product management credibility, formal education, and certifications as one coherent evidence stack.

## Public Anchor

- `experience-education`

## Navigation Spec

- Bottom nav label: `Work`
- Nav target: `experience-education`
- Icon: `work`
- Current implementation: selected through the shared bottom liquid-glass `BottomNavigation`.
- On selection, `activeSection` becomes `experience-education`, the hash becomes `#experience-education`, and `ActivePortfolioSection` mounts only `ExperienceEducationSection`.
- This section replaces the older split between `Work` and `Qualifications`; those must not return as separate public nav items.

## Current Implementation Files

- `src/App.tsx`: mounts `ExperienceEducationSection` for `experience-education`
- `src/components/ExperienceEducationSection.tsx`: section layout, work rail, active work details, video preview, education card
- `src/data/portfolio.ts`: work experience, qualifications, certifications, and placeholder helpers
- `src/index.css`: portfolio stage, liquid-glass panels, section-level responsive styling

## Current Component Model

The current section is built from these primary components:

- `ExperienceEducationSection`
- `WorkFloatingHeader`
- `ProductManagementWorkRail`
- `ProductManagementWorkCard`
- `ProductVideoPreview`
- `EducationCard`
- `EducationDegreeTile`
- `EducationCertificateTile`

## Source Data

- `portfolioContent.productManagementWorkExperiences`
- `portfolioContent.qualifications.qualifications`
- `portfolioContent.qualifications.certifications`

## Required Intro

The intro should communicate proven product experience across complex product environments, including fintech, climate, geospatial, ecommerce, start-ups, SMEs, governments, and corporates.

## Current Work Experience Data

The current implementation renders exactly 10 work cards from `portfolioContent.productManagementWorkExperiences.companies`:

- Bayut
- SIDE
- Perkbox Vivup
- WPP Media, with previous company name `GroupM`
- Cox Auto, with full company name `Cox Automotive`
- Ordnance Survey
- Urgentem
- Deity AI
- ERM
- Tesla

## Required Work Item Fields

Each company item should support:

- `companyLogo`
- `companyName`
- `fullCompanyName`
- `previousCompanyName`
- `productVideo`
- `productVideoUrl`
- `location`
- `monthYearRangeWorked`
- `jobTitle`
- `companyDescription`
- `industryTag`
- `productsWorkedOn`
- `mainAchievements`
- `processesIntroducedManagerial`
- `marketType`
- `customerClientTypesAndUserNumbers`
- `reviews`

Missing assets must render as intentional placeholders rather than broken media.

## Current Work UX

- The section fills the portfolio stage and uses `id="experience-education"`.
- The top-left header shows `02 / Work`, `Experiences & Qualifications`, and the current section intro.
- Desktop layout uses a two-column evidence composition: left context column and right work rail.
- The right column maps all company cards in a repeatable card form.
- Cards are clickable and keyboard-accessible through `role="button"` plus Enter/Space handling.
- The active card expands to show context, market/user detail, products, achievements, processes, and reviews when present.
- Selecting a work card scrolls that card into the stage viewport.
- The left context column shows the selected work video preview when media exists or a deliberate placeholder otherwise.
- Local company videos are resolved through imported media assets in `src/company-videos`.

## Qualifications

The current implementation renders exactly two degree rows:

- Imperial College London, MSc Environmental Technology
- University of Northampton, BA Business and Marketing

Each qualification item should support:

- `institutionLogo`
- `institutionName`
- `qualification`
- `qualificationType`
- `gradeAchieved`
- `year`
- `modulesIncluded`
- `howThisHelpedAsPm`
- `qualificationLink`

## Certifications

The current implementation renders exactly five certification rows:

- IBM AI Engineer Certification
- Google AI School Professional Machine Learning Engineer
- Google AI School Generative AI Leader
- Anthropic Academy MCP Advanced Topics
- MBTi Leadership Development Programme

Each certification item should support:

- `awardingBodyLogo`
- `awardingBodyName`
- `certificationName`
- `certificationLink`
- `modulesIncluded`
- `howThisHelpedAsPm`

## Current Education UX

- Degrees and certifications live inside one `EducationCard` in the left column.
- The card toggles between `Degrees` and `Certifications`.
- Degrees render as two compact rows with institution, qualification, grade/year, topic pills, and PM relevance copy.
- Certifications render compactly by default and expand details when the certifications tab is selected.
- Link placeholders appear as intentional pills when proof links are missing.

## Required UX Rules

- Work experience and education must live in the same public section.
- Qualifications and certifications must not appear as a separate top-level nav section.
- Each company should use the same repeatable form factor.
- Each qualification/certification should use a consistent credential form factor.
- Missing logos, videos, links, reviews, and proof should use placeholders from the data layer.

## Implementation Checklist

- [ ] Structural nav label is `Experience & Education`.
- [ ] Bottom nav display label is `Work`.
- [ ] Public target is `experience-education`.
- [ ] `ActivePortfolioSection` mounts `ExperienceEducationSection`.
- [ ] All 10 work cards appear exactly once.
- [ ] Both qualifications appear exactly once.
- [ ] All five certifications appear exactly once.
- [ ] Work cards are keyboard-accessible.
- [ ] No separate public `Work` or `Qualifications` section remains.
- [ ] All missing proof uses intentional placeholders.

## Acceptance Test

The section should read as one evidence stack: current and historical product work first, with qualifications and certifications supporting the same product management credibility story.
