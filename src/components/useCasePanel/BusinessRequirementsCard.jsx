import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

const BusinessRequirementsCard = ({ useCaseId }) => {
  const { getUseCaseDocumentation, updateUseCaseDocumentation } = useApp();

  const doc = getUseCaseDocumentation(useCaseId);
  const businessRequirements = doc?.structured?.businessRequirements || {};

  const [newDataSource, setNewDataSource] = useState('');

  const handleFieldChange = (field, value) => {
    const updated = {
      ...doc,
      structured: {
        ...doc?.structured,
        businessRequirements: {
          ...businessRequirements,
          [field]: value
        }
      }
    };
    updateUseCaseDocumentation(useCaseId, updated);
  };

  const addDataSource = () => {
    if (!newDataSource.trim()) return;

    const dataSources = businessRequirements.dataSources || [];
    if (!dataSources.includes(newDataSource.trim())) {
      handleFieldChange('dataSources', [...dataSources, newDataSource.trim()]);
    }
    setNewDataSource('');
  };

  const removeDataSource = (source) => {
    const dataSources = businessRequirements.dataSources || [];
    handleFieldChange('dataSources', dataSources.filter(ds => ds !== source));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addDataSource();
    }
  };

  return (
    <div className="glass-panel-strong rounded-xl p-4 space-y-4">
      <h3 className="text-sm font-bold text-[#d4af37] uppercase tracking-wider flex items-center gap-2">
        <span>📋</span>
        Business Requirements
      </h3>

      <div className="space-y-4">
        {/* Primary Goal */}
        <div>
          <label htmlFor="primaryGoal" className="block text-xs font-medium text-[#a8b0c8] mb-2">
            Primary Goal
          </label>
          <textarea
            id="primaryGoal"
            value={businessRequirements.primaryGoal || ''}
            onChange={(e) => handleFieldChange('primaryGoal', e.target.value)}
            placeholder="What is the main business goal?"
            rows={3}
            className="w-full px-3 py-2 bg-[#0a0e1a] border border-[#252d44] rounded-lg text-[#e8eaf0] text-sm placeholder-[#a8b0c8]/50 focus:outline-none focus:border-[#d4af37] transition-colors resize-none"
          />
        </div>

        {/* Success Metrics */}
        <div>
          <label htmlFor="successMetrics" className="block text-xs font-medium text-[#a8b0c8] mb-2">
            Success Metrics
          </label>
          <textarea
            id="successMetrics"
            value={businessRequirements.successMetrics || ''}
            onChange={(e) => handleFieldChange('successMetrics', e.target.value)}
            placeholder="How will success be measured? List specific KPIs..."
            rows={4}
            className="w-full px-3 py-2 bg-[#0a0e1a] border border-[#252d44] rounded-lg text-[#e8eaf0] text-sm placeholder-[#a8b0c8]/50 focus:outline-none focus:border-[#d4af37] transition-colors resize-none"
          />
        </div>

        {/* Data Sources */}
        <div>
          <label htmlFor="dataSourceInput" className="block text-xs font-medium text-[#a8b0c8] mb-2">
            Data Sources
          </label>

          {/* Tags display */}
          {(businessRequirements.dataSources || []).length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {(businessRequirements.dataSources || []).map((source) => (
                <div
                  key={source}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-[#d4af37]/20 text-[#d4af37] rounded-lg text-sm border border-[#d4af37]/40"
                >
                  <span>{source}</span>
                  <button
                    onClick={() => removeDataSource(source)}
                    className="flex items-center justify-center hover:text-[#d4af37]/80 transition-colors"
                    aria-label={`Remove ${source}`}
                    type="button"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Input to add new data source */}
          <div className="flex gap-2">
            <input
              id="dataSourceInput"
              type="text"
              value={newDataSource}
              onChange={(e) => setNewDataSource(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="e.g., Salesforce, SAP, Custom DB"
              className="flex-1 px-3 py-2 bg-[#0a0e1a] border border-[#252d44] rounded-lg text-[#e8eaf0] text-sm placeholder-[#a8b0c8]/50 focus:outline-none focus:border-[#d4af37] transition-colors"
              aria-label="Add data source"
            />
            <button
              onClick={addDataSource}
              disabled={!newDataSource.trim()}
              className="px-4 py-2 bg-[#d4af37] text-[#0a0e1a] rounded-lg text-sm font-medium hover:bg-[#d4af37]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              type="button"
            >
              Add
            </button>
          </div>
          <p className="text-xs text-[#a8b0c8]/70 mt-1">Press Enter or click Add to include a data source</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* User Count */}
          <div>
            <label htmlFor="userCount" className="block text-xs font-medium text-[#a8b0c8] mb-2">
              Expected User Count
            </label>
            <input
              id="userCount"
              type="number"
              min="0"
              value={businessRequirements.userCount || ''}
              onChange={(e) => handleFieldChange('userCount', e.target.value)}
              placeholder="Number of users"
              className="w-full px-3 py-2 bg-[#0a0e1a] border border-[#252d44] rounded-lg text-[#e8eaf0] text-sm placeholder-[#a8b0c8]/50 focus:outline-none focus:border-[#d4af37] transition-colors"
            />
          </div>

          {/* Deployment Model */}
          <div>
            <label htmlFor="deploymentModel" className="block text-xs font-medium text-[#a8b0c8] mb-2">
              Deployment Model
            </label>
            <select
              id="deploymentModel"
              value={businessRequirements.deploymentModel || ''}
              onChange={(e) => handleFieldChange('deploymentModel', e.target.value)}
              className="w-full px-3 py-2 bg-[#0a0e1a] border border-[#252d44] rounded-lg text-[#e8eaf0] text-sm focus:outline-none focus:border-[#d4af37] transition-colors"
            >
              <option value="">Not specified</option>
              <option value="cloud">Cloud</option>
              <option value="on-premise">On-premise</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessRequirementsCard;
