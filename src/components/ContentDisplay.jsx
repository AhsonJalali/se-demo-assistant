import React from 'react';
import { useApp } from '../context/AppContext';
import Card from './Card';
import ThreeWhysContent from './ThreeWhysContent';
import AIPrepTab from './AIPrepTab';

const ContentDisplay = () => {
  const { activeTab, filteredContent, searchQuery } = useApp();

  // Show ThreeWhysContent for three-whys tab
  if (activeTab === 'three-whys') {
    return <ThreeWhysContent />;
  }

  if (activeTab === 'ai-prep') {
    return <AIPrepTab />;
  }

  const getCardType = () => {
    if (activeTab === 'discovery') return 'discovery';
    if (activeTab === 'usecases') return 'usecase';
    if (activeTab === 'differentiators') return 'differentiator';
    if (activeTab === 'objections') return 'objection';
    return 'discovery';
  };

  if (filteredContent.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center animate-fade-in-up">
          <div className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-2xl glass-panel">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="M21 21l-4.35-4.35" strokeLinecap="round"/>
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-[var(--color-text-primary)] mb-3" style={{ fontFamily: "'Geist', serif" }}>
            No results found
          </h3>
          <p className="text-[var(--color-text-tertiary)] max-w-sm mx-auto">
            {searchQuery
              ? 'Try adjusting your search query or clearing some filters'
              : 'Try selecting different filters to see content'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-[1600px] mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-1 bg-gradient-to-b from-[var(--color-accent-cyan)] to-transparent rounded-full" />
            <p className="text-sm font-semibold text-[var(--color-text-secondary)]">
              Showing <span className="text-[var(--color-accent-cyan)] font-bold">{filteredContent.length}</span> result{filteredContent.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {filteredContent.map((item, index) => (
            <div
              key={item.id}
              className="animate-fade-in-up opacity-0"
              style={{ animationDelay: `${index * 0.05}s`, animationFillMode: 'forwards' }}
            >
              <Card item={item} type={getCardType()} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContentDisplay;
