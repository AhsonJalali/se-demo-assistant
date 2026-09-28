import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import Icon from './ui/Icon';
import { formatRelative, formatDate } from '../utils/format';

/** Sidebar deal/session switcher. */
const SessionDropdown = () => {
  const {
    sessions,
    currentSession,
    saveState,
    loadSession,
    closeSession,
    deleteSession,
    openNewSession,
    setShowSessionModal,
    setSessionModalMode,
    exportSessionAsJson,
    importSessionFromJson,
  } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const rootRef = useRef(null);
  const importInputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setIsOpen(false);
        setDeleteConfirmId(null);
      }
    };
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        setIsOpen(false);
        setDeleteConfirmId(null);
      }
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey, true);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey, true);
    };
  }, [isOpen]);

  const sorted = [...sessions].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      importSessionFromJson(file);
      setIsOpen(false);
    }
    e.target.value = '';
  };

  const run = (fn) => () => {
    setIsOpen(false);
    fn();
  };

  const saveLabel = {
    saving: 'Saving…',
    saved: 'Saved',
    error: 'Not saved',
    idle: '',
  }[saveState.status];

  return (
    <div className="relative" ref={rootRef}>
      <input ref={importInputRef} type="file" accept=".json,application/json" className="hidden" onChange={handleImportFile} />

      {currentSession ? (
        <button
          type="button"
          onClick={() => setIsOpen(o => !o)}
          aria-haspopup="true"
          aria-expanded={isOpen}
          className="w-full flex items-center gap-2.5 p-2 rounded-xl border border-line bg-surface hover:border-line-strong text-left transition-colors"
        >
          <div className="w-8 h-8 rounded-lg bg-accent-soft text-accent-text flex items-center justify-center text-[13px] font-semibold shrink-0">
            {currentSession.name.trim().charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-semibold text-fg truncate">{currentSession.name}</div>
            <div className="flex items-center gap-1.5 text-2xs text-fg-3">
              <span className="truncate">{currentSession.metadata.dealStage}</span>
              {saveLabel && (
                <>
                  <span aria-hidden="true">·</span>
                  <span
                    className={saveState.status === 'error' ? 'text-danger font-medium' : ''}
                    role="status"
                    aria-live="polite"
                  >
                    {saveLabel}
                  </span>
                </>
              )}
            </div>
          </div>
          <Icon name="chevrons-up-down" size={14} className="text-fg-3" />
        </button>
      ) : (
        <div className="p-3 rounded-xl border border-dashed border-line-strong bg-surface">
          <p className="text-[13px] font-medium text-fg">No deal selected</p>
          <p className="text-xs text-fg-3 mt-0.5 mb-2.5">Start one per prospect to keep notes and build an export.</p>
          <div className="flex gap-1.5">
            <button type="button" onClick={openNewSession} className="btn btn-primary btn-sm flex-1">
              <Icon name="plus" size={14} /> New session
            </button>
            {sessions.length > 0 && (
              <button type="button" onClick={() => setIsOpen(o => !o)} className="btn btn-secondary btn-sm" aria-haspopup="true" aria-expanded={isOpen}>
                Open
              </button>
            )}
          </div>
        </div>
      )}

      {isOpen && (
        <div className="absolute left-0 right-0 lg:right-auto lg:w-80 top-full mt-1.5 z-40 bg-surface border border-line rounded-xl shadow-pop animate-pop-in overflow-hidden">
          {currentSession && (
            <div className="p-1.5 border-b border-line">
              <MenuItem icon="edit" onClick={run(() => { setSessionModalMode('edit'); setShowSessionModal(true); })}>
                Edit session details
              </MenuItem>
              <MenuItem icon="download" onClick={run(() => exportSessionAsJson(currentSession))}>
                Download as file
              </MenuItem>
              <MenuItem icon="log-out" onClick={run(closeSession)}>
                Close session
              </MenuItem>
            </div>
          )}

          <div className="px-3 pt-2.5 pb-1 section-label">Sessions</div>
          <div className="max-h-72 overflow-y-auto scrollbar-thin px-1.5 pb-1.5">
            {sorted.length === 0 && (
              <p className="px-2.5 py-3 text-[13px] text-fg-3">No saved sessions yet.</p>
            )}
            {sorted.map(session => {
              const isActive = currentSession?.id === session.id;
              const confirming = deleteConfirmId === session.id;
              if (confirming) {
                return (
                  <div key={session.id} className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-danger-soft">
                    <span className="flex-1 text-[13px] text-fg truncate">Delete “{session.name}”?</span>
                    <button type="button" className="btn btn-sm btn-danger h-7" onClick={() => { deleteSession(session.id); setDeleteConfirmId(null); }}>
                      Delete
                    </button>
                    <button type="button" className="btn btn-sm btn-ghost h-7" onClick={() => setDeleteConfirmId(null)}>
                      Cancel
                    </button>
                  </div>
                );
              }
              return (
                <div key={session.id} className={`group flex items-center rounded-lg ${isActive ? 'bg-accent-soft' : 'hover:bg-muted'}`}>
                  <button
                    type="button"
                    onClick={run(() => loadSession(session.id))}
                    className="flex-1 min-w-0 text-left px-2.5 py-2"
                    aria-current={isActive ? 'true' : undefined}
                  >
                    <div className={`text-[13px] font-medium truncate ${isActive ? 'text-accent-text' : 'text-fg'}`}>{session.name}</div>
                    <div className="text-2xs text-fg-3 truncate">
                      {session.metadata.dealStage} · {formatDate(session.metadata.demoDate)} · edited {formatRelative(session.updatedAt)}
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmId(session.id)}
                    className="icon-btn w-7 h-7 mr-1 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 hover:text-danger"
                    aria-label={`Delete ${session.name}`}
                  >
                    <Icon name="trash" size={14} />
                  </button>
                </div>
              );
            })}
          </div>

          <div className="p-1.5 border-t border-line">
            <MenuItem icon="plus" onClick={run(openNewSession)} shortcut="N">New session</MenuItem>
            <MenuItem icon="upload" onClick={() => importInputRef.current?.click()}>Import from file…</MenuItem>
          </div>
        </div>
      )}
    </div>
  );
};

const MenuItem = ({ icon, children, onClick, shortcut }) => (
  <button
    type="button"
    onClick={onClick}
    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] text-fg hover:bg-muted text-left"
  >
    <Icon name={icon} size={15} className="text-fg-3" />
    <span className="flex-1">{children}</span>
    {shortcut && <kbd>{shortcut}</kbd>}
  </button>
);

export default SessionDropdown;
