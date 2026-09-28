# Roadmap

Rough priority order. Checked items are shipped.

## Shipped
- [x] Content library: discovery, differentiators, objections, use cases with search + filters
- [x] Per-prospect sessions with notes, selections, and localStorage persistence
- [x] 3 Why's capture (Why change / Why now / Why us)
- [x] Use-case documentation panel
- [x] PDF / DOCX session export
- [x] AI Prep tab — streaming Claude pre-call brief (server-side key proxy for prod)
- [x] Login gate + AI query rate limiting for public deploys
- [x] Objection copilot — live-call responses grounded in the library, matched cards highlighted, save to notes
- [x] Product-agnostic redesign — universal content library, Settings (product name, pitch, theme, accent), sidebar layout, light/dark themes, auto-save, keyboard shortcuts, accessible dialogs, rebuilt PDF/Word exports
- [x] Unit tests (Vitest) over session helpers, storage manager, and the streaming parsers; CI on PRs

## Next
- [ ] **Post-demo recap generator** — turn session notes + 3 Why's + selected use cases into a follow-up email / internal recap with Claude
- [ ] **AI-suggested discovery** — recommend the next-best discovery questions based on what's already been asked and answered in the session

## Later
- [ ] Industry-specific content packs (e.g. healthcare, financial services)
- [ ] Session sharing — export/import a session file or share a read-only link so an AE can see prep + notes
- [ ] Session timeline — chronological view of a deal across multiple demo sessions
- [ ] PPTX leave-behind export alongside PDF/DOCX
- [ ] PWA/offline mode for on-site demos with flaky wifi
- [ ] In-app content editor, and importable content packs (JSON) per product or team
