import { useEffect, useRef, type ReactNode, type RefObject } from 'react';
import { motion } from 'framer-motion';

/** Shared frame for the portfolio's full-screen reading surfaces. */
export function ReaderOverlay({ children, onClose, labelledBy, returnFocusRef, className = '' }: {
  children: ReactNode;
  onClose: () => void;
  labelledBy?: string;
  returnFocusRef?: RefObject<HTMLElement | null>;
  className?: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const root = rootRef.current;
    const focusable = () => Array.from(root?.querySelectorAll<HTMLElement>(
      'button:not([disabled]), a[href], [tabindex="0"]',
    ) ?? []).filter((element) => element.tabIndex >= 0 && element.getClientRects().length > 0);

    if (labelledBy) focusable()[0]?.focus({ preventScroll: true });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
      if (!labelledBy || event.key !== 'Tab') return;
      const elements = focusable();
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (!first) {
        event.preventDefault();
        root?.focus({ preventScroll: true });
      } else if (event.shiftKey && (document.activeElement === first || !root?.contains(document.activeElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !root?.contains(document.activeElement))) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      if (returnFocusRef) requestAnimationFrame(() => {
        const trigger = returnFocusRef.current;
        if (trigger?.isConnected && trigger.getClientRects().length && getComputedStyle(trigger).visibility !== 'hidden') {
          trigger.focus({ preventScroll: true });
        }
      });
    };
  }, [labelledBy, onClose, returnFocusRef]);

  return (
    <motion.div
      ref={rootRef}
      role={labelledBy ? 'dialog' : undefined}
      aria-modal={labelledBy ? true : undefined}
      aria-labelledby={labelledBy}
      tabIndex={labelledBy ? -1 : undefined}
      className={`portfolio-deep-dive-overlay fixed inset-0 z-[220] overflow-y-auto px-3 py-3 text-text-primary sm:px-5 sm:py-5 ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.28, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <button
        type="button"
        tabIndex={-1}
        aria-label={labelledBy ? 'Close biography backdrop' : 'Close case study backdrop'}
        className="portfolio-deep-dive-backdrop absolute inset-0 bg-bg/20 backdrop-blur-[3px]"
        onClick={onClose}
      />
      {children}
    </motion.div>
  );
}
