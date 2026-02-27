# AI Prep Tab Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a Claude-powered "AI Prep" tab that generates a personalized pre-call brief, targeted discovery questions, talking points, and demo flow from a prospect's company name and pasted LinkedIn profiles.

**Architecture:** Single streaming fetch call to Anthropic API (`claude-sonnet-4-6`) with all ThoughtSpot JSON content embedded in the system prompt. Output streams into four section components delimited by `## BRIEF`, `## DISCOVERY`, `## TALKING_POINTS`, `## DEMO_FLOW` markers. API key read from `import.meta.env.VITE_ANTHROPIC_API_KEY` at build time.

**Tech Stack:** React 18, Vite, Tailwind CSS, native browser `fetch` with `ReadableStream` (no SDK needed), existing ThoughtSpot design tokens from `index.css`.

> **Note:** This project has no test framework configured. "Verify" steps use `npm run dev` and manual browser inspection instead of automated tests.

---

### Task 1: Document the API key requirement

**Files:**
- Create: `.env.example`

**Step 1: Create `.env.example`**

```
# Get your API key from https://console.anthropic.com/
VITE_ANTHROPIC_API_KEY=your-anthropic-api-key-here
```

**Step 2: Verify `.env` is gitignored**

Run: `cat .gitignore | grep .env`

Expected output includes `.env` or `.env.*`. If not present, add `.env` to `.gitignore`.

**Step 3: Commit**

```bash
git add .env.example
git commit -m "chore: add .env.example for Anthropic API key"
```

---

### Task 2: Create the Claude streaming API utility

**Files:**
- Create: `src/utils/claudeApi.js`

**Step 1: Create the file**

```javascript
import discoveryData from '../data/discovery.json';
import differentiatorsData from '../data/differentiators.json';
import objectionsData from '../data/objections.json';
import usecasesData from '../data/usecases.json';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-6';

function buildSystemPrompt() {
  const discovery = JSON.stringify(discoveryData.questions, null, 2);
  const differentiators = JSON.stringify(differentiatorsData.competitors, null, 2);
  const objections = JSON.stringify(objectionsData.objections, null, 2);
  const usecases = JSON.stringify(usecasesData.useCases, null, 2);

  return `You are an expert ThoughtSpot Solution Engineer assistant. Your job is to help SEs prepare highly personalized, relevant demos for specific prospects.

You have access to ThoughtSpot's complete sales content library:

DISCOVERY QUESTIONS:
${discovery}

COMPETITIVE DIFFERENTIATORS:
${differentiators}

OBJECTION HANDLING:
${objections}

USE CASES:
${usecases}

When given a prospect's details, generate a personalized prep brief using EXACTLY these four section headers in this order. Do not add any text before the first section header.

## BRIEF
Write 2-3 paragraphs: company context and what they do, what the stakeholder(s) care about based on their LinkedIn profiles, likely analytics pain points, and the recommended ThoughtSpot angle for this specific prospect.

## DISCOVERY
List the 8-10 most relevant discovery questions from the library above, reframed specifically for this prospect. Number each question and add 1-2 sentences below explaining why it's relevant for this specific company/person.

## TALKING_POINTS
List 5-7 of the most relevant differentiators and objection responses from the library, reframed to resonate with this prospect's context. Use bullet points.

