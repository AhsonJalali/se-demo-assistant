import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';

const MAX_CHARS = 2000;

const NoteModal = () => {
  const {
    editingNoteItemId,
    getItemNote,
    addItemNote,
    removeItemNote,
    closeNoteModal
  } = useApp();

  const [content, setContent] = useState('');
  const textareaRef = useRef(null);

  // Load existing note content
  useEffect(() => {
    if (editingNoteItemId) {
      const note = getItemNote(editingNoteItemId);
      setContent(note?.content || '');
    }
  }, [editingNoteItemId, getItemNote]);

  // Auto-focus textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [editingNoteItemId]);

  if (!editingNoteItemId) return null;

  const note = getItemNote(editingNoteItemId);
  const charCount = content.length;
  const isOverLimit = charCount > MAX_CHARS;

  const handleSave = () => {
    if (!isOverLimit) {
      if (content.trim()) {
        addItemNote(editingNoteItemId, content);
      } else {
        removeItemNote(editingNoteItemId);
      }
      closeNoteModal();
    }
  };

  const handleDelete = () => {
    removeItemNote(editingNoteItemId);
    closeNoteModal();
  };

  const handleCancel = () => {
    closeNoteModal();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleCancel();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleCancel();
    }
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      handleSave();
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fadeIn"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
    >
      <div className="w-full max-w-2xl max-h-[80vh] bg-[#08062B] border border-[#1B1B61] rounded-xl shadow-2xl animate-scaleIn flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#1B1B61]">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-[#e8eaf0]">Note</h3>
              {note && note.timestamp && (
                <p className="text-xs text-[#a8b0c8] mt-1">
                  {note.lastModified !== note.timestamp ? 'Modified' : 'Created'}: {formatTimestamp(note.lastModified || note.timestamp)}
                </p>
              )}
            </div>
            <button
              onClick={handleCancel}
              className="p-2 rounded-lg hover:bg-[#1B1B61] transition-colors duration-200"
            >
              <svg className="w-5 h-5 text-[#a8b0c8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-hidden flex flex-col">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Add your notes here..."
            className="w-full h-full min-h-[300px] px-4 py-3 bg-[#08062B] border border-[#1B1B61] rounded-lg text-[#e8eaf0] placeholder-[#a8b0c8]/50 focus:outline-none focus:border-[#00D2FF] transition-colors duration-200 resize-none custom-scrollbar"
          />

          {/* Character Count */}
          <div className={`mt-2 text-xs text-right ${isOverLimit ? 'text-red-400' : 'text-[#a8b0c8]'}`}>
            {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()} characters
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-[#1B1B61] flex items-center justify-between">
          <div>
            {note && note.content && (
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors duration-200"
              >
                Delete Note
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleCancel}
              className="px-6 py-2 rounded-lg border border-[#1B1B61] text-[#e8eaf0] hover:bg-[#1B1B61] transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isOverLimit}
              className={`px-6 py-2 rounded-lg font-medium transition-colors duration-200 ${
                isOverLimit
                  ? 'bg-[#1B1B61] text-[#a8b0c8] cursor-not-allowed'
                  : 'bg-[#00D2FF] text-[#08062B] hover:bg-[#00D2FF]/90'
              }`}
            >
              Save Note
            </button>
          </div>
        </div>

        {/* Keyboard Shortcuts Help */}
        <div className="px-6 py-2 text-xs text-[#a8b0c8] border-t border-[#1B1B61]/50">
          <span className="inline-flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-[#1B1B61] rounded text-[10px]">Esc</kbd> to cancel
          </span>
          <span className="inline-flex items-center gap-1 ml-4">
            <kbd className="px-1.5 py-0.5 bg-[#1B1B61] rounded text-[10px]">⌘/Ctrl</kbd>
            <kbd className="px-1.5 py-0.5 bg-[#1B1B61] rounded text-[10px]">Enter</kbd> to save
          </span>
        </div>
      </div>
    </div>
  );
};

export default NoteModal;
