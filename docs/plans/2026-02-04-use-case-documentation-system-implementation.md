# Use Case Documentation System Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform Use Cases tab from static reference into active documentation tool for customer discovery calls with structured capture, quick actions, and enhanced exports.

**Architecture:** Side panel component (60% width, resizable) that opens when SE clicks a use case card. Extends session data model to store structured fields + free-form notes. Integrates with existing save/export system.

**Tech Stack:** React 18, Context API for state, Tailwind CSS for styling, existing session/storage helpers, jsPDF/docx for exports

---

## Phase 1: Core Infrastructure

### Task 1: Extend Session Data Model

**Files:**
- Modify: `src/utils/sessionHelpers.js:12-41`
- Test: Manual verification in browser console

**Step 1: Add useCaseDocumentation to session structure**

In `src/utils/sessionHelpers.js`, modify the `createSession` function:

```javascript
export const createSession = (name = 'New Session', metadata = {}) => {
  const now = new Date().toISOString();

  return {
    id: uuidv4(),
    name: name.trim() || 'New Session',
    metadata: {
      demoDate: metadata.demoDate || now,
      dealStage: metadata.dealStage || 'Discovery',
      industries: metadata.industries || [],
      useCases: metadata.useCases || []
    },
    notes: {
      items: {},
      general: ''
    },
    selectedItems: {
      discovery: [],
      usecases: [],
      differentiators: [],
      objections: []
    },
    threeWhys: {
      'why-change': '',
      'why-now': '',
      'why-thoughtspot': ''
    },
    // NEW: Use case documentation
    useCaseDocumentation: {},
    createdAt: now,
    updatedAt: now
  };
};
```

**Step 2: Verify in browser**

Run: Open browser console, create new session, inspect session object
Expected: `useCaseDocumentation: {}` present in session

**Step 3: Save changes**

Run: `git add src/utils/sessionHelpers.js`
Note: Will commit with other Phase 1 changes

---

### Task 2: Create UseCaseDocumentationPanel Component Skeleton

**Files:**
- Create: `src/components/UseCaseDocumentationPanel.jsx`
- Modify: `src/App.jsx:10-12,34`

**Step 1: Create empty panel component**

Create `src/components/UseCaseDocumentationPanel.jsx`:

```javascript
import React from 'react';
import { useApp } from '../context/AppContext';

const UseCaseDocumentationPanel = () => {
  const { showUseCasePanel, setShowUseCasePanel, selectedUseCaseId } = useApp();

  if (!showUseCasePanel || !selectedUseCaseId) return null;

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 animate-fadeIn"
        onClick={() => setShowUseCasePanel(false)}
      />

      {/* Panel */}
      <aside className="fixed top-0 right-0 h-full w-[60%] bg-[#121729] border-l border-[#252d44] z-50 flex flex-col animate-slideInRight shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#252d44] bg-[#0a0e1a]">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#e8eaf0]">Use Case Documentation</h2>
            <button
              onClick={() => setShowUseCasePanel(false)}
              className="p-2 rounded-lg hover:bg-[#252d44] transition-colors duration-200"
            >
              <svg className="w-5 h-5 text-[#a8b0c8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          <p className="text-[#a8b0c8]">Panel skeleton - content coming soon</p>
        </div>
      </aside>
    </>
  );
};

export default UseCaseDocumentationPanel;
```

**Step 2: Add state to AppContext**

Modify `src/context/AppContext.jsx`:

Add state variables after existing state (around line 57):
```javascript
const [showUseCasePanel, setShowUseCasePanel] = useState(false);
const [selectedUseCaseId, setSelectedUseCaseId] = useState(null);
```

Add to context value (around line 459):
```javascript
showUseCasePanel,
setShowUseCasePanel,
selectedUseCaseId,
setSelectedUseCaseId,
```

**Step 3: Import and render in App.jsx**

Modify `src/App.jsx`:

Add import at top:
```javascript
import UseCaseDocumentationPanel from './components/UseCaseDocumentationPanel';
```

Add to render (after NotesPanel):
```javascript
{/* Use Case Documentation Panel */}
{showUseCasePanel && <UseCaseDocumentationPanel />}
```

