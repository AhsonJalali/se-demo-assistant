import React from 'react';
import { useApp } from '../context/AppContext';

const FilterPanel = () => {
  const {
    activeTab,
    selectedIndustries,
    setSelectedIndustries,
    selectedUseCases,
    setSelectedUseCases,
    selectedCompetitors,
    setSelectedCompetitors,
    selectedCategories,
    setSelectedCategories,
    clearFilters,
    categories
  } = useApp();

  const toggleFilter = (value, selected, setSelected) => {
    if (selected.includes(value)) {
      setSelected(selected.filter(item => item !== value));
    } else {
      setSelected([...selected, value]);
    }
  };

  const hasActiveFilters =
    selectedIndustries.length > 0 ||
    selectedUseCases.length > 0 ||
    selectedCompetitors.length > 0 ||
    selectedCategories.length > 0;

  const activeFilterCount =
    selectedIndustries.length +
    selectedUseCases.length +
    selectedCompetitors.length +
    selectedCategories.length;

  return (
    <aside className="w-80 border-r border-[var(--color-border-subtle)] overflow-y-auto animate-slide-in-right">
      <div className="sticky top-0 glass-panel-strong border-b border-[var(--color-border-subtle)] px-6 py-5 z-10">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-bold text-[var(--color-text-primary)]" style={{ fontFamily: "'Geist', serif" }}>
            Filters
          </h2>
          {activeFilterCount > 0 && (
            <div className="px-2 py-0.5 rounded-full bg-[var(--color-accent-gold)]/10 border border-[var(--color-accent-gold)]/30">
              <span className="text-xs font-bold text-[var(--color-accent-gold)]">{activeFilterCount}</span>
            </div>
          )}
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-xs font-medium text-[var(--color-text-tertiary)] hover:text-[var(--color-accent-gold)]
                     transition-all duration-200 flex items-center gap-1.5 group"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round"/>
            </svg>
            <span>Clear all filters</span>
          </button>
        )}
      </div>

      <div className="p-6 space-y-8">
        {/* Discovery filters */}
        {activeTab === 'discovery' && (
          <>
            <FilterSection
              title="Industry"
              items={categories.industries}
              selected={selectedIndustries}
              onToggle={(value) => toggleFilter(value, selectedIndustries, setSelectedIndustries)}
              isGlobal={true}
              icon={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" strokeWidth="2"/>
                </svg>
              }
            />
            <FilterSection
              title="Category"
              items={categories.discoveryCategories}
              selected={selectedCategories}
              onToggle={(value) => toggleFilter(value, selectedCategories, setSelectedCategories)}
              isGlobal={true}
              icon={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="3" y="3" width="7" height="7" strokeWidth="2"/>
                  <rect x="14" y="3" width="7" height="7" strokeWidth="2"/>
                  <rect x="14" y="14" width="7" height="7" strokeWidth="2"/>
                  <rect x="3" y="14" width="7" height="7" strokeWidth="2"/>
                </svg>
              }
            />
          </>
        )}

        {/* Use Cases filters */}
        {activeTab === 'usecases' && (
          <>
            <FilterSection
              title="Industry"
              items={categories.industries}
              selected={selectedIndustries}
              onToggle={(value) => toggleFilter(value, selectedIndustries, setSelectedIndustries)}
              isGlobal={true}
              icon={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" strokeWidth="2"/>
                </svg>
              }
            />
          </>
        )}

        {/* Differentiators filters */}
        {activeTab === 'differentiators' && (
          <>
            <FilterSection
              title="Competitor"
              items={categories.competitors}
              selected={selectedCompetitors}
              onToggle={(value) => toggleFilter(value, selectedCompetitors, setSelectedCompetitors)}
              isGlobal={true}
              icon={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M18 20V10M12 20V4M6 20v-6" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              }
            />
          </>
        )}

        {/* Objections filters */}
        {activeTab === 'objections' && (
          <>
            {/* No filters for objections - they have their own taxonomy */}
          </>
        )}
      </div>
    </aside>
  );
};

const FilterSection = ({ title, items, selected, onToggle, icon, isGlobal = false }) => {
  const [isExpanded, setIsExpanded] = React.useState(true);

  return (
    <div className="animate-fade-in-up">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between mb-4 group"
      >
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[var(--color-text-tertiary)] group-hover:text-[var(--color-accent-gold)] transition-colors">
            {icon}
          </span>
          <h3 className="text-sm font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
            {title}
          </h3>
          {isGlobal && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 font-semibold border border-blue-500/30">
              Global
            </span>
          )}
          {selected.length > 0 && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-[var(--color-accent-gold)]/10 text-[var(--color-accent-gold)] font-semibold">
              {selected.length}
            </span>
          )}
        </div>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`text-[var(--color-text-tertiary)] transition-transform duration-200 ${
            isExpanded ? 'rotate-180' : ''
          }`}
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      <div className={`space-y-2 overflow-hidden transition-all duration-300 ${
        isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
      }`}>
        {items.map((item, index) => (
          <label
            key={item.id}
            className="flex items-center gap-3 cursor-pointer group py-1.5 px-2 rounded-lg hover:bg-white/5 transition-all duration-200"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className="relative">
              <input
                type="checkbox"
                checked={selected.includes(item.id)}
                onChange={() => onToggle(item.id)}
                className="peer sr-only"
              />
              <div className={`w-4 h-4 rounded border-2 transition-all duration-200 flex items-center justify-center ${
                selected.includes(item.id)
                  ? 'bg-[var(--color-accent-gold)] border-[var(--color-accent-gold)]'
                  : 'border-[var(--color-border)] bg-transparent group-hover:border-[var(--color-accent-gold)]/50'
              }`}>
                {selected.includes(item.id) && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#0a0e1a" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                )}
              </div>
            </div>
            <span className="text-sm text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)] transition-colors flex-1">
              {item.name}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default FilterPanel;
