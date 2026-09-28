import React from 'react';
import { useApp } from '../context/AppContext';
import Drawer from './ui/Drawer';
import EmptyState from './ui/EmptyState';
import Icon from './ui/Icon';
import CustomerContextCard from './useCasePanel/CustomerContextCard';
import StakeholdersCard from './useCasePanel/StakeholdersCard';
import TimelineCard from './useCasePanel/TimelineCard';
import BusinessRequirementsCard from './useCasePanel/BusinessRequirementsCard';
import TechnicalRequirementsCard from './useCasePanel/TechnicalRequirementsCard';

const UseCaseDocumentationPanel = () => {
  const {
    currentSession,
    setShowUseCasePanel,
    selectedUseCaseId,
    setShowExportModal,
    allCardsCollapsed,
    setAllCardsCollapsed,
    content,
    openNewSession,
    saveState,
  } = useApp();

  const close = () => setShowUseCasePanel(false);
  const useCase = content.usecases.find(u => u.id === selectedUseCaseId);

  return (
    <Drawer
      title={useCase ? useCase.name : 'Use case'}
      subtitle={currentSession ? `${currentSession.name} · ${saveState.status === 'saving' ? 'Saving…' : 'Saved'}` : undefined}
      onClose={close}
      width={760}
      actions={currentSession && (
        <>
          <button
            type="button"
            onClick={() => setAllCardsCollapsed(!allCardsCollapsed)}
            className="btn btn-ghost btn-sm"
            aria-label={allCardsCollapsed ? 'Expand all sections' : 'Collapse all sections'}
          >
            <Icon name={allCardsCollapsed ? 'maximize' : 'minimize'} size={14} />
            <span className="hidden sm:inline">{allCardsCollapsed ? 'Expand all' : 'Collapse all'}</span>
          </button>
          <button type="button" onClick={() => setShowExportModal(true)} className="btn btn-secondary btn-sm">
            <Icon name="download" size={14} />
            <span className="hidden sm:inline">Export</span>
          </button>
        </>
      )}
    >
      <div className="flex-1 overflow-y-auto scrollbar-thin bg-canvas">
        {!currentSession ? (
          <EmptyState
            icon="file-text"
            title="No session open"
            action={<button type="button" className="btn btn-primary btn-sm" onClick={() => { close(); openNewSession(); }}>New session</button>}
          >
            Use-case documentation is saved per prospect. Start a session to capture context, stakeholders, and requirements.
          </EmptyState>
        ) : (
          <div className="p-5 space-y-4">
            {useCase && <p className="text-[13px] text-fg-2 leading-relaxed">{useCase.description}</p>}
            <CustomerContextCard useCaseId={selectedUseCaseId} collapsed={allCardsCollapsed} />
            <StakeholdersCard useCaseId={selectedUseCaseId} collapsed={allCardsCollapsed} />
            <TimelineCard useCaseId={selectedUseCaseId} collapsed={allCardsCollapsed} />
            <BusinessRequirementsCard useCaseId={selectedUseCaseId} collapsed={allCardsCollapsed} />
            <TechnicalRequirementsCard useCaseId={selectedUseCaseId} collapsed={allCardsCollapsed} />
          </div>
        )}
      </div>
    </Drawer>
  );
};

export default UseCaseDocumentationPanel;
