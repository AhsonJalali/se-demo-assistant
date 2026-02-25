# ThoughtSpot Visual Retheme Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the gold/luxury aesthetic with ThoughtSpot's dark navy + electric cyan palette and swap fonts to Geist.

**Architecture:** Update CSS design tokens in `index.css`, then sweep all component files to replace hard-coded hex color values. No structural changes — purely visual. No unit tests apply (visual verification via the running dev server at http://localhost:5173).

**Tech Stack:** React, Tailwind CSS (arbitrary values), CSS custom properties, Google Fonts (Geist)

---

## Color Reference

| Old | New | Usage |
|---|---|---|
| `#d4af37` | `#00D2FF` | Primary accent (cyan) |
| `#b8984f` | `#0099CC` | Muted accent |
| `#0a0e1a` | `#08062B` | BG primary |
| `#121729` | `#0D0A35` | BG secondary |
| `#1a2138` / `#1a1f2e` | `#141040` | BG tertiary |
| `#252d44` / `#252b3b` | `#1B1B61` | Borders / button bg |
| `#2d3548` | `#232060` | Button hover bg |
| `rgba(212, 175, 55, ...)` | `rgba(0, 210, 255, ...)` | Transparent accent |
| `text-gradient-gold` | `text-gradient-cyan` | CSS utility class |
| `Crimson Pro` | `Geist` | Display font |
| `DM Sans` | `Geist` | Body font |

---

### Task 1: Update `src/index.css` — tokens, font, utilities, scrollbar, gradients

**Files:**
- Modify: `src/index.css`

**Step 1: Replace the Google Fonts import**

Find:
```css
@import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400;600;700&family=DM+Sans:wght@400;500;600;700&display=swap');
```
Replace with:
```css
@import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&display=swap');
```

**Step 2: Update CSS custom properties**

Find the entire `:root` block and replace with:
```css
:root {
  --color-bg-primary: #08062B;
  --color-bg-secondary: #0D0A35;
  --color-bg-tertiary: #141040;
  --color-accent-cyan: #00D2FF;
  --color-accent-cyan-muted: #0099CC;
  --color-accent-purple: #DCADFF;
  --color-accent-pink: #FE476E;
  --color-text-primary: #e8eaf0;
  --color-text-secondary: #a8b0c8;
  --color-text-tertiary: #6b7494;
  --color-border: #1B1B61;
  --color-border-subtle: #12103D;
  --color-glass: rgba(0, 210, 255, 0.03);
  --color-glass-border: rgba(0, 210, 255, 0.12);
}
```

**Step 3: Update body styles**

Find:
```css
    background-color: #0a0e1a;
    color: #e8eaf0;
    font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
```
Replace with:
```css
    background-color: #08062B;
    color: #e8eaf0;
    font-family: 'Geist', ui-sans-serif, system-ui, sans-serif;
```

**Step 4: Update body background gradient**

Find:
```css
      radial-gradient(at 0% 0%, rgba(212, 175, 55, 0.05) 0px, transparent 50%),
      radial-gradient(at 100% 100%, rgba(90, 103, 216, 0.05) 0px, transparent 50%);
```
Replace with:
```css
      radial-gradient(at 0% 0%, rgba(0, 210, 255, 0.08) 0px, transparent 50%),
      radial-gradient(at 100% 100%, rgba(220, 173, 255, 0.08) 0px, transparent 50%);
```

**Step 5: Rename `.text-gradient-gold` to `.text-gradient-cyan` and update gradient**

Find:
```css
  .text-gradient-gold {
    background: linear-gradient(135deg, #d4af37 0%, #f4e5a1 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
```
Replace with:
```css
  .text-gradient-cyan {
    background: linear-gradient(135deg, #00D2FF 0%, #DCADFF 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
```

**Step 6: Update scrollbar colors**

Find:
```css
  .custom-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: rgba(212, 175, 55, 0.3) transparent;
  }
```
Replace with:
```css
  .custom-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: rgba(0, 210, 255, 0.3) transparent;
  }
```

Find:
```css
    background: rgba(212, 175, 55, 0.3);
```
Replace with:
```css
    background: rgba(0, 210, 255, 0.3);
```

Find:
```css
    background: rgba(212, 175, 55, 0.5);
```
Replace with:
```css
    background: rgba(0, 210, 255, 0.5);
```

**Step 7: Verify in browser**

Open http://localhost:5173 — background should be deeper navy, no gold visible in scrollbars or body gradient.

**Step 8: Commit**

```bash
git add src/index.css
git commit -m "style: update CSS tokens and font to ThoughtSpot design system"
```

---

### Task 2: Update `src/components/Header.jsx`

**Files:**
- Modify: `src/components/Header.jsx`

**Step 1: Update logo gradient**

Find:
```jsx
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#d4af37] to-[#b8984f] flex items-center justify-center shadow-lg shadow-[#d4af37]/20">
```
Replace with:
```jsx
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00D2FF] to-[#0099CC] flex items-center justify-center shadow-lg shadow-[#00D2FF]/20">
```

**Step 2: Update logo icon color (dark bg for contrast)**

Find:
```jsx
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-[#0a0e1a]">
```
Replace with:
```jsx
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-[#08062B]">
```

**Step 3: Update title font and gradient class**

Find:
```jsx
            <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "'Crimson Pro', serif" }}>
              <span className="text-gradient-gold">ThoughtSpot</span>
```
Replace with:
```jsx
            <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "'Geist', sans-serif" }}>
              <span className="text-gradient-cyan">ThoughtSpot</span>
```

**Step 4: Update search bar and button accent colors**

Replace all remaining `#d4af37` occurrences in this file with `#00D2FF`.

**Step 5: Verify in browser**

Logo should show cyan gradient, header title should show cyan-to-purple gradient text.

**Step 6: Commit**

```bash
git add src/components/Header.jsx
git commit -m "style: update Header to ThoughtSpot cyan palette"
```

---

### Task 3: Update `src/components/UseCaseDocumentationPanel.jsx`

**Files:**
- Modify: `src/components/UseCaseDocumentationPanel.jsx`

**Step 1: Replace all hard-coded colors**

Perform these replacements throughout the file:
- `#1a1f2e` → `#141040`
- `#d4af37` → `#00D2FF`  (5 occurrences)
- `#252b3b` → `#1B1B4A`  (4 occurrences)
- `#2d3548` → `#232060`  (4 occurrences)

**Step 2: Verify in browser**

Open Use Case panel — toolbar buttons should show cyan hover accents, no gold visible.

**Step 3: Commit**

```bash
git add src/components/UseCaseDocumentationPanel.jsx
git commit -m "style: update UseCaseDocumentationPanel to cyan palette"
```

---

### Task 4: Update `src/components/ExportModal.jsx`

**Files:**
- Modify: `src/components/ExportModal.jsx`

**Step 1: Replace all hard-coded colors**

Perform these replacements throughout the file:
- `#d4af37` → `#00D2FF`  (3 occurrences — lines 154, 196, 197)
- `#0a0e1a` → `#08062B`  (line 149)
- `#252d44` → `#1B1B61`  (lines 149, 151, 162)

**Step 2: Verify in browser**

Open Export modal — accent color should be cyan, borders deep navy.

**Step 3: Commit**

```bash
git add src/components/ExportModal.jsx
git commit -m "style: update ExportModal to cyan palette"
```

---

### Task 5: Update `src/components/NotesPanel.jsx`

**Files:**
- Modify: `src/components/NotesPanel.jsx`

**Step 1: Replace all hard-coded colors**

Perform these replacements throughout the file:
- `#0a0e1a` → `#08062B`  (lines 70, 72)
- `#252d44` → `#1B1B61`  (lines 70, 72)

**Step 2: Commit**

```bash
git add src/components/NotesPanel.jsx
git commit -m "style: update NotesPanel to new bg/border colors"
```

---

### Task 6: Update `src/utils/exportToPDF.js`

**Files:**
- Modify: `src/utils/exportToPDF.js`

**Step 1: Replace all hard-coded colors**

Perform these replacements:
- `#0a0e1a` → `#08062B`
- `#121729` → `#0D0A35`
- `#d4af37` → `#00D2FF`
- `#b8984f` → `#0099CC`

**Step 2: Commit**

```bash
git add src/utils/exportToPDF.js
git commit -m "style: update PDF export colors to ThoughtSpot palette"
```

---

### Task 7: Update font references in remaining components

**Files:**
- Modify: `src/components/ContentDisplay.jsx`
- Modify: `src/components/FilterPanel.jsx`
- Modify: `src/components/Card.jsx`
- Modify: `src/components/ThreeWhysContent.jsx`

**Step 1: Replace `Crimson Pro` with `Geist` in each file**

In each file, find every occurrence of `'Crimson Pro'` (or `"Crimson Pro"`) and replace with `'Geist'`. Keep surrounding code (font-weight, font-style) unchanged.

Files and approximate occurrences:
- `ContentDisplay.jsx` — line 32 (1 occurrence)
- `FilterPanel.jsx` — line 43 (1 occurrence)
- `Card.jsx` — lines 130, 255, 306, 397 (4 occurrences)
- `ThreeWhysContent.jsx` — lines 66, 84, 117 (3 occurrences)

**Step 2: Commit**

```bash
git add src/components/ContentDisplay.jsx src/components/FilterPanel.jsx src/components/Card.jsx src/components/ThreeWhysContent.jsx
git commit -m "style: replace Crimson Pro with Geist across components"
```

---

### Task 8: Sweep `src/components/useCasePanel/` for hard-coded hex values

**Files:**
- Modify: `src/components/useCasePanel/CustomerContextCard.jsx`
- Modify: `src/components/useCasePanel/StakeholdersCard.jsx`
- Modify: `src/components/useCasePanel/TimelineCard.jsx`
- Modify: `src/components/useCasePanel/BusinessRequirementsCard.jsx`
- Modify: `src/components/useCasePanel/TechnicalRequirementsCard.jsx`

**Step 1: In each file, replace these colors**

- `#0a0e1a` → `#08062B`  (used as input background)
- `#252d44` → `#1B1B61`  (used as input border)
- `#d4af37` → `#00D2FF`  (accent/label/focus colors)

Note: `#a8b0c8` and `#e8eaf0` are kept as-is (they map to `--color-text-secondary` and `--color-text-primary` which remain unchanged).

**Step 2: Verify in browser**

Open Use Case panel and expand Customer Context card — input fields should show cyan focus borders and labels, deep navy input backgrounds.

**Step 3: Commit**

```bash
git add src/components/useCasePanel/
git commit -m "style: update useCasePanel components to ThoughtSpot palette"
```

---

### Task 9: Final visual QA pass

**Step 1: Load the app at http://localhost:5173**

Check each area:
- [ ] Header: cyan logo gradient, cyan-to-purple title, no gold anywhere
- [ ] Tab navigation: active tab in cyan, hover states cyan
- [ ] Content cards: borders, accents, selection states all cyan
- [ ] Filter panel: selected filters highlighted in cyan
- [ ] Notes panel: accent colors cyan
- [ ] Use Case Documentation panel: toolbar, input focus, section labels all cyan
- [ ] Export modal: cyan accents
- [ ] Session dropdown: cyan accents
- [ ] Scrollbars: cyan thumb
- [ ] Background: deep navy (#08062B) with subtle cyan/purple radial gradients
- [ ] Typography: Geist used throughout (verify in DevTools → Elements → Computed styles)

**Step 2: Fix any missed occurrences found during QA**

If any gold (`#d4af37`) or old colors are spotted, locate and replace them.

**Step 3: Final commit**

```bash
git add -A
git commit -m "style: ThoughtSpot visual retheme complete"
```
