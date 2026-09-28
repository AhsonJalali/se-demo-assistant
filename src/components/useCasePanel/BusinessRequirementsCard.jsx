import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

const BusinessRequirementsCard = ({ useCaseId, collapsed = false }) => {
  const { getUseCaseDocumentation, updateUseCaseDocumentation } = useApp();

  const doc = getUseCaseDocumentation(useCaseId);
  const businessRequirements = doc?.structured?.businessRequirements || {};

  const [newDataSource, setNewDataSource] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);

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

  const isCardCollapsed = collapsed || isCollapsed;

  return (
    <div className="panel p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-fg flex items-center gap-2">
          Business Requirements
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
        {/* Primary Goal */}
        <div>
          <label htmlFor="primaryGoal" className="label">
            Primary Goal
          </label>
          <textarea
            id="primaryGoal"
            value={businessRequirements.primaryGoal || ''}
            onChange={(e) => handleFieldChange('primaryGoal', e.target.value)}
            placeholder="What is the main business goal?"
            rows={3}
            className="field resize-y"
          />
        </div>

        {/* Success Metrics */}
        <div>
          <label htmlFor="successMetrics" className="label">
            Success Metrics
          </label>
          <textarea
            id="successMetrics"
            value={businessRequirements.successMetrics || ''}
            onChange={(e) => handleFieldChange('successMetrics', e.target.value)}
            placeholder="How will success be measured? List specific KPIs..."
            rows={4}
            className="field resize-y"
          />
        </div>

        {/* Data Sources */}
        <div>
          <label htmlFor="dataSourceInput" className="label">
            Data Sources
          </label>

          {/* Tags display */}
          {(businessRequirements.dataSources || []).length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {(businessRequirements.dataSources || []).map((source) => (
                <div
                  key={source}
                  className="chip chip-accent h-7 text-[13px]"
                >
                  <span>{source}</span>
                  <button
                    onClick={() => removeDataSource(source)}
                    className="flex items-center justify-center hover:opacity-70 transition-opacity"
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
              placeholder="Enter data source..."
              className="field flex-1 w-auto"
              aria-label="Add data source"
            />
            <button
              onClick={addDataSource}
              disabled={!newDataSource.trim()}
              className="btn btn-secondary"
              type="button"
            >
              Add
            </button>
          </div>
          <p className="hint mt-1">Press Enter or click Add to include a data source</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* User Count */}
          <div>
            <label htmlFor="userCount" className="label">
              User Count
            </label>
            <input
              id="userCount"
              type="number"
              min="0"
              value={businessRequirements.userCount || ''}
              onChange={(e) => handleFieldChange('userCount', e.target.value)}
              placeholder="Number of users"
              className="field"
            />
          </div>

          {/* Deployment Model */}
          <div>
            <label htmlFor="deploymentModel" className="label">
              Deployment Model
            </label>
            <select
              id="deploymentModel"
              value={businessRequirements.deploymentModel || ''}
              onChange={(e) => handleFieldChange('deploymentModel', e.target.value)}
              className="field"
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
