import React, { useCallback, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { streamAiPrep } from '../utils/claudeApi';

// ── Section parser ────────────────────────────────────────────────────────────
const SECTION_KEYS = ['BRIEF', 'DISCOVERY', 'TALKING_POINTS', 'DEMO_FLOW'];
const SECTION_LABELS = {
  BRIEF: 'Pre-Call Research Brief',
  DISCOVERY: 'Targeted Discovery Questions',
  TALKING_POINTS: 'Personalized Talking Points',
  DEMO_FLOW: 'Suggested Demo Flow',
};

function parseSections(text) {
  const sections = { BRIEF: '', DISCOVERY: '', TALKING_POINTS: '', DEMO_FLOW: '' };
  let current = null;
  for (const line of text.split('\n')) {
    const match = line.match(/^## (BRIEF|DISCOVERY|TALKING_POINTS|DEMO_FLOW)$/);
    if (match) {
      current = match[1];
    } else if (current) {
      sections[current] += line + '\n';
    }
  }
  return sections;
}

// ── Copy button ───────────────────────────────────────────────────────────────
function CopyButton({ text }) {
  const [copied, setCopied] = React.useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="text-xs px-2 py-1 rounded-md border border-[var(--color-border)] text-[var(--color-text-tertiary)] hover:text-[var(--color-accent-cyan)] hover:border-[var(--color-accent-cyan)]/50 transition-all duration-200"
    >
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}

// ── Output section card ───────────────────────────────────────────────────────
function SectionCard({ sectionKey, content, isStreaming }) {
  const [collapsed, setCollapsed] = React.useState(false);
  const isEmpty = !content.trim();

  if (isEmpty && !isStreaming) return null;

  return (
    <div className="glass-panel rounded-xl border border-[var(--color-border)] overflow-hidden animate-fade-in-up">
      <div
        className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-white/5 transition-colors duration-200"
        onClick={() => setCollapsed(c => !c)}
      >
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-[var(--color-accent-cyan)]" />
          <h3 className="font-semibold text-[var(--color-text-primary)] text-sm">
            {SECTION_LABELS[sectionKey]}
          </h3>
          {isStreaming && isEmpty && (
            <span className="text-xs text-[var(--color-text-tertiary)] animate-pulse">
              Generating...
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!isEmpty && <CopyButton text={content} />}
          <svg
            width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2"
            className={`text-[var(--color-text-tertiary)] transition-transform duration-200 ${collapsed ? '' : 'rotate-180'}`}
          >
            <path d="M18 15l-6-6-6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      {!collapsed && (
        <div className="px-5 pb-5">
          <div className="text-sm text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-wrap">
            {content}
            {isStreaming && content && (
              <span className="inline-block w-1.5 h-4 bg-[var(--color-accent-cyan)] ml-0.5 animate-pulse align-middle" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
const AIPrepTab = () => {
  const {
    aiPrepInputs,
    setAiPrepInputs,
    aiPrepResult,
    setAiPrepResult,
    aiPrepIsGenerating,
    setAiPrepIsGenerating,
    aiPrepError,
    setAiPrepError,
    aiPrepAbortRef,
    cancelAiPrep,
    clearAiPrep,
    showToast,
  } = useApp();

  const [generationKey, setGenerationKey] = React.useState(0);

  const apiKeyMissing = !import.meta.env.VITE_ANTHROPIC_API_KEY;

  const updateInput = (field, value) => {
    setAiPrepInputs(prev => ({ ...prev, [field]: value }));
  };

  const updateProfile = (index, value) => {
    setAiPrepInputs(prev => {
      const profiles = [...prev.linkedinProfiles];
      profiles[index] = value;
      return { ...prev, linkedinProfiles: profiles };
    });
  };

  const addProfile = () => {
    if (aiPrepInputs.linkedinProfiles.length < 5) {
      setAiPrepInputs(prev => ({
        ...prev,
        linkedinProfiles: [...prev.linkedinProfiles, ''],
      }));
    }
  };

  const removeProfile = (index) => {
    setAiPrepInputs(prev => ({
      ...prev,
      linkedinProfiles: prev.linkedinProfiles.filter((_, i) => i !== index),
    }));
  };

  const handleGenerate = useCallback(async () => {
    if (!aiPrepInputs.companyName.trim()) return;

    setGenerationKey(k => k + 1);
    setAiPrepError(null);
    setAiPrepResult('');
    setAiPrepIsGenerating(true);

    const controller = new AbortController();
    aiPrepAbortRef.current = controller;

    try {
      await streamAiPrep(
        aiPrepInputs,
        (chunk) => {
          setAiPrepResult(prev => (prev ?? '') + chunk);
        },
        controller.signal
      );
    } catch (err) {
      if (err.name === 'AbortError') return;
      if (err.message === 'NO_API_KEY') {
        setAiPrepError('no_api_key');
      } else {
        setAiPrepError(err.message);
        showToast('Generation failed — check console for details', 'error');
        console.error('AI Prep error:', err);
      }
    } finally {
      aiPrepAbortRef.current = null;
      setAiPrepIsGenerating(false);
    }
  }, [aiPrepInputs, aiPrepAbortRef, setAiPrepResult, setAiPrepIsGenerating, setAiPrepError, showToast]);

  const sections = useMemo(
    () => (aiPrepResult ? parseSections(aiPrepResult) : null),
    [aiPrepResult]
  );
  const hasResult = sections && SECTION_KEYS.some(k => sections[k].trim());
  const isInterrupted = !aiPrepIsGenerating && aiPrepResult && !hasResult;

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-[1600px] mx-auto">
        <div className="flex gap-8">

          {/* ── Left column: Input form ── */}
          <div className="w-[420px] shrink-0 flex flex-col gap-5">
            <div>
              <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-1" style={{ fontFamily: "'Geist', sans-serif" }}>
                AI Prep Brief
              </h2>
              <p className="text-sm text-[var(--color-text-tertiary)]">
                Enter prospect details to generate a personalized pre-call brief powered by Claude.
              </p>
            </div>

            {/* API key warning */}
            {apiKeyMissing && (
              <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-sm text-amber-300">
                <p className="font-semibold mb-1">API key not configured</p>
                <p className="text-amber-300/70">
                  Add <code className="font-mono bg-amber-500/20 px-1 rounded">VITE_ANTHROPIC_API_KEY</code> to your <code className="font-mono bg-amber-500/20 px-1 rounded">.env</code> file and restart the dev server.
                </p>
              </div>
            )}

            {/* Company name */}
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide mb-2">
                Company Name <span className="text-[var(--color-accent-cyan)]">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Acme Corp"
                value={aiPrepInputs.companyName}
                onChange={e => updateInput('companyName', e.target.value)}
                className="w-full px-4 py-3 glass-panel rounded-xl text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-cyan)]/50 transition-all duration-200 text-sm"
              />
            </div>

            {/* LinkedIn profiles */}
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide mb-2">
                LinkedIn Profile Text
              </label>
              <p className="text-xs text-[var(--color-text-tertiary)] mb-3">
                Open a LinkedIn profile, select all text (⌘A), copy, and paste below.
              </p>
              <div className="flex flex-col gap-3">
                {aiPrepInputs.linkedinProfiles.map((profile, index) => (
                  <div key={index} className="relative">
                    {aiPrepInputs.linkedinProfiles.length > 1 && (
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-[var(--color-text-tertiary)]">Profile {index + 1}</span>
                        <button
                          onClick={() => removeProfile(index)}
                          className="text-xs text-[var(--color-text-tertiary)] hover:text-red-400 transition-colors duration-200"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                    <textarea
                      placeholder="Paste LinkedIn profile text here..."
                      value={profile}
                      onChange={e => updateProfile(index, e.target.value)}
                      rows={5}
                      className="w-full px-4 py-3 glass-panel rounded-xl text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-cyan)]/50 transition-all duration-200 text-sm resize-none"
                    />
                  </div>
                ))}
                {aiPrepInputs.linkedinProfiles.length < 5 && (
                  <button
                    onClick={addProfile}
                    className="flex items-center gap-2 text-sm text-[var(--color-text-tertiary)] hover:text-[var(--color-accent-cyan)] transition-colors duration-200 self-start"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                    </svg>
                    Add another profile
                  </button>
                )}
              </div>
            </div>

            {/* Additional context */}
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide mb-2">
                Additional Context
              </label>
              <textarea
                placeholder="e.g. They're evaluating Tableau, deal is late-stage, champion is VP of Finance"
                value={aiPrepInputs.additionalContext}
                onChange={e => updateInput('additionalContext', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 glass-panel rounded-xl text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-cyan)]/50 transition-all duration-200 text-sm resize-none"
              />
            </div>

            {/* Generate / Cancel button */}
            {aiPrepIsGenerating ? (
              <button
                onClick={cancelAiPrep}
                className="w-full py-3 rounded-xl border border-red-500/40 bg-red-500/10 text-red-400 hover:bg-red-500/20 font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="4" y="4" width="16" height="16" rx="2" />
                </svg>
                Stop Generating
              </button>
            ) : (
              <button
                onClick={handleGenerate}
                disabled={!aiPrepInputs.companyName.trim() || apiKeyMissing}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#00D2FF] to-[#0099CC] text-[#08062B] font-bold text-sm hover:opacity-90 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-[#00D2FF]/20"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Generate Prep Brief
              </button>
            )}
            {aiPrepResult && !aiPrepIsGenerating && (
              <button
                onClick={clearAiPrep}
                className="w-full py-2 rounded-xl border border-[var(--color-border)] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] hover:border-[var(--color-border-subtle)] text-xs font-medium transition-all duration-200"
              >
                Clear results
              </button>
            )}

            {/* Error state */}
            {aiPrepError && aiPrepError !== 'no_api_key' && (
              <div className="p-3 rounded-xl border border-red-500/30 bg-red-500/10 text-xs text-red-400">
                Generation failed. Check your API key and network connection, then try again.
              </div>
            )}
          </div>

          {/* ── Right column: Output ── */}
          <div className="flex-1 min-w-0 flex flex-col gap-4">
            {!aiPrepResult && !aiPrepIsGenerating && (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center max-w-sm">
                  <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-2xl glass-panel">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[var(--color-text-tertiary)]">
                      <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <p className="text-[var(--color-text-tertiary)] text-sm">
                    Fill in prospect details to generate a personalized prep brief.
                  </p>
                </div>
              </div>
            )}

            {/* Streaming / completed sections */}
            {(aiPrepResult || aiPrepIsGenerating) && sections && (
              <>
                {SECTION_KEYS.map(key => (
                  <SectionCard
                    key={`${key}-${generationKey}`}
                    sectionKey={key}
                    content={sections[key]}
                    isStreaming={aiPrepIsGenerating}
                  />
                ))}
              </>
            )}

            {/* Interrupted notice */}
            {isInterrupted && (
              <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 text-xs text-amber-300 text-center">
                Generation was interrupted — try again to get a complete brief.
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default AIPrepTab;
