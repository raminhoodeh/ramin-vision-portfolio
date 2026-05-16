# 02 Experience & Education

## Purpose

Present professional product management credibility and formal education/certification in one coherent section.

## Public Anchor

- `experience-education`

## Navigation Spec

- Bottom nav label: `Work`
- Nav target: `experience-education`
- Icon: `work`
- Current implementation: selected through the bottom liquid-glass `BottomNavigation` bar.
- On selection, `activeSection` becomes `experience-education`, the hash becomes `#experience-education`, and `ActivePortfolioSection` mounts only `ExperienceEducationSection`.
- This section replaces the older split between `Work` and `Qualifications`; those must not return as separate public nav items.

## Source Data

- `portfolioContent.productManagementWorkExperiences`
- `portfolioContent.qualifications`

## Required Intro

The section intro must communicate proven experience across multiple industries in start-ups and SMEs.

## Product Management Work Experiences

Include exactly these companies:

- Bayut
- SIDE
- Perkbox
- GroupM
- Cox Auto
- Ordnance Survey
- Deity AI
- ERM
- Tesla

## Required Work Item Fields

Each company item must support:

- `companyLogo`
- `companyName`
- `productVideo`
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

## Qualifications

Include exactly:

- Imperial College MSc
- University of Northampton BA

Each qualification item must support:

- `institutionLogo`
- `institutionName`
- `qualification`
- `qualificationType`
- `gradeAchieved`
- `howThisHelpedAsPm`

## Certifications

Include exactly:

- IBM AI Engineer Certification
- Google Professional Machine Learning Engineer
- Google Generative AI Leader
- Anthropic MCP Advanced Topics
- MBTi Leadership Development Programme

Each certification item must support:

- `awardingBodyLogo`
- `awardingBodyName`
- `certificationName`
- `certificationLink`
- `modulesIncluded`
- `howThisHelpedAsPm`

## Required UX

- Work experience and education must live in the same public section.
- Qualifications and certifications must not appear as a separate top-level nav section.
- Each company should use the same repeatable form factor.
- Each qualification/certification should use a consistent credential form factor.
- Missing assets must appear as intentional slots, not broken media.

## Implementation Checklist

- [ ] Structural nav label is `Experience & Education`.
- [ ] Bottom nav display label is `Work`.
- [ ] Public target is `experience-education`.
- [ ] All nine companies appear exactly once.
- [ ] Both qualifications appear exactly once.
- [ ] All five certifications appear exactly once.
- [ ] No separate public `Work` or `Qualifications` section remains.
- [ ] All missing proof uses placeholders.

## Acceptance Test

The section reads as a single evidence stack: career experience first, then qualifications and certifications supporting the same PM credibility story.
