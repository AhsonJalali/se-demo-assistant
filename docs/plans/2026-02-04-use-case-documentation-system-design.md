# Use Case Documentation & Discovery System Design

**Date:** 2026-02-04
**Status:** Design Complete - Ready for Implementation
**Author:** SE Team + Claude

---

## Overview

Transform the Use Cases tab from a static reference library into an active documentation and discovery tool used during customer calls. The system captures comprehensive information about customer use cases to support POC planning and deal progression.

## Purpose & Goals

### Primary Use Case
Solution Engineers use this during customer discovery calls to:
1. Identify which use case(s) apply to the customer
2. Ask qualification questions and capture detailed responses
3. Document customer-specific requirements across business and technical dimensions
4. Capture opportunities, risks, and action items in real-time
5. Export documented information for POC creation and planning

### Success Criteria
- SEs can capture complete use case information during 45-60 minute calls
- All critical dimensions captured: pain points, technical requirements, success criteria, stakeholders
- Information exports cleanly for POC planning documents
- Fast enough to use during live conversations without losing call flow

---

## Architecture

### Layout: Side Panel (60% Width, Resizable)

**Why Side Panel:**
- Keeps use case library visible on left (40%) for quick reference and switching
- Familiar pattern (matches existing Notes panel)
- Easy to switch between use cases during conversation
- Doesn't lose context of other available use cases

**Panel Behavior:**
- Opens from right with smooth slide-in (400ms)
- Resizable: 40% min → 60% default → 80% max
- Drag handle for manual resize with snap points
- Sticky header with use case name and controls
- Single scrollable column with prioritized sections

### Information Hierarchy (Top to Bottom)

1. **Header Bar** (sticky)
   - Use case name + category badge
   - Industry fit indicators (colored dots)
   - Panel controls (resize, close)

2. **Structured Quick Capture Fields** (compact, always visible)
   - Customer context, stakeholders, timeline
   - Business requirements (emphasis)
   - Technical requirements (extra emphasis)

3. **Quick Action Toolbar** (sticky when scrolling)
   - 6 quick capture buttons with keyboard shortcuts

4. **Enhanced Free-Form Notes** (main area, 60% height)
   - Rich text with markdown support
   - Smart template insertion
   - Inline quick capture items

5. **Use Case Reference** (expandable accordions)
   - Key benefits, typical challenges, demo scenarios, ideal for
   - Collapsed by default

6. **Related Content** (smart suggestions)
   - Discovery questions, differentiators, objections
   - Clickable pills to add to session

---

## Structured Quick Capture Fields

### Design Principles
- **Compact but complete** - Essential fields only, well-organized
- **Visual hierarchy** - Icons, cards, logical flow
- **Quick input** - Dropdowns, tags, multi-select where appropriate
- **Focus on business + technical** - Extra detail in these areas

### Customer Context Card

**2-column grid with icons:**
- 🏢 **Industry** - Multi-select dropdown from categories
- 🏭 **Company Size** - Dropdown: SMB, Mid-Market, Enterprise
- 🔧 **Current Tools** - Tags input (free-form, can add multiple)
- ⏱️ **Urgency Level** - Pills: Low/Medium/High/Critical (color-coded)

### Stakeholders Card

**Flexible tags/chips:**
- 👤 **Primary Contact** - Name + role input
- 🎯 **Decision Makers** - Add multiple with name + role
- ⭐ **Champions** - Tagged separately with visual star indicator
- 📊 **Economic Buyer** - Specific field (name + role)

### Timeline Card

**Date pickers + visual indicator:**
- 📅 **Discovery Date** - Auto-filled to today
- 🎯 **Target POC Date** - Date picker
- 🚀 **Expected Close Date** - Optional
- Visual timeline bar showing days until POC/close

### Business Requirements Card (Emphasis Area)

**Larger card with structured inputs:**
- 🎯 **Primary Business Goals** - Textarea with bullet support
- 📈 **Success Metrics** - Structured rows:
  - Metric name + Current value + Target value
  - Can add multiple metrics
  - Example: "Report creation time | 2 weeks | 2 hours"
- 💰 **Expected ROI/Value** - Free text
- 🏆 **Strategic Initiatives** - Tags: Digital Transformation, Cost Reduction, Revenue Growth, etc.

### Technical Requirements Card (Extra Emphasis)

**Largest structured card with blue-gray accent border:**

