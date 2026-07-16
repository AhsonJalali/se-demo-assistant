# Roadmap

Rough priority order. Checked items are shipped.

## Shipped
- [x] Content library: discovery, differentiators, objections, use cases with search + filters
- [x] Per-prospect sessions with notes, selections, and localStorage persistence
- [x] 3 Why's capture (Why Change / Why Now / Why ThoughtSpot)
- [x] Use-case documentation panel
- [x] PDF / DOCX session export
- [x] AI Prep tab — streaming Claude pre-call brief (server-side key proxy for prod)
- [x] Login gate + AI query rate limiting for public deploys
- [x] ThoughtSpot visual retheme

## Next
- [ ] **Objection copilot** — paste what the prospect actually said, get a tailored response grounded in the objection library and the current session's context
- [ ] **Post-demo recap generator** — turn session notes + 3 Why's + selected use cases into a follow-up email / internal recap with Claude
- [ ] **AI-suggested discovery** — recommend the next-best discovery questions based on what's already been asked and answered in the session
- [ ] Unit tests (Vitest) over session helpers, storage manager, and the streaming parser; CI on PRs

## Later
- [ ] More competitor packs (Sigma, Omni, Mode) and industry-specific content packs
- [ ] Session sharing — export/import a session file or share a read-only link so an AE can see prep + notes
- [ ] Session timeline — chronological view of a deal across multiple demo sessions
- [ ] PPTX leave-behind export alongside PDF/DOCX
- [ ] PWA/offline mode for on-site demos with flaky wifi
- [ ] Make the content layer fully product-agnostic (config-driven branding) so this works for any SE team
