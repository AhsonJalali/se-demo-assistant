import React from 'react';
import { useApp } from '../context/AppContext';

const NoteButton = ({ itemId }) => {
  const { getItemNote, openNoteModal } = useApp();

  const note = getItemNote(itemId);
  const hasNote = note && note.content && note.content.trim().length > 0;

  const handleClick = (e) => {
    e.stopPropagation(); // Prevent card expansion
    openNoteModal(itemId);
  };

  return (
    <button
      onClick={handleClick}
      className={`group relative w-8 h-8 rounded-lg border transition-all duration-300 flex items-center justify-center ${
        hasNote
          ? 'border-[#00D2FF] bg-[#00D2FF]/20 hover:bg-[#00D2FF]/30'
          : 'border-[#1B1B61] bg-[#08062B]/80 hover:border-[#00D2FF]/50 hover:bg-[#00D2FF]/10'
      }`}
      title={hasNote ? 'Edit note' : 'Add note'}
    >
      <svg
        className={`w-4 h-4 ${hasNote ? 'text-[#00D2FF]' : 'text-[#a8b0c8]'} group-hover:text-[#00D2FF] transition-colors duration-200`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>

      {/* Note indicator badge */}
      {hasNote && (
        <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#00D2FF] border border-[#08062B] animate-pulse" />
      )}
    </button>
  );
};

export default NoteButton;
