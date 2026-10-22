import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { portfolioContent } from '../data/portfolio';
import { GlassImprintCta } from '../components/GlassImprintCta';
import { resourceContact } from '../data/resources';
import './contact.css';
import { JourneyPrivacy } from '../components/JourneyPrivacy';
import { recordJourneyEvent } from '../lib/visitorJourney';

export function Contact() {
  const { contactCta } = portfolioContent;
  const marqueeRef = useRef<HTMLDivElement | null>(null);
  const copyResetTimeoutRef = useRef<number | null>(null);
  const [emailCopied, setEmailCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const emailAddress = resourceContact.email;
  const whatsAppHref = contactCta.ctaButtons.find((button) => button.label === 'WhatsApp')?.href;
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
        const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        const textarea = document.createElement('textarea');
        textarea.value = emailAddress;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        textarea.style.top = '0';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        try {
          textarea.focus();
          textarea.select();
          textarea.setSelectionRange(0, textarea.value.length);
          return document.execCommand('copy');
        } finally {
          document.body.removeChild(textarea);
          opener?.focus({ preventScroll: true });
        }
      };

      let didCopy = false;
      if (navigator.clipboard?.writeText) {
        try { await navigator.clipboard.writeText(emailAddress); didCopy = true; } catch { /* Use the selectable-text fallback below. */ }
      }
      if (!didCopy) didCopy = copyFromHiddenTextarea();

      if (!didCopy) throw new Error('Unable to copy email address.');

      setEmailCopied(true);
      setCopyFailed(false);
      recordJourneyEvent('contact_open', 'email_copy', 'contact');
      if (copyResetTimeoutRef.current) window.clearTimeout(copyResetTimeoutRef.current);
      copyResetTimeoutRef.current = window.setTimeout(() => setEmailCopied(false), 1800);
    } catch {
      setEmailCopied(false);
      setCopyFailed(true);
    }
  }, [emailAddress]);

  useLayoutEffect(() => {
    const marquee = marqueeRef.current;
    if (!marquee) return undefined;

    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.to(marquee, { xPercent: -50, duration: 49.2, ease: 'none', repeat: -1 });
    });
    return () => media.revert();
  }, []);

  useEffect(() => {
    return () => {
      if (copyResetTimeoutRef.current) window.clearTimeout(copyResetTimeoutRef.current);
    };
  }, []);

  return (
    <section
      id="contact"
      className="contact-page--useful relative isolate min-h-full bg-transparent text-center"
    >
      <div className="absolute inset-0 z-0 bg-white/8" aria-hidden="true" />
      <div className="absolute inset-x-0 top-0 z-[2] h-44 bg-gradient-to-b from-bg/80 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 z-[2] h-52 bg-gradient-to-t from-bg/80 to-transparent" />

      <div className="contact-values-marquee pointer-events-none absolute inset-x-0 top-8 z-[3] overflow-hidden py-4 md:top-10">
        <div
          ref={marqueeRef}
          className="flex w-max whitespace-nowrap font-display text-5xl italic text-text-primary/10 md:text-8xl"
        >
          <span>{marqueeText}</span>
          <span>{marqueeText}</span>
        </div>
      </div>

      <div className="contact-content relative z-10 mx-auto flex max-w-5xl flex-col items-center">
        <header className="contact-intro">
          <p className="contact-hook">{contactCta.hook}</p>
          <h1 className="sr-only">Contact Ramin Hoodeh</h1>
        </header>
        <div className="contact-expression" aria-hidden="true">
      <svg
        className="contact-headline-cutout-layer contact-headline-cutout-layer-desktop"
        viewBox="0 0 1600 440"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <mask id="contact-headline-cutout-mask-desktop" maskUnits="userSpaceOnUse" x="0" y="0" width="1600" height="440">
            <rect x="0" y="0" width="1600" height="440" fill="white" />
            {headlineLines.map((line, index) => (
              <text
                key={line}
                className="hero-name-cutout-mask-text contact-headline-cutout-mask-text-desktop"
                x="800"
                y={102 + index * 118}
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
          height="440"
          fill="white"
          mask="url(#contact-headline-cutout-mask-desktop)"
        />
      </svg>

      <svg
        className="contact-headline-cutout-layer contact-headline-cutout-layer-mobile"
        viewBox="0 0 420 280"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <mask id="contact-headline-cutout-mask-mobile" maskUnits="userSpaceOnUse" x="0" y="0" width="420" height="280">
            <rect x="0" y="0" width="420" height="280" fill="white" />
            {headlineLines.map((line, index) => (
              <text
                key={line}
                className="hero-name-cutout-mask-text contact-headline-cutout-mask-text-mobile"
                x="210"
                y={70 + index * 72}
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
          height="280"
          fill="white"
          mask="url(#contact-headline-cutout-mask-mobile)"
        />
      </svg>

        </div>
        <div className="contact-purpose">
          <p>{resourceContact.purpose}</p>
          <p className="contact-timezone">{resourceContact.timezoneLabel}</p>
        </div>
        <p className="contact-visible-email">{emailAddress}</p>
        <div className="contact-cta-row">
          <GlassImprintCta label="Compose email" ariaLabel={`Compose an email to ${emailAddress}`} href={`mailto:${emailAddress}`} className="contact-compose-email" />
          <button
            type="button"
            onClick={handleCopyEmail}
            aria-label={`Copy ${emailAddress} to clipboard`}
            className="contact-copy-control"
          >{emailCopied ? 'Email copied' : 'Copy email'}</button>
        </div>
        <div className="contact-copy-status" role="status" aria-live="polite">
          {emailCopied ? `${emailAddress} copied to clipboard` : copyFailed ? 'Could not copy automatically. You can select the address above.' : ''}
        </div>
        <nav className="contact-professional-links" aria-label="Contact and professional links">
          <a href={resourceContact.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
          {whatsAppHref ? <a href={whatsAppHref} target="_blank" rel="noopener noreferrer">WhatsApp</a> : null}
          <a href="/resources">Resources</a>
        </nav>
        <JourneyPrivacy />
      </div>
    </section>
  );
}
