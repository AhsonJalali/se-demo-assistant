# 3 Why's Tab Design

## Overview

Add a new "3 Why's" tab to the SE Demo Assistant that captures strategic context through three key questions:
- Why change
- Why now
- Why ThoughtSpot

## Data Architecture

### JSON Template Data

New file: `src/data/threeWhys.json`

```json
{
  "questions": [
    {
      "id": "why-change",
      "question": "Why change",
      "order": 1
    },
    {
      "id": "why-now",
      "question": "Why now",
      "order": 2
    },
    {
      "id": "why-thoughtspot",
      "question": "Why ThoughtSpot",
      "order": 3
    }
  ]
}
```

### Session Storage

Answers stored per session under new `threeWhys` property:

```javascript
{
  // existing session properties (id, name, notes, selectedItems, etc.)
  threeWhys: {
    "why-change": "Answer text...",
    "why-now": "Answer text...",
    "why-thoughtspot": "Answer text..."
  }
}
```

This follows the existing pattern: template data in JSON files, user input saved per session.

## UI Components

### Tab Navigation Update

Add new tab to `TabNavigation.jsx`:

```javascript
{
  id: 'three-whys',
  label: '3 Why\'s',
  shortLabel: '3 Why\'s',
  icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M9 18h6M10 22h4M15 8a3 3 0 00-6 0c0 2 3 3 3 6"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 2v1M12 21v1M4.22 4.22l.707.707M18.364 18.364l.707.707M1 12h1M22 12h1M4.22 19.78l.707-.707M18.364 5.636l.707-.707"
            strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}
```

### New Component: ThreeWhysContent

Location: `src/components/ThreeWhysContent.jsx`

**Features:**
- Vertically stacked layout with three questions
- Large text areas (8-10 rows each) for detailed responses
- No placeholder text (question titles provide context)
- Auto-save with 300ms debounce (matches existing notes behavior)
- Glass-panel styling matching app aesthetic
- Fade-in animations with staggered delays

**Component Structure:**
```javascript
- Load questions from threeWhysData.json
- Access/update answers via currentSession.threeWhys
- Use updateSession() to trigger auto-save
- Show "No active session" message if no session loaded
- Display auto-save indicator when saving
```

### ContentDisplay Update

Add conditional rendering for three-whys tab:

```javascript
if (activeTab === 'three-whys') {
  return <ThreeWhysContent />;
}
// existing card grid logic...
```

## Context Integration

### AppContext Updates

1. **Import**: Add `threeWhysData` from JSON file
2. **Session Creation**: Initialize `threeWhys: {}` in `createSession()`
3. **Auto-save**: Existing session auto-save handles threeWhys updates automatically
4. **No new methods needed**: Use existing `updateSession()` and `currentSession` access

## Error Handling

### Missing Session
Show message: "Create or load a session to capture your 3 Why's responses" (similar to notes behavior)

### Storage Failures
Use existing toast notification system for save errors

### Data Migration
Existing sessions without `threeWhys` property: Initialize as empty object `{}` on first access

## Edge Cases

1. **Long Text**: Text areas handle large text without layout breaking
2. **Special Characters**: Standard textarea behavior, stored as plain text
3. **Session Switching**: Component re-renders with new session's answers
4. **Empty Answers**: Valid state, no required fields
5. **Export**: Update export logic to include `threeWhys` data

## Styling

- Match existing glass-panel aesthetic
- Use CSS variables for colors (--color-accent-gold, --color-text-primary, etc.)
- Responsive padding and spacing
- Subtle separators between questions
- Staggered fade-in animations (0.1s delay per question)

## Implementation Order

1. Create `src/data/threeWhys.json`
2. Update `AppContext.jsx`:
   - Import threeWhysData
   - Initialize threeWhys in createSession
3. Create `src/components/ThreeWhysContent.jsx`
4. Update `TabNavigation.jsx` (add new tab)
5. Update `ContentDisplay.jsx` (add conditional rendering)
6. Update export logic in `ExportModal.jsx` (include threeWhys)
7. Test auto-save, session switching, export

## No Breaking Changes

- Existing sessions work without threeWhys (empty state)
- All existing features unchanged
- Purely additive functionality
