import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';

const CustomerContextCard = ({ useCaseId, collapsed = false }) => {
  const {
    getUseCaseDocumentation,
    updateUseCaseDocumentation,
    categories,
    currentSession
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

  // Prefill industry from the session so the SE doesn't type it twice.
  useEffect(() => {
    const sessionIndustry = currentSession?.metadata?.industries?.[0];
    if (!sessionIndustry || context.industry?.length) return;
    const name = categories.industries.find(i => i.id === sessionIndustry)?.name;
    if (name) handleFieldChange('industry', [name]);
  }, [useCaseId, currentSession?.metadata?.industries?.[0]]); // eslint-disable-line react-hooks/exhaustive-deps

  const urgencyColors = {
    low: 'bg-muted text-fg-2 border-line-strong',
    medium: 'bg-warning-soft text-warning border-warning/40',
    high: 'bg-warning-soft text-warning border-warning/60',
    critical: 'bg-danger-soft text-danger border-danger/40'
  };

  const isCardCollapsed = collapsed || isCollapsed;

  return (
    <div className="panel p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-fg flex items-center gap-2">
          Customer Context
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

      <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 transition-all duration-300 ${isCardCollapsed ? 'hidden' : 'block'}`}>
        {/* Industry */}
        <div>
          <label className="label">
            Industry
          </label>
          <input
            type="text"
            value={context.industry?.join(', ') || ''}
            onChange={(e) => {
              const industries = e.target.value.split(',').map(t => t.trim()).filter(Boolean);
              handleFieldChange('industry', industries);
            }}
            placeholder="e.g. Retail"
            className="field"
          />
        </div>

        {/* Company Size */}
        <div>
          <label className="label">
            Company Size
          </label>
          <select
            value={context.companySize || ''}
            onChange={(e) => handleFieldChange('companySize', e.target.value)}
            className="field"
          >
            <option value="">Select size...</option>
            <option value="smb">SMB (&lt; 500 employees)</option>
            <option value="mid-market">Mid-Market (500-1000)</option>
            <option value="enterprise">Enterprise (1000+)</option>
          </select>
        </div>

        {/* Category */}
        <div className="col-span-2">
          <label className="label">
            Category
          </label>
          <input
            type="text"
            value={context.category?.join(', ') || ''}
            onChange={(e) => {
              const categories = e.target.value.split(',').map(t => t.trim()).filter(Boolean);
              handleFieldChange('category', categories);
            }}
            placeholder="e.g. Modernization, Efficiency"
            className="field"
          />
        </div>

        {/* Current Tools */}
        <div className="col-span-2">
          <label className="label">
            Current Tools
          </label>
          <input
            type="text"
            value={context.currentTools?.join(', ') || ''}
            onChange={(e) => {
              const tools = e.target.value.split(',').map(t => t.trim()).filter(Boolean);
              handleFieldChange('currentTools', tools);
            }}
            placeholder="Comma-separated, e.g. Spreadsheets, Legacy CRM"
            className="field"
          />
        </div>

        {/* Urgency Level */}
        <div className="col-span-2">
          <label className="label">
            Urgency Level
          </label>
          <div className="flex gap-2">
            {['low', 'medium', 'high', 'critical'].map(level => (
              <button
                key={level}
                onClick={() => handleFieldChange('urgencyLevel', level)}
                className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold capitalize border transition-colors ${
                  context.urgencyLevel === level
                    ? urgencyColors[level]
                    : 'bg-surface text-fg-3 border-line hover:border-line-strong hover:text-fg-2'
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
