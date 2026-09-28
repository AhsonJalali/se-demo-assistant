import React from 'react';
import { useApp } from '../context/AppContext';
import { getView } from '../config/views';
import Card from './Card';
import ThreeWhysContent from './ThreeWhysContent';
import AIPrepTab from './AIPrepTab';
import ObjectionCopilot from './ObjectionCopilot';
import PageHeader from './PageHeader';
import FilterMenu from './ui/FilterMenu';
import EmptyState from './ui/EmptyState';
import Icon from './ui/Icon';

const CARD_TYPE = {
  discovery: 'discovery',
  differentiators: 'differentiator',
  objections: 'objection',
  usecases: 'usecase',
};

const SearchField = () => {
  const { searchQuery, setSearchQuery, searchInputRef, activeTab } = useApp();
  const view = getView(activeTab);
  return (
    <div className="relative flex-1 min-w-[12rem] max-w-md">
      <Icon name="search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-3 pointer-events-none" />
      <input
        ref={searchInputRef}
        type="search"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder={`Search ${view.label.toLowerCase()}`}
        aria-label={`Search ${view.label}`}
        className="field h-8 pl-9 pr-14 py-0 rounded-full [&::-webkit-search-cancel-button]:hidden"
      />
      {searchQuery ? (
        <button
          type="button"
          onClick={() => { setSearchQuery(''); searchInputRef.current?.focus(); }}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 icon-btn w-6 h-6"
          aria-label="Clear search"
        >
          <Icon name="x" size={13} />
        </button>
      ) : (
        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 hidden sm:flex gap-0.5 pointer-events-none">
          <kbd>⌘</kbd><kbd>K</kbd>
        </span>
      )}
    </div>
  );
};

const Filters = () => {
  const {
    activeTab, categories,
    selectedIndustries, setSelectedIndustries,
    selectedCompetitors, setSelectedCompetitors,
    selectedCategories, setSelectedCategories,
  } = useApp();

  const industries = categories.industries.filter(i => i.id !== 'all');
  return (
    <>
      {(activeTab === 'discovery' || activeTab === 'usecases') && (
        <FilterMenu label="Industry" options={industries} selected={selectedIndustries} onChange={setSelectedIndustries} />
      )}
      {activeTab === 'discovery' && (
        <FilterMenu label="Topic" options={categories.discoveryCategories} selected={selectedCategories} onChange={setSelectedCategories} />
      )}
      {activeTab === 'differentiators' && (
        <FilterMenu label="Alternative" options={categories.competitors} selected={selectedCompetitors} onChange={setSelectedCompetitors} />
      )}
    </>
  );
};

const LibraryView = () => {
  const {
    activeTab, filteredContent, content, searchQuery, clearFilters,
    selectedIndustries, selectedCompetitors, selectedCategories, currentSession,
  } = useApp();
  const view = getView(activeTab);
  const total = content[activeTab]?.length ?? 0;

  const relevantFilterCount =
    (activeTab === 'discovery' || activeTab === 'usecases' ? selectedIndustries.length : 0) +
    (activeTab === 'discovery' ? selectedCategories.length : 0) +
    (activeTab === 'differentiators' ? selectedCompetitors.length : 0);
  const narrowed = relevantFilterCount > 0 || searchQuery.trim();

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <PageHeader title={view.label} description={view.description}>
        <div className="flex flex-wrap items-center gap-2">
          <SearchField />
          <Filters />
          {narrowed && (
            <button type="button" onClick={clearFilters} className="btn btn-ghost btn-sm rounded-full">
              Clear all
            </button>
          )}
          <span className="ml-auto text-xs text-fg-3 tabular-nums" role="status" aria-live="polite">
            {narrowed ? `${filteredContent.length} of ${total}` : `${total} items`}
          </span>
        </div>
      </PageHeader>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {activeTab === 'objections' && <ObjectionCopilot />}

          {!currentSession && (
            <p className="mb-4 flex items-center gap-2 text-xs text-fg-3">
              <Icon name="info" size={14} />
              Start a session to take notes on cards and save them to an export.
            </p>
          )}

          {filteredContent.length === 0 ? (
            <EmptyState
              icon="search"
              title="Nothing matches"
              action={<button type="button" className="btn btn-secondary btn-sm" onClick={clearFilters}>Clear search and filters</button>}
            >
              {searchQuery.trim()
                ? <>No {view.label.toLowerCase()} match “{searchQuery.trim()}” with the current filters.</>
                : <>No {view.label.toLowerCase()} match the current filters.</>}
            </EmptyState>
          ) : (
            <ul className="space-y-2.5">
              {filteredContent.map(item => (
                <li key={item.id}>
                  <Card item={item} type={CARD_TYPE[activeTab]} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

const ContentDisplay = () => {
  const { activeTab } = useApp();
  if (activeTab === 'three-whys') return <ThreeWhysContent />;
  if (activeTab === 'ai-prep') return <AIPrepTab />;
  return <LibraryView />;
};

export default ContentDisplay;
