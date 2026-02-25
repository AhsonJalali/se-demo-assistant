import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getSessionsSortedByDate } from '../utils/sessionHelpers';

const SessionDropdown = () => {
  const {
    sessions,
    currentSession,
    loadSession,
    deleteSession,
    setShowSessionModal
  } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setDeleteConfirmId(null);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleNewSession = () => {
    setIsOpen(false);
    setShowSessionModal(true);
  };

  const handleSelectSession = (sessionId) => {
    loadSession(sessionId);
    setIsOpen(false);
  };

  const handleDeleteClick = (e, sessionId) => {
    e.stopPropagation();
    setDeleteConfirmId(sessionId);
  };

  const handleConfirmDelete = (e, sessionId) => {
    e.stopPropagation();
    deleteSession(sessionId);
    setDeleteConfirmId(null);
  };

  const handleCancelDelete = (e) => {
    e.stopPropagation();
    setDeleteConfirmId(null);
  };

  const sortedSessions = getSessionsSortedByDate();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatLastUpdated = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(dateString);
  };

  const getSessionStats = (session) => {
    const noteCount = Object.keys(session.notes.items).length;
    const hasGeneralNotes = session.notes.general && session.notes.general.trim().length > 0;
    const selectedCount = Object.values(session.selectedItems).flat().length;

    return { noteCount, hasGeneralNotes, selectedCount };
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Current Session Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#1B1B61] bg-[#08062B]/80 backdrop-blur-sm hover:border-[#00D2FF]/50 transition-all duration-300 group"
      >
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${currentSession ? 'bg-[#00D2FF]' : 'bg-[#a8b0c8]/30'} ${currentSession ? 'animate-pulse' : ''}`} />
          <span className="text-sm font-medium text-[#e8eaf0]">
            {currentSession ? currentSession.name : 'No Session'}
          </span>
        </div>
        <svg
          className={`w-4 h-4 text-[#a8b0c8] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 max-h-[500px] overflow-hidden rounded-lg border border-[#1B1B61] bg-[#08062B]/95 backdrop-blur-md shadow-2xl z-50 animate-slideDown">
          {/* New Session Button */}
          <button
            onClick={handleNewSession}
            className="w-full px-4 py-3 flex items-center gap-3 text-left border-b border-[#1B1B61] hover:bg-[#00D2FF]/10 transition-colors duration-200 group"
          >
            <div className="w-8 h-8 rounded-lg bg-[#00D2FF]/20 flex items-center justify-center group-hover:bg-[#00D2FF]/30 transition-colors duration-200">
              <svg className="w-5 h-5 text-[#00D2FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-medium text-[#e8eaf0]">New Session</div>
              <div className="text-xs text-[#a8b0c8]">Create a new demo session</div>
            </div>
          </button>

          {/* Sessions List */}
          <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
            {sortedSessions.length === 0 ? (
              <div className="px-4 py-8 text-center text-[#a8b0c8]">
                <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-sm">No sessions yet</p>
                <p className="text-xs mt-1">Create your first session to get started</p>
              </div>
            ) : (
              sortedSessions.map((session) => {
                const isActive = currentSession?.id === session.id;
                const stats = getSessionStats(session);
                const isDeleting = deleteConfirmId === session.id;

                return (
                  <div
                    key={session.id}
                    className={`relative border-b border-[#1B1B61] last:border-b-0 ${isActive ? 'bg-[#00D2FF]/10' : ''}`}
                  >
                    {/* Session Item */}
                    <button
                      onClick={() => handleSelectSession(session.id)}
                      disabled={isDeleting}
                      className={`w-full px-4 py-3 text-left hover:bg-[#00D2FF]/5 transition-colors duration-200 ${isDeleting ? 'opacity-50' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {isActive && (
                              <div className="w-1.5 h-1.5 rounded-full bg-[#00D2FF] animate-pulse" />
                            )}
                            <h3 className="text-sm font-medium text-[#e8eaf0] truncate">
                              {session.name}
                            </h3>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-[#a8b0c8] mb-2">
                            <span>{session.metadata.dealStage}</span>
                            <span>•</span>
                            <span>{formatDate(session.metadata.demoDate)}</span>
                          </div>

                          {/* Stats */}
                          <div className="flex items-center gap-3 text-xs text-[#a8b0c8]">
                            {stats.noteCount > 0 && (
                              <span className="flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                {stats.noteCount}
                              </span>
                            )}
                            {stats.selectedCount > 0 && (
                              <span className="flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                {stats.selectedCount}
                              </span>
                            )}
                            <span className="ml-auto">{formatLastUpdated(session.updatedAt)}</span>
                          </div>
                        </div>

                        {/* Delete Button */}
                        {!isDeleting && (
                          <button
                            onClick={(e) => handleDeleteClick(e, session.id)}
                            className="flex-shrink-0 p-1 rounded hover:bg-red-500/20 transition-colors duration-200 group/delete"
                            title="Delete session"
                          >
                            <svg className="w-4 h-4 text-[#a8b0c8] group-hover/delete:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </button>

                    {/* Delete Confirmation */}
                    {isDeleting && (
                      <div className="absolute inset-0 bg-[#08062B]/95 backdrop-blur-sm flex items-center justify-center gap-2 px-4">
                        <span className="text-xs text-[#e8eaf0] flex-1">Delete this session?</span>
                        <button
                          onClick={(e) => handleConfirmDelete(e, session.id)}
                          className="px-3 py-1 text-xs bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded transition-colors duration-200"
                        >
                          Delete
                        </button>
                        <button
                          onClick={handleCancelDelete}
                          className="px-3 py-1 text-xs bg-[#1B1B61] hover:bg-[#1B1B61]/70 text-[#e8eaf0] rounded transition-colors duration-200"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionDropdown;
