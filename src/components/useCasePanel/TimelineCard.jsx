import React from 'react';
import { useApp } from '../../context/AppContext';

const TimelineCard = ({ useCaseId }) => {
  const { getUseCaseDocumentation, updateUseCaseDocumentation } = useApp();

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
    'no-timeline': 'bg-[#a8b0c8]/20 text-[#a8b0c8] border-[#a8b0c8]/40',
    'within-1-month': 'bg-red-500/20 text-red-400 border-red-500/40',
    '1-3-months': 'bg-orange-500/20 text-orange-400 border-orange-500/40',
    '3-6-months': 'bg-amber-500/20 text-amber-400 border-amber-500/40',
    '6-12-months': 'bg-[#a8b0c8]/20 text-[#a8b0c8] border-[#a8b0c8]/40',
    '12-plus-months': 'bg-[#a8b0c8]/20 text-[#a8b0c8] border-[#a8b0c8]/40'
  };

  return (
    <div className="glass-panel-strong rounded-xl p-4 space-y-4">
      <h3 className="text-sm font-bold text-[#d4af37] uppercase tracking-wider flex items-center gap-2">
        <span>📅</span>
        Timeline & Project Scope
      </h3>

      <div className="space-y-4">
        {/* Decision Timeline */}
        <div>
          <label className="block text-xs font-medium text-[#a8b0c8] mb-2">
            Decision Timeline
          </label>
          <select
            value={timeline.decisionTimeline || ''}
            onChange={(e) => handleFieldChange('decisionTimeline', e.target.value)}
            className="w-full px-3 py-2 bg-[#0a0e1a] border border-[#252d44] rounded-lg text-[#e8eaf0] text-sm focus:outline-none focus:border-[#d4af37] transition-colors"
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
              <span className={`inline-block px-3 py-1 rounded-lg text-xs font-semibold uppercase tracking-wide border ${timelineColors[timeline.decisionTimeline]}`}>
                {timeline.decisionTimeline === 'no-timeline' && 'No Timeline Set'}
                {timeline.decisionTimeline === 'within-1-month' && 'Within 1 Month'}
                {timeline.decisionTimeline === '1-3-months' && '1-3 Months'}
                {timeline.decisionTimeline === '3-6-months' && '3-6 Months'}
                {timeline.decisionTimeline === '6-12-months' && '6-12 Months'}
                {timeline.decisionTimeline === '12-plus-months' && '12+ Months'}
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Budget Status */}
          <div>
            <label className="block text-xs font-medium text-[#a8b0c8] mb-2">
              Budget Status
            </label>
            <select
              value={timeline.budgetStatus || ''}
              onChange={(e) => handleFieldChange('budgetStatus', e.target.value)}
              className="w-full px-3 py-2 bg-[#0a0e1a] border border-[#252d44] rounded-lg text-[#e8eaf0] text-sm focus:outline-none focus:border-[#d4af37] transition-colors"
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
            <label className="block text-xs font-medium text-[#a8b0c8] mb-2">
              Current Phase
            </label>
            <select
              value={timeline.currentPhase || ''}
              onChange={(e) => handleFieldChange('currentPhase', e.target.value)}
              className="w-full px-3 py-2 bg-[#0a0e1a] border border-[#252d44] rounded-lg text-[#e8eaf0] text-sm focus:outline-none focus:border-[#d4af37] transition-colors"
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
          <label className="block text-xs font-medium text-[#a8b0c8] mb-2">
            Expected Start Date
          </label>
          <input
            type="date"
            value={timeline.expectedStartDate || ''}
            onChange={(e) => handleFieldChange('expectedStartDate', e.target.value)}
            className="w-full px-3 py-2 bg-[#0a0e1a] border border-[#252d44] rounded-lg text-[#e8eaf0] text-sm focus:outline-none focus:border-[#d4af37] transition-colors"
          />
        </div>

        {/* Key Milestones */}
        <div>
          <label className="block text-xs font-medium text-[#a8b0c8] mb-2">
            Key Milestones
          </label>
          <textarea
            value={timeline.keyMilestones || ''}
            onChange={(e) => handleFieldChange('keyMilestones', e.target.value)}
            placeholder="List key dates and milestones..."
            rows={4}
            className="w-full px-3 py-2 bg-[#0a0e1a] border border-[#252d44] rounded-lg text-[#e8eaf0] text-sm placeholder-[#a8b0c8]/50 focus:outline-none focus:border-[#d4af37] transition-colors resize-none"
          />
        </div>
      </div>
    </div>
  );
};

export default TimelineCard;
