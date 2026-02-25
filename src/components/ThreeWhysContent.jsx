import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import threeWhysData from '../data/threeWhys.json';

const ThreeWhysContent = () => {
  const { currentSession, updateSession, isAutoSaving } = useApp();
  const [answers, setAnswers] = useState({
    'why-change': '',
    'why-now': '',
    'why-thoughtspot': ''
  });
  const autoSaveTimeoutRef = useRef(null);

  // Load answers from current session
  useEffect(() => {
    if (currentSession?.threeWhys) {
      setAnswers(currentSession.threeWhys);
    } else {
      setAnswers({
        'why-change': '',
        'why-now': '',
        'why-thoughtspot': ''
      });
    }
  }, [currentSession]);

  // Debounced auto-save
  useEffect(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    if (currentSession) {
      autoSaveTimeoutRef.current = setTimeout(() => {
        updateSession({ threeWhys: answers });
      }, 300);
    }

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [answers, currentSession, updateSession]);

  const handleChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  // Show message if no session is active
  if (!currentSession) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center animate-fade-in-up">
          <div className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-2xl glass-panel">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18h6M10 22h4M15 8a3 3 0 00-6 0c0 2 3 3 3 6"
                    strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 2v1M12 21v1M4.22 4.22l.707.707M18.364 18.364l.707.707M1 12h1M22 12h1M4.22 19.78l.707-.707M18.364 5.636l.707-.707"
                    strokeLinecap="round"/>
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-[var(--color-text-primary)] mb-3" style={{ fontFamily: "'Geist', serif" }}>
            No Active Session
          </h3>
          <p className="text-[var(--color-text-tertiary)] max-w-sm mx-auto">
            Create or load a session to capture your 3 Why's responses
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-6 min-h-0">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between animate-fade-in-up shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-6 w-1 bg-gradient-to-b from-[var(--color-accent-cyan)] to-transparent rounded-full" />
          <h2 className="text-2xl font-bold text-[var(--color-text-primary)]" style={{ fontFamily: "'Geist', serif" }}>
            The 3 Why's
          </h2>
          <p className="text-sm text-[var(--color-text-secondary)]">— Capture the strategic context for this opportunity</p>
        </div>
        {isAutoSaving && (
          <div className="flex items-center gap-2 text-sm text-[var(--color-text-tertiary)]">
            <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10" strokeWidth="3" strokeDasharray="60" strokeDashoffset="15" opacity="0.25"/>
              <path d="M12 2a10 10 0 0110 10" strokeWidth="3" strokeLinecap="round"/>
            </svg>
            <span>Saving...</span>
          </div>
        )}
      </div>

      {/* Questions — 3-column side-by-side, fills remaining height */}
      <div className="grid grid-cols-3 gap-4 flex-1 min-h-0">
        {threeWhysData.questions.map((question, index) => (
          <div
            key={question.id}
            className="flex flex-col glass-panel p-4 rounded-2xl animate-fade-in-up min-h-0"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <label htmlFor={question.id} className="block mb-3 shrink-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-[var(--color-accent-cyan)] to-[#0099CC] text-[var(--color-bg-primary)] text-xs font-bold shrink-0">
                  {index + 1}
                </span>
                <h3 className="text-base font-bold text-[var(--color-text-primary)]" style={{ fontFamily: "'Geist', serif" }}>
                  {question.question}
                </h3>
              </div>
            </label>

            <textarea
              id={question.id}
              value={answers[question.id] || ''}
              onChange={(e) => handleChange(question.id, e.target.value)}
              className="flex-1 w-full px-3 py-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)] rounded-xl
                       text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)]
                       focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-cyan)] focus:ring-opacity-30
                       focus:border-[var(--color-accent-cyan)] transition-all duration-200
                       resize-none min-h-0"
              style={{ fontFamily: "'Inter', sans-serif" }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ThreeWhysContent;