**Step 4: Test panel opens/closes**

Run: `npm run dev`, open browser, manually set state in console
```javascript
// In browser console
window.__appContext = document.querySelector('[data-context]')?.__reactProps$?.value;
window.__appContext.setShowUseCasePanel(true);
window.__appContext.setSelectedUseCaseId('uc-1');
```
Expected: Panel slides in from right, clicking backdrop closes it

**Step 5: Commit**

```bash
git add src/components/UseCaseDocumentationPanel.jsx src/context/AppContext.jsx src/App.jsx src/utils/sessionHelpers.js
git commit -m "feat: add use case documentation panel skeleton

- Extend session data model with useCaseDocumentation
- Create empty UseCaseDocumentationPanel component
- Add panel state to AppContext
- Wire up panel in App.jsx

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 3: Connect Panel to Use Case Card Click

**Files:**
- Modify: `src/components/Card.jsx:18-20`

**Step 1: Add click handler for use case cards**

In `src/components/Card.jsx`, modify the `Card` component's click handler:

```javascript
const Card = ({ item, type }) => {
  const {
    expandedCard,
    setExpandedCard,
    currentSession,
    toggleItemSelection,
    isItemSelected,
    getItemNote,
    setShowUseCasePanel,
    setSelectedUseCaseId
  } = useApp();

  const isExpanded = expandedCard === item.id;
  const isSelected = currentSession ? isItemSelected(item.id) : false;
  const hasNote = currentSession ? getItemNote(item.id) : null;

  const toggleExpand = () => {
    // For use cases, open documentation panel instead of expanding
    if (type === 'usecase') {
      setSelectedUseCaseId(item.id);
      setShowUseCasePanel(true);
    } else {
      setExpandedCard(isExpanded ? null : item.id);
    }
  };

  // ... rest of component
```

**Step 2: Test clicking use case card**

Run: `npm run dev`, navigate to Use Cases tab, click a card
Expected: Documentation panel opens with panel visible

**Step 3: Commit**

```bash
git add src/components/Card.jsx
git commit -m "feat: connect use case cards to documentation panel

- Clicking use case card now opens documentation panel
- Other card types continue to expand inline

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 4: Add Panel Resizing

**Files:**
- Modify: `src/components/UseCaseDocumentationPanel.jsx:23-50`
- Create: `src/hooks/useResizable.js`

**Step 1: Create useResizable hook**

Create `src/hooks/useResizable.js`:

```javascript
import { useState, useCallback, useEffect } from 'react';

export const useResizable = (initialWidth = 60) => {
  const [width, setWidth] = useState(initialWidth);
  const [isResizing, setIsResizing] = useState(false);

  const startResize = useCallback((e) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const stopResize = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback((e) => {
    if (!isResizing) return;

    const viewportWidth = window.innerWidth;
    const newWidth = ((viewportWidth - e.clientX) / viewportWidth) * 100;

    // Constrain between 40% and 80%
    const constrainedWidth = Math.max(40, Math.min(80, newWidth));
    setWidth(constrainedWidth);
  }, [isResizing]);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', resize);
      window.addEventListener('mouseup', stopResize);

      return () => {
        window.removeEventListener('mousemove', resize);
        window.removeEventListener('mouseup', stopResize);
      };
    }
  }, [isResizing, resize, stopResize]);

  return { width, startResize, isResizing };
};
```

**Step 2: Add resize handle to panel**

Modify `src/components/UseCaseDocumentationPanel.jsx`:

```javascript
import { useResizable } from '../hooks/useResizable';

const UseCaseDocumentationPanel = () => {
  const { showUseCasePanel, setShowUseCasePanel, selectedUseCaseId } = useApp();
  const { width, startResize, isResizing } = useResizable(60);

  if (!showUseCasePanel || !selectedUseCaseId) return null;

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 animate-fadeIn"
        onClick={() => setShowUseCasePanel(false)}
      />

      {/* Panel */}
      <aside
        className="fixed top-0 right-0 h-full bg-[#121729] border-l border-[#252d44] z-50 flex flex-col shadow-2xl transition-all duration-200"
        style={{ width: `${width}%` }}
      >
        {/* Resize Handle */}
        <div
          className={`absolute left-0 top-0 bottom-0 w-1 cursor-ew-resize hover:bg-[#d4af37]/50 transition-colors ${
            isResizing ? 'bg-[#d4af37]' : ''
          }`}
          onMouseDown={startResize}
        />

        {/* Rest of panel content... */}
```

**Step 3: Test resizing**

Run: `npm run dev`, open panel, drag left edge
Expected: Panel resizes smoothly, constrained to 40-80%

**Step 4: Commit**

```bash
git add src/hooks/useResizable.js src/components/UseCaseDocumentationPanel.jsx
git commit -m "feat: add panel resizing with drag handle

- Create useResizable hook for panel width control
- Add resize handle on left edge of panel
- Constrain width between 40% and 80%

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Phase 2: Structured Fields

### Task 5: Create Customer Context Fields

**Files:**
- Create: `src/components/useCasePanel/CustomerContextCard.jsx`
- Modify: `src/components/UseCaseDocumentationPanel.jsx:40-45`
- Modify: `src/context/AppContext.jsx` (add helper functions)

**Step 1: Create helper functions for use case documentation**

Add to `src/context/AppContext.jsx` (around line 355):

```javascript
// Use case documentation methods
const getUseCaseDocumentation = useCallback((useCaseId) => {
  if (!currentSession) return null;
  return currentSession.useCaseDocumentation[useCaseId] || null;
}, [currentSession]);

const updateUseCaseDocumentation = useCallback((useCaseId, updates) => {
  if (!currentSession) return;

  try {
    const existingDoc = currentSession.useCaseDocumentation[useCaseId] || {
      structured: {
        customerContext: {},
        stakeholders: {},
        timeline: {},
        businessRequirements: {},
        technicalRequirements: {}
      },
      notes: { content: '', quickCaptureItems: [], lastModified: null }
    };

    const updated = {
      ...currentSession,
      useCaseDocumentation: {
        ...currentSession.useCaseDocumentation,
        [useCaseId]: {
          ...existingDoc,
          ...updates
        }
      },
      updatedAt: new Date().toISOString()
    };

    setCurrentSession(updated);
  } catch (error) {
    showToast(`Failed to update documentation: ${error.message}`, 'error');
  }
}, [currentSession, showToast]);
```

Add to context value (around line 459):
```javascript
getUseCaseDocumentation,
updateUseCaseDocumentation,
```

**Step 2: Create CustomerContextCard component**

Create `src/components/useCasePanel/CustomerContextCard.jsx`:

```javascript
import React from 'react';
import { useApp } from '../../context/AppContext';

const CustomerContextCard = ({ useCaseId }) => {
  const { getUseCaseDocumentation, updateUseCaseDocumentation, categories } = useApp();

  const doc = getUseCaseDocumentation(useCaseId);
  const context = doc?.structured?.customerContext || {};

  const handleFieldChange = (field, value) => {
    const updated = {
      ...doc,
      structured: {
        ...doc?.structured,
        customerContext: {
          ...context,
          [field]: value
        }
      }
    };
    updateUseCaseDocumentation(useCaseId, updated);
  };

  const urgencyColors = {
    low: 'bg-[#a8b0c8]/20 text-[#a8b0c8] border-[#a8b0c8]/40',
    medium: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
    high: 'bg-orange-500/20 text-orange-400 border-orange-500/40',
    critical: 'bg-red-500/20 text-red-400 border-red-500/40'
  };

  return (
    <div className="glass-panel-strong rounded-xl p-4 space-y-4">
      <h3 className="text-sm font-bold text-[#d4af37] uppercase tracking-wider flex items-center gap-2">
        <span>🏢</span>
        Customer Context
      </h3>

      <div className="grid grid-cols-2 gap-4">
        {/* Industry */}
        <div>
          <label className="block text-xs font-medium text-[#a8b0c8] mb-2">
            Industry
          </label>
          <select
            multiple
            value={context.industry || []}
            onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions, option => option.value);
              handleFieldChange('industry', selected);
            }}
            className="w-full px-3 py-2 bg-[#0a0e1a] border border-[#252d44] rounded-lg text-[#e8eaf0] text-sm focus:outline-none focus:border-[#d4af37] transition-colors"
            size={4}
          >
            {categories.industries.map(ind => (
              <option key={ind.id} value={ind.id}>{ind.name}</option>
            ))}
          </select>
          <p className="text-xs text-[#a8b0c8]/70 mt-1">Hold Cmd/Ctrl to select multiple</p>
        </div>

        {/* Company Size */}
        <div>
          <label className="block text-xs font-medium text-[#a8b0c8] mb-2">
            Company Size
          </label>
          <select
            value={context.companySize || ''}
            onChange={(e) => handleFieldChange('companySize', e.target.value)}
            className="w-full px-3 py-2 bg-[#0a0e1a] border border-[#252d44] rounded-lg text-[#e8eaf0] text-sm focus:outline-none focus:border-[#d4af37] transition-colors"
          >
            <option value="">Select size...</option>
            <option value="smb">SMB (< 500 employees)</option>
            <option value="mid-market">Mid-Market (500-5000)</option>
            <option value="enterprise">Enterprise (5000+)</option>
          </select>
        </div>

        {/* Current Tools */}
        <div className="col-span-2">
          <label className="block text-xs font-medium text-[#a8b0c8] mb-2">
            Current Tools
          </label>
          <input
            type="text"
            value={context.currentTools?.join(', ') || ''}
            onChange={(e) => {
              const tools = e.target.value.split(',').map(t => t.trim()).filter(Boolean);
              handleFieldChange('currentTools', tools);
            }}
            placeholder="e.g., Tableau, Excel, Power BI (comma-separated)"
            className="w-full px-3 py-2 bg-[#0a0e1a] border border-[#252d44] rounded-lg text-[#e8eaf0] text-sm placeholder-[#a8b0c8]/50 focus:outline-none focus:border-[#d4af37] transition-colors"
          />
        </div>

        {/* Urgency Level */}
        <div className="col-span-2">
          <label className="block text-xs font-medium text-[#a8b0c8] mb-2">
            Urgency Level
          </label>
          <div className="flex gap-2">
            {['low', 'medium', 'high', 'critical'].map(level => (
              <button
                key={level}
                onClick={() => handleFieldChange('urgencyLevel', level)}
                className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wide border transition-all ${
                  context.urgencyLevel === level
                    ? urgencyColors[level]
                    : 'bg-[#0a0e1a]/50 text-[#a8b0c8]/50 border-[#252d44] hover:border-[#d4af37]/30'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerContextCard;
```

**Step 3: Add to panel**

Modify `src/components/UseCaseDocumentationPanel.jsx`:

```javascript
import CustomerContextCard from './useCasePanel/CustomerContextCard';

// In the content div:
<div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
  <CustomerContextCard useCaseId={selectedUseCaseId} />
</div>
```

**Step 4: Test customer context card**

Run: `npm run dev`, open use case panel, fill in fields
Expected: Fields update immediately, data saves to session

**Step 5: Commit**

```bash
git add src/components/useCasePanel/CustomerContextCard.jsx src/components/UseCaseDocumentationPanel.jsx src/context/AppContext.jsx
git commit -m "feat: add customer context fields to use case panel

- Create CustomerContextCard with industry, company size, tools, urgency
- Add documentation helper functions to AppContext
- Multi-select industry with categories integration
- Color-coded urgency level pills

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 6: Create Stakeholders Card

**Files:**
- Create: `src/components/useCasePanel/StakeholdersCard.jsx`
- Modify: `src/components/UseCaseDocumentationPanel.jsx:42`

**Step 1: Create StakeholdersCard component**

Create `src/components/useCasePanel/StakeholdersCard.jsx`:

```javascript
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

const StakeholdersCard = ({ useCaseId }) => {
  const { getUseCaseDocumentation, updateUseCaseDocumentation } = useApp();

  const doc = getUseCaseDocumentation(useCaseId);
  const stakeholders = doc?.structured?.stakeholders || {};

  const [newDM, setNewDM] = useState({ name: '', role: '' });

  const handleFieldChange = (field, value) => {
    const updated = {
      ...doc,
      structured: {
        ...doc?.structured,
        stakeholders: {
          ...stakeholders,
          [field]: value
        }
      }
    };
    updateUseCaseDocumentation(useCaseId, updated);
  };

  const addDecisionMaker = () => {
    if (!newDM.name || !newDM.role) return;

    const dms = stakeholders.decisionMakers || [];
    handleFieldChange('decisionMakers', [...dms, { ...newDM }]);
    setNewDM({ name: '', role: '' });
  };

  const removeDecisionMaker = (index) => {
    const dms = stakeholders.decisionMakers || [];
    handleFieldChange('decisionMakers', dms.filter((_, i) => i !== index));
  };

  const toggleChampion = (index) => {
    const champions = stakeholders.champions || [];
    const dm = stakeholders.decisionMakers[index];

    const isChampion = champions.some(c => c.name === dm.name);
    if (isChampion) {
      handleFieldChange('champions', champions.filter(c => c.name !== dm.name));
    } else {
      handleFieldChange('champions', [...champions, dm]);
    }
  };

  return (
    <div className="glass-panel-strong rounded-xl p-4 space-y-4">
      <h3 className="text-sm font-bold text-[#d4af37] uppercase tracking-wider flex items-center gap-2">
        <span>👥</span>
        Stakeholders
      </h3>

      {/* Primary Contact */}
      <div className="space-y-2">
        <label className="block text-xs font-medium text-[#a8b0c8]">
          Primary Contact
        </label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            value={stakeholders.primaryContact?.name || ''}
            onChange={(e) => handleFieldChange('primaryContact', {
              ...stakeholders.primaryContact,
              name: e.target.value
            })}
            placeholder="Name"
            className="px-3 py-2 bg-[#0a0e1a] border border-[#252d44] rounded-lg text-[#e8eaf0] text-sm placeholder-[#a8b0c8]/50 focus:outline-none focus:border-[#d4af37] transition-colors"
          />
          <input
            type="text"
            value={stakeholders.primaryContact?.role || ''}
            onChange={(e) => handleFieldChange('primaryContact', {
              ...stakeholders.primaryContact,
              role: e.target.value
            })}
            placeholder="Role"
            className="px-3 py-2 bg-[#0a0e1a] border border-[#252d44] rounded-lg text-[#e8eaf0] text-sm placeholder-[#a8b0c8]/50 focus:outline-none focus:border-[#d4af37] transition-colors"
          />
        </div>
      </div>

      {/* Decision Makers */}
      <div className="space-y-2">
        <label className="block text-xs font-medium text-[#a8b0c8]">
          Decision Makers
        </label>

        {/* Add new DM */}
        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            value={newDM.name}
            onChange={(e) => setNewDM({ ...newDM, name: e.target.value })}
            placeholder="Name"
            className="px-3 py-2 bg-[#0a0e1a] border border-[#252d44] rounded-lg text-[#e8eaf0] text-sm placeholder-[#a8b0c8]/50 focus:outline-none focus:border-[#d4af37] transition-colors"
          />
          <div className="flex gap-2">
            <input
              type="text"
              value={newDM.role}
              onChange={(e) => setNewDM({ ...newDM, role: e.target.value })}
              placeholder="Role"
              className="flex-1 px-3 py-2 bg-[#0a0e1a] border border-[#252d44] rounded-lg text-[#e8eaf0] text-sm placeholder-[#a8b0c8]/50 focus:outline-none focus:border-[#d4af37] transition-colors"
            />
            <button
              onClick={addDecisionMaker}
              className="px-3 py-2 bg-[#d4af37]/10 border border-[#d4af37]/30 rounded-lg text-[#d4af37] text-sm font-semibold hover:bg-[#d4af37]/20 transition-colors"
            >
              +
            </button>
          </div>
        </div>

        {/* DM List */}
        <div className="space-y-1">
          {(stakeholders.decisionMakers || []).map((dm, idx) => {
            const isChampion = (stakeholders.champions || []).some(c => c.name === dm.name);
            return (
              <div key={idx} className="flex items-center gap-2 px-3 py-2 bg-[#0a0e1a] border border-[#252d44] rounded-lg">
                <button
                  onClick={() => toggleChampion(idx)}
                  className={`text-lg transition-all ${
                    isChampion ? 'text-[#d4af37]' : 'text-[#a8b0c8]/30 hover:text-[#d4af37]/50'
                  }`}
                  title={isChampion ? 'Champion' : 'Mark as champion'}
                >
                  ⭐
                </button>
                <div className="flex-1">
                  <span className="text-sm text-[#e8eaf0]">{dm.name}</span>
                  <span className="text-xs text-[#a8b0c8] ml-2">- {dm.role}</span>
                </div>
                <button
                  onClick={() => removeDecisionMaker(idx)}
                  className="text-[#f87171] hover:text-[#f87171]/80 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Economic Buyer */}
      <div className="space-y-2">
        <label className="block text-xs font-medium text-[#a8b0c8]">
          Economic Buyer
        </label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            value={stakeholders.economicBuyer?.name || ''}
            onChange={(e) => handleFieldChange('economicBuyer', {
              ...stakeholders.economicBuyer,
              name: e.target.value
            })}
            placeholder="Name"
            className="px-3 py-2 bg-[#0a0e1a] border border-[#252d44] rounded-lg text-[#e8eaf0] text-sm placeholder-[#a8b0c8]/50 focus:outline-none focus:border-[#d4af37] transition-colors"
          />
          <input
            type="text"
            value={stakeholders.economicBuyer?.role || ''}
            onChange={(e) => handleFieldChange('economicBuyer', {
              ...stakeholders.economicBuyer,
              role: e.target.value
            })}
            placeholder="Role"
            className="px-3 py-2 bg-[#0a0e1a] border border-[#252d44] rounded-lg text-[#e8eaf0] text-sm placeholder-[#a8b0c8]/50 focus:outline-none focus:border-[#d4af37] transition-colors"
          />
        </div>
      </div>
    </div>
  );
};

export default StakeholdersCard;
```

**Step 2: Add to panel**

Modify `src/components/UseCaseDocumentationPanel.jsx`:

```javascript
import StakeholdersCard from './useCasePanel/StakeholdersCard';

// In the content div, after CustomerContextCard:
<StakeholdersCard useCaseId={selectedUseCaseId} />
```

**Step 3: Test stakeholders card**

Run: `npm run dev`, open use case panel, add decision makers, mark champions
Expected: Can add/remove DMs, toggle champion stars, all saves to session

**Step 4: Commit**

```bash
git add src/components/useCasePanel/StakeholdersCard.jsx src/components/UseCaseDocumentationPanel.jsx
git commit -m "feat: add stakeholders card to use case panel

- Primary contact, decision makers, economic buyer fields
- Add/remove decision makers dynamically
- Toggle champion status with star icon
- Visual champion indicator

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

**Note:** This implementation plan would continue with Tasks 7-30+ covering:
- Timeline Card (Task 7)
- Business Requirements Card (Task 8)
- Technical Requirements Card with all subsections (Tasks 9-13)
- Quick Action Toolbar (Task 14-15)
- Enhanced Free-Form Notes (Tasks 16-18)
- Smart Templates System (Task 19-20)
- Use Case Reference Accordions (Task 21)
- Related Content Suggestions (Task 22)
- Export Enhancements (Tasks 23-26)
- Visual Polish & Animations (Tasks 27-28)
- Testing & Bug Fixes (Tasks 29-30)

Each task follows the same pattern: small, focused changes with clear steps and immediate commits.

---

## Execution Notes

- **Estimated total tasks:** 30-35
- **Estimated time:** 6-10 hours of focused development
- **Test frequently:** After each task, verify in browser
- **Commit frequently:** Every task = one commit
- **Reference design:** docs/plans/2026-02-04-use-case-documentation-system-design.md

