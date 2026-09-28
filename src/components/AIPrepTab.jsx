import React, { useCallback, useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { streamAiPrep } from '../utils/claudeApi';
import { getView } from '../config/views';
import PageHeader from './PageHeader';
import Icon from './ui/Icon';
import { aiKeyMissing, aiErrorMessage, AiSetupNotice, CopyButton, ErrorNotice, RichText } from './ai/AiShared';

// ── LinkedIn URL detection ────────────────────────────────────────────────────
// Matches an entry that is *only* a LinkedIn URL with no whitespace-separated extras.
const LINKEDIN_URL_ONLY_RE = /^https?:\/\/(www\.)?linkedin\.com\/\S+$/i;

function isLinkedInUrlOnly(entry) {
  const trimmed = (entry || '').trim();
  if (!trimmed) return false;
  return LINKEDIN_URL_ONLY_RE.test(trimmed);
}

// ── Section parser ────────────────────────────────────────────────────────────
const SECTION_KEYS = ['BRIEF', 'DISCOVERY', 'TALKING_POINTS', 'DEMO_FLOW'];
const SECTIONS = {
  BRIEF: { label: 'Pre-call brief', icon: 'building', blurb: 'Who they are, what the stakeholders care about, and the angle to take.' },
  DISCOVERY: { label: 'Discovery questions', icon: 'compass', blurb: 'The most relevant questions from your library, reframed for this prospect.' },
  TALKING_POINTS: { label: 'Talking points', icon: 'message', blurb: 'Positioning and objection responses tuned to their situation.' },
  DEMO_FLOW: { label: 'Demo flow', icon: 'play', blurb: 'A 4–5 step demo sequence and why each step fits.' },
};

const HEADER_RE = /^\s*#{1,4}\s*\**\s*(BRIEF|DISCOVERY|TALKING[ _-]?POINTS|DEMO[ _-]?FLOW)\b/i;

function normalizeHeaderKey(raw) {
  const k = raw.toUpperCase().replace(/[ -]/g, '_');
  if (k.startsWith('TALKING')) return 'TALKING_POINTS';
  if (k.startsWith('DEMO')) return 'DEMO_FLOW';
  return k;
}

function parseSections(text) {
  const sections = { BRIEF: '', DISCOVERY: '', TALKING_POINTS: '', DEMO_FLOW: '' };
  let current = null;
  let sawAnyHeader = false;
  for (const line of text.split('\n')) {
    const match = line.match(HEADER_RE);
    if (match) {
      current = normalizeHeaderKey(match[1]);
      sawAnyHeader = true;
    } else if (current) {
      sections[current] += line + '\n';
    }
  }
  // Fallback: model didn't emit recognizable headers — show full output under BRIEF
  // so the user sees what was generated instead of an empty "interrupted" state.
  if (!sawAnyHeader && text.trim()) {
    sections.BRIEF = text;
  }
  return sections;
}

// ── Output section ────────────────────────────────────────────────────────────
function SectionCard({ sectionKey, content, isStreaming, isActive }) {
  const [collapsed, setCollapsed] = useState(false);
  const meta = SECTIONS[sectionKey];
  const isEmpty = !content.trim();

  return (
    <section className={`panel overflow-hidden ${isEmpty ? 'opacity-70' : ''}`}>
      <div className="flex items-center gap-3 px-4 h-12 border-b border-line">
        <Icon name={meta.icon} size={15} className="text-fg-3" />
        <button
          type="button"
          className="flex-1 text-left text-[13px] font-semibold text-fg"
          onClick={() => setCollapsed(c => !c)}
          aria-expanded={!collapsed}
        >
          {meta.label}
        </button>
        {isStreaming && isActive && (
          <span className="flex items-center gap-1.5 text-xs text-fg-3">
            <Icon name="loader" size={13} className="animate-spin" /> Writing…
          </span>
        )}
        {!isEmpty && !isStreaming && <CopyButton text={content} />}
        <button type="button" className="icon-btn w-7 h-7" onClick={() => setCollapsed(c => !c)} aria-label={collapsed ? 'Expand section' : 'Collapse section'}>
          <Icon name="chevron-down" size={15} className={`transition-transform ${collapsed ? '-rotate-90' : ''}`} />
        </button>
      </div>
      {!collapsed && (
        <div className="px-4 py-4">
          {isEmpty ? (
            <div className="space-y-2" aria-hidden="true">
              <div className="h-3 rounded bg-muted w-11/12 animate-pulse" />
              <div className="h-3 rounded bg-muted w-9/12 animate-pulse" />
              <div className="h-3 rounded bg-muted w-10/12 animate-pulse" />
            </div>
          ) : (
            <RichText text={content} streaming={isStreaming && isActive} />
          )}
        </div>
      )}
    </section>
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
    currentSession,
    updateGeneralNotes,
    showToast,
    content,
    settings,
  } = useApp();

  const [generationKey, setGenerationKey] = useState(0);
  const [savedToNotes, setSavedToNotes] = useState(false);
  const keyMissing = aiKeyMissing();
  const view = getView('ai-prep');

  const updateInput = (field, value) => setAiPrepInputs(prev => ({ ...prev, [field]: value }));

  const updateProfile = (index, value) => {
    setAiPrepInputs(prev => {
      const profiles = [...prev.linkedinProfiles];
      profiles[index] = value;
      return { ...prev, linkedinProfiles: profiles };
    });
  };

  const addProfile = () => {
    if (aiPrepInputs.linkedinProfiles.length < 5) {
      setAiPrepInputs(prev => ({ ...prev, linkedinProfiles: [...prev.linkedinProfiles, ''] }));
    }
  };

  const removeProfile = (index) => {
    setAiPrepInputs(prev => ({ ...prev, linkedinProfiles: prev.linkedinProfiles.filter((_, i) => i !== index) }));
  };

  const handleGenerate = useCallback(async (e) => {
    e?.preventDefault();
    if (!aiPrepInputs.companyName.trim() || aiPrepIsGenerating) return;

    setGenerationKey(k => k + 1);
    setAiPrepError(null);
    setAiPrepResult('');
    setSavedToNotes(false);
    setAiPrepIsGenerating(true);

    const controller = new AbortController();
    aiPrepAbortRef.current = controller;

    try {
      await streamAiPrep(
        aiPrepInputs,
        (chunk) => setAiPrepResult(prev => (prev ?? '') + chunk),
        controller.signal,
        { content, settings }
      );
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.error('AI Prep error:', err);
      setAiPrepError(aiErrorMessage(err));
    } finally {
      aiPrepAbortRef.current = null;
      setAiPrepIsGenerating(false);
    }
  }, [aiPrepInputs, aiPrepIsGenerating, aiPrepAbortRef, setAiPrepResult, setAiPrepIsGenerating, setAiPrepError, content, settings]);

  const sections = useMemo(() => (aiPrepResult ? parseSections(aiPrepResult) : null), [aiPrepResult]);
  const hasResult = sections && SECTION_KEYS.some(k => sections[k].trim());
  const isInterrupted = !aiPrepIsGenerating && aiPrepResult && !hasResult;
  const activeKey = sections ? [...SECTION_KEYS].reverse().find(k => sections[k].trim()) || 'BRIEF' : null;
  const showOutput = aiPrepIsGenerating || hasResult;

  const handleSaveToNotes = () => {
    if (!currentSession || !aiPrepResult) return;
    const block = `— Prep brief · ${aiPrepInputs.companyName.trim()} · ${new Date().toLocaleString()} —\n\n${aiPrepResult.trim()}\n`;
    const existing = currentSession.notes?.general ?? '';
    updateGeneralNotes(existing ? `${existing.trimEnd()}\n\n${block}` : block);
    setSavedToNotes(true);
    showToast('Brief saved to session notes', 'success');
  };

  const prefillFromSession = currentSession && !aiPrepInputs.companyName && (
    <button type="button" className="text-xs font-medium text-accent-text hover:underline" onClick={() => updateInput('companyName', currentSession.name)}>
      Use “{currentSession.name}”
    </button>
  );

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <PageHeader
        title={view.label}
        description={view.description}
        actions={hasResult && !aiPrepIsGenerating && (
          <>
            <CopyButton text={aiPrepResult} label="Copy all" />
            {currentSession && (
              <button type="button" className="btn btn-secondary btn-sm" onClick={handleSaveToNotes} disabled={savedToNotes}>
                <Icon name={savedToNotes ? 'check' : 'notebook'} size={14} />
                {savedToNotes ? 'Saved to notes' : 'Save to notes'}
              </button>
            )}
          </>
        )}
      />

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grid gap-6 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] items-start">
          {/* ── Inputs ── */}
          <form onSubmit={handleGenerate} className="panel p-5 space-y-4 lg:sticky lg:top-0" aria-label="Prospect details">
            {keyMissing && <AiSetupNotice />}

            <div>
              <div className="flex items-baseline justify-between">
                <label htmlFor="prep-company" className="label">Company <span className="text-danger" aria-hidden="true">*</span></label>
                {prefillFromSession}
              </div>
              <input
                id="prep-company"
                type="text"
                required
                placeholder="e.g. Northwind Traders"
                value={aiPrepInputs.companyName}
                onChange={e => updateInput('companyName', e.target.value)}
                className="field"
              />
            </div>

            <div>
              <label htmlFor="prep-website" className="label">Website <span className="font-normal text-fg-3">(optional)</span></label>
              <input
                id="prep-website"
                type="text"
                inputMode="url"
                placeholder="northwind.com"
                value={aiPrepInputs.companyWebsite}
                onChange={e => updateInput('companyWebsite', e.target.value)}
                className="field"
              />
            </div>

            <fieldset>
              <legend className="label">Stakeholders <span className="font-normal text-fg-3">(optional)</span></legend>
              <p className="hint -mt-0.5 mb-2">Paste LinkedIn profile text for the best results. A profile URL also works.</p>
              <div className="space-y-2.5">
                {aiPrepInputs.linkedinProfiles.map((profile, index) => (
                  <div key={index}>
                    {aiPrepInputs.linkedinProfiles.length > 1 && (
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-fg-3">Person {index + 1}</span>
                        <button type="button" onClick={() => removeProfile(index)} className="text-xs text-fg-3 hover:text-danger">
                          Remove
                        </button>
                      </div>
                    )}
                    <textarea
                      aria-label={`Stakeholder ${index + 1} profile`}
                      placeholder="Profile text or linkedin.com/in/…"
                      value={profile}
                      onChange={e => updateProfile(index, e.target.value)}
                      rows={3}
                      className="field resize-y"
                    />
                    {isLinkedInUrlOnly(profile) && (
                      <p className="mt-1 text-xs text-warning">
                        Just a URL — pasting the profile text (⌘A, ⌘C on the profile page) gives richer results.
                      </p>
                    )}
                  </div>
                ))}
                {aiPrepInputs.linkedinProfiles.length < 5 && (
                  <button type="button" onClick={addProfile} className="btn btn-ghost btn-sm -ml-2">
                    <Icon name="plus" size={14} /> Add a person
                  </button>
                )}
              </div>
            </fieldset>

            <div>
              <label htmlFor="prep-context" className="label">Context <span className="font-normal text-fg-3">(optional)</span></label>
              <textarea
                id="prep-context"
                placeholder="e.g. Evaluating an incumbent, late stage, champion is the VP of Operations"
                value={aiPrepInputs.additionalContext}
                onChange={e => updateInput('additionalContext', e.target.value)}
                rows={3}
                className="field resize-y"
              />
            </div>

            <div className="flex gap-2 pt-1">
              {aiPrepIsGenerating ? (
                <button type="button" onClick={cancelAiPrep} className="btn btn-secondary flex-1">
                  <Icon name="square" size={14} /> Stop
                </button>
              ) : (
                <button type="submit" disabled={!aiPrepInputs.companyName.trim() || keyMissing} className="btn btn-primary flex-1">
                  <Icon name="sparkles" size={15} /> {hasResult ? 'Regenerate brief' : 'Generate brief'}
                </button>
              )}
              {aiPrepResult && !aiPrepIsGenerating && (
                <button type="button" onClick={() => { clearAiPrep(); setSavedToNotes(false); }} className="btn btn-ghost">
                  Clear
                </button>
              )}
            </div>
            <p className="hint">Uses web search to research the company. Takes about 30–60 seconds.</p>
          </form>

          {/* ── Output ── */}
          <div className="space-y-3 min-w-0" aria-live="polite" aria-busy={aiPrepIsGenerating}>
            {aiPrepError && <ErrorNotice onRetry={keyMissing ? undefined : handleGenerate}>{aiPrepError}</ErrorNotice>}
            {isInterrupted && (
              <ErrorNotice onRetry={handleGenerate}>The brief was interrupted before any sections arrived.</ErrorNotice>
            )}

            {showOutput ? (
              SECTION_KEYS.map(key => (
                <SectionCard
                  key={`${key}-${generationKey}`}
                  sectionKey={key}
                  content={sections?.[key] || ''}
                  isStreaming={aiPrepIsGenerating}
                  isActive={key === activeKey}
                />
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-line-strong p-6">
                <h2 className="text-[15px] font-semibold text-fg">What you’ll get</h2>
                <p className="mt-1 text-[13px] text-fg-2">A brief built from public information and your content library, ready to skim before the call.</p>
                <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                  {SECTION_KEYS.map(key => (
                    <li key={key} className="flex gap-3 p-3 rounded-lg bg-subtle">
                      <div className="w-8 h-8 rounded-lg bg-surface border border-line flex items-center justify-center text-fg-3 shrink-0">
                        <Icon name={SECTIONS[key].icon} size={15} />
                      </div>
                      <div>
                        <div className="text-[13px] font-medium text-fg">{SECTIONS[key].label}</div>
                        <div className="text-xs text-fg-2 mt-0.5 leading-snug">{SECTIONS[key].blurb}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIPrepTab;