#### Data Landscape (expandable section)
- 📊 **Data Sources** - Multi-add with:
  - Source name (text)
  - Type dropdown: Cloud DW, Database, SaaS, Files
  - Volume indicator: Small/Medium/Large
- ☁️ **Cloud Platform** - Chips: Snowflake, Databricks, BigQuery, Redshift, Azure Synapse, Other
- 🔄 **Data Refresh Needs** - Dropdown: Real-time, Hourly, Daily, Weekly
- ✨ **Data Quality** - Pills: Clean / Some Issues / Significant Cleanup Needed (colored)

#### Scale & Access (grid layout)
- 👥 **Total User Count** - Number input with range helper: <50, 50-200, 200-1000, 1000+
- 🎭 **User Personas** - Tags: Analysts, Business Users, Executives, Data Scientists, etc.
- 📱 **Access Patterns** - Checkboxes: Web, Mobile, Embedded, API
- 🌍 **Geographic Distribution** - Dropdown: Single region, Multi-region, Global

#### Integration Requirements (semi-structured list)
- 🔌 **Required Integrations** - Add multiple with:
  - System name
  - Integration type: SSO, Data, Embedded, API
  - Priority: Must-have / Nice-to-have
- Quick add buttons for common integrations: Salesforce, SAP, Oracle, ServiceNow

#### Security & Compliance (checklist + notes)
- 🔒 **Security Requirements** - Checkboxes:
  - SSO/SAML, MFA, Row-level security, Column-level security, Private embedding
- 📋 **Compliance Needs** - Checkboxes:
  - SOC2, HIPAA, GDPR, FedRAMP, None/Unknown
- 🛡️ **Additional Security Notes** - Textarea for special requirements

#### Technical Complexity Indicators
Auto-calculated badges based on inputs:
- "High Data Complexity"
- "Multi-Cloud"
- "Heavy Integration Needs"
- "Compliance-Sensitive"

---

## Quick Action Toolbar & Quick Capture System

### Toolbar Design

**Sticky horizontal bar below header:**

Button layout (left to right by priority):
1. 🎯 **Opportunity** - Gold accent (primary position)
2. ⚙️ **Technical Flag** - Blue accent (secondary position)
3. ⚠️ **Risk** - Red accent
4. ✓ **Action** - Green accent
5. ❓ **Question** - Purple accent
6. 💡 **Assumption** - Orange accent

Each button: Glass-panel styling, hover effects, luxury dark theme

### Quick Capture Behavior

**Clicking a button:**
- Inserts tagged block into notes at cursor (or end if no focus)
- Auto-focuses text input for immediate typing
- Timestamp added automatically

**Block Structure:**
```
[🎯 OPPORTUNITY] <timestamp>
[Editable text area with placeholder prompt]
```

**Placeholder Prompts:**
- **Opportunity:** "Describe the upsell/expansion opportunity..."
- **Technical Flag:** "What's the technical concern or requirement..."
- **Risk:** "What could block or delay this..."
- **Action:** "What needs to be done, by whom, by when..."
- **Question:** "What do we need to ask or research..."
- **Assumption:** "What are we assuming that needs validation..."

**Visual Treatment:**
- Colored left border matching icon type
- Timestamp badge in corner
- Collapsible/expandable
- Searchable and filterable later

**Keyboard Shortcuts:**
- `Cmd/Ctrl + 1-6` - Insert each quick capture type
- `Tab` - Move between blocks
- `Esc` - Close/finish a block

---

## Enhanced Free-Form Notes

### Main Notes Area

**Design:**
- Largest section (~60% of panel vertical space)
- Rich textarea with markdown support
- Clean white text on dark background
- Subtle formatting hints (grid/line guides)
- Soft glow focus state
- Auto-save indicator in corner
- Optional line numbers (toggle)

### Smart Templates System

**Trigger:** "+ Add Section" button or `Cmd/Ctrl + T`

**Available Templates:**

#### 1. Customer Pain Points
```markdown
## 🔥 Customer Pain Points
- **Current challenge:**
- **Business impact:**
- **Frequency/severity:**
```

#### 2. Current State (As-Is)
```markdown
## 📊 Current State
**Tools:**
**Process:**
**Pain points:**
**Cost/time:**
```

#### 3. Desired Future State (To-Be)
```markdown
## 🎯 Desired Future State
**Vision:**
**Expected outcomes:**
**Success looks like:**
**Timeline:**
```

