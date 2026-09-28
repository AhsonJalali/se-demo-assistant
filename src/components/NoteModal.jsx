import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { formatDateTime } from '../utils/format';
import Dialog from './ui/Dialog';

const MAX_CHARS = 2000;

/** Finds the library item a note is attached to, for the dialog title. */
const findItemTitle = (content, itemId) => {
  for (const list of Object.values(content)) {
    const item = Array.isArray(list) && list.find(i => i.id === itemId);
    if (item) return item.question || item.objection || item.feature || item.name || null;
  }
  return null;
};

const NoteModal = () => {
  const { editingNoteItemId, getItemNote, addItemNote, removeItemNote, closeNoteModal, content } = useApp();
  const [text, setText] = useState('');

  useEffect(() => {
    if (editingNoteItemId) setText(getItemNote(editingNoteItemId)?.content || '');
  }, [editingNoteItemId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!editingNoteItemId) return null;

  const note = getItemNote(editingNoteItemId);
  const isOverLimit = text.length > MAX_CHARS;
  const itemTitle = findItemTitle(content, editingNoteItemId);

  const handleSave = () => {
    if (isOverLimit) return;
    if (text.trim()) addItemNote(editingNoteItemId, text);
    else removeItemNote(editingNoteItemId);
    closeNoteModal();
  };

  const handleDelete = () => {
    removeItemNote(editingNoteItemId);
    closeNoteModal();
  };

  return (
    <Dialog
      title={note?.content ? 'Edit note' : 'Add note'}
      description={itemTitle || undefined}
      onClose={closeNoteModal}
      size="lg"
      footer={
        <>
          {note?.content && (
            <button type="button" onClick={handleDelete} className="btn btn-danger-ghost mr-auto">Delete note</button>
          )}
          <span className="hidden sm:flex items-center gap-1 text-xs text-fg-3 mr-2"><kbd>⌘</kbd><kbd>↵</kbd> to save</span>
          <button type="button" className="btn btn-secondary" onClick={closeNoteModal}>Cancel</button>
          <button type="button" className="btn btn-primary" onClick={handleSave} disabled={isOverLimit}>Save note</button>
        </>
      }
    >
      <label htmlFor="note-text" className="sr-only">Note</label>
      <textarea
        id="note-text"
        data-autofocus
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
            e.preventDefault();
            handleSave();
          }
        }}
        placeholder="What did the prospect say? What should you follow up on?"
        className={`field min-h-[220px] resize-y leading-relaxed ${isOverLimit ? 'field-error' : ''}`}
      />
      <div className="mt-2 flex justify-between text-xs text-fg-3">
        <span>{note?.lastModified ? `Last edited ${formatDateTime(note.lastModified)}` : ''}</span>
        <span className={isOverLimit ? 'text-danger font-medium' : ''}>
          {text.length.toLocaleString()} / {MAX_CHARS.toLocaleString()}
        </span>
      </div>
    </Dialog>
  );
};

export default NoteModal;
