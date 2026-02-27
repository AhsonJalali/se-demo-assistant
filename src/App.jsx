import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Layout from './components/Layout';
import Header from './components/Header';
import TabNavigation from './components/TabNavigation';
import FilterPanel from './components/FilterPanel';
import ContentDisplay from './components/ContentDisplay';
import SessionModal from './components/SessionModal';
import NoteModal from './components/NoteModal';
import NotesPanel from './components/NotesPanel';
import ExportModal from './components/ExportModal';
import Toast from './components/Toast';
import UseCaseDocumentationPanel from './components/UseCaseDocumentationPanel';

const AppContent = () => {
  const { showSessionModal, showNotesPanel, showExportModal, showUseCasePanel, activeTab } = useApp();

  return (
    <>
      <Layout>
        <Header />
        <TabNavigation />
        <div className="flex flex-1 overflow-hidden">
          {activeTab !== 'ai-prep' && <FilterPanel />}
          <ContentDisplay />
        </div>
      </Layout>

      {/* Modals */}
      {showSessionModal && <SessionModal />}
      <NoteModal />
      {showExportModal && <ExportModal />}

      {/* Notes Panel */}
      {showNotesPanel && <NotesPanel />}

      {/* Use Case Documentation Panel */}
      {showUseCasePanel && <UseCaseDocumentationPanel />}

      {/* Toast Notifications */}
      <Toast />
    </>
  );
};

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