#### 4. Technical Landscape
```markdown
## ⚙️ Technical Landscape
**Data architecture:**
**Integration points:**
**Technical debt:**
**Constraints:**
```

#### 5. Success Criteria
```markdown
## 🏆 Success Criteria
**Must-haves:**
-
**Nice-to-haves:**
-
**Deal breakers:**
-
```

#### 6. Key Stakeholders & Roles
```markdown
## 👥 Stakeholders
| Name | Role | Interest | Influence |
|------|------|----------|-----------|
|      |      |          |           |
```

**Template Behavior:**
- Inserts at cursor position
- Pre-filled with prompts but fully editable
- Can reorder by dragging section headers
- Sections collapsible for easier navigation
- Markdown fully supported (tables, lists, formatting)

---

## Use Case Reference (Expandable Accordions)

### Purpose
Quick access to original use case data without scrolling back to card. Reference material stays accessible while documenting.

### Accordion Sections

Each section: Icon + Title + Count + Gold accent bar when expanded

#### 1. ✅ Key Benefits
- Shows keyBenefits array from use case data
- Bulleted list with gold dots
- Copy button to paste into notes

#### 2. ⚠️ Typical Challenges
- Shows typicalChallenges array
- Red dot bullets
- Helps SE identify if customer mentioned these

#### 3. 🎬 Demo Scenarios
- Shows demoScenarios array
- Numbered list
- "Add to session plan" quick action

#### 4. 🎯 Ideal For
- Shows idealFor array
- Check if customer matches profiles
- Green checkmark bullets

**Visual Design:**
- Subtle divider lines between sections
- Smooth height animation (300ms) on expand/collapse
- All sections can be expanded simultaneously
- "Expand All / Collapse All" toggle at top
- Collapsed by default to save space

---

## Related Content (Smart Suggestions)

### Purpose
Suggest relevant content from other tabs that connect to this use case. Helps build complete picture.

### Layout

Horizontal pill/chip sections with scrollable content:

#### 📋 Recommended Discovery Questions (3-5 suggestions)
- Shows Discovery questions tagged with this use case
- Click to add to session or jump to Discovery tab
- Shows checkmark if already selected

#### ⚡ Relevant Differentiators (3-5 suggestions)
- Shows competitive differentiators that support this use case
- Preview on hover
- Click to add to session

#### 🛡️ Common Objections (2-3 suggestions)
- Shows objections frequently raised for this use case
- Quick preview of response
- Click to add to session

**Visual Design:**
- Compact pills with icons and truncated text
- Hover shows preview tooltip
- Gold accent on items already in session
- "View All" link to see full list in respective tab

---

## Visual Design System

### Color Palette (Extends Existing Luxury Theme)

**Panel Colors:**
- Panel background: `#121729` (slightly lighter than main) with subtle gradient
- Section cards: Glass-panel effect with backdrop-blur and semi-transparent borders
- Dividers: `#252d44`

**Accent Colors:**
- Gold `#d4af37` - Primary actions, opportunities, selected states
- Blue-gray `#4a5f8f` - Technical content borders
- Success green `#4ade80` - Actions, completions
- Warning red `#f87171` - Risks, flags
- Purple `#a78bfa` - Questions
- Orange `#fb923c` - Assumptions

### Typography Hierarchy

- **Panel Title:** Crimson Pro, 24px, bold
- **Section Headers:** DM Sans, 14px, bold, uppercase, gold, letter-spacing
- **Field Labels:** DM Sans, 12px, medium, muted
- **Body Text:** DM Sans, 14px, regular, primary
- **Timestamps/Meta:** 11px, tertiary

### Spacing & Layout

- **Panel Padding:** 24px all sides
- **Section Spacing:** 20px between major sections
- **Field Spacing:** 12px between fields
- **Card Padding:** 16px internal
- **Tight Mode:** Option to reduce spacing by 25%

### Animations & Micro-interactions

#### Panel Open/Close
- 400ms slide-in from right with cubic-bezier easing
- Backdrop blur fade-in simultaneously
- Resize handle pulses subtly on first open

#### Section Interactions
- Accordion expand: 300ms height animation
- Cards hover: Subtle scale (1.01) + gold border glow
- Template insert: Fade-in + slight slide down (200ms)

#### Quick Capture
- Button click: Scale down then up (100ms bounce)
- Block insert: Slide-down animation (250ms)
- Auto-focus with typing indicator

