import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { generatePDF } from '../utils/exportToPDF';
import { generateDocx } from '../utils/exportToDocx';
import discoveryData from '../data/discovery.json';
import differentiatorsData from '../data/differentiators.json';
import objectionsData from '../data/objections.json';
import usecasesData from '../data/usecases.json';

const ExportModal = () => {
  const {
    currentSession,
    setShowExportModal,
    filteredContent,
    activeTab,
    showToast
  } = useApp();

  const [exportFormat, setExportFormat] = useState('pdf');
  const [isExporting, setIsExporting] = useState(false);

  if (!currentSession) return null;

  const handleClose = () => {
    setShowExportModal(false);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const getContentToExport = () => {
    // Get all content organized by category
    const discovery = [];
    const usecases = [];
    const differentiators = [];
    const objections = [];

    // Check if user has explicitly selected items
    const hasSelections =
      currentSession.selectedItems.discovery.length > 0 ||
      currentSession.selectedItems.usecases?.length > 0 ||
      currentSession.selectedItems.differentiators.length > 0 ||
      currentSession.selectedItems.objections.length > 0;

    if (hasSelections) {
      // Export only selected items
      // Discovery
      discoveryData.questions.forEach(q => {
        if (currentSession.selectedItems.discovery.includes(q.id)) {
          discovery.push(q);
        }
      });

      // Use Cases
      usecasesData.useCases.forEach(uc => {
        if (currentSession.selectedItems.usecases?.includes(uc.id)) {
          usecases.push(uc);
        }
      });

      // Differentiators
      Object.values(differentiatorsData.competitors).forEach(competitor => {
        competitor.differentiators.forEach(diff => {
          const itemId = diff.id;
          if (currentSession.selectedItems.differentiators.includes(itemId)) {
            differentiators.push({
              ...diff,
              competitorName: competitor.name,
              competitorId: Object.keys(differentiatorsData.competitors).find(
                key => differentiatorsData.competitors[key].name === competitor.name
              )
            });
          }
        });
      });

      // Objections
      objectionsData.objections.forEach(obj => {
        if (currentSession.selectedItems.objections.includes(obj.id)) {
          objections.push(obj);
        }
      });
    } else {
      // Export all items from all tabs
      discovery.push(...discoveryData.questions);
      usecases.push(...usecasesData.useCases);

      Object.values(differentiatorsData.competitors).forEach(competitor => {
        competitor.differentiators.forEach(diff => {
          differentiators.push({
            ...diff,
            competitorName: competitor.name,
            competitorId: Object.keys(differentiatorsData.competitors).find(
              key => differentiatorsData.competitors[key].name === competitor.name
            )
          });
        });
      });

      objections.push(...objectionsData.objections);
    }

    return {
      discovery,
      usecases,
      differentiators,
      objections
    };
  };

  const handleExport = async () => {
    setIsExporting(true);

    try {
      const content = getContentToExport();

      let fileName;
      if (exportFormat === 'pdf') {
        fileName = await generatePDF(currentSession, content);
      } else {
        fileName = await generateDocx(currentSession, content);
      }

      showToast(`Successfully exported: ${fileName}`, 'success');
      handleClose();
    } catch (error) {
      console.error('Export error:', error);
      showToast(`Export failed: ${error.message}`, 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const content = getContentToExport();
  const noteCount = Object.keys(currentSession.notes.items).length;
  const hasGeneralNotes = currentSession.notes.general && currentSession.notes.general.trim().length > 0;
  const hasThreeWhys = currentSession.threeWhys && Object.values(currentSession.threeWhys).some(answer => answer && answer.trim().length > 0);
  const selectedCount = Object.values(currentSession.selectedItems).flat().length;
  const totalItems = content.discovery.length + content.differentiators.length + content.objections.length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fadeIn"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-lg bg-[#08062B] border border-[#1B1B61] rounded-xl shadow-2xl animate-scaleIn">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#1B1B61]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-6 h-6 text-[#00D2FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h2 className="text-xl font-bold text-[#e8eaf0]">Export Session</h2>
            </div>
            <button
              onClick={handleClose}
              disabled={isExporting}
              className="p-2 rounded-lg hover:bg-[#1B1B61] transition-colors duration-200 disabled:opacity-50"
            >
              <svg className="w-5 h-5 text-[#a8b0c8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Session Info */}
          <div className="px-4 py-3 bg-[#1B1B61]/30 rounded-lg border border-[#1B1B61]">
            <h3 className="text-sm font-medium text-[#e8eaf0] mb-2">{currentSession.name}</h3>
            <p className="text-xs text-[#a8b0c8]">
              {new Date(currentSession.metadata.demoDate).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })} • {currentSession.metadata.dealStage}
            </p>
          </div>

          {/* Export Format Selection */}
          <div>
            <label className="block text-sm font-medium text-[#e8eaf0] mb-3">
              Export Format
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setExportFormat('pdf')}
                disabled={isExporting}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  exportFormat === 'pdf'
                    ? 'border-[#00D2FF] bg-[#00D2FF]/10'
                    : 'border-[#1B1B61] bg-[#08062B] hover:border-[#00D2FF]/50'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="text-sm font-medium text-[#e8eaf0]">PDF</div>
                <div className="text-xs text-[#a8b0c8] mt-1">Read-only format</div>
              </button>

              <button
                onClick={() => setExportFormat('docx')}
                disabled={isExporting}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  exportFormat === 'docx'
                    ? 'border-[#00D2FF] bg-[#00D2FF]/10'
                    : 'border-[#1B1B61] bg-[#08062B] hover:border-[#00D2FF]/50'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="text-sm font-medium text-[#e8eaf0]">Word</div>
                <div className="text-xs text-[#a8b0c8] mt-1">Editable format</div>
              </button>
            </div>
          </div>

          {/* Preview Checklist */}
          <div>
            <label className="block text-sm font-medium text-[#e8eaf0] mb-3">
              What will be exported
            </label>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm px-3 py-2 bg-[#1B1B61]/20 rounded">
                <span className="text-[#a8b0c8]">Session metadata</span>
                <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>

              {hasGeneralNotes && (
                <div className="flex items-center justify-between text-sm px-3 py-2 bg-[#1B1B61]/20 rounded">
                  <span className="text-[#a8b0c8]">General notes</span>
                  <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}

              {hasThreeWhys && (
                <div className="flex items-center justify-between text-sm px-3 py-2 bg-[#1B1B61]/20 rounded">
                  <span className="text-[#a8b0c8]">3 Why's responses</span>
                  <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}

              <div className="flex items-center justify-between text-sm px-3 py-2 bg-[#1B1B61]/20 rounded">
                <span className="text-[#a8b0c8]">
                  {selectedCount > 0 ? `${selectedCount} selected items` : `All items (${totalItems})`}
                </span>
                <span className="text-[#00D2FF] font-medium">{totalItems}</span>
              </div>

              {noteCount > 0 && (
                <div className="flex items-center justify-between text-sm px-3 py-2 bg-[#1B1B61]/20 rounded">
                  <span className="text-[#a8b0c8]">Item notes</span>
                  <span className="text-[#00D2FF] font-medium">{noteCount}</span>
                </div>
              )}

              {selectedCount === 0 && (
                <div className="mt-3 px-3 py-2 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <p className="text-xs text-blue-300">
                    💡 No items selected. All content will be exported.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-[#1B1B61] flex items-center justify-end gap-3">
          <button
            onClick={handleClose}
            disabled={isExporting}
            className="px-6 py-2 rounded-lg border border-[#1B1B61] text-[#e8eaf0] hover:bg-[#1B1B61] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="px-6 py-2 rounded-lg bg-[#00D2FF] text-[#08062B] font-medium hover:bg-[#00D2FF]/90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isExporting ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Export</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
