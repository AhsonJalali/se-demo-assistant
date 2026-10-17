# SE Demo Assistant

A demo-day copilot for Solutions Engineers: a searchable library (discovery, differentiators,
objections, use cases) plus per-prospect sessions with notes, the 3 Why's, an AI prep brief, an
objection copilot, and PDF/Word export. React 18 + Vite + Tailwind, deployed on Vercel. Public repo.

## Commands

```bash
npm install
npm run dev     # http://localhost:5173
npm test        # vitest (jsdom)
npm run build
```

CI (`.github/workflows/ci.yml`) runs `npm test` and `npm run build` on every PR to `main`. Run both
before calling a change done.

## Layout

- `src/data/*.json`: all library content. Refer to the product as `{{product}}` / `{{Product}}` and the
  company as `{{company}}`; Settings fills them in at runtime.
- `src/components/`: UI. `src/context/AppContext.jsx` holds app state; sessions persist to localStorage
  via `src/utils/storageManager.js` and `sessionHelpers.js`.
- `src/utils/claudeApi.js` and `objectionCopilot.js`: streaming calls to the Anthropic Messages API.
- `api/`: Vercel serverless functions. `api/anthropic/` proxies to Anthropic with the server-side
  `ANTHROPIC_API_KEY`; `api/auth.js` is the optional login gate.
- `src/test/setup.js` works around Node 22+'s global `localStorage` shadowing jsdom's.

## Rules

- **Product-agnostic.** No vendor names, branding, or product-specific content anywhere. Everything
  product-related goes through the `{{product}}` / `{{company}}` tokens.
- Never use `VITE_ANTHROPIC_API_KEY` in production; it would be bundled into public JS.
- Work on a branch and open small PRs; never commit to `main` directly.
- Live AI calls and the phone-width layout haven't been verified end to end.