#### Field Interactions
- Input focus: Gold ring (2px) with shadow glow
- Dropdown open: Slide-down with shadow (200ms)
- Tag/chip add: Pop-in animation (150ms)
- Success states: Subtle green checkmark fade-in

### Responsive Behavior

- **Min width:** 600px (maintains usability)
- **Max width:** 1200px (prevents being too wide)
- **Default:** 60% of viewport
- **Drag resize:** Smooth with snap points at 40%, 50%, 60%, 80%

---

## Session Integration & Data Structure

### Session Data Model Extension

```javascript
session: {
  id: "session-uuid",
  name: "Acme Corp - Analytics Modernization",
  // ... existing session fields ...

  selectedItems: {
    discovery: [],
    usecases: ["uc-1"], // Selected use case IDs
    differentiators: [],
    objections: []
  },

  // NEW: Use case documentation data
  useCaseDocumentation: {
    "uc-1": {  // Keyed by use case ID

      // Structured fields
      structured: {
        customerContext: {
          industry: ["retail", "finance"],
          companySize: "enterprise",
          currentTools: ["Tableau", "Excel"],
          urgencyLevel: "high"
        },
        stakeholders: {
          primaryContact: { name: "John Doe", role: "VP Analytics" },
          decisionMakers: [
            { name: "Jane Smith", role: "CTO" },
            { name: "Bob Johnson", role: "CFO" }
          ],
          champions: [{ name: "John Doe", role: "VP Analytics" }],
          economicBuyer: { name: "Bob Johnson", role: "CFO" }
        },
        timeline: {
          discoveryDate: "2024-01-15",
          targetPOCDate: "2024-02-28",
          expectedCloseDate: "2024-04-30"
        },
        businessRequirements: {
          primaryGoals: "Reduce report creation time...",
          successMetrics: [
            {
              name: "Report creation time",
              current: "2 weeks",
              target: "2 hours"
            }
          ],
          expectedROI: "$2M annual savings",
          strategicInitiatives: ["digital-transformation", "cost-reduction"]
        },
        technicalRequirements: {
          dataLandscape: {
            dataSources: [
              {
                name: "Snowflake DW",
                type: "cloud-dw",
                volume: "large"
              }
            ],
            cloudPlatform: ["snowflake"],
            dataRefreshNeeds: "real-time",
            dataQuality: "some-issues"
          },
          scaleAccess: {
            totalUsers: 500,
            userPersonas: ["analysts", "business-users"],
            accessPatterns: ["web", "mobile"],
            geographic: "multi-region"
          },
          integrations: [
            {
              system: "Salesforce",
              type: "data",
              priority: "must-have"
            }
          ],
          securityCompliance: {
            securityReqs: ["sso", "mfa", "row-level-security"],
            complianceNeeds: ["soc2", "gdpr"],
            additionalNotes: "Requires on-prem option for EMEA"
          }
        }
      },

      // Free-form notes with quick capture items
      notes: {
        content: `## Customer Pain Points\n...`, // Full markdown
        quickCaptureItems: [
          {
            id: "qc-1",
            type: "opportunity",
            timestamp: "2024-01-15T10:30:00Z",
            content: "Potential expansion to APAC region..."
          }
        ],
        lastModified: "2024-01-15T10:30:00Z"
      }
    }
  }
}
```

### Auto-Save Behavior

- **Structured fields:** Save immediately on blur (field loses focus)
- **Notes content:** 500ms debounce while typing
- **Quick capture items:** Save immediately on creation
- **Visual indicator:** "Saved" with checkmark or "Saving..." with spinner

### Session List View Enhancement

In session dropdown/modal:
- Badge showing "3 Use Cases Documented"
- Quick preview of use case names
- Indication of completion level (e.g., "75% complete")

---

## Export & POC Preparation

### Enhanced Export Options

#### 1. PDF Export (Enhanced)
**New section: "Use Case Documentation"**

For each documented use case:
- Use case overview (from reference data)
- Customer-specific structured fields in formatted tables
- Free-form notes with proper markdown rendering
- Quick capture items grouped by type with icons
- Visual separation between use cases

**Formatting:**
- Tables for structured data (clean, readable)
- Color-coded quick capture items (opportunities gold, risks red, etc.)
- Section headers with use case category badges

#### 2. Word Export (Enhanced)
Same structure as PDF but:
- Fully editable
- Native Word tables for structured data
- Easy to copy/paste into other documents
- Styles preserved for section headers
- Ideal for creating POC proposal documents

#### 3. NEW: Use Case Summary (Markdown)
Lightweight format for POC planning:
```markdown
# Use Case: Analytics Modernization - Acme Corp