## DEMO_FLOW
Recommend a 4-5 step demo sequence. For each step, name the use case, describe what to show, and explain why it fits this specific prospect.`;
}

function buildUserPrompt({ companyName, linkedinProfiles, additionalContext }) {
  const profilesText = linkedinProfiles
    .filter(p => p.trim())
    .map((p, i) => `--- LinkedIn Profile ${i + 1} ---\n${p}`)
    .join('\n\n');

  let prompt = `Company: ${companyName}\n\n`;
  if (profilesText) {
    prompt += `Stakeholder LinkedIn Profiles:\n${profilesText}\n\n`;
  }
  if (additionalContext?.trim()) {
    prompt += `Additional Context:\n${additionalContext}\n\n`;
  }
  prompt += 'Generate the personalized prep brief.';
  return prompt;
}

/**
 * Stream a Claude response for the given prospect inputs.
 *
 * @param {Object} inputs - { companyName, linkedinProfiles, additionalContext }
 * @param {Function} onChunk - called with each text chunk as it arrives
 * @param {AbortSignal} signal - optional AbortSignal for cancellation
 */
export async function streamAiPrep(inputs, onChunk, signal) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('NO_API_KEY');
  }

  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-allow-browser': 'true',
    },
    signal,
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 4000,
      stream: true,
      system: buildSystemPrompt(),
      messages: [{ role: 'user', content: buildUserPrompt(inputs) }],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API_ERROR:${response.status}:${errorText}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split('\n');

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const data = line.slice(6).trim();
      if (data === '[DONE]' || !data) continue;
      try {
        const parsed = JSON.parse(data);
        if (
          parsed.type === 'content_block_delta' &&
          parsed.delta?.type === 'text_delta' &&
          parsed.delta.text
        ) {
          onChunk(parsed.delta.text);
        }
      } catch {
        // skip malformed SSE lines
      }
    }
  }
}
```

**Step 2: Verify the file was created**

Run: `ls src/utils/`

Expected: `claudeApi.js` (and any existing utils) listed.

**Step 3: Commit**

```bash
git add src/utils/claudeApi.js
git commit -m "feat(ai-prep): add Claude streaming API utility"
```

---

### Task 3: Add AI Prep state to AppContext

**Files:**
- Modify: `src/context/AppContext.jsx`

**Step 1: Add aiPrep state after the existing UI state block (around line 62)**

Find this line:
```javascript
  const [allCardsCollapsed, setAllCardsCollapsed] = useState(false);
```

Add after it:
```javascript

  // AI Prep state
  const [aiPrepInputs, setAiPrepInputs] = useState({
    companyName: '',
    linkedinProfiles: [''],
    additionalContext: '',
  });
  const [aiPrepResult, setAiPrepResult] = useState(null);    // full generated text
  const [aiPrepIsGenerating, setAiPrepIsGenerating] = useState(false);
  const [aiPrepError, setAiPrepError] = useState(null);
  const aiPrepAbortRef = useRef(null);
```

**Step 2: Add cancelAiPrep and clearAiPrep helpers after the `closeNoteModal` function (around line 521)**

Find this line:
```javascript
  const closeNoteModal = useCallback(() => {
    setEditingNoteItemId(null);
  }, []);
```

Add after it:
```javascript

  const cancelAiPrep = useCallback(() => {
    if (aiPrepAbortRef.current) {
      aiPrepAbortRef.current.abort();
      aiPrepAbortRef.current = null;
    }
    setAiPrepIsGenerating(false);
  }, []);

  const clearAiPrep = useCallback(() => {
    cancelAiPrep();
    setAiPrepResult(null);
    setAiPrepError(null);
  }, [cancelAiPrep]);
```

**Step 3: Expose the new state and helpers in the context value object**

Find the `// UI state` comment block near the end of the `value` object (around line 568) and add before the closing `}`:

```javascript
    // AI Prep
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
```

**Step 4: Verify the app still loads**

Run: `npm run dev`

Open `http://localhost:5173` — all existing tabs should work normally. No console errors.

**Step 5: Commit**

```bash
git add src/context/AppContext.jsx
git commit -m "feat(ai-prep): add AI prep state to AppContext"
```

---

### Task 4: Create the AIPrepTab component

**Files:**
- Create: `src/components/AIPrepTab.jsx`

**Step 1: Create the full component**

```jsx
import React, { useCallback } from 'react';
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
    showToast,
  } = useApp();

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

  const sections = aiPrepResult ? parseSections(aiPrepResult) : null;
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
                    key={key}
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
```

**Step 2: Verify the file was created**

Run: `ls src/components/ | grep AIPrepTab`

Expected: `AIPrepTab.jsx`

**Step 3: Commit**

```bash
git add src/components/AIPrepTab.jsx
git commit -m "feat(ai-prep): add AIPrepTab component with streaming output"
```

