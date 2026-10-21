const focusableSelector = 'a[href], button, input, select, textarea, summary, [tabindex], [contenteditable="true"]';

type InertSnapshot = { count: number; inert: boolean };
type DialogEntry = { root: HTMLElement; opener: HTMLElement | null };
const inertSnapshots = new Map<HTMLElement, InertSnapshot>();
const dialogs: DialogEntry[] = [];
let previousOverflow = '';
let restoreFrame: number | null = null;
let restoreGeneration = 0;

function cancelFocusRestore() {
  restoreGeneration += 1;
  if (restoreFrame !== null) window.cancelAnimationFrame(restoreFrame);
  restoreFrame = null;
}

export function hasOpenDialog() {
  return dialogs.length > 0;
}

export function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function isVisible(element: HTMLElement) {
  return element.getClientRects().length > 0 && getComputedStyle(element).visibility !== 'hidden';
}

function isAvailable(element: HTMLElement) {
  return !element.closest('[inert], [hidden], [aria-hidden="true"]') && isVisible(element);
}

export function getDialogFocusables(root: HTMLElement) {
  return Array.from(root.querySelectorAll<HTMLElement>(focusableSelector)).filter(
    (element) => element.tabIndex >= 0 && !element.matches(':disabled') && isAvailable(element),
  );
}

function focusElement(element: HTMLElement) {
  element.focus({ preventScroll: true });
}

function canRestoreFocus(element: HTMLElement) {
  return element !== document.body && element !== document.documentElement &&
    element.matches(focusableSelector) && !element.matches(':disabled') && isAvailable(element);
}

/** Focus the new page only after its dialog has closed. The main target is also the direct-link fallback. */
export function focusRouteContent(root?: HTMLElement | null) {
  if (hasOpenDialog()) return false;
  const target = root ?? document.querySelector<HTMLElement>('[data-route-focus], main');
  if (!target || !isAvailable(target)) return false;
  cancelFocusRestore();
  if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
  focusElement(target);
  return true;
}

function isolateBackground(root: HTMLElement) {
  const isolated: HTMLElement[] = [];
  let branch: HTMLElement = root;
  while (branch.parentElement) {
    for (const sibling of Array.from(branch.parentElement.children)) {
      if (!(sibling instanceof HTMLElement) || sibling === branch || sibling.hasAttribute('data-dialog-backdrop') || /^(SCRIPT|STYLE|LINK)$/.test(sibling.tagName)) continue;
      const existing = inertSnapshots.get(sibling);
      if (existing) existing.count += 1;
      else inertSnapshots.set(sibling, { count: 1, inert: sibling.inert });
      sibling.inert = true;
      isolated.push(sibling);
    }
    branch = branch.parentElement;
    if (branch === document.body) break;
  }
  return () => {
    for (const element of isolated) {
      const snapshot = inertSnapshots.get(element);
      if (!snapshot || --snapshot.count > 0) continue;
      element.inert = snapshot.inert;
      inertSnapshots.delete(element);
    }
  };
}

/** One keyboard boundary shared by menus, readers and AI settings. Returns an idempotent cleanup. */
export function activateDialog(root: HTMLElement, onClose: () => void) {
  cancelFocusRestore();
  const entry: DialogEntry = { root, opener: document.activeElement instanceof HTMLElement ? document.activeElement : null };
  if (!dialogs.length) {
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }
  dialogs.push(entry);
  const isTop = () => dialogs[dialogs.length - 1] === entry;
  const focusInitial = () => {
    if (!isVisible(root)) return false;
    const initial = Array.from(root.querySelectorAll<HTMLElement>('[data-dialog-initial]')).find(isAvailable);
    focusElement(initial ?? getDialogFocusables(root)[0] ?? root);
    return true;
  };

  // Move focus before hiding the opener's ancestor from the accessibility tree.
  const focusedImmediately = focusInitial();
  // The static-document handoff reveals #root in a sibling layout effect.
  // Retry once after that commit, without taking focus again on ordinary opens.
  const focusFrame = focusedImmediately ? null : window.requestAnimationFrame(() => {
    if (isTop() && root.isConnected) focusInitial();
  });
  const restoreBackground = isolateBackground(root);
  const handleKeyDown = (event: KeyboardEvent) => {
    if (!isTop() || event.isComposing) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      onClose();
      return;
    }
    if (event.key !== 'Tab') return;
    const elements = getDialogFocusables(root);
    const first = elements[0];
    const last = elements[elements.length - 1];
    if (!first) {
      event.preventDefault();
      focusElement(root);
    } else if (!root.contains(document.activeElement) || document.activeElement === root || (event.shiftKey ? document.activeElement === first : document.activeElement === last)) {
      event.preventDefault();
      focusElement(event.shiftKey ? last : first);
    }
  };
  const handleFocus = (event: FocusEvent) => {
    if (isTop() && event.target instanceof Node && !root.contains(event.target)) focusInitial();
  };
  document.addEventListener('keydown', handleKeyDown, true);
  document.addEventListener('focusin', handleFocus, true);
  let cleaned = false;
  return () => {
    if (cleaned) return;
    cleaned = true;
    if (focusFrame !== null) window.cancelAnimationFrame(focusFrame);
    const wasTop = isTop();
    document.removeEventListener('keydown', handleKeyDown, true);
    document.removeEventListener('focusin', handleFocus, true);
    dialogs.splice(dialogs.indexOf(entry), 1);
    restoreBackground();
    if (!dialogs.length) document.body.style.overflow = previousOverflow;
    if (!wasTop) return;
    cancelFocusRestore();
    const generation = restoreGeneration;
    const remainingDialog = dialogs[dialogs.length - 1];
    // Layout-effect cleanup runs before React has revealed the underlying route
    // and before an exiting dialog is removed. Restore after that commit.
    restoreFrame = window.requestAnimationFrame(() => {
      restoreFrame = null;
      if (generation !== restoreGeneration || dialogs[dialogs.length - 1] !== remainingDialog) return;
      const current = document.activeElement;
      // An intentional route/user focus change after close takes precedence.
      if (current instanceof HTMLElement && current.isConnected && !entry.root.contains(current) && canRestoreFocus(current)) return;
      if (entry.opener?.isConnected && canRestoreFocus(entry.opener)) focusElement(entry.opener);
      else if (remainingDialog) focusElement(remainingDialog.root);
      else focusRouteContent();
    });
  };
}