## Business Context
**Industry:** Retail, Finance
**Company Size:** Enterprise (500 users)
**Urgency:** High
**Primary Contact:** John Doe, VP Analytics

## Business Requirements
**Goals:** Reduce report creation time from 2 weeks to 2 hours
**Success Metrics:**
- Report creation time: 2 weeks → 2 hours
- User adoption: 50% → 90%
**Expected ROI:** $2M annual savings

## Technical Requirements
**Data Sources:**
- Snowflake DW (Large volume, Real-time refresh)
**Cloud Platform:** Snowflake
**Integrations (Must-have):**
- Salesforce (Data integration)
**Security/Compliance:** SOC2, GDPR, SSO, MFA

## Opportunities & Flags
🎯 Potential expansion to APAC region (500+ additional users)
⚙️ Complex data quality issues may extend POC timeline

## Notes
[Free-form content]
```

**Use case:** Perfect for pasting into Confluence, Notion, GitHub, Jira

#### 4. NEW: POC Planning Checklist
Auto-generated from documented requirements:
```markdown
# POC Checklist - Acme Corp

## Data & Integration Setup
- [ ] Connect to Snowflake DW
- [ ] Set up Salesforce data integration
- [ ] Configure real-time data refresh

## Security & Compliance
- [ ] Configure SSO/SAML
- [ ] Implement row-level security
- [ ] SOC2 compliance review
- [ ] GDPR compliance review

## User Setup
- [ ] Create 500 user accounts
- [ ] Set up analyst personas
- [ ] Set up business user personas

## Success Metrics Tracking
- [ ] Baseline: Report creation time (currently 2 weeks)
- [ ] Target: Reduce to 2 hours
- [ ] Track user adoption rates

## Action Items
[From quick capture action items]

## Questions to Resolve
[From quick capture question items]

