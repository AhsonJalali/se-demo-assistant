import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Sidebar from './components/Sidebar';
import ContentDisplay from './components/ContentDisplay';
import SessionModal from './components/SessionModal';
import NoteModal from './components/NoteModal';
import NotesPanel from './components/NotesPanel';
import ExportModal from './components/ExportModal';
import SettingsDialog from './components/SettingsDialog';
import ShortcutsDialog from './components/ShortcutsDialog';
import Toast from './components/Toast';
import UseCaseDocumentationPanel from './components/UseCaseDocumentationPanel';
import LoginGate from './components/LoginGate';
import ErrorBoundary from './components/ErrorBoundary';

const AppContent = () => {
  const {
    activeTab,
    showSessionModal,
    showNotesPanel,
    showExportModal,
    showUseCasePanel,
    showSettings,
    showShortcuts,
  } = useApp();

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] btn btn-primary"
      >
        Skip to content
      </a>
      <div className="flex h-full bg-canvas">
        <Sidebar />
        <main id="main" className="flex-1 min-w-0 flex flex-col bg-canvas">
          {/* Reset the boundary when switching views so one broken view doesn't strand the app. */}
          <ErrorBoundary key={activeTab} scope="view">
            <ContentDisplay />
          </ErrorBoundary>
        </main>
      </div>

      {showSessionModal && <SessionModal />}
      <NoteModal />
      {showExportModal && <ExportModal />}
      {showSettings && <SettingsDialog />}
      {showShortcuts && <ShortcutsDialog />}
      {showNotesPanel && <NotesPanel />}
      {showUseCasePanel && <UseCaseDocumentationPanel />}
      <Toast />
    </>
  );
};

function App() {
  return (
    <ErrorBoundary scope="app">
      <LoginGate>
        <AppProvider>
          <AppContent />
        </AppProvider>
      </LoginGate>
    </ErrorBoundary>
  );
}

export default App;
