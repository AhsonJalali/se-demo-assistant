# ThoughtSpot Visual Retheme Design

**Date:** 2026-02-25
**Status:** Approved

## Goal

Restyle the SE Demo Assistant to match ThoughtSpot's visual design language as seen on thoughtspot.com — replacing the current gold/luxury aesthetic with ThoughtSpot's dark navy + electric cyan + purple/pink palette, and swapping fonts to Geist.

## Approach

Option A: CSS variables + global color swap. Update design tokens in `index.css`, then do a project-wide find-and-replace of all hard-coded hex values in component files.

---

## Section 1 — Color Tokens

Update CSS custom properties in `src/index.css`:

| Token | Current | New |
|---|---|---|
| `--color-bg-primary` | `#0a0e1a` | `#08062B` |
| `--color-bg-secondary` | `#121729` | `#0D0A35` |
| `--color-bg-tertiary` | `#1a2138` | `#141040` |
| `--color-accent-gold` → `--color-accent-cyan` | `#d4af37` | `#00D2FF` |
| `--color-accent-gold-muted` → `--color-accent-cyan-muted` | `#b8984f` | `#0099CC` |
| `--color-border` | `#252d44` | `#1B1B61` |
| `--color-border-subtle` | `#1e2537` | `#12103D` |
| `--color-glass` | `rgba(255,255,255,0.03)` | `rgba(0,210,255,0.03)` |
| `--color-glass-border` | `rgba(255,255,255,0.08)` | `rgba(0,210,255,0.12)` |

New secondary accent tokens:
- `--color-accent-purple: #DCADFF`
- `--color-accent-pink: #FE476E`

Body background radial gradients update from gold/indigo to cyan/purple:
```css
radial-gradient(at 0% 0%, rgba(0, 210, 255, 0.08) 0px, transparent 50%),
radial-gradient(at 100% 100%, rgba(220, 173, 255, 0.08) 0px, transparent 50%)
```

Scrollbar thumb: `rgba(0, 210, 255, 0.3)` / hover `rgba(0, 210, 255, 0.5)`

`.text-gradient-gold` renamed to `.text-gradient-cyan`:
```css
background: linear-gradient(135deg, #00D2FF 0%, #DCADFF 100%);
```

---

## Section 2 — Typography

- Remove Google Fonts import: `Crimson Pro` + `DM Sans`
- Add: `https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&display=swap`
- Update body `font-family`: `'Geist', ui-sans-serif, system-ui, sans-serif`
- Update `Header.jsx` inline style `fontFamily: "'Crimson Pro', serif"` → `'Geist', sans-serif`

---

## Section 3 — Component Color Sweep

Project-wide find-and-replace across all files in `src/`:

| Find | Replace |
|---|---|
| `#d4af37` | `#00D2FF` |
| `d4af37` (in Tailwind arbitrary values) | `00D2FF` |
| `#b8984f` | `#0099CC` |
| `b8984f` | `0099CC` |
| `#0a0e1a` | `#08062B` |
| `0a0e1a` | `08062B` |
| `#121729` | `#0D0A35` |
| `121729` | `0D0A35` |
| `#1a2138` | `#141040` |
| `1a2138` | `141040` |
| `#1a1f2e` | `#141040` |
| `1a1f2e` | `141040` |
| `#252d44` | `#1B1B61` |
| `252d44` | `1B1B61` |
| `#252b3b` | `#1B1B4A` |
| `252b3b` | `1B1B4A` |
| `#2d3548` | `#232060` |
| `2d3548` | `232060` |
| `rgba(212, 175, 55` | `rgba(0, 210, 255` |
| `text-gradient-gold` | `text-gradient-cyan` |

---

## Files Affected

- `src/index.css` — CSS variables, font import, utility classes, scrollbar, gradients
- `tailwind.config.js` — no changes needed (using arbitrary values)
- `src/components/Header.jsx` — inline font style, `text-gradient-gold` → `text-gradient-cyan`
- All files in `src/components/` and `src/components/useCasePanel/` — hex color replacements
- `src/context/AppContext.jsx` — no color references
