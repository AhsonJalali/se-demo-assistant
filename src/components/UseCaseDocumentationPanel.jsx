import React from 'react';
import { useApp } from '../context/AppContext';
import { useResizable } from '../hooks/useResizable';
import CustomerContextCard from './useCasePanel/CustomerContextCard';
import StakeholdersCard from './useCasePanel/StakeholdersCard';
import TimelineCard from './useCasePanel/TimelineCard';
import BusinessRequirementsCard from './useCasePanel/BusinessRequirementsCard';
import TechnicalRequirementsCard from './useCasePanel/TechnicalRequirementsCard';

const UseCaseDocumentationPanel = () => {
  const { currentSession, setShowUseCasePanel, selectedUseCaseId, setShowExportModal, showToast, allCardsCollapsed, setAllCardsCollapsed } = useApp();
  const { width, startResize, isResizing } = useResizable(60);

  const handleClose = () => {
    setShowUseCasePanel(false);
  };

  const handleExport = () => {
    setShowExportModal(true);
  };

  const handleCollapseAll = () => {
    const newCollapsedState = !allCardsCollapsed;
    setAllCardsCollapsed(newCollapsedState);
    showToast(newCollapsedState ? 'All cards collapsed' : 'All cards expanded', 'info');
  };

  const handleCopyLink = () => {
    showToast('Copy Link - Feature coming soon', 'info');
  };

  const handleHelp = () => {
    showToast('Help - Keyboard shortcuts coming soon', 'info');
  };

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={handleClose}
      />

      {/* Slide-in panel */}
      <div className="fixed top-0 right-0 h-full bg-[var(--color-bg-primary)] shadow-2xl z-50 flex flex-col animate-slideInRight" style={{ width: `${width}%` }}>
        {/* Resize Handle */}
        <div
          className={`absolute left-0 top-0 bottom-0 w-1 cursor-ew-resize hover:bg-[#00D2FF]/50 transition-colors ${
            isResizing ? 'bg-[#00D2FF]' : ''
          }`}
          onMouseDown={startResize}
        />
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
          <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Use Case Documentation</h2>
          <button
            onClick={handleClose}
            className="text-[var(--color-text-secondary)] hover:text-[var(--color-accent-gold)] transition-colors"
            aria-label="Close panel"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Quick Action Toolbar */}
        <div className="sticky top-0 z-10 bg-[#141040] border-b border-[#00D2FF]/20 px-6 py-3">
          <div className="flex items-center gap-3">
            {/* Collapse All Button */}
            <button
              type="button"
              onClick={handleCollapseAll}
              className="group flex items-center gap-2 px-3 py-2 rounded-md bg-[#1B1B4A] hover:bg-[#232060] border border-[#00D2FF]/20 hover:border-[#00D2FF]/50 transition-all duration-200"
              title={allCardsCollapsed ? "Expand all cards" : "Collapse all cards"}
              aria-label={allCardsCollapsed ? "Expand all cards" : "Collapse all cards"}
            >
              {allCardsCollapsed ? (
                <svg className="w-4 h-4 text-gray-400 group-hover:text-[#00D2FF] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-gray-400 group-hover:text-[#00D2FF] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
              <span className="text-sm text-gray-300 group-hover:text-[#00D2FF] transition-colors">
                {allCardsCollapsed ? 'Expand All' : 'Collapse All'}
              </span>
            </button>

            {/* Export Button */}
            <button
              type="button"
              onClick={handleExport}
              className="group flex items-center gap-2 px-3 py-2 rounded-md bg-[#1B1B4A] hover:bg-[#232060] border border-[#00D2FF]/20 hover:border-[#00D2FF]/50 transition-all duration-200"
              title="Export use case documentation"
              aria-label="Export documentation"
            >
              <svg className="w-4 h-4 text-gray-400 group-hover:text-[#00D2FF] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-sm text-gray-300 group-hover:text-[#00D2FF] transition-colors">Export</span>
            </button>

            {/* Copy Link Button */}
            <button
              type="button"
              onClick={handleCopyLink}
              className="group flex items-center gap-2 px-3 py-2 rounded-md bg-[#1B1B4A] hover:bg-[#232060] border border-[#00D2FF]/20 hover:border-[#00D2FF]/50 transition-all duration-200"
              title="Copy shareable link"
              aria-label="Copy shareable link"
            >
              <svg className="w-4 h-4 text-gray-400 group-hover:text-[#00D2FF] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              <span className="text-sm text-gray-300 group-hover:text-[#00D2FF] transition-colors">Copy Link</span>
            </button>

            {/* Help Button */}
            <button
              type="button"
              onClick={handleHelp}
              className="group flex items-center gap-2 px-3 py-2 rounded-md bg-[#1B1B4A] hover:bg-[#232060] border border-[#00D2FF]/20 hover:border-[#00D2FF]/50 transition-all duration-200 ml-auto"
              title="Show tips and keyboard shortcuts"
              aria-label="Show help and keyboard shortcuts"
            >
              <svg className="w-4 h-4 text-gray-400 group-hover:text-[#00D2FF] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm text-gray-300 group-hover:text-[#00D2FF] transition-colors">Help</span>
            </button>
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
          {!currentSession ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md">
                <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--color-accent-gold)]/10">
                  <svg className="w-8 h-8 text-[var(--color-accent-gold)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">No Active Session</h3>
                <p className="text-[var(--color-text-secondary)] mb-4">
                  Please create or load a session before documenting use cases.
                </p>
                <button
                  onClick={handleClose}
                  className="px-4 py-2 bg-[var(--color-accent-gold)] text-[var(--color-bg-primary)] rounded-lg hover:bg-[var(--color-accent-gold-muted)] transition-colors font-medium"
                >
                  Close Panel
                </button>
              </div>
            </div>
          ) : (
            <>
              <CustomerContextCard useCaseId={selectedUseCaseId} collapsed={allCardsCollapsed} />
              <StakeholdersCard useCaseId={selectedUseCaseId} collapsed={allCardsCollapsed} />
              <TimelineCard useCaseId={selectedUseCaseId} collapsed={allCardsCollapsed} />
              <BusinessRequirementsCard useCaseId={selectedUseCaseId} collapsed={allCardsCollapsed} />
              <TechnicalRequirementsCard useCaseId={selectedUseCaseId} collapsed={allCardsCollapsed} />
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default UseCaseDocumentationPanel;
