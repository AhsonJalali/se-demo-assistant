import React, { useEffect, useId, useRef } from 'react';
import Icon from './Icon';

const FOCUSABLE = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Keeps Tab focus inside `ref` while mounted, focuses the first field (or the
 * element marked data-autofocus), and returns focus to the opener on unmount.
 * Escape is handled globally in AppContext so stacked overlays close one at a time.
 */
export function useFocusTrap(ref) {
  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    const opener = document.activeElement;
    const first = node.querySelector('[data-autofocus]') || node.querySelector(FOCUSABLE);
    (first || node).focus({ preventScroll: true });

    const onKeyDown = (e) => {
      if (e.key !== 'Tab') return;
      const items = [...node.querySelectorAll(FOCUSABLE)].filter(el => el.offsetParent !== null);
      if (items.length === 0) return;
      const firstEl = items[0];
      const lastEl = items[items.length - 1];
      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    };
    node.addEventListener('keydown', onKeyDown);
    return () => {
      node.removeEventListener('keydown', onKeyDown);
      if (opener && typeof opener.focus === 'function') opener.focus({ preventScroll: true });
    };
  }, [ref]);
}

const SIZES = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl' };

const Dialog = ({ title, description, onClose, children, footer, size = 'md', icon }) => {
  const panelRef = useRef(null);
  const titleId = useId();
  const descId = useId();
  useFocusTrap(panelRef);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 bg-black/40 backdrop-blur-[2px] animate-fade-in"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
        className={`w-full ${SIZES[size]} max-h-[92vh] flex flex-col bg-surface border border-line rounded-t-2xl sm:rounded-2xl shadow-dialog animate-pop-in outline-none`}
      >
        <div className="flex items-start gap-3 px-6 pt-5 pb-4">
          {icon && (
            <div className="mt-0.5 w-8 h-8 rounded-lg bg-accent-soft text-accent-text flex items-center justify-center">
              <Icon name={icon} size={16} />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h2 id={titleId} className="text-base font-semibold text-fg">{title}</h2>
            {description && <p id={descId} className="mt-0.5 text-sm text-fg-2">{description}</p>}
          </div>
          <button type="button" onClick={onClose} className="icon-btn -mr-2 -mt-1" aria-label="Close">
            <Icon name="x" />
          </button>
        </div>
        <div className="px-6 pb-5 overflow-y-auto scrollbar-thin">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-line bg-subtle rounded-b-2xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dialog;
