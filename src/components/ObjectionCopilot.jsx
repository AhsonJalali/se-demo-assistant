import React, { useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { streamObjectionCopilot, parseMatchedIds } from '../utils/objectionCopilot';

// ── Section parser ────────────────────────────────────────────────────────────
const SECTION_KEYS = ['READ', 'RESPONSE', 'REDIRECT'];
const SECTION_LABELS = {
  READ: 'The read',
  RESPONSE: 'Say this',
  REDIRECT: 'Take back control',
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

// ── Small copy button ─────────────────────────────────────────────────────────
function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
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

function errorMessage(err) {
  switch (err?.message) {
    case 'NO_API_KEY':
      return 'No API key configured. Add VITE_ANTHROPIC_API_KEY to your .env file and restart the dev server.';
    case 'AUTH_EXPIRED':
      return 'Your session expired. Refresh the page and sign in again.';
    case 'RATE_LIMITED':
      return 'Rate limit reached — give it a minute and try again.';
    case 'SERVER_API_KEY_INVALID':
      return "The server's Anthropic API key was rejected — an admin needs to update ANTHROPIC_API_KEY in Vercel.";
    default:
      return 'Something went wrong generating a response. Try again.';
  }
}

// ── Main component ────────────────────────────────────────────────────────────
const ObjectionCopilot = () => {
  const { currentSession, setHighlightedItemIds, updateGeneralNotes, showToast } = useApp();
  const [text, setText] = useState('');
  const [output, setOutput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);
  const [lastObjection, setLastObjection] = useState('');
  const [saved, setSaved] = useState(false);
  const abortRef = useRef(null);

  const sections = parseCopilotSections(output);
  const hasOutput = Boolean(output.trim());

  async function handleGenerate() {
    const objectionText = text.trim();
    if (!objectionText || isStreaming) return;
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
        { objectionText, session: currentSession },
        chunk => {
          full += chunk;
          setOutput(prev => prev + chunk);
        },
        controller.signal
      );
      // Highlight the library cards the model matched (READ section's Matches: line).
      setHighlightedItemIds(parseMatchedIds(full));
    } catch (err) {
      if (err?.name !== 'AbortError') setError(errorMessage(err));
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

  return (
    <div className="mb-8">
      <div className="glass-panel rounded-xl border border-[var(--color-border)] p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-2 h-2 rounded-full bg-[var(--color-accent-cyan)]" />
          <h3 className="font-semibold text-[var(--color-text-primary)] text-sm">Objection Copilot</h3>
          <span className="text-xs text-[var(--color-text-tertiary)]">
            Paste what the prospect actually said — get a tailored response in seconds
          </span>
        </div>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={2}
          placeholder={'e.g. "We\'re already deep into Power BI and the switching costs are real..."'}
          className="w-full rounded-lg border border-[var(--color-border)] bg-transparent px-4 py-3 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-accent-cyan)]/60 resize-y"
        />
        <div className="mt-3 flex items-center gap-3">
          {isStreaming ? (
            <button
              onClick={handleStop}
              className="text-sm px-4 py-2 rounded-lg border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-all duration-200"
            >
              Stop
            </button>
          ) : (
            <button
              onClick={handleGenerate}
              disabled={!text.trim()}
              className="text-sm px-4 py-2 rounded-lg bg-[var(--color-accent-cyan)] text-black font-semibold hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
            >
              Help me respond
            </button>
          )}
          {hasOutput && !isStreaming && currentSession && (
            <button
              onClick={handleSaveToNotes}
              disabled={saved}
              className="text-sm px-3 py-2 rounded-lg border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-accent-cyan)] hover:border-[var(--color-accent-cyan)]/50 disabled:opacity-50 disabled:cursor-default transition-all duration-200"
            >
              {saved ? 'Saved ✓' : 'Save to session notes'}
            </button>
          )}
          {hasOutput && !isStreaming && (
            <button
              onClick={handleClear}
              className="text-sm px-3 py-2 rounded-lg text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors duration-200"
            >
              Clear
            </button>
          )}
          <span className="ml-auto text-xs text-[var(--color-text-tertiary)] hidden sm:inline">⌘⏎ to send</span>
        </div>
        {error && (
          <p className="mt-3 text-sm text-red-400">{error}</p>
        )}
      </div>

      {(hasOutput || isStreaming) && (
        <div className="mt-4 grid grid-cols-1 gap-4">
          {SECTION_KEYS.map(key => {
            const content = sections[key];
            if (!content.trim() && !isStreaming) return null;
            return (
              <div key={key} className="glass-panel rounded-xl border border-[var(--color-border)] px-5 py-4 animate-fade-in-up">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-[var(--color-accent-cyan)]" />
                    <h4 className="font-semibold text-[var(--color-text-primary)] text-sm">{SECTION_LABELS[key]}</h4>
                    {isStreaming && !content.trim() && (
                      <span className="text-xs text-[var(--color-text-tertiary)] animate-pulse">Generating...</span>
                    )}
                  </div>
                  {key === 'RESPONSE' && content.trim() && <CopyButton text={content} />}
                </div>
                <div className="text-sm text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-wrap">
                  {content.trim()}
                  {isStreaming && content && (
                    <span className="inline-block w-1.5 h-4 bg-[var(--color-accent-cyan)] ml-0.5 animate-pulse align-middle" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ObjectionCopilot;
