import React from 'react';
import { useApp } from '../context/AppContext';
import SessionDropdown from './SessionDropdown';

const Header = () => {
  const {
    searchQuery,
    setSearchQuery,
    showNotesPanel,
    setShowNotesPanel,
    currentSession,
  } = useApp();
  const [isFocused, setIsFocused] = React.useState(false);

  return (
    <header className="glass-panel-strong border-b border-[var(--color-border)] px-8 py-5 sticky top-0 z-50 animate-fade-in-up">
      <div className="max-w-[1800px] mx-auto flex items-center justify-between gap-8">
        {/* Logo & Title */}
        <div className="flex items-center gap-4 min-w-fit">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00D2FF] to-[#0099CC] flex items-center justify-center shadow-lg shadow-[#00D2FF]/20">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-[#08062B]">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="currentColor" fillOpacity="0.3"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "'Geist', sans-serif" }}>
              <span className="text-gradient-cyan">ThoughtSpot</span>
            </h1>
            <p className="text-xs text-[var(--color-text-tertiary)] font-medium tracking-wide uppercase">
              SE Demo Assistant
            </p>
          </div>
        </div>

        {/* Session Dropdown */}
        <SessionDropdown />

        {/* Search Bar */}
        <div className="flex-1 max-w-xl">
          <div className={`relative transition-all duration-300 ${isFocused ? 'scale-[1.02]' : ''}`}>
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] transition-colors duration-200">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="11" cy="11" r="8" strokeWidth="2"/>
                <path d="M21 21l-4.35-4.35" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search questions, differentiators, objections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className="w-full pl-12 pr-12 py-3 glass-panel text-[var(--color-text-primary)] rounded-xl
                       focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-cyan)]/50
                       placeholder-[var(--color-text-tertiary)] transition-all duration-200
                       hover:border-[var(--color-accent-cyan)]/30"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]
                         hover:text-[var(--color-accent-cyan)] transition-colors duration-200
                         w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/5"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round"/>
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 min-w-fit">
          {/* Notes Panel Toggle */}
          <button
            onClick={() => setShowNotesPanel(!showNotesPanel)}
            className={`relative p-2.5 rounded-lg border transition-all duration-300 ${
              showNotesPanel
                ? 'border-[#00D2FF] bg-[#00D2FF]/10'
                : 'border-[#1B1B61] bg-[#08062B]/80 hover:border-[#00D2FF]/50'
            } backdrop-blur-sm`}
            title="Toggle notes panel"
          >
            <svg className="w-5 h-5 text-[#e8eaf0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            {currentSession?.notes.general && currentSession.notes.general.trim().length > 0 && (
              <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#00D2FF] animate-pulse" />
            )}
          </button>


          {/* Version Badge */}
          <div className="px-3 py-1.5 rounded-full glass-panel border border-[var(--color-accent-cyan)]/20">
            <span className="text-xs font-semibold text-[var(--color-accent-cyan)]">v1.1</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
