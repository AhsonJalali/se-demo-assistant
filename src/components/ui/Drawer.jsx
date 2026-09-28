import React, { useId, useRef } from 'react';
import Icon from './Icon';
import { useFocusTrap } from './Dialog';

/** Right-hand slide-over panel. Full width on small screens. */
const Drawer = ({ title, subtitle, onClose, children, actions, width = 440, style }) => {
  const panelRef = useRef(null);
  const titleId = useId();
  useFocusTrap(panelRef);

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30 animate-fade-in" onClick={onClose} aria-hidden="true" />
      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="fixed inset-y-0 right-0 z-50 w-full flex flex-col bg-surface border-l border-line shadow-dialog animate-slide-in-right outline-none"
        style={{ maxWidth: width, ...style }}
      >
        <header className="flex items-center gap-3 h-14 px-5 border-b border-line shrink-0">
          <div className="flex-1 min-w-0">
            <h2 id={titleId} className="text-sm font-semibold text-fg truncate">{title}</h2>
            {subtitle && <p className="text-xs text-fg-3 truncate">{subtitle}</p>}
          </div>
          {actions}
          <button type="button" onClick={onClose} className="icon-btn -mr-1.5" aria-label="Close panel">
            <Icon name="x" />
          </button>
        </header>
        {children}
      </aside>
    </>
  );
};

export default Drawer;
