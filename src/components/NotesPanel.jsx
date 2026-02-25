import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

const MAX_CHARS = 50000;

const NotesPanel = () => {
  const {
    showNotesPanel,
    setShowNotesPanel,
    currentSession,
    updateGeneralNotes,
    filteredContent
  } = useApp();

  const [localNotes, setLocalNotes] = useState('');

  // Sync local notes with current session
  useEffect(() => {
    if (currentSession) {
      setLocalNotes(currentSession.notes.general || '');
    } else {
      setLocalNotes('');
    }
  }, [currentSession]);

  // Update notes in context (triggers auto-save)
  const handleNotesChange = (e) => {
    const newValue = e.target.value;
    setLocalNotes(newValue);
    updateGeneralNotes(newValue);
  };

  if (!showNotesPanel) return null;

  const charCount = localNotes.length;
  const wordCount = localNotes.trim() ? localNotes.trim().split(/\s+/).length : 0;
  const isOverLimit = charCount > MAX_CHARS;

  // Get selected items count
  const selectedCount = currentSession
    ? Object.values(currentSession.selectedItems).flat().length
    : 0;

  // Get item notes count
  const itemNotesCount = currentSession
    ? Object.keys(currentSession.notes.items).length
    : 0;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden animate-fadeIn"
        onClick={() => setShowNotesPanel(false)}
      />

      {/* Panel */}
      <aside className="fixed top-0 right-0 h-full w-full lg:w-[400px] bg-[#08062B] border-l border-[#1B1B61] z-50 flex flex-col animate-slideInRight shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#1B1B61] bg-[#08062B]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-[#00D2FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <h2 className="text-lg font-bold text-[#e8eaf0]">Notes</h2>
            </div>
            <button
              onClick={() => setShowNotesPanel(false)}
              className="p-2 rounded-lg hover:bg-[#1B1B61] transition-colors duration-200"
            >
              <svg className="w-5 h-5 text-[#a8b0c8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {!currentSession ? (
            <div className="flex flex-col items-center justify-center h-full px-6 text-center">
              <svg className="w-16 h-16 text-[#a8b0c8]/30 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-[#a8b0c8] mb-2">No active session</p>
              <p className="text-sm text-[#a8b0c8]/70">Create or select a session to start taking notes</p>
            </div>
          ) : (
            <div className="p-6 space-y-6">
              {/* General Notes Section */}
              <div>
                <label className="block text-sm font-medium text-[#e8eaf0] mb-2">
                  General Notes
                </label>
                <textarea
                  value={localNotes}
                  onChange={handleNotesChange}
                  placeholder="Add general observations, key points, or action items..."
                  className="w-full h-64 px-4 py-3 bg-[#08062B] border border-[#1B1B61] rounded-lg text-[#e8eaf0] placeholder-[#a8b0c8]/50 focus:outline-none focus:border-[#00D2FF] transition-colors duration-200 resize-none custom-scrollbar"
                />
                <div className="flex items-center justify-between mt-2 text-xs">
                  <span className="text-[#a8b0c8]">
                    {wordCount.toLocaleString()} words
                  </span>
                  <span className={isOverLimit ? 'text-red-400' : 'text-[#a8b0c8]'}>
                    {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()} chars
                  </span>
                </div>
              </div>

              {/* Session Summary */}
              <div className="pt-6 border-t border-[#1B1B61]">
                <h3 className="text-sm font-medium text-[#e8eaf0] mb-3">Session Summary</h3>
                <div className="space-y-3">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="px-3 py-2 bg-[#1B1B61]/30 rounded-lg border border-[#1B1B61]">
                      <div className="text-2xl font-bold text-[#00D2FF]">{selectedCount}</div>
                      <div className="text-xs text-[#a8b0c8]">Selected Items</div>
                    </div>
                    <div className="px-3 py-2 bg-[#1B1B61]/30 rounded-lg border border-[#1B1B61]">
                      <div className="text-2xl font-bold text-[#00D2FF]">{itemNotesCount}</div>
                      <div className="text-xs text-[#a8b0c8]">Item Notes</div>
                    </div>
                  </div>

                  {/* Content Visible */}
                  <div className="px-3 py-2 bg-[#1B1B61]/30 rounded-lg border border-[#1B1B61]">
                    <div className="text-xs text-[#a8b0c8] mb-1">Visible Content</div>
                    <div className="text-sm font-medium text-[#e8eaf0]">
                      {filteredContent.length} items
                    </div>
                  </div>
                </div>
              </div>

              {/* Session Metadata */}
              <div className="pt-6 border-t border-[#1B1B61]">
                <h3 className="text-sm font-medium text-[#e8eaf0] mb-3">Session Details</h3>
                <div className="space-y-2">
                  <div className="flex items-start justify-between text-sm">
                    <span className="text-[#a8b0c8]">Customer</span>
                    <span className="text-[#e8eaf0] font-medium text-right">{currentSession.name}</span>
                  </div>
                  <div className="flex items-start justify-between text-sm">
                    <span className="text-[#a8b0c8]">Demo Date</span>
                    <span className="text-[#e8eaf0] text-right">{formatDate(currentSession.metadata.demoDate)}</span>
                  </div>
                  <div className="flex items-start justify-between text-sm">
                    <span className="text-[#a8b0c8]">Deal Stage</span>
                    <span className="text-[#e8eaf0]">{currentSession.metadata.dealStage}</span>
                  </div>
                  {currentSession.metadata.industries && currentSession.metadata.industries.length > 0 && (
                    <div className="flex items-start justify-between text-sm">
                      <span className="text-[#a8b0c8]">Industries</span>
                      <div className="text-right text-[#e8eaf0] max-w-[60%]">
                        {currentSession.metadata.industries.length} selected
                      </div>
                    </div>
                  )}
                  {currentSession.metadata.useCases && currentSession.metadata.useCases.length > 0 && (
                    <div className="flex items-start justify-between text-sm">
                      <span className="text-[#a8b0c8]">Use Cases</span>
                      <div className="text-right text-[#e8eaf0] max-w-[60%]">
                        {currentSession.metadata.useCases.length} selected
                      </div>
                    </div>
                  )}
                  <div className="flex items-start justify-between text-sm pt-2 border-t border-[#1B1B61]/50">
                    <span className="text-[#a8b0c8]">Last Updated</span>
                    <span className="text-[#e8eaf0] text-right text-xs">{formatDate(currentSession.updatedAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default NotesPanel;