---

### Task 5: Add the AI Prep tab to TabNavigation

**Files:**
- Modify: `src/components/TabNavigation.jsx`

**Step 1: Add the ai-prep entry to the tabs array**

Find this closing block in the `tabs` array (the `three-whys` tab, around line 52):
```javascript
    {
      id: 'three-whys',
```

Add a new tab entry **before** it:
```javascript
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
```

**Step 2: Verify the dev server shows a new tab**

Run: `npm run dev`

Expected: The tab bar shows "AI Prep" between "Use Cases" and "3 Why's". Clicking it should change `activeTab` (currently it won't render anything — that's fixed in the next task).

**Step 3: Commit**

```bash
git add src/components/TabNavigation.jsx
git commit -m "feat(ai-prep): add AI Prep tab to navigation"
```

---

### Task 6: Wire up ContentDisplay and App to render AIPrepTab

**Files:**
- Modify: `src/components/ContentDisplay.jsx`
- Modify: `src/App.jsx`

**Step 1: Import and render AIPrepTab in ContentDisplay**

In `src/components/ContentDisplay.jsx`, add the import at the top after the existing imports:
```javascript
import AIPrepTab from './AIPrepTab';
```

Then add a check at the top of the component body, after the existing `three-whys` check:
```javascript
  if (activeTab === 'ai-prep') {
    return <AIPrepTab />;
  }
```

It should go after this existing block:
```javascript
  if (activeTab === 'three-whys') {
    return <ThreeWhysContent />;
  }
```

**Step 2: Hide the FilterPanel when on the AI Prep tab**

In `src/App.jsx`, the layout renders `FilterPanel` and `ContentDisplay` side by side:
```javascript
          <FilterPanel />
          <ContentDisplay />
```

Change it to:
```javascript
          {activeTab !== 'ai-prep' && <FilterPanel />}
          <ContentDisplay />
```

You'll also need to destructure `activeTab` from `useApp()` in `AppContent`:

Find:
```javascript
  const { showSessionModal, showNotesPanel, showExportModal, showUseCasePanel } = useApp();
```

Change to:
```javascript
  const { showSessionModal, showNotesPanel, showExportModal, showUseCasePanel, activeTab } = useApp();
```

**Step 3: Verify end-to-end in the browser**

Run: `npm run dev`

1. Click "AI Prep" tab — the filter panel should disappear and the two-column AI prep layout should appear
2. All other tabs should still show the filter panel and card grid as before
3. Without an API key set, the amber warning should display
4. With a valid `VITE_ANTHROPIC_API_KEY` in `.env`, enter a company name and click "Generate Prep Brief" — sections should stream in progressively

**Step 4: Commit**

```bash
git add src/components/ContentDisplay.jsx src/App.jsx
git commit -m "feat(ai-prep): wire AIPrepTab into app layout and hide filter panel"
```

---

### Task 7: Smoke test and cleanup

**Step 1: Run full build to catch any import or type errors**

Run: `npm run build`

Expected: Build succeeds with no errors. Warnings about bundle size are acceptable.

**Step 2: Test the happy path manually**

1. Add your Anthropic API key to `.env`: `VITE_ANTHROPIC_API_KEY=sk-ant-...`
2. Run `npm run dev`
3. Go to AI Prep tab
4. Enter company name: "Salesforce"
5. Paste any sample text into the LinkedIn profile field
6. Click "Generate Prep Brief"
7. Verify: sections stream in one by one, the blinking cursor is visible while streaming, copy buttons appear on completion

**Step 3: Test the stop/cancel flow**

1. Click "Generate Prep Brief"
2. Immediately click "Stop Generating"
3. Verify: generation stops, "Stop Generating" button reverts to "Generate Prep Brief"

**Step 4: Test session persistence**

1. Generate a brief
2. Switch to the Discovery tab
3. Switch back to AI Prep
4. Verify: the generated brief is still visible (persisted in AppContext state)

**Step 5: Final commit**

```bash
git add -A
git commit -m "feat(ai-prep): complete AI prep tab with Claude streaming integration"
```
