import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

const TimelineCard = ({ useCaseId, collapsed = false }) => {
  const { getUseCaseDocumentation, updateUseCaseDocumentation } = useApp();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const doc = getUseCaseDocumentation(useCaseId);
  const timeline = doc?.structured?.timeline || {};

  const handleFieldChange = (field, value) => {
    const updated = {
      ...doc,
      structured: {
        ...doc?.structured,
        timeline: {
          ...timeline,
          [field]: value
        }
      }
    };
    updateUseCaseDocumentation(useCaseId, updated);
  };

  const timelineColors = {
    'no-timeline': 'bg-muted text-fg-2 border-line-strong',
    'within-1-month': 'bg-danger-soft text-danger border-danger/40',
    '1-3-months': 'bg-warning-soft text-warning border-warning/60',
    '3-6-months': 'bg-warning-soft text-warning border-warning/40',
    '6-12-months': 'bg-muted text-fg-2 border-line-strong',
    '12-plus-months': 'bg-muted text-fg-2 border-line-strong'
  };

  const timelineLabels = {
    'no-timeline': 'No Timeline Set',
    'within-1-month': 'Within 1 Month',
    '1-3-months': '1-3 Months',
    '3-6-months': '3-6 Months',
    '6-12-months': '6-12 Months',
    '12-plus-months': '12+ Months'
  };

  const isCardCollapsed = collapsed || isCollapsed;

  return (
    <div className="panel p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-fg flex items-center gap-2">
          Timeline & Project Scope
        </h3>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="icon-btn -mr-1.5"
          aria-label={isCardCollapsed ? "Expand card" : "Collapse card"}
        >
          <svg className={`w-5 h-5 transition-transform duration-300 ${isCardCollapsed ? 'rotate-0' : 'rotate-90'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className={`space-y-4 transition-all duration-300 ${isCardCollapsed ? 'hidden' : 'block'}`}>
        {/* Decision Timeline */}
        <div>
          <label htmlFor="decisionTimeline" className="label">
            Decision Timeline
          </label>
          <select
            id="decisionTimeline"
            value={timeline.decisionTimeline || ''}
            onChange={(e) => handleFieldChange('decisionTimeline', e.target.value)}
            className="field"
          >
            <option value="">Select timeline...</option>
            <option value="no-timeline">No timeline set</option>
            <option value="within-1-month">Within 1 month</option>
            <option value="1-3-months">1-3 months</option>
            <option value="3-6-months">3-6 months</option>
            <option value="6-12-months">6-12 months</option>
            <option value="12-plus-months">12+ months</option>
          </select>
          {timeline.decisionTimeline && (
            <div className="mt-2">
              <span className={`inline-block px-3 py-1 rounded-lg text-xs font-medium border ${timelineColors[timeline.decisionTimeline]}`}>
                {timelineLabels[timeline.decisionTimeline]}
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Budget Status */}
          <div>
            <label htmlFor="budgetStatus" className="label">
              Budget Status
            </label>
            <select
              id="budgetStatus"
              value={timeline.budgetStatus || ''}
              onChange={(e) => handleFieldChange('budgetStatus', e.target.value)}
              className="field"
            >
              <option value="">Select status...</option>
              <option value="not-discussed">Not discussed</option>
              <option value="budget-approved">Budget approved</option>
              <option value="budget-pending">Budget pending</option>
              <option value="no-budget">No budget allocated</option>
            </select>
          </div>

          {/* Current Phase */}
          <div>
            <label htmlFor="currentPhase" className="label">
              Current Phase
            </label>
            <select
              id="currentPhase"
              value={timeline.currentPhase || ''}
              onChange={(e) => handleFieldChange('currentPhase', e.target.value)}
              className="field"
            >
              <option value="">Select phase...</option>
              <option value="initial-discovery">Initial discovery</option>
              <option value="requirements-gathering">Requirements gathering</option>
              <option value="vendor-evaluation">Vendor evaluation</option>
              <option value="proof-of-concept">Proof of concept</option>
              <option value="final-decision">Final decision</option>
              <option value="implementation-planning">Implementation planning</option>
            </select>
          </div>
        </div>

        {/* Expected Start Date */}
        <div>
          <label htmlFor="expectedStartDate" className="label">
            Expected Start Date
          </label>
          <input
            id="expectedStartDate"
            type="date"
            value={timeline.expectedStartDate || ''}
            onChange={(e) => handleFieldChange('expectedStartDate', e.target.value)}
            className="field"
          />
        </div>

        {/* Key Milestones */}
        <div>
          <label htmlFor="keyMilestones" className="label">
            Key Milestones
          </label>
          <textarea
            id="keyMilestones"
            value={timeline.keyMilestones || ''}
            onChange={(e) => handleFieldChange('keyMilestones', e.target.value)}
            placeholder="List key dates and milestones..."
            rows={4}
            className="field resize-y"
          />
        </div>
      </div>
    </div>
  );
};

export default TimelineCard;
