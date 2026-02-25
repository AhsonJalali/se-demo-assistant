import React from 'react';
import { useApp } from '../context/AppContext';
import NoteButton from './NoteButton';

const Card = ({ item, type }) => {
  const {
    expandedCard,
    setExpandedCard,
    currentSession,
    toggleItemSelection,
    isItemSelected,
    getItemNote,
    setShowUseCasePanel,
    setSelectedUseCaseId
  } = useApp();
  const isExpanded = expandedCard === item.id;
  const isSelected = currentSession ? isItemSelected(item.id) : false;
  const hasNote = currentSession ? getItemNote(item.id) : null;

  const toggleExpand = () => {
    // For use cases, open documentation panel instead of expanding
    if (type === 'usecase') {
      setSelectedUseCaseId(item.id);
      setShowUseCasePanel(true);
    } else {
      setExpandedCard(isExpanded ? null : item.id);
    }
  };

  const handleSelectionToggle = (e) => {
    e.stopPropagation();
    if (currentSession) {
      toggleItemSelection(item.id);
    }
  };

  return (
    <div
      className={`group glass-panel rounded-2xl overflow-hidden cursor-pointer
                 transition-all duration-500 hover:scale-[1.01]
                 ${isExpanded
                   ? 'ring-2 ring-[var(--color-accent-cyan)]/50 shadow-2xl shadow-[var(--color-accent-cyan)]/10'
                   : isSelected
                   ? 'ring-2 ring-[var(--color-accent-cyan)]/30'
                   : 'hover:border-[var(--color-accent-cyan)]/30'
                 }`}
      onClick={toggleExpand}
    >
      {/* Hover glow effect */}
      <div className={`absolute inset-0 bg-gradient-to-br from-[var(--color-accent-cyan)]/5 to-transparent opacity-0
                      group-hover:opacity-100 transition-opacity duration-500 pointer-events-none ${
                        isExpanded || isSelected ? 'opacity-100' : ''
                      }`} />

      {/* Selection Checkbox - top-left */}
      {currentSession && (
        <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
          <label
            className="flex items-center justify-center w-6 h-6 cursor-pointer"
            onClick={handleSelectionToggle}
          >
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => {}}
              className="sr-only"
            />
            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
              isSelected
                ? 'bg-[#00D2FF] border-[#00D2FF]'
                : 'bg-[#08062B]/80 border-[#1B1B61] hover:border-[#00D2FF]/50'
            }`}>
              {isSelected && (
                <svg className="w-3 h-3 text-[#08062B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          </label>
        </div>
      )}

      {/* Note Button - top-right */}
      {currentSession && (
        <div className="absolute top-3 right-3 z-10">
          <NoteButton itemId={item.id} />
        </div>
      )}

      {/* Gold corner accent if note exists */}
      {hasNote && hasNote.content && (
        <div className="absolute top-0 right-0 w-8 h-8">
          <div className="absolute top-0 right-0 w-0 h-0 border-t-[32px] border-t-[#00D2FF]/30 border-l-[32px] border-l-transparent" />
        </div>
      )}

      <div className="relative p-6 pt-10">
        {type === 'discovery' && <DiscoveryCard item={item} isExpanded={isExpanded} />}
        {type === 'usecase' && <UseCaseCard item={item} isExpanded={isExpanded} />}
        {type === 'differentiator' && <DifferentiatorCard item={item} isExpanded={isExpanded} />}
        {type === 'objection' && <ObjectionCard item={item} isExpanded={isExpanded} />}
      </div>

      {/* Expand indicator */}
      <div className={`absolute bottom-3 right-3 w-8 h-8 rounded-full glass-panel flex items-center justify-center
                      transition-all duration-300 ${isExpanded ? 'bg-[var(--color-accent-cyan)]/20' : ''}`}>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`transition-transform duration-300 ${
            isExpanded ? 'rotate-180 text-[var(--color-accent-cyan)]' : 'text-[var(--color-text-tertiary)]'
          }`}
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>
    </div>
  );
};

const UseCaseCard = ({ item, isExpanded }) => {
  return (
    <>
      <div className="flex items-start justify-between gap-4 mb-4">
        <h3 className="text-xl font-bold text-[var(--color-text-primary)] flex-1 pr-8 leading-relaxed"
            style={{ fontFamily: "'Geist', serif" }}>
          {item.name}
        </h3>
      </div>

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <CategoryTag label={item.category} />
      </div>

      <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mb-4">
        {item.description}
      </p>

      {isExpanded && (
        <div className="mt-6 pt-6 border-t border-[var(--color-border)] space-y-5 animate-fade-in-up">
          {/* Key Benefits */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              <h4 className="text-sm font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
                Key Benefits
              </h4>
            </div>
            <ul className="space-y-2.5">
              {item.keyBenefits.map((benefit, idx) => (
                <li
                  key={idx}
                  className="text-sm text-[var(--color-text-secondary)] pl-6 relative
                           before:content-[''] before:absolute before:left-0 before:top-[0.6em]
                           before:w-2 before:h-2 before:rounded-full before:bg-[var(--color-accent-cyan)]/50
                           hover:text-[var(--color-text-primary)] transition-colors duration-200"
                >
                  {benefit}
                </li>
              ))}
            </ul>
          </div>

          {/* Typical Challenges */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
              <h4 className="text-sm font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
                Typical Challenges
              </h4>
            </div>
            <ul className="space-y-2.5">
              {item.typicalChallenges.map((challenge, idx) => (
                <li
                  key={idx}
                  className="text-sm text-[var(--color-text-secondary)] pl-6 relative
                           before:content-[''] before:absolute before:left-0 before:top-[0.6em]
                           before:w-2 before:h-2 before:rounded-full before:bg-red-400/50
                           hover:text-[var(--color-text-primary)] transition-colors duration-200"
                >
                  {challenge}
                </li>
              ))}
            </ul>
          </div>

          {/* Ideal For */}
          <div className="glass-panel-strong rounded-xl p-4 border-l-2 border-[var(--color-accent-cyan)]">
            <div className="flex items-center gap-2 mb-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              <h4 className="text-sm font-bold text-[var(--color-accent-cyan)] uppercase tracking-wider">Ideal For</h4>
            </div>
            <ul className="space-y-2">
              {item.idealFor.map((target, idx) => (
                <li
                  key={idx}
                  className="text-sm text-[var(--color-text-primary)] pl-6 relative
                           before:content-['✓'] before:absolute before:left-0 before:top-0
                           before:text-[var(--color-accent-cyan)] before:font-bold"
                >
                  {target}
                </li>
              ))}
            </ul>
          </div>

          {/* Demo Scenarios */}
          <div className="glass-panel-strong rounded-xl p-4 bg-gradient-to-br from-[var(--color-accent-cyan)]/10 to-transparent">
            <div className="flex items-center gap-2 mb-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
              <h4 className="text-sm font-bold text-[var(--color-accent-cyan)] uppercase tracking-wider">Demo Scenarios</h4>
            </div>
            <ul className="space-y-2">
              {item.demoScenarios.map((scenario, idx) => (
                <li
                  key={idx}
                  className="text-sm text-[var(--color-text-primary)] pl-6 relative
                           before:content-['▸'] before:absolute before:left-0 before:top-0
                           before:text-[var(--color-accent-cyan)]"
                >
                  {scenario}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
};

const DiscoveryCard = ({ item, isExpanded }) => {
  return (
    <>
      <div className="flex items-start justify-between gap-4 mb-4">
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)] flex-1 pr-8 leading-relaxed"
            style={{ fontFamily: "'Geist', serif" }}>
          {item.question}
        </h3>
        <div className="flex flex-col gap-2 items-end">
          <PriorityBadge priority={item.priority} />
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <CategoryTag label={item.category} />
      </div>

      {isExpanded && (
        <div className="mt-6 pt-6 border-t border-[var(--color-border)] space-y-5 animate-fade-in-up">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <h4 className="text-sm font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
                Follow-up Questions
              </h4>
            </div>
            <ul className="space-y-2.5">
              {item.followUp.map((followUp, idx) => (
                <li
                  key={idx}
                  className="text-sm text-[var(--color-text-secondary)] pl-6 relative
                           before:content-[''] before:absolute before:left-0 before:top-[0.6em]
                           before:w-2 before:h-2 before:rounded-full before:bg-[var(--color-accent-cyan)]/50
                           hover:text-[var(--color-text-primary)] transition-colors duration-200"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  {followUp}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
};

const DifferentiatorCard = ({ item, isExpanded }) => {
  return (
    <>
      <div className="flex items-start justify-between gap-4 mb-4">
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)] flex-1 pr-8 leading-relaxed"
            style={{ fontFamily: "'Geist', serif" }}>
          {item.feature}
        </h3>
        <CompetitorBadge competitor={item.competitorName} />
      </div>

      <div className="flex items-center gap-2 mb-4">
        <CategoryTag label={item.category} />
      </div>

      {!isExpanded && (
        <p className="text-sm text-[var(--color-text-secondary)] line-clamp-2 leading-relaxed">
          {item.thoughtspot}
        </p>
      )}

      {isExpanded && (
        <div className="mt-6 space-y-5 animate-fade-in-up">
          <div className="glass-panel-strong rounded-xl p-4 border-l-2 border-[#4ade80]">
            <div className="flex items-center gap-2 mb-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <h4 className="text-sm font-bold text-[#4ade80] uppercase tracking-wider">ThoughtSpot</h4>
            </div>
            <p className="text-sm text-[var(--color-text-primary)] leading-relaxed">{item.thoughtspot}</p>
          </div>

          <div className="glass-panel-strong rounded-xl p-4 border-l-2 border-[#f87171]">
            <div className="flex items-center gap-2 mb-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
              <h4 className="text-sm font-bold text-[#f87171] uppercase tracking-wider">{item.competitorName}</h4>
            </div>
            <p className="text-sm text-[var(--color-text-primary)] leading-relaxed">{item.competitor}</p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              <h4 className="text-sm font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
                Talking Points
              </h4>
            </div>
            <ul className="space-y-2.5">
              {item.talkingPoints.map((point, idx) => (
                <li
                  key={idx}
                  className="text-sm text-[var(--color-text-secondary)] pl-6 relative
                           before:content-[''] before:absolute before:left-0 before:top-[0.6em]
                           before:w-2 before:h-2 before:rounded-full before:bg-[var(--color-accent-cyan)]/50
                           hover:text-[var(--color-text-primary)] transition-colors duration-200"
                >
                  {point}
                </li>
              ))}
            </ul>
          </div>

          <div className="glass-panel-strong rounded-xl p-4 bg-gradient-to-br from-[var(--color-accent-cyan)]/10 to-transparent">
            <div className="flex items-center gap-2 mb-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
              </svg>
              <h4 className="text-sm font-bold text-[var(--color-accent-cyan)] uppercase tracking-wider">Demo Tip</h4>
            </div>
            <p className="text-sm text-[var(--color-text-primary)] leading-relaxed">{item.demo}</p>
          </div>
        </div>
      )}
    </>
  );
};

const ObjectionCard = ({ item, isExpanded }) => {
  return (
    <>
      <div className="flex items-start gap-4 mb-4">
        <div className="mt-1 flex-shrink-0">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)] leading-relaxed mb-3"
              style={{ fontFamily: "'Geist', serif" }}>
            "{item.objection}"
          </h3>
          <CategoryTag label={item.category} />
        </div>
      </div>

      {!isExpanded && (
        <p className="text-sm text-[var(--color-text-secondary)] line-clamp-2 leading-relaxed pl-9">
          {item.response}
        </p>
      )}

      {isExpanded && (
        <div className="mt-6 space-y-5 animate-fade-in-up pl-9">
          <div className="glass-panel-strong rounded-xl p-4 border-l-2 border-[var(--color-accent-cyan)]">
            <div className="flex items-center gap-2 mb-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              <h4 className="text-sm font-bold text-[var(--color-accent-cyan)] uppercase tracking-wider">Response</h4>
            </div>
            <p className="text-sm text-[var(--color-text-primary)] leading-relaxed">{item.response}</p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 20h9"/>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
              </svg>
              <h4 className="text-sm font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
                Talking Points
              </h4>
            </div>
            <ul className="space-y-2.5">
              {item.talkingPoints.map((point, idx) => (
                <li
                  key={idx}
                  className="text-sm text-[var(--color-text-secondary)] pl-6 relative
                           before:content-[''] before:absolute before:left-0 before:top-[0.6em]
                           before:w-2 before:h-2 before:rounded-full before:bg-[var(--color-accent-cyan)]/50
                           hover:text-[var(--color-text-primary)] transition-colors duration-200"
                >
                  {point}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <h4 className="text-sm font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
                Discovery Questions
              </h4>
            </div>
            <ul className="space-y-2.5">
              {item.questions.map((question, idx) => (
                <li
                  key={idx}
                  className="text-sm text-[var(--color-text-secondary)] pl-6 relative
                           before:content-['?'] before:absolute before:left-0 before:top-0
                           before:text-[var(--color-accent-cyan)] before:font-bold
                           hover:text-[var(--color-text-primary)] transition-colors duration-200"
                >
                  {question}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
};

// Utility Components
const PriorityBadge = ({ priority }) => {
  const config = {
    high: {
      bg: 'bg-gradient-to-r from-red-500/20 to-red-600/20',
      border: 'border-red-500/40',
      text: 'text-red-400',
      icon: (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L2 22h20L12 2z"/>
        </svg>
      )
    },
    medium: {
      bg: 'bg-gradient-to-r from-amber-500/20 to-amber-600/20',
      border: 'border-amber-500/40',
      text: 'text-amber-400',
      icon: (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="10"/>
        </svg>
      )
    }
  };

  const style = config[priority] || config.medium;

  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${style.bg} border ${style.border}`}>
      <span className={style.text}>{style.icon}</span>
      <span className={`text-xs font-semibold uppercase tracking-wide ${style.text}`}>
        {priority}
      </span>
    </div>
  );
};

const CategoryTag = ({ label }) => {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass-panel text-xs font-medium text-[var(--color-text-secondary)] border border-[var(--color-border)]">
      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent-cyan)]/60" />
      {label}
    </span>
  );
};

const CompetitorBadge = ({ competitor }) => {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/40">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 20V10M12 20V4M6 20v-6"/>
      </svg>
      <span className="text-xs font-semibold text-blue-300 uppercase tracking-wide">
        vs {competitor}
      </span>
    </div>
  );
};

export default Card;
