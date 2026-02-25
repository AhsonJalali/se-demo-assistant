import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';

const CustomerContextCard = ({ useCaseId, collapsed = false }) => {
  const {
    getUseCaseDocumentation,
    updateUseCaseDocumentation,
    categories,
    selectedCompetitors,
    selectedIndustries,
    selectedCategories
  } = useApp();
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

  // Auto-populate Current Tools with selected competitors
  useEffect(() => {
    if (selectedCompetitors.length > 0) {
      const competitorNames = selectedCompetitors.map(compId => {
        const competitor = categories.competitors.find(c => c.id === compId);
        return competitor?.name;
      }).filter(Boolean);

      const currentTools = context.currentTools || [];
      const newTools = [...new Set([...currentTools, ...competitorNames])];

      if (newTools.length > currentTools.length) {
        handleFieldChange('currentTools', newTools);
      }
    }
  }, [useCaseId, selectedCompetitors]);

  // Auto-populate Industry from global filter
  useEffect(() => {
    if (selectedIndustries.length > 0) {
      const industryNames = selectedIndustries
        .filter(id => id !== 'all')
        .map(indId => {
          const industry = categories.industries.find(i => i.id === indId);
          return industry?.name;
        })
        .filter(Boolean);

      const currentIndustries = context.industry || [];
      const newIndustries = [...new Set([...currentIndustries, ...industryNames])];

      if (newIndustries.length > currentIndustries.length) {
        handleFieldChange('industry', newIndustries);
      }
    }
  }, [useCaseId, selectedIndustries]);

  // Auto-populate Category from global filter (Discovery categories only)
  useEffect(() => {
    if (selectedCategories.length > 0) {
      const categoryNames = selectedCategories.map(catId => {
        const category = categories.discoveryCategories?.find(c => c.id === catId);
        return category?.name;
      }).filter(Boolean);

      const currentCategories = context.category || [];
      const newCategories = [...new Set([...currentCategories, ...categoryNames])];

      if (newCategories.length > currentCategories.length) {
        handleFieldChange('category', newCategories);
      }
    }
  }, [useCaseId, selectedCategories]);

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
        <h3 className="text-sm font-bold text-[#00D2FF] uppercase tracking-wider flex items-center gap-2">
          <span>🏢</span>
          Customer Context
        </h3>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-[#a8b0c8] hover:text-[#00D2FF] transition-colors"
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
          <input
            type="text"
            value={context.industry?.join(', ') || ''}
            onChange={(e) => {
              const industries = e.target.value.split(',').map(t => t.trim()).filter(Boolean);
              handleFieldChange('industry', industries);
            }}
            placeholder="Auto-filled from global filter"
            className="w-full px-3 py-2 bg-[#08062B] border border-[#1B1B61] rounded-lg text-[#e8eaf0] text-sm placeholder-[#a8b0c8]/50 focus:outline-none focus:border-[#00D2FF] transition-colors"
          />
        </div>

        {/* Company Size */}
        <div>
          <label className="block text-xs font-medium text-[#a8b0c8] mb-2">
            Company Size
          </label>
          <select
            value={context.companySize || ''}
            onChange={(e) => handleFieldChange('companySize', e.target.value)}
            className="w-full px-3 py-2 bg-[#08062B] border border-[#1B1B61] rounded-lg text-[#e8eaf0] text-sm focus:outline-none focus:border-[#00D2FF] transition-colors"
          >
            <option value="">Select size...</option>
            <option value="smb">SMB (&lt; 500 employees)</option>
            <option value="mid-market">Mid-Market (500-1000)</option>
            <option value="enterprise">Enterprise (1000+)</option>
          </select>
        </div>

        {/* Category */}
        <div className="col-span-2">
          <label className="block text-xs font-medium text-[#a8b0c8] mb-2">
            Category
          </label>
          <input
            type="text"
            value={context.category?.join(', ') || ''}
            onChange={(e) => {
              const categories = e.target.value.split(',').map(t => t.trim()).filter(Boolean);
              handleFieldChange('category', categories);
            }}
            placeholder="Auto-filled from global filter"
            className="w-full px-3 py-2 bg-[#08062B] border border-[#1B1B61] rounded-lg text-[#e8eaf0] text-sm placeholder-[#a8b0c8]/50 focus:outline-none focus:border-[#00D2FF] transition-colors"
          />
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
            placeholder="Auto-filled from competitor filter, or add manually"
            className="w-full px-3 py-2 bg-[#08062B] border border-[#1B1B61] rounded-lg text-[#e8eaf0] text-sm placeholder-[#a8b0c8]/50 focus:outline-none focus:border-[#00D2FF] transition-colors"
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
                    : 'bg-[#08062B]/50 text-[#a8b0c8]/50 border-[#1B1B61] hover:border-[#00D2FF]/30'
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
