import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { formatDateTime } from '../utils/format';
import Drawer from './ui/Drawer';
import EmptyState from './ui/EmptyState';
import Icon from './ui/Icon';

const MAX_CHARS = 50000;

const NotesPanel = () => {
  const {
    setShowNotesPanel,
    currentSession,
    updateGeneralNotes,
    openNewSession,
    openNoteModal,
    content,
    categories,
    saveState,
  } = useApp();

  const [localNotes, setLocalNotes] = useState(currentSession?.notes.general || '');

  // Pick up external changes (e.g. the objection copilot appending an exchange).
  useEffect(() => {
    setLocalNotes(currentSession?.notes.general || '');
  }, [currentSession?.id, currentSession?.notes.general]); // eslint-disable-line react-hooks/exhaustive-deps

  const close = () => setShowNotesPanel(false);

  if (!currentSession) {
    return (
      <Drawer title="Notes" onClose={close}>
        <EmptyState
          icon="notebook"
          title="No session open"
          action={<button type="button" className="btn btn-primary btn-sm" onClick={() => { close(); openNewSession(); }}>New session</button>}
        >
          Notes belong to a session, so they're saved with the rest of the deal.
        </EmptyState>
      </Drawer>
    );
  }

  const wordCount = localNotes.trim() ? localNotes.trim().split(/\s+/).length : 0;
  const isOverLimit = localNotes.length > MAX_CHARS;

  // Item notes grouped with the title of the card they're attached to.
  const itemNotes = Object.entries(currentSession.notes.items)
    .map(([id, note]) => {
      for (const list of [content.discovery, content.objections, content.differentiators, content.usecases]) {
        const item = list.find(i => i.id === id);
        if (item) return { id, note, title: item.question || item.objection || item.feature || item.name };
      }
      return { id, note, title: id };
    })
    .sort((a, b) => new Date(b.note.lastModified) - new Date(a.note.lastModified));

  const industry = currentSession.metadata.industries?.[0];
  const industryName = industry && categories.industries.find(i => i.id === industry)?.name;

  return (
    <Drawer
      title="Notes"
      subtitle={`${currentSession.name} · ${saveState.status === 'saving' ? 'Saving…' : saveState.status === 'error' ? 'Not saved' : 'Saved'}`}
      onClose={close}
    >
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="p-5 space-y-6">
          <div>
            <label htmlFor="general-notes" className="label">Meeting notes</label>
            <textarea
              id="general-notes"
              data-autofocus
              value={localNotes}
              onChange={(e) => { setLocalNotes(e.target.value); updateGeneralNotes(e.target.value); }}
              placeholder="Observations, quotes, action items…"
              className={`field min-h-[260px] resize-y leading-relaxed ${isOverLimit ? 'field-error' : ''}`}
            />
            <div className="mt-1.5 flex justify-between text-xs text-fg-3">
              <span>{wordCount.toLocaleString()} words</span>
              <span className={isOverLimit ? 'text-danger font-medium' : ''}>
                {localNotes.length.toLocaleString()} / {MAX_CHARS.toLocaleString()}
              </span>
            </div>
          </div>

          <section>
            <h3 className="section-label mb-2">Notes on library items</h3>
            {itemNotes.length === 0 ? (
              <p className="text-[13px] text-fg-3">
                Use the <Icon name="note" size={13} className="inline -mt-0.5" /> button on any card to attach a note.
              </p>
            ) : (
              <ul className="space-y-2">
                {itemNotes.map(({ id, note, title }) => (
                  <li key={id}>
                    <button
                      type="button"
                      onClick={() => openNoteModal(id)}
                      className="w-full text-left p-3 rounded-lg border border-line hover:border-line-strong hover:bg-subtle transition-colors"
                    >
                      <div className="text-xs font-medium text-fg-2 truncate">{title}</div>
                      <div className="mt-1 text-[13px] text-fg line-clamp-3 whitespace-pre-wrap">{note.content}</div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h3 className="section-label mb-2">Session</h3>
            <dl className="text-[13px] divide-y divide-line border border-line rounded-lg">
              {[
                ['Prospect', currentSession.name],
                ['Stage', currentSession.metadata.dealStage],
                ['Industry', industryName || '—'],
                ['Meeting', formatDateTime(currentSession.metadata.demoDate)],
                ['Saved to export', `${Object.values(currentSession.selectedItems).flat().length} items`],
                ['Last saved', saveState.at ? formatDateTime(saveState.at) : '—'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 px-3 py-2">
                  <dt className="text-fg-3">{k}</dt>
                  <dd className="text-fg text-right truncate">{v}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>
      </div>
    </Drawer>
  );
};

export default NotesPanel;
