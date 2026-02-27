# AI Prep Tab — Design Document

**Date:** 2026-02-27
**Status:** Approved

## Overview

Add a Claude-powered "AI Prep" tab to the ThoughtSpot SE Demo Assistant. Given a prospect's company name and one or more pasted LinkedIn profiles, Claude generates a personalized pre-call brief, targeted discovery questions, personalized talking points, and a suggested demo flow — all grounded in the app's existing ThoughtSpot content.

---

## Architecture

### New Tab
- `ai-prep` added to `TabNavigation` alongside existing tabs
- New component: `src/components/AIPrepTab.jsx`

### API Integration
- New utility: `src/utils/claudeApi.js`
- Calls Anthropic Messages API directly from the browser (no backend)
- API key sourced from `import.meta.env.VITE_ANTHROPIC_API_KEY` (set at build time)
- Uses streaming (`stream: true`) for progressive output rendering
- All four ThoughtSpot JSON files embedded in the system prompt as context

### State
- New state added to `AppContext`: prospect inputs, streaming status, and generated result
- Generated result persisted in session under `session.aiPrep = { inputs, result, generatedAt }`
- Uses existing `updateSession` pattern — no new storage mechanism needed

### Prompt Structure
- **System prompt:** Establishes Claude as a ThoughtSpot SE prep assistant; embeds full content from `discovery.json`, `differentiators.json`, `objections.json`, `usecases.json`
- **User turn:** Company name + pasted LinkedIn profile text(s) + optional additional context
- **Output format:** Four clearly delimited sections Claude returns in order:
  - `## BRIEF`
  - `## DISCOVERY`
  - `## TALKING_POINTS`
  - `## DEMO_FLOW`

---

## UI / UX

### Layout
Two-column layout within the AI Prep tab:
- **Left column (~40%):** Input form
- **Right column (~60%):** Streaming output area

### Input Form
- Company name (required text input)
- LinkedIn profile textarea(s) — paste profile text; "+ Add another profile" adds up to 5 profiles
- Optional "Additional context" free-text field (e.g. "evaluating Tableau", "VP of Finance champion")
- "Generate Prep Brief" button — disabled until company name is filled; shows spinner + "Generating..." during streaming

### Output Area
Four collapsible sections that populate progressively as Claude streams:
1. **Pre-Call Research Brief** — company context, stakeholder backgrounds, inferred pain points, suggested angle
2. **Targeted Discovery Questions** — ranked shortlist from `discovery.json`, reframed for this prospect
3. **Personalized Talking Points** — differentiators and objection responses reframed for this account
4. **Suggested Demo Flow** — recommended use case sequence with rationale

Each section includes a copy-to-clipboard button. Output persists across tab switches via session state.

**Empty state:** Right column shows "Fill in prospect details to generate a personalized prep brief."

---

## Data Flow

1. SE fills in company name, pastes LinkedIn text, optionally adds context
2. Clicks "Generate Prep Brief"
3. `claudeApi.js` builds prompt (system context + user inputs) and opens streaming request
4. As chunks arrive, raw text is appended to `streamingText` state
5. Lightweight parser watches for `## SECTION` delimiters and routes text to correct section component
6. On completion, full result is saved to `currentSession.aiPrep` via `updateSession`

---

## Error Handling

| Scenario | Behavior |
|---|---|
| No API key set | Inline warning with instructions to set `VITE_ANTHROPIC_API_KEY` |
| API error (rate limit, network) | Toast notification + error state with "Try again" button |
| Stream interrupted mid-generation | Keeps partial output; shows "Generation was interrupted — Try again" at bottom |

---

## Cost & Performance

- Prompt size: ~3–5k tokens (ThoughtSpot context) + prospect text
- Each generation: fraction of a cent at current Claude pricing
- No throttling needed at SE team scale

---

## Files Affected

| File | Change |
|---|---|
| `src/components/AIPrepTab.jsx` | New component |
| `src/utils/claudeApi.js` | New utility — streaming API call |
| `src/components/TabNavigation.jsx` | Add `ai-prep` tab |
| `src/context/AppContext.jsx` | Add AI prep state + session persistence |
| `.env.example` | Document `VITE_ANTHROPIC_API_KEY` |
