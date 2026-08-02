import { useEffect, useRef } from 'react';
import styles from './Modal.module.css';

// Only the topmost open Modal should respond to Escape — without this, two
// stacked modals (e.g. a form opened from within a detail view) both close
// on a single press, since each registers its own document-level listener.
const openModals: symbol[] = [];

interface ModalProps {
  onClose: () => void;
  closeLabel: string;
  maxWidth?: number;
  align?: 'center' | 'top';
  floatingClose?: boolean;
  noPadding?: boolean;
  zIndex?: number;
  ariaLabel?: string;
  children: React.ReactNode;
}

export function Modal({
  onClose,
  closeLabel,
  maxWidth = 420,
  align = 'center',
  floatingClose = false,
  noPadding = false,
  zIndex = 300,
  ariaLabel,
  children,
}: ModalProps) {
  const idRef = useRef(Symbol('modal'));

  useEffect(() => {
    const id = idRef.current;
    openModals.push(id);

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && openModals[openModals.length - 1] === id) onClose();
    }
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      openModals.splice(openModals.indexOf(id), 1);
      document.removeEventListener('keydown', onKey);
      if (openModals.length === 0) document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      className={`${styles.overlay} ${align === 'top' ? styles.overlayTop : ''}`}
      style={{ zIndex }}
      onClick={onClose}
    >
      <div
        className={`${styles.panel} ${noPadding ? '' : styles.panelPadded}`}
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
      >
        <button
          className={`${styles.closeBtn} ${floatingClose ? styles.closeBtnFloating : ''}`}
          onClick={onClose}
          aria-label={closeLabel}
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}
