import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

const CustomerContextCard = ({ useCaseId, collapsed = false }) => {
  const { getUseCaseDocumentation, updateUseCaseDocumentation, categories } = useApp();
  const [isCollapsed, setIsCollapsed] = useState(false);

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

  const isCardCollapsed = collapsed || isCollapsed;

  return (
    <div className="glass-panel-strong rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-[#d4af37] uppercase tracking-wider flex items-center gap-2">
          <span>🏢</span>
          Customer Context
        </h3>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-[#a8b0c8] hover:text-[#d4af37] transition-colors"
          aria-label={isCardCollapsed ? "Expand card" : "Collapse card"}
        >
          <svg className={`w-5 h-5 transition-transform duration-300 ${isCardCollapsed ? 'rotate-0' : 'rotate-90'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className={`grid grid-cols-2 gap-4 transition-all duration-300 ${isCardCollapsed ? 'hidden' : 'block'}`}>
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
            <option value="smb">SMB (&lt; 500 employees)</option>
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
