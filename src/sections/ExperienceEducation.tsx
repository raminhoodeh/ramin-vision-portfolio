import { useCallback, useEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { portfolioContent } from '../data/portfolio';
import { type ProductManagementWorkExperience } from './types';
import { resolveCompanyLogoSrc, resolveWorkVideoSrc, displayWorkCompanyName } from '../lib/assets';
import {
  getInitials,
  conciseCredentialSummary,
  educationCredentialChipName,
  educationIssuerChipName,
  formatSourceStatus,
} from '../lib/text';
import {
  contentItemsToText,
  publicWorkValue,
  type PlaceholderLike,
} from '../lib/placeholder';
import { preloadWorkVideoForEntry, preloadWorkVideos } from '../performance/workVideoPreload';

function CompanyLogoMark({
  logo,
  name,
  className = '',
}: {
  logo: string | PlaceholderLike | undefined;
  name: string;
  className?: string;
}) {
  const logoSrc = resolveCompanyLogoSrc(logo);

  return (
    <span
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-[1rem] text-center text-[0.58rem] font-semibold uppercase leading-none tracking-[0.12em] text-muted ${
        logoSrc ? 'bg-transparent' : 'bg-white/45 shadow-[inset_0_1px_0_rgba(255,255,255,0.42)]'
      } ${className}`}
      aria-hidden="true"
    >
      {logoSrc ? (
        <img
          src={logoSrc}
          alt=""
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
        />
      ) : (
        getInitials(name)
      )}
    </span>
  );
}

function WorkMetaPill({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full bg-white/42 px-3 py-1.5 text-[0.65rem] font-medium uppercase tracking-[0.12em] text-muted">
      {children}
    </span>
  );
}

function ExpandIndicator({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={`card-glass-attachment ${isActive ? 'is-active' : ''}`}
      aria-hidden="true"
    >
      <span className="card-glass-attachment__glyph">
        <span className="card-glass-attachment__line card-glass-attachment__line-horizontal" />
        <span className="card-glass-attachment__line card-glass-attachment__line-vertical" />
      </span>
    </span>
  );
}

function WorkListBlock({
  label,
  items,
  maxItems,
  compact = false,
}: {
  label: string;
  items: readonly (string | PlaceholderLike)[];
  maxItems?: number;
  compact?: boolean;
}) {
  const visibleItems = (maxItems ? items.slice(0, maxItems) : items)
    .map((item) => publicWorkValue(item))
    .filter((item): item is string => Boolean(item));

  if (!visibleItems.length) return null;

  return (
    <div className={`rounded-[1rem] bg-white/24 ${compact ? 'p-3' : 'p-4'}`}>
      <p className="text-[0.58rem] uppercase tracking-[0.16em] text-muted">{label}</p>
      <div className={`${compact ? 'mt-2 gap-1.5' : 'mt-3 gap-2'} grid`}>
        {visibleItems.map((item, index) => (
          <p
            key={`${label}-${item}-${index}`}
            className={`${compact ? 'text-xs leading-5' : 'text-sm leading-6'} text-text-primary`}
          >
            {item}
          </p>
        ))}
      </div>
    </div>
  );
}

function WorkFactRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;

  return (
    <div className="work-mobile-detail-fact-row">
      <p>{label}</p>
      <strong>{value}</strong>
    </div>
  );
}

function WorkProductDetailsBlock({ entry }: { entry: ProductManagementWorkExperience }) {
  const productDetails = entry.productDetails
    .map((product) => ({
      name: publicWorkValue(product.name),
      description: publicWorkValue(product.description),
    }))
    .filter((product) => product.name || product.description);

  if (!productDetails.length) return null;

  return (
    <div className="work-mobile-detail-block">
      <p className="work-mobile-detail-block-label">Products</p>
      <div className="grid gap-2">
        {productDetails.map((product, index) => (
          <article key={`${product.name}-${index}`} className="work-mobile-detail-product">
            {product.name ? <strong>{product.name}</strong> : null}
            {product.description ? <p>{product.description}</p> : null}
          </article>
        ))}
      </div>
    </div>
  );
}

function ProductVideoPreview({
  entry,
  isActive,
}: {
  entry: ProductManagementWorkExperience | null;
  isActive: boolean;
}) {
  if (!entry || !isActive) {
    return null;
  }

  const videoUrl = resolveWorkVideoSrc(entry);
  const isNativeVideo = Boolean(videoUrl && /\.(mp4|webm|mov)(\?.*)?$/i.test(videoUrl));

  return (
    <div
      className="work-product-video-preview relative flex aspect-video min-h-[12rem] w-full flex-1 overflow-hidden rounded-[1.45rem] bg-white/24 shadow-[0_18px_55px_rgba(23,45,72,0.16),inset_0_1px_0_rgba(255,255,255,0.42)]"
      aria-label={`${displayWorkCompanyName(entry)} work video`}
    >
      {isNativeVideo && videoUrl ? (
        <video
          src={videoUrl}
          className="h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onLoadedData={(event) => {
            void event.currentTarget.play().catch(() => undefined);
          }}
        />
      ) : null}
    </div>
  );
}

function SelectedCompanyContextCard({
  entry,
}: {
  entry: ProductManagementWorkExperience | null;
}) {
  if (!entry) return null;

  return (
    <article className="liquid-glass mt-3 rounded-[1.25rem] p-4 shadow-[0_14px_44px_rgba(23,45,72,0.1)]">
      <p className="text-[0.58rem] uppercase tracking-[0.18em] text-muted">Company context</p>
      <p className="mt-2 text-sm leading-6 text-text-primary">
        {publicWorkValue(entry.companyDescription)}
      </p>
    </article>
  );
}

function ProductManagementWorkCard({
  entry,
  index,
  isActive,
  onActivate,
  onPreviewIntent,
}: {
  entry: ProductManagementWorkExperience;
  index: number;
  isActive: boolean;
  onActivate: () => void;
  onPreviewIntent: () => void;
}) {
  const companyName = displayWorkCompanyName(entry);
  const productText = contentItemsToText(entry.productsWorkedOn, 2);
  const location = publicWorkValue(entry.location);
  const clients = publicWorkValue(entry.customerClientTypesAndUserNumbers);

  return (
    <motion.article
      layout
      data-work-index={index}
      role="button"
      tabIndex={0}
      aria-expanded={isActive}
      onPointerEnter={onPreviewIntent}
      onFocus={onPreviewIntent}
      onClick={onActivate}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onActivate();
        }
      }}
      className={`group relative w-full max-w-full shrink-0 cursor-pointer rounded-[1.15rem] p-2.5 outline-none transition duration-300 ${
        isActive
          ? 'liquid-glass-strong shadow-[0_18px_50px_rgba(23,45,72,0.14)]'
          : 'liquid-glass hover:-translate-y-0.5 hover:bg-white/70 focus-visible:ring-2 focus-visible:ring-white/70'
      }`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.42,
        delay: Math.min(index * 0.025, 0.18),
        layout: { type: 'spring', stiffness: 380, damping: 34 },
      }}
      whileTap={{ scale: 0.996 }}
    >
      <div className="grid gap-x-3 gap-y-2 md:grid-cols-[2.75rem_minmax(10rem,0.72fr)_minmax(18rem,1.28fr)_2.75rem] md:items-start">
        <CompanyLogoMark logo={entry.companyLogo} name={companyName} className="h-10 w-10" />

        <div className="min-w-0">
          <p className="text-[0.62rem] uppercase tracking-[0.18em] text-muted">
            {publicWorkValue(entry.monthYearRangeWorked)}
          </p>
          <h3 className="mt-1 text-lg font-semibold tracking-[-0.035em] text-text-primary">
            {companyName}
          </h3>
          <p className="mt-1 text-sm leading-5 text-muted">{publicWorkValue(entry.jobTitle)}</p>
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap gap-2 md:justify-end">
            <WorkMetaPill>{publicWorkValue(entry.industryTag)}</WorkMetaPill>
            <WorkMetaPill>{publicWorkValue(entry.marketType)}</WorkMetaPill>
          </div>
          <div className="mt-2 flex max-w-full items-start gap-2 md:justify-end">
            <span className="shrink-0 rounded-full bg-white/34 px-2 py-1 text-[0.52rem] uppercase leading-none tracking-[0.12em] text-muted">
              Product
            </span>
            <p
              className="min-w-0 max-w-full text-xs leading-5 text-muted md:text-right"
              title={productText}
            >
              {productText}
            </p>
          </div>
        </div>

        <div className="absolute right-2.5 top-2.5 md:static md:flex md:justify-end">
          <ExpandIndicator isActive={isActive} />
        </div>
      </div>

      <AnimatePresence initial={false}>
        {isActive ? (
          <motion.div
            key={`${entry.companyName}-details`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.24, ease: [0.25, 0.1, 0.25, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-3 grid gap-2 border-t border-stroke/50 pt-3">
              {location ? (
                <div className="grid grid-cols-[5.5rem_minmax(0,1fr)] items-baseline gap-3 rounded-[0.95rem] bg-white/20 px-3 py-2">
                  <p className="text-[0.58rem] uppercase tracking-[0.16em] text-muted">Location</p>
                  <p className="text-xs leading-5 text-text-primary">{location}</p>
                </div>
              ) : null}
              {clients ? (
                <div className="grid grid-cols-[5.5rem_minmax(0,1fr)] items-baseline gap-3 rounded-[0.95rem] bg-white/20 px-3 py-2">
                  <p className="text-[0.58rem] uppercase tracking-[0.16em] text-muted">Clients</p>
                  <p className="text-xs leading-5 text-text-primary">{clients}</p>
                </div>
              ) : null}

              <div className="grid gap-2">
                <WorkListBlock label="Main achievements" items={entry.mainAchievements} maxItems={3} compact />
                <WorkListBlock label="Process introduced / managerial" items={entry.processesIntroducedManagerial} maxItems={1} compact />
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.article>
  );
}

function ProductManagementWorkRail({
  activeIndex,
  onActiveIndexChange,
}: {
  activeIndex: number | null;
  onActiveIndexChange: (index: number | null) => void;
}) {
  const { companies } = portfolioContent.productManagementWorkExperiences;
  const railRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (activeIndex === null) return;
    const rail = railRef.current;
    const activeCard = rail?.querySelector<HTMLElement>(`[data-work-index="${activeIndex}"]`);
    if (!rail || !activeCard) return;
    if (rail.getClientRects().length === 0) return;

    window.requestAnimationFrame(() => {
      const canScrollRail = rail.scrollHeight > rail.clientHeight + 1 && getComputedStyle(rail).overflowY !== 'visible';
      const scrollContainer = canScrollRail ? rail : rail.closest<HTMLElement>('.portfolio-stage');
      if (!scrollContainer) return;
      const activeRect = activeCard.getBoundingClientRect();
      const scrollRect = scrollContainer.getBoundingClientRect();

      scrollContainer.scrollTo({
        top: Math.max(scrollContainer.scrollTop + activeRect.top - scrollRect.top - 16, 0),
        behavior: 'smooth',
      });
    });
  }, [activeIndex]);

  return (
    <div className="flex min-w-0 flex-col bg-transparent p-0 md:h-full md:min-h-0">
      <div
        ref={railRef}
        className={`work-dashboard-scroll flex flex-col gap-3 pr-1 md:min-h-0 md:flex-1 md:overflow-y-auto ${
          activeIndex === null ? 'py-4 md:py-5' : 'pb-4 pt-0 md:pb-5 md:pt-0'
        }`}
      >
        {companies.map((entry, index) => (
          <ProductManagementWorkCard
            key={`${entry.companyName}-${index}`}
            entry={entry}
            index={index}
            isActive={activeIndex === index}
            onActivate={() => onActiveIndexChange(activeIndex === index ? null : index)}
            onPreviewIntent={() => preloadWorkVideoForEntry(entry, 'intent')}
          />
        ))}
      </div>
    </div>
  );
}

function MobileWorkSummaryCard({ entry, index }: { entry: ProductManagementWorkExperience; index: number }) {
  const companyName = displayWorkCompanyName(entry);
  const productText = contentItemsToText(entry.productsWorkedOn, 2);

  return (
    <article className="work-mobile-detail-summary-card liquid-glass">
      <div className="grid grid-cols-[2.85rem_minmax(0,1fr)] items-start gap-3">
        <CompanyLogoMark logo={entry.companyLogo} name={companyName} className="h-11 w-11" />
        <div className="min-w-0 pr-12">
          <p className="text-[0.62rem] uppercase tracking-[0.18em] text-muted">
            {String(index + 1).padStart(2, '0')} / {publicWorkValue(entry.monthYearRangeWorked)}
          </p>
          <h3 className="mt-1 text-[1.35rem] font-semibold leading-6 tracking-[-0.035em] text-text-primary">
            {companyName}
          </h3>
          <p className="mt-1 text-sm leading-5 text-muted">{publicWorkValue(entry.jobTitle)}</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <WorkMetaPill>{publicWorkValue(entry.industryTag)}</WorkMetaPill>
        <WorkMetaPill>{publicWorkValue(entry.marketType)}</WorkMetaPill>
      </div>

      <div className="mt-3 rounded-[1rem] bg-white/22 px-3 py-2.5">
        <p className="text-[0.58rem] uppercase tracking-[0.16em] text-muted">Product</p>
        <p className="mt-1 text-sm leading-6 text-text-primary">{productText}</p>
      </div>
    </article>
  );
}

function MobileWorkDetail({
  entry,
  index,
  onClose,
}: {
  entry: ProductManagementWorkExperience;
  index: number;
  onClose: () => void;
}) {
  const location = publicWorkValue(entry.location);
  const clients = publicWorkValue(entry.customerClientTypesAndUserNumbers);

  return (
    <motion.article
      key={`${entry.companyName}-mobile-detail`}
      className="work-mobile-detail"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.26, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <button type="button" className="work-mobile-detail-close" aria-label="Close work detail" onClick={onClose}>
        <span aria-hidden="true" />
      </button>

      <MobileWorkSummaryCard entry={entry} index={index} />
      <ProductVideoPreview entry={entry} isActive />
      <SelectedCompanyContextCard entry={entry} />

      <div className="work-mobile-detail-facts">
        <WorkFactRow label="Location" value={location} />
        <WorkFactRow label="Clients" value={clients} />
      </div>

      <WorkProductDetailsBlock entry={entry} />
      <WorkListBlock label="Main achievements" items={entry.mainAchievements} />
      <WorkListBlock label="Process introduced / managerial" items={entry.processesIntroducedManagerial} />
    </motion.article>
  );
}

type EducationRow = {
  id: string;
  logo: string | PlaceholderLike;
  issuer: string;
  credential: string;
  typeLabel: string;
  outcome: string;
  year: string;
  summary: string;
  fullSummary: string;
  modules: readonly string[];
};

function EducationSummaryChip({
  label,
  variant,
}: {
  label: string;
  variant: 'degree' | 'certification';
}) {
  return (
    <span
      className={`education-summary-chip ${
        variant === 'degree' ? 'education-summary-chip-degree' : 'education-summary-chip-certification'
      }`}
    >
      {label}
    </span>
  );
}

function EducationDetailPanel({ row }: { row: EducationRow }) {
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);
  const isDegree = row.typeLabel !== 'Certificate';
  const issuerLabel = isDegree ? row.issuer : educationIssuerChipName(row.issuer);
  const credentialLabel = isDegree ? row.credential : educationCredentialChipName(row.credential);
  const hasFullSummary = !isDegree && row.fullSummary.trim().length > row.summary.trim().length;
  const visibleSummary = hasFullSummary && isSummaryExpanded ? row.fullSummary : row.summary;

  return (
    <article className="rounded-[1.1rem] bg-white/26 p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.26)]">
      <div className="grid min-w-0 grid-cols-[1.575rem_minmax(0,1fr)] items-start gap-3 pr-11">
        <CompanyLogoMark logo={row.logo} name={row.issuer} className="h-[1.575rem] w-[1.575rem] rounded-[0.6rem]" />
        <div className="min-w-0">
          <p className="text-[0.73rem] uppercase tracking-[0.16em] text-muted">
            {isDegree ? 'Degree' : 'Certification'} / {row.year}
          </p>
          <h4 className="mt-1 text-[1.14rem] font-semibold leading-5 text-text-primary">{credentialLabel}</h4>
          <p className="mt-1 text-[0.98rem] leading-5 text-muted">{issuerLabel}</p>
        </div>
      </div>

      <div className="mt-3 rounded-[0.9rem] bg-white/22 px-3.5 py-2.5">
        <p className="text-[0.98rem] leading-7 text-muted">{visibleSummary}</p>
        {hasFullSummary ? (
          <div className="mt-2 flex justify-end">
            <button
              type="button"
              aria-expanded={isSummaryExpanded}
              onClick={() => setIsSummaryExpanded((current) => !current)}
              className="education-read-more-chip"
            >
              <span className="education-read-more-chip__label">{isSummaryExpanded ? 'Show less' : 'Read more'}</span>
            </button>
          </div>
        ) : null}
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5">
        {isDegree ? (
          <span className="rounded-full bg-white/38 px-3 py-1.5 text-[0.75rem] uppercase leading-none tracking-[0.12em] text-text-primary">
            {row.outcome}
          </span>
        ) : null}
        {row.modules.slice(0, isDegree ? 3 : 5).map((module) => (
          <span
            key={`${row.id}-${module}`}
            className="rounded-full bg-white/26 px-3 py-1.5 text-[0.75rem] leading-none text-muted"
          >
            {module}
          </span>
        ))}
      </div>
    </article>
  );
}

function EducationCard({
  isActive,
  onToggle,
}: {
  isActive: boolean;
  onToggle: () => void;
}) {
  const { qualifications, certifications } = portfolioContent.qualifications;
  const degreeRows: EducationRow[] = qualifications.map((entry) => ({
    id: `degree-${entry.institutionName}`,
    logo: entry.institutionLogo,
    issuer: entry.institutionName,
    credential: entry.qualification,
    typeLabel: entry.qualificationType,
    outcome: entry.gradeAchieved,
    year: entry.dateAchieved,
    summary: entry.howThisHasHelpedYouAsAPM,
    fullSummary: entry.howThisHasHelpedYouAsAPM,
    modules: entry.modulesOrFocusAreas,
  }));
  const certificateRows: EducationRow[] = certifications.map((entry) => ({
    id: `certificate-${entry.certificationName}`,
    logo: entry.awardingBodyLogo,
    issuer: entry.awardingBodyName,
    credential: entry.certificationName,
    typeLabel: 'Certificate',
    outcome: 'Certificate',
    year: entry.dateAchieved,
    summary: conciseCredentialSummary(entry.howThisHasHelpedYouAsAPM),
    fullSummary: entry.howThisHasHelpedYouAsAPM,
    modules: entry.modulesIncluded,
  }));
  const featuredDegreeRows = degreeRows.filter((row) => row.issuer === 'Imperial College London').slice(0, 1);
  const featuredCertificateNames = new Set([
    'AI Engineer Certification',
    'Professional Machine Learning Engineer',
    'MCP Advanced Topics',
  ]);
  const expandedCertificateNames = [
    'AI Engineer Certification',
    'Professional Machine Learning Engineer',
    'Generative AI Leader',
    'MCP Advanced Topics',
    'MBTi Leadership Development Programme',
  ];
  const featuredCertificateRows = certificateRows.filter((row) => featuredCertificateNames.has(row.credential));
  const expandedCertificateRows = expandedCertificateNames
    .map((name) => certificateRows.find((row) => row.credential === name))
    .filter((row): row is EducationRow => Boolean(row));
  const detailRows = [...featuredDegreeRows, ...expandedCertificateRows];

  return (
    <section
      data-education-card
      aria-expanded={isActive}
      className={`relative rounded-[1.45rem] p-3.5 outline-none transition duration-300 ${
        isActive ? 'flex h-full flex-col liquid-glass-strong' : 'liquid-glass hover:bg-white/70'
      }`}
    >
      {!isActive ? (
        <button
          type="button"
          aria-expanded={isActive}
          onClick={onToggle}
          className="group/education block w-full rounded-[1.15rem] text-left outline-none focus-visible:ring-2 focus-visible:ring-white/70"
        >
          <span className="flex items-start justify-between gap-3">
            <span className="grid min-w-0 flex-1 gap-2.5">
              <span className="font-display text-[1.55rem] italic leading-none tracking-[0] text-text-primary">
                Degrees
              </span>
              <span className="flex min-w-0">
                {featuredDegreeRows.map((row) => (
                  <EducationSummaryChip
                    key={row.id}
                    label={`${row.typeLabel} - ${row.issuer}`}
                    variant="degree"
                  />
                ))}
              </span>
              <span className="pt-1 font-display text-[1.55rem] italic leading-none tracking-[0] text-text-primary">
                Certifications
              </span>
              <span className="education-certification-chip-row">
                {featuredCertificateRows.map((row) => (
                  <EducationSummaryChip
                    key={row.id}
                    label={`${educationCredentialChipName(row.credential)} - ${educationIssuerChipName(row.issuer)}`}
                    variant="certification"
                  />
                ))}
              </span>
            </span>
            <ExpandIndicator isActive={isActive} />
          </span>
        </button>
      ) : (
        <button
          type="button"
          aria-label="Collapse qualifications"
          aria-expanded={isActive}
          onClick={onToggle}
          className="education-collapse-button rounded-full outline-none focus-visible:ring-2 focus-visible:ring-white/70"
        >
          <ExpandIndicator isActive={isActive} />
        </button>
      )}

      <AnimatePresence initial={false}>
        {isActive ? (
          <motion.div
            key="education-details"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.24, ease: [0.25, 0.1, 0.25, 1] }}
            className="min-h-0 flex-1 overflow-hidden"
          >
            <div className="education-detail-scroll portfolio-stage-scroll grid h-full min-h-0 content-start gap-2.5 pr-1">
              {detailRows.map((row) => (
                <EducationDetailPanel key={row.id} row={row} />
              ))}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}

function WorkFloatingHeader({ intro, hideSubtitle }: { intro: string; hideSubtitle: boolean }) {
  if (hideSubtitle) return null;

  return (
    <div className="pointer-events-none relative z-20 px-7 pt-7 md:absolute md:left-10 md:top-10 md:max-w-[29rem] md:p-0">
      {/* Section label rendered globally via <SectionMarker> */}
      <h2 className="mt-4 font-display text-[2.7rem] font-normal italic leading-[0.9] tracking-[0] text-text-primary md:text-[3.6rem] lg:text-[3.8rem]">
        Experiences & Qualifications
      </h2>
      <AnimatePresence initial={false}>
        {!hideSubtitle ? (
          <motion.p
            key="work-subtitle"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="mt-5 max-w-xl text-xs leading-5 text-muted md:mt-6 md:text-sm md:leading-5"
          >
            {intro}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export function ExperienceEducationSection() {
  const { intro, companies } = portfolioContent.productManagementWorkExperiences;
  const [activeWorkIndex, setActiveWorkIndex] = useState<number | null>(null);
  const [isEducationExpanded, setIsEducationExpanded] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);
  const educationCardRef = useRef<HTMLDivElement | null>(null);
  const mobileEducationCardRef = useRef<HTMLDivElement | null>(null);
  const previewEntry = activeWorkIndex === null ? null : companies[activeWorkIndex];

  const handleEducationToggle = () => {
    setIsEducationExpanded((current) => {
      const next = !current;
      if (next) {
        requestAnimationFrame(() => {
          const section = sectionRef.current;
          const stage = section?.closest<HTMLElement>('.portfolio-stage');
          if (!section || !stage) return;
          stage.scrollTo({ top: section.offsetTop, left: 0, behavior: 'smooth' });
        });
      }
      return next;
    });
  };

  useEffect(() => {
    preloadWorkVideos('visible');
  }, []);

  useEffect(() => {
    if (previewEntry) preloadWorkVideoForEntry(previewEntry, 'activate');
  }, [previewEntry]);

  useEffect(() => {
    if (activeWorkIndex === null || typeof window === 'undefined') return;
    if (!window.matchMedia('(max-width: 767px)').matches) return;

    requestAnimationFrame(() => {
      const section = sectionRef.current;
      const stage = section?.closest<HTMLElement>('.portfolio-stage');
      if (!section || !stage) return;

      stage.scrollTo({ top: section.offsetTop, left: 0, behavior: 'smooth' });
    });
  }, [activeWorkIndex]);

  useEffect(() => {
    document.body.classList.toggle('work-certifications-expanded', isEducationExpanded);

    return () => {
      document.body.classList.remove('work-certifications-expanded');
    };
  }, [isEducationExpanded]);

  useEffect(() => {
    if (!isEducationExpanded) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!(event.target instanceof Node)) return;

      const cards = [educationCardRef.current, mobileEducationCardRef.current].filter(
        (card): card is HTMLDivElement => Boolean(card),
      );
      if (!cards.length || cards.some((card) => card.contains(event.target as Node))) return;

      setIsEducationExpanded(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsEducationExpanded(false);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isEducationExpanded]);

  return (
    <section
      ref={sectionRef}
      id="experience-education"
      className={`relative isolate min-h-full ${isEducationExpanded ? 'overflow-hidden' : 'overflow-visible'} rounded-[24px] bg-transparent p-4 sm:rounded-[34px] md:h-full md:min-h-0 md:overflow-hidden md:p-5`}
    >
      <div className="work-section-opacity-layer absolute inset-0 z-0" aria-hidden="true" />
      <div className={activeWorkIndex !== null ? 'hidden md:block' : ''}>
        <WorkFloatingHeader intro={intro} hideSubtitle={isEducationExpanded || activeWorkIndex !== null} />
      </div>
      <AnimatePresence initial={false}>
        {isEducationExpanded ? (
          <motion.button
            type="button"
            aria-label="Collapse qualifications"
            className="work-education-dim hidden md:block"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            onClick={() => setIsEducationExpanded(false)}
          />
        ) : null}
      </AnimatePresence>
      <div className="work-mobile-content md:hidden" data-showing-detail={activeWorkIndex !== null || undefined}>
        <AnimatePresence mode="wait" initial={false}>
          {activeWorkIndex !== null && previewEntry ? (
            <MobileWorkDetail
              key="mobile-work-detail"
              entry={previewEntry}
              index={activeWorkIndex}
              onClose={() => setActiveWorkIndex(null)}
            />
          ) : isEducationExpanded ? (
            <motion.div
              key="mobile-education-expanded"
              ref={mobileEducationCardRef}
              className="work-mobile-education-expanded"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <EducationCard isActive={true} onToggle={handleEducationToggle} />
            </motion.div>
          ) : (
            <motion.div
              key="mobile-work-list"
              className="grid gap-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <div ref={isEducationExpanded ? undefined : mobileEducationCardRef}>
                <EducationCard
                  isActive={false}
                  onToggle={handleEducationToggle}
                />
              </div>

              <div className="work-mobile-card-list">
                {companies.map((entry, index) => (
                  <ProductManagementWorkCard
                    key={`${entry.companyName}-mobile-${index}`}
                    entry={entry}
                    index={index}
                    isActive={false}
                    onActivate={() => {
                      setIsEducationExpanded(false);
                      setActiveWorkIndex(index);
                    }}
                    onPreviewIntent={() => preloadWorkVideoForEntry(entry, 'intent')}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="work-desktop-shell relative hidden min-h-full w-full max-w-none md:block md:h-full md:min-h-0">
        <div
          className="work-desktop-grid relative grid min-h-full gap-5 md:h-full md:min-h-0 md:grid-cols-[minmax(0,0.382fr)_minmax(0,0.618fr)]"
        >
          <motion.aside
            className={`work-desktop-aside work-dashboard-scroll relative flex min-h-[42rem] flex-col p-0 md:h-full md:min-h-0 md:overflow-y-auto ${
              isEducationExpanded ? 'z-30' : ''
            }`}
            initial={{ opacity: 0, x: -18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className={`${activeWorkIndex === null && !isEducationExpanded ? 'min-h-[14rem]' : 'min-h-0'} shrink-0`} />
            {previewEntry ? (
              <div className="mb-4 grid w-full min-h-0 shrink-0">
                <ProductVideoPreview entry={previewEntry} isActive={activeWorkIndex !== null} />
                <SelectedCompanyContextCard entry={previewEntry} />
              </div>
            ) : null}
            <div
              ref={educationCardRef}
              className={`transition-[bottom,top,height] duration-300 ${
                isEducationExpanded
                  ? 'absolute inset-0 z-50 h-full'
                  : 'mt-auto md:absolute md:bottom-0 md:left-0 md:right-0 md:z-20'
              }`}
            >
              <EducationCard
                isActive={isEducationExpanded}
                onToggle={handleEducationToggle}
              />
            </div>
          </motion.aside>

          <motion.div
            className="work-desktop-rail relative z-0 min-w-0 md:h-full md:min-h-0"
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.06 }}
          >
            <ProductManagementWorkRail activeIndex={activeWorkIndex} onActiveIndexChange={setActiveWorkIndex} />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
