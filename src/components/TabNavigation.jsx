import React from 'react';
import { useApp } from '../context/AppContext';

const TabNavigation = () => {
  const { activeTab, setActiveTab } = useApp();

  const tabs = [
    {
      id: 'discovery',
      label: 'Discovery Questions',
      shortLabel: 'Discovery',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="11" cy="11" r="8" strokeWidth="2"/>
          <path d="M21 21l-4.35-4.35" strokeWidth="2" strokeLinecap="round"/>
          <circle cx="11" cy="11" r="3" fill="currentColor"/>
        </svg>
      )
    },
    {
      id: 'differentiators',
      label: 'Competitive Differentiators',
      shortLabel: 'Differentiators',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="currentColor" fillOpacity="0.2"/>
        </svg>
      )
    },
    {
      id: 'objections',
      label: 'Objection Handling',
      shortLabel: 'Objections',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="currentColor" fillOpacity="0.2"/>
        </svg>
      )
    },
    {
      id: 'usecases',
      label: 'Use Cases',
      shortLabel: 'Use Cases',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9 12h6M9 16h6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    {
      id: 'ai-prep',
      label: 'AI Prep',
      shortLabel: 'AI Prep',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/>
        </svg>
      )
    },
    {
      id: 'three-whys',
      label: '3 Why\'s',
      shortLabel: '3 Why\'s',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M9 18h6M10 22h4M15 8a3 3 0 00-6 0c0 2 3 3 3 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 2v1M12 21v1M4.22 4.22l.707.707M18.364 18.364l.707.707M1 12h1M22 12h1M4.22 19.78l.707-.707M18.364 5.636l.707-.707" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      )
    }
  ];

  return (
    <div className="border-b border-[var(--color-border-subtle)] animate-fade-in-up stagger-1">
      <div className="max-w-[1800px] mx-auto px-8">
        <div className="flex gap-2 pt-4">
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`group relative px-6 py-3 font-semibold transition-all duration-300 rounded-t-xl
                        ${activeTab === tab.id
                          ? 'text-[var(--color-accent-cyan)]'
                          : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                        }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Background */}
              <div className={`absolute inset-0 rounded-t-xl transition-all duration-300 ${
                activeTab === tab.id
                  ? 'glass-panel-strong'
                  : 'opacity-0 group-hover:opacity-100 bg-white/5'
              }`} />

              {/* Bottom border indicator */}
              <div className={`absolute bottom-0 left-0 right-0 h-0.5 transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-[#00D2FF] to-[#0099CC]'
                  : 'bg-transparent'
              }`} />

              {/* Content */}
              <div className="relative flex items-center gap-3">
                <span className={`transition-all duration-300 ${
                  activeTab === tab.id ? 'text-[var(--color-accent-cyan)]' : 'text-[var(--color-text-tertiary)]'
                }`}>
                  {tab.icon}
                </span>
                <span className="hidden lg:inline">{tab.label}</span>
                <span className="lg:hidden">{tab.shortLabel}</span>
              </div>

              {/* Glow effect on active */}
              {activeTab === tab.id && (
                <div className="absolute inset-0 rounded-t-xl bg-[var(--color-accent-cyan)] opacity-5 blur-xl" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TabNavigation;
