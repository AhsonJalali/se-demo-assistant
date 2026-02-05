import React from 'react';
import { useApp } from '../context/AppContext';
import { useResizable } from '../hooks/useResizable';
import CustomerContextCard from './useCasePanel/CustomerContextCard';
import StakeholdersCard from './useCasePanel/StakeholdersCard';
import TimelineCard from './useCasePanel/TimelineCard';
import BusinessRequirementsCard from './useCasePanel/BusinessRequirementsCard';

const UseCaseDocumentationPanel = () => {
  const { setShowUseCasePanel, selectedUseCaseId } = useApp();
  const { width, startResize, isResizing } = useResizable(60);

  const handleClose = () => {
    setShowUseCasePanel(false);
  };

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={handleClose}
      />

      {/* Slide-in panel */}
      <div className="fixed top-0 right-0 h-full bg-white shadow-2xl z-50 flex flex-col animate-slide-in" style={{ width: `${width}%` }}>
        {/* Resize Handle */}
        <div
          className={`absolute left-0 top-0 bottom-0 w-1 cursor-ew-resize hover:bg-[#d4af37]/50 transition-colors ${
            isResizing ? 'bg-[#d4af37]' : ''
          }`}
          onMouseDown={startResize}
        />
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Use Case Documentation</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Close panel"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
          <CustomerContextCard useCaseId={selectedUseCaseId} />
          <StakeholdersCard useCaseId={selectedUseCaseId} />
          <TimelineCard useCaseId={selectedUseCaseId} />
          <BusinessRequirementsCard useCaseId={selectedUseCaseId} />
        </div>
      </div>
    </>
  );
};

export default UseCaseDocumentationPanel;