## Assumptions to Validate
[From quick capture assumption items]
```

### Export Controls

**In export modal, new options:**
- ☐ Include use case documentation (on by default if any exist)
- ☐ Include only documented use cases vs all selected
- ☐ Include quick capture items
- ☐ Generate POC checklist
- **Format selection:** PDF / Word / Markdown / Checklist

### Copy to Clipboard (Quick Actions)

In the use case panel, quick copy buttons:
- **"📋 Copy Technical Summary"** - Just technical requirements formatted
- **"📋 Copy Business Summary"** - Just business context and requirements
- **"📋 Copy All"** - Full use case documentation in markdown

**Benefit:** Fast sharing via Slack, email, or pasting into other tools

---

## Implementation Phases

### Phase 1: Core Infrastructure (Foundation)
- Create UseCaseDocumentationPanel component
- Implement panel open/close/resize functionality
- Set up data structure in session system
- Basic auto-save functionality

### Phase 2: Structured Fields (Essential Capture)
- Build all structured field components
- Customer context, stakeholders, timeline
- Business requirements section
- Technical requirements section (detailed)
- Field validation and error handling

### Phase 3: Quick Capture System
- Build quick action toolbar
- Implement 6 quick capture item types
- Keyboard shortcuts
- Visual indicators and timestamps
- Integration with notes area

### Phase 4: Enhanced Free-Form Notes
- Rich textarea with markdown support
- Smart template system (6 templates)
- Template insertion and management
- Section reordering
- Inline quick capture items

### Phase 5: Reference & Related Content
- Use case reference accordions (4 sections)
- Related content suggestions
- Cross-linking to other tabs
- "Add to session" functionality

### Phase 6: Visual Polish & Interactions
- Complete animation system
- Micro-interactions
- Loading states and transitions
- Responsive behavior
- Keyboard navigation

### Phase 7: Export & Integration
- Enhanced PDF export
- Enhanced Word export
- New markdown export format
- POC planning checklist generator
- Copy to clipboard functionality
- Session list view enhancements

---

## Success Metrics

### Usage Metrics
- % of sessions with documented use cases
- Average fields completed per use case
- Average quick capture items per session
- Time spent in documentation panel

### Quality Metrics
- Completeness score (% of structured fields filled)
- Documentation depth (word count in notes)
- Export usage rates
- POC conversion rate for documented vs non-documented use cases

### Performance Metrics
- Panel load time < 200ms
- Auto-save latency < 500ms
- No lag during typing in notes
- Smooth 60fps animations

---

## Technical Considerations

### Performance
- Lazy load panel content (don't render until opened)
- Virtualize long lists (if many quick capture items)
- Debounced auto-save to prevent excessive writes
- Optimize re-renders with React.memo where appropriate

### Accessibility
- Full keyboard navigation support
- ARIA labels for all interactive elements
- Focus management when opening/closing panel
- Screen reader support for quick capture items

### Data Validation
- Required field indicators
- Email/date format validation
- Warning if closing panel with unsaved changes
- Graceful handling of malformed data

### Browser Compatibility
- Same as main app (Chrome/Edge, Firefox, Safari latest)
- Graceful degradation for older browsers
- Backdrop-filter fallback for glass effects

---

## Future Enhancements (Post-V1)

### AI-Powered Features
- Auto-suggest use case based on conversation
- Extract technical requirements from notes
- Generate POC checklist automatically from documented reqs
- Identify missing information prompts

### Collaboration Features
- Share documented use case with team
- Comments/annotations on use cases
- Version history for documentation
- Team templates library

### Advanced Analytics
- Use case patterns across customers
- Common technical requirements analysis
- Success prediction based on documentation completeness
- Benchmark comparisons

### Integration Enhancements
- Direct integration with POC management tools
- Salesforce opportunity sync
- Slack notifications for action items
- Calendar integration for timeline dates

---

## Appendix: UI Mockup Descriptions

### Main View (Use Case Card in Library)
```
┌─────────────────────────────────────────┐
│ 📋 Analytics Modernization        [⭐] │
│ Category: Modernization | 🟢🟢🟡⚪      │
│                                         │
│ Transform legacy BI systems into        │
│ modern, cloud-based analytics...        │
│                                         │
│ [✓ Selected] [📝 Documented]           │
└─────────────────────────────────────────┘
```

### Documentation Panel (Collapsed Sections)
```
┌─────────────────────────────────────────────────┐
│ 📋 Analytics Modernization            [⬅] [✕]  │
│ Category: Modernization | 🟢🟢🟡⚪               │
├─────────────────────────────────────────────────┤
│                                                 │
│ ┌─ Customer Context ─────────────────────────┐ │
│ │ Industry: Retail, Finance    Urgency: High │ │
│ │ Company: Enterprise (500)    Tools: Tab... │ │
│ └───────────────────────────────────────────┘  │
│                                                 │
│ ┌─ Business Requirements ──────────────────┐   │
│ │ Goals: [filled text]                     │   │
│ │ Metrics: 2 defined | ROI: $2M annual     │   │
│ └─────────────────────────────────────────┘    │
│                                                 │
│ ┌─ Technical Requirements ─────────────────┐   │
│ │ Data: Snowflake (Large) | Users: 500    │   │
│ │ Integrations: 3 | Compliance: SOC2, GDPR │   │
│ └─────────────────────────────────────────┘    │
│                                                 │
│ [🎯 Opportunity] [⚙️ Technical] [⚠️ Risk] ...  │
│                                                 │
│ ┌─ Enhanced Notes ────────────────────────┐    │
│ │                                         │    │
│ │ ## Customer Pain Points                 │    │
│ │ - Current reporting takes 2 weeks...    │    │
│ │                                         │    │
│ │ [🎯 OPPORTUNITY] 10:30 AM               │    │
│ │ Expansion to APAC region...             │    │
│ │                                         │    │
│ │ [+ Add Section]                         │    │
│ │                                         │    │
│ └─────────────────────────────────────────┘    │
│                                                 │
│ ▼ Key Benefits (4)                             │
│ ▼ Typical Challenges (4)                       │
│ ▼ Demo Scenarios (3)                           │
│                                                 │
│ ━━ Related Content ━━━━━━━━━━━━━━━━━━━━━━━━    │
│ 📋 Discovery: [Q1] [Q2] [Q3] ...              │
│ ⚡ Differentiators: [D1] [D2] ...             │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## Design Sign-off

**Validated by:** SE Team
**Date:** 2026-02-04
**Next Steps:**
1. Review and approve design document
2. Create implementation plan with phased approach
3. Set up git worktree for isolated development
4. Begin Phase 1 implementation

---

**End of Design Document**
