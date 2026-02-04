import React from 'react';
import { useApp } from '../context/AppContext';

const UseCaseDocumentationPanel = () => {
  const { setShowUseCasePanel, selectedUseCaseId } = useApp();

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
      <div className="fixed top-0 right-0 h-full w-[600px] bg-white shadow-2xl z-50 flex flex-col animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Use Case Documentation</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content area - empty for now */}
        <div className="flex-1 overflow-y-auto p-6">
          <p className="text-gray-500">Documentation content will appear here for use case: {selectedUseCaseId}</p>
        </div>
      </div>
    </>
  );
};

export default UseCaseDocumentationPanel;
