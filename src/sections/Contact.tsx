import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { portfolioContent } from '../data/portfolio';
import { GlassImprintCta } from '../components/GlassImprintCta';
import { isPlaceholderValue } from '../lib/placeholder';

export function Contact() {
  const { contactCta } = portfolioContent;
  const marqueeRef = useRef<HTMLDivElement | null>(null);
  const copyResetTimeoutRef = useRef<number | null>(null);
  const [emailCopied, setEmailCopied] = useState(false);
  const emailAddress = contactCta.ctaButtons[0].href;
  const marqueeText = useMemo(
    () => Array.from({ length: 10 }, () => `${contactCta.artisticHeroText} . `).join(''),
    [contactCta.artisticHeroText],
  );
  const headlineLines = useMemo(() => {
    if (contactCta.headline === "Let's create beautiful things that the world really needs") {
      return ["Let's create beautiful", 'things that the world', 'really needs'];
    }

    return [contactCta.headline];
  }, [contactCta.headline]);

  const handleCopyEmail = useCallback(async () => {
    try {
      const copyFromHiddenTextarea = () => {
        const textarea = document.createElement('textarea');
        textarea.value = emailAddress;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        textarea.style.top = '0';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        textarea.setSelectionRange(0, textarea.value.length);
        const copied = document.execCommand('copy');
        document.body.removeChild(textarea);
        return copied;
      };

      let didCopy = copyFromHiddenTextarea();

      if (!didCopy && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(emailAddress);
        didCopy = true;
      }

      if (!didCopy) throw new Error('Unable to copy email address.');

      setEmailCopied(true);
      if (copyResetTimeoutRef.current) window.clearTimeout(copyResetTimeoutRef.current);
      copyResetTimeoutRef.current = window.setTimeout(() => setEmailCopied(false), 1800);
    } catch {
      setEmailCopied(false);
    }
  }, [emailAddress]);

  useLayoutEffect(() => {
    const marquee = marqueeRef.current;
    if (!marquee) return undefined;

    const ctx = gsap.context(() => {
      gsap.to(marquee, {
        xPercent: -50,
        duration: 49.2,
        ease: 'none',
        repeat: -1,
      });
    }, marquee);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    return () => {
      if (copyResetTimeoutRef.current) window.clearTimeout(copyResetTimeoutRef.current);
    };
  }, []);

  return (
    <section
      id="contact"
      className="relative isolate flex min-h-[calc(100vh-1.5rem)] items-center justify-center overflow-hidden bg-transparent px-6 pb-36 pt-24 text-center md:min-h-[calc(100vh-3rem)] md:px-10 md:pb-40 md:pt-28 lg:px-16"
    >
      <div className="absolute inset-0 z-0 bg-white/8" aria-hidden="true" />
      <div className="absolute inset-x-0 top-0 z-[2] h-44 bg-gradient-to-b from-bg/80 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 z-[2] h-52 bg-gradient-to-t from-bg/80 to-transparent" />

      <svg
        className="contact-headline-cutout-layer contact-headline-cutout-layer-desktop"
        viewBox="0 0 1600 900"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <mask id="contact-headline-cutout-mask-desktop" maskUnits="userSpaceOnUse" x="0" y="0" width="1600" height="900">
            <rect x="0" y="0" width="1600" height="900" fill="white" />
            {headlineLines.map((line, index) => (
              <text
                key={line}
                className="hero-name-cutout-mask-text contact-headline-cutout-mask-text-desktop"
                x="800"
                y={320 + index * 118}
                fill="black"
              >
                {line}
              </text>
            ))}
          </mask>
        </defs>
        <rect
          className="contact-headline-cutout-surface"
          x="0"
          y="0"
          width="1600"
          height="900"
          fill="white"
          mask="url(#contact-headline-cutout-mask-desktop)"
        />
      </svg>

      <svg
        className="contact-headline-cutout-layer contact-headline-cutout-layer-mobile"
        viewBox="0 0 420 760"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <mask id="contact-headline-cutout-mask-mobile" maskUnits="userSpaceOnUse" x="0" y="0" width="420" height="760">
            <rect x="0" y="0" width="420" height="760" fill="white" />
            {headlineLines.map((line, index) => (
              <text
                key={line}
                className="hero-name-cutout-mask-text contact-headline-cutout-mask-text-mobile"
                x="210"
                y={264 + index * 58}
                fill="black"
              >
                {line}
              </text>
            ))}
          </mask>
        </defs>
        <rect
          className="contact-headline-cutout-surface"
          x="0"
          y="0"
          width="420"
          height="760"
          fill="white"
          mask="url(#contact-headline-cutout-mask-mobile)"
        />
      </svg>

      <div className="contact-values-marquee pointer-events-none absolute inset-x-0 top-8 z-[3] overflow-hidden py-4 md:top-10">
        <div
          ref={marqueeRef}
          className="flex w-max whitespace-nowrap font-display text-5xl italic text-text-primary/10 md:text-8xl"
        >
          <span>{marqueeText}</span>
          <span>{marqueeText}</span>
        </div>
      </div>

      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center">
        {/* Section label rendered globally via <SectionMarker> */}
        <p className="translate-y-16 text-xs uppercase tracking-[0.3em] text-muted md:translate-y-20">{contactCta.hook}</p>
        <h2 className="sr-only">{contactCta.headline}</h2>
        <div className="contact-headline-cutout-spacer" aria-hidden="true" />

        <div className="contact-cta-row mt-24 flex w-full flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          {contactCta.ctaButtons.map((button, index) => {
            const isPlaceholder = isPlaceholderValue(button.href);
            const href = isPlaceholder ? undefined : button.href;
            const isPrimary = index === 0;
            const isEmailCta = isPrimary && href === emailAddress;

            if (isEmailCta) {
              return (
                <button
                  key={button.label}
                  type="button"
                  onClick={handleCopyEmail}
                  aria-label={`Copy ${emailAddress} to clipboard`}
                  className="contact-email-copy-button group relative inline-flex max-w-full rounded-full p-[2px] text-sm transition duration-300 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                >
                  <span className="accent-gradient animated-gradient absolute inset-0 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <span className="contact-email-copy-button-inner relative inline-flex items-center gap-3 rounded-full bg-[#597ca0] py-3 pl-6 pr-3.5 text-center text-bg transition duration-300 group-hover:bg-bg group-hover:text-text-primary">
                    <span className="contact-email-address max-w-[14.75rem] truncate sm:max-w-none">{emailAddress}</span>
                    <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 text-bg/80 transition duration-300 group-hover:border-stroke group-hover:bg-white/85 group-hover:text-text-primary">
                      {emailCopied ? (
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                      ) : (
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <rect x="9" y="9" width="13" height="13" rx="2" />
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                      )}
                    </span>
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none absolute -top-3 right-4 inline-flex -translate-y-full items-center gap-1.5 rounded-full border border-stroke/70 bg-white/80 px-3 py-1 text-[0.62rem] uppercase tracking-[0.18em] text-text-primary shadow-[0_12px_36px_rgba(15,23,42,0.14)] backdrop-blur-md transition duration-300 ${
                        emailCopied ? 'translate-x-0 opacity-100' : 'translate-x-2 opacity-0'
                      }`}
                    >
                      <span className="accent-gradient h-1.5 w-1.5 rounded-full" />
                      Copied
                    </span>
                  </span>
                </button>
              );
            }

            if (!href) {
              return (
                <span
                  key={button.label}
                  className="inline-flex max-w-full rounded-full border border-dashed border-stroke/70 bg-white/45 px-7 py-3.5 text-sm text-muted"
                >
                  {button.label}
                </span>
              );
            }

            return (
              <GlassImprintCta
                key={button.label}
                label={button.label}
                ariaLabel={`Open ${button.label}`}
                href={href}
                target={href.startsWith('http') ? '_blank' : undefined}
                rel={href.startsWith('http') ? 'noreferrer' : undefined}
                className="contact-page-whatsapp-glass-button"
              />
            );
          })}
          <span className="sr-only" aria-live="polite">
            {emailCopied ? `${emailAddress} copied to clipboard` : ''}
          </span>
        </div>
      </div>
    </section>
  );
}
