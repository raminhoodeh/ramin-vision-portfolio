import { useLayoutEffect, useRef, type RefObject } from 'react';
import { activateDialog } from './dialogFocus';
import '../styles/accessibility.css';

export function useDialogFocus(rootRef: RefObject<HTMLElement | null>, active: boolean, onClose: () => void) {
  const closeRef = useRef(onClose);
  useLayoutEffect(() => { closeRef.current = onClose; }, [onClose]);
  useLayoutEffect(() => {
    if (!active || !rootRef.current) return;
    return activateDialog(rootRef.current, () => closeRef.current());
  }, [active, rootRef]);
}
