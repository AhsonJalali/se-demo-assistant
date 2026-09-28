import React from 'react';
import { useApp } from '../context/AppContext';
import Icon from './ui/Icon';

const NoteButton = ({ itemId }) => {
  const { getItemNote, openNoteModal } = useApp();
  const note = getItemNote(itemId);
  const hasNote = Boolean(note?.content?.trim());

  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); openNoteModal(itemId); }}
      className={`icon-btn relative ${hasNote ? 'text-accent hover:text-accent' : ''}`}
      aria-label={hasNote ? 'Edit note' : 'Add note'}
      title={hasNote ? 'Edit note' : 'Add note'}
    >
      <Icon name="note" size={16} />
      {hasNote && <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-accent" aria-hidden="true" />}
    </button>
  );
};

export default NoteButton;
