import React, { useEffect, useId, useRef, useState } from 'react';
import Icon from './Icon';

/**
 * Compact multi-select filter: a pill button that opens a checklist popover.
 * Shows the selected value (or a count) in the pill so active filters are
 * visible without opening it.
 */
const FilterMenu = ({ label, options, selected, onChange }) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey, true);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey, true);
    };
  }, [open]);

  const toggle = (id) => {
    onChange(selected.includes(id) ? selected.filter(s => s !== id) : [...selected, id]);
  };

  const active = selected.length > 0;
  const summary = !active
    ? null
    : selected.length === 1
      ? options.find(o => o.id === selected[0])?.name
      : `${selected.length} selected`;

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={menuId}
        className={`inline-flex items-center gap-1.5 h-8 pl-3 pr-2 rounded-full border text-[13px] transition-colors
          ${active
            ? 'border-accent/40 bg-accent-soft text-accent-text'
            : 'border-line bg-surface text-fg-2 hover:text-fg hover:border-line-strong'}`}
      >
        <span className={active ? 'font-medium' : ''}>{label}</span>
        {summary && <span className="font-medium max-w-[10rem] truncate">: {summary}</span>}
        <Icon name="chevron-down" size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          id={menuId}
          role="group"
          aria-label={`${label} filter`}
          className="absolute left-0 top-full mt-1.5 z-30 w-64 p-1.5 bg-surface border border-line rounded-xl shadow-pop animate-pop-in"
        >
          <div className="max-h-72 overflow-y-auto scrollbar-thin">
            {options.map(option => {
              const checked = selected.includes(option.id);
              return (
                <label
                  key={option.id}
                  className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-fg cursor-pointer hover:bg-muted"
                >
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={checked}
                    onChange={() => toggle(option.id)}
                  />
                  <span
                    className={`w-4 h-4 rounded border flex items-center justify-center transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-accent/50
                      ${checked ? 'bg-accent border-accent text-accent-fg' : 'border-line-strong bg-surface'}`}
                  >
                    {checked && <Icon name="check" size={12} strokeWidth={3} />}
                  </span>
                  {option.name}
                </label>
              );
            })}
          </div>
          {active && (
            <div className="border-t border-line mt-1.5 pt-1.5">
              <button type="button" onClick={() => onChange([])} className="w-full text-left px-2.5 py-1.5 rounded-lg text-[13px] text-fg-2 hover:bg-muted hover:text-fg">
                Clear {label.toLowerCase()}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FilterMenu;
