import React, { useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { streamObjectionCopilot, parseMatchedIds } from '../utils/objectionCopilot';
import Icon from './ui/Icon';
import { aiKeyMissing, aiErrorMessage, AiSetupNotice, CopyButton, ErrorNotice, RichText } from './ai/AiShared';

// ── Section parser ────────────────────────────────────────────────────────────
const SECTION_LABELS = {
  READ: 'What’s really going on',
  RESPONSE: 'Say this',
  REDIRECT: 'Then ask',
};

const HEADER_RE = /^\s*#{1,4}\s*\**\s*(READ|RESPONSE|REDIRECT)\b/i;

export function parseCopilotSections(text) {
  const sections = { READ: '', RESPONSE: '', REDIRECT: '' };
  let current = null;
  let sawAnyHeader = false;
  for (const line of text.split('\n')) {
    const match = line.match(HEADER_RE);
    if (match) {
      current = match[1].toUpperCase();
      sawAnyHeader = true;
    } else if (current) {
      sections[current] += line + '\n';
    }
  }
  // Fallback: no recognizable headers — surface everything under RESPONSE so
  // the SE still sees what was generated.
  if (!sawAnyHeader && text.trim()) {
    sections.RESPONSE = text;
  }
  return sections;
}

// ── Main component ────────────────────────────────────────────────────────────
const ObjectionCopilot = () => {
  const { currentSession, setHighlightedItemIds, updateGeneralNotes, showToast, content, settings } = useApp();
  const [text, setText] = useState('');
  const [output, setOutput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);
  const [lastObjection, setLastObjection] = useState('');
  const [saved, setSaved] = useState(false);
  const abortRef = useRef(null);
  const keyMissing = aiKeyMissing();

  const sections = parseCopilotSections(output);
  const hasOutput = Boolean(output.trim());

  async function handleGenerate() {
    const objectionText = text.trim();
    if (!objectionText || isStreaming || keyMissing) return;
    setError(null);
    setOutput('');
    setHighlightedItemIds([]);
    setSaved(false);
    setLastObjection(objectionText);
    setIsStreaming(true);
    const controller = new AbortController();
    abortRef.current = controller;
    let full = '';
    try {
      await streamObjectionCopilot(
        { objectionText, session: currentSession, content, settings },
        chunk => {
          full += chunk;
          setOutput(prev => prev + chunk);
        },
        controller.signal
      );
      // Highlight the library cards the model matched (READ section's Matches: line).
      setHighlightedItemIds(parseMatchedIds(full));
    } catch (err) {
      if (err?.name !== 'AbortError') setError(aiErrorMessage(err));
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  }

  function handleStop() {
    abortRef.current?.abort();
  }

  function handleClear() {
    setOutput('');
    setError(null);
    setHighlightedItemIds([]);
    setSaved(false);
  }

  function handleSaveToNotes() {
    if (!currentSession || !hasOutput) return;
    const stamp = new Date().toLocaleString();
    const block =
      `— Objection Copilot · ${stamp} —\n` +
      `Objection: "${lastObjection}"\n\n` +
      `${output.trim()}\n`;
    const existing = currentSession.notes?.general ?? '';
    updateGeneralNotes(existing ? `${existing.trimEnd()}\n\n${block}` : block);
    setSaved(true);
    showToast('Saved to session notes', 'success');
  }

  function handleKeyDown(e) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleGenerate();
    }
  }

  // The READ section carries a machine-readable "Matches:" line; hide it from display.
  const displayRead = sections.READ.split('\n').filter(l => !/^\s*\**\s*matches\s*:/i.test(l)).join('\n');
  const matchCount = parseMatchedIds(output).length;

  return (
    <section className="panel mb-6 overflow-hidden" aria-labelledby="copilot-title">
      <div className="p-4 sm:p-5">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-7 h-7 rounded-lg bg-accent-soft text-accent-text flex items-center justify-center">
            <Icon name="sparkles" size={15} />
          </div>
          <h2 id="copilot-title" className="text-[15px] font-semibold text-fg">Objection copilot</h2>
          <span className="chip">Live call</span>
        </div>
        <p className="text-[13px] text-fg-2 mb-3">Paste what the prospect just said and get a response you can say out loud.</p>

        {keyMissing && <div className="mb-3"><AiSetupNotice /></div>}

        <label htmlFor="copilot-input" className="sr-only">What the prospect said</label>
        <textarea
          id="copilot-input"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={2}
          placeholder={'e.g. “We already have a tool for this and switching feels like a lot of work.”'}
          className="field resize-y leading-relaxed"
        />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {isStreaming ? (
            <button type="button" onClick={handleStop} className="btn btn-secondary">
              <Icon name="square" size={14} /> Stop
            </button>
          ) : (
            <button type="button" onClick={handleGenerate} disabled={!text.trim() || keyMissing} className="btn btn-primary">
              Help me respond
            </button>
          )}
          {hasOutput && !isStreaming && currentSession && (
            <button type="button" onClick={handleSaveToNotes} disabled={saved} className="btn btn-secondary">
              <Icon name={saved ? 'check' : 'notebook'} size={14} />
              {saved ? 'Saved to notes' : 'Save to notes'}
            </button>
          )}
          {hasOutput && !isStreaming && (
            <button type="button" onClick={handleClear} className="btn btn-ghost">Clear</button>
          )}
          <span className="ml-auto hidden sm:flex items-center gap-1 text-xs text-fg-3"><kbd>⌘</kbd><kbd>↵</kbd> to send</span>
        </div>
        {error && <div className="mt-3"><ErrorNotice onRetry={handleGenerate}>{error}</ErrorNotice></div>}
      </div>

      {(hasOutput || isStreaming) && (
        <div className="border-t border-line bg-subtle p-4 sm:p-5 grid gap-3 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]" aria-live="polite" aria-busy={isStreaming}>
          <div className="space-y-3">
            <OutputBlock label={SECTION_LABELS.READ} text={displayRead} streaming={isStreaming}>
              {!isStreaming && matchCount > 0 && (
                <p className="mt-2 text-xs text-fg-3">Matching library cards are highlighted below.</p>
              )}
            </OutputBlock>
            <OutputBlock label={SECTION_LABELS.REDIRECT} text={sections.REDIRECT} streaming={isStreaming} />
          </div>
          <OutputBlock label={SECTION_LABELS.RESPONSE} text={sections.RESPONSE} streaming={isStreaming} emphasis copy />
        </div>
      )}
    </section>
  );
};

function OutputBlock({ label, text, streaming, emphasis, copy, children }) {
  const empty = !text.trim();
  return (
    <div className={`rounded-lg border p-4 ${emphasis ? 'bg-surface border-accent/30' : 'bg-surface border-line'}`}>
      <div className="flex items-center justify-between mb-2 min-h-[1.75rem]">
        <h3 className={`section-label ${emphasis ? '!text-accent-text' : ''}`}>{label}</h3>
        {copy && !empty && !streaming && <CopyButton text={text} className="-mr-2" />}
      </div>
      {empty ? (
        <div className="space-y-2" aria-hidden="true">
          <div className="h-3 rounded bg-muted w-10/12 animate-pulse" />
          <div className="h-3 rounded bg-muted w-7/12 animate-pulse" />
        </div>
      ) : (
        <div className={emphasis ? '[&_p]:text-[15px]' : ''}><RichText text={text} streaming={streaming} /></div>
      )}
      {children}
    </div>
  );
}

export default ObjectionCopilot;
