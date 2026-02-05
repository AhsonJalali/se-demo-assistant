import React from 'react';
import { useApp } from '../../context/AppContext';

const TechnicalRequirementsCard = ({ useCaseId }) => {
  const { getUseCaseDocumentation, updateUseCaseDocumentation } = useApp();

  const doc = getUseCaseDocumentation(useCaseId);
  const technicalRequirements = doc?.structured?.technicalRequirements || {};
  const overview = technicalRequirements.overview || {};
  const apiIntegration = technicalRequirements.apiIntegration || {};
  const dataModel = technicalRequirements.dataModel || {};

  const handleFieldChange = (subsection, field, value) => {
    const updated = {
      ...doc,
      structured: {
        ...doc?.structured,
        technicalRequirements: {
          ...technicalRequirements,
          [subsection]: {
            ...(technicalRequirements[subsection] || {}),
            [field]: value
          }
        }
      }
    };
    updateUseCaseDocumentation(useCaseId, updated);
  };

  const handleSecurityRequirementChange = (requirement) => {
    const securityRequirements = overview.securityRequirements || [];
    const updated = securityRequirements.includes(requirement)
      ? securityRequirements.filter(req => req !== requirement)
      : [...securityRequirements, requirement];
    handleFieldChange('overview', 'securityRequirements', updated);
  };

  const securityOptions = [
    { id: 'rls', label: 'Row Level Security (RLS)' },
    { id: 'cls', label: 'Column Level Security (CLS)' },
    { id: 'encryption', label: 'Data Encryption' },
    { id: 'compliance', label: 'Compliance (GDPR, HIPAA, etc.)' }
  ];

  return (
    <div className="glass-panel-strong rounded-xl p-4 space-y-4">
      <h3 className="text-sm font-bold text-[#d4af37] uppercase tracking-wider flex items-center gap-2">
        Technical Requirements
      </h3>

      <div className="space-y-4">
        {/* Overview Section Header */}
        <div>
          <h4 className="text-xs font-semibold text-[#d4af37] uppercase tracking-wider mb-3">
            Overview
          </h4>

          <div className="space-y-4">
            {/* Integration Needs */}
            <div>
              <label htmlFor="integrationNeeds" className="block text-xs font-medium text-[#a8b0c8] mb-2">
                Integration Needs
              </label>
              <select
                id="integrationNeeds"
                value={overview.integrationNeeds || ''}
                onChange={(e) => handleFieldChange('overview', 'integrationNeeds', e.target.value)}
                className="w-full px-3 py-2 bg-[#0a0e1a] border border-[#252d44] rounded-lg text-[#e8eaf0] text-sm focus:outline-none focus:border-[#d4af37] transition-colors"
              >
                <option value="">Not specified</option>
                <option value="none">None</option>
                <option value="basic">Basic (SSO)</option>
                <option value="moderate">Moderate (SSO + APIs)</option>
                <option value="complex">Complex (Multiple systems)</option>
              </select>
            </div>

            {/* Data Volume */}
            <div>
              <label htmlFor="dataVolume" className="block text-xs font-medium text-[#a8b0c8] mb-2">
                Data Volume
              </label>
              <select
                id="dataVolume"
                value={overview.dataVolume || ''}
                onChange={(e) => handleFieldChange('overview', 'dataVolume', e.target.value)}
                className="w-full px-3 py-2 bg-[#0a0e1a] border border-[#252d44] rounded-lg text-[#e8eaf0] text-sm focus:outline-none focus:border-[#d4af37] transition-colors"
              >
                <option value="">Not specified</option>
                <option value="small">Small (&lt;1GB)</option>
                <option value="medium">Medium (1-10GB)</option>
                <option value="large">Large (10-100GB)</option>
                <option value="very-large">Very Large (&gt;100GB)</option>
              </select>
            </div>

            {/* Performance Needs */}
            <div>
              <label htmlFor="performanceNeeds" className="block text-xs font-medium text-[#a8b0c8] mb-2">
                Performance Needs
              </label>
              <select
                id="performanceNeeds"
                value={overview.performanceNeeds || ''}
                onChange={(e) => handleFieldChange('overview', 'performanceNeeds', e.target.value)}
                className="w-full px-3 py-2 bg-[#0a0e1a] border border-[#252d44] rounded-lg text-[#e8eaf0] text-sm focus:outline-none focus:border-[#d4af37] transition-colors"
              >
                <option value="">Not specified</option>
                <option value="standard">Standard</option>
                <option value="high">High (sub-second queries)</option>
                <option value="critical">Critical (real-time)</option>
              </select>
            </div>

            {/* Security Requirements */}
            <div>
              <fieldset>
                <legend className="block text-xs font-medium text-[#a8b0c8] mb-2">
                  Security Requirements
                </legend>
                <div className="space-y-2">
                  {securityOptions.map(option => (
                    <div key={option.id} className="flex items-center">
                      <input
                        id={`security-${option.id}`}
                        type="checkbox"
                        checked={(overview.securityRequirements || []).includes(option.id)}
                        onChange={() => handleSecurityRequirementChange(option.id)}
                        className="w-4 h-4 bg-[#0a0e1a] border border-[#252d44] rounded text-[#d4af37] focus:ring-[#d4af37] focus:ring-offset-0 focus:ring-2 cursor-pointer"
                      />
                      <label
                        htmlFor={`security-${option.id}`}
                        className="ml-2 text-sm text-[#e8eaf0] cursor-pointer select-none"
                      >
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              </fieldset>
            </div>
          </div>
        </div>

        {/* API Integration Section */}
        <div className="mt-6">
          <h4 className="text-xs font-semibold text-[#d4af37] uppercase tracking-wider mb-3">
            API Integration
          </h4>

          <div className="space-y-4">
            {/* API Type */}
            <div>
              <label htmlFor="apiType" className="block text-xs font-medium text-[#a8b0c8] mb-2">
                API Type
              </label>
              <select
                id="apiType"
                value={apiIntegration.apiType || ''}
                onChange={(e) => handleFieldChange('apiIntegration', 'apiType', e.target.value)}
                className="w-full px-3 py-2 bg-[#0a0e1a] border border-[#252d44] rounded-lg text-[#e8eaf0] text-sm focus:outline-none focus:border-[#d4af37] transition-colors"
              >
                <option value="">Not applicable</option>
                <option value="rest">REST API</option>
                <option value="graphql">GraphQL</option>
                <option value="soap">SOAP</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            {/* Authentication Method */}
            <div>
              <label htmlFor="authMethod" className="block text-xs font-medium text-[#a8b0c8] mb-2">
                Authentication Method
              </label>
              <select
                id="authMethod"
                value={apiIntegration.authMethod || ''}
                onChange={(e) => handleFieldChange('apiIntegration', 'authMethod', e.target.value)}
                className="w-full px-3 py-2 bg-[#0a0e1a] border border-[#252d44] rounded-lg text-[#e8eaf0] text-sm focus:outline-none focus:border-[#d4af37] transition-colors"
              >
                <option value="">Not applicable</option>
                <option value="oauth2">OAuth 2.0</option>
                <option value="apikey">API Key</option>
                <option value="basic">Basic Auth</option>
                <option value="saml">SAML</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            {/* Required Endpoints */}
            <div>
              <label htmlFor="requiredEndpoints" className="block text-xs font-medium text-[#a8b0c8] mb-2">
                Required Endpoints
              </label>
              <textarea
                id="requiredEndpoints"
                value={apiIntegration.requiredEndpoints || ''}
                onChange={(e) => handleFieldChange('apiIntegration', 'requiredEndpoints', e.target.value)}
                placeholder="List required API endpoints..."
                rows={4}
                className="w-full px-3 py-2 bg-[#0a0e1a] border border-[#252d44] rounded-lg text-[#e8eaf0] text-sm focus:outline-none focus:border-[#d4af37] transition-colors resize-y"
              />
            </div>

            {/* Rate Limits */}
            <div>
              <label htmlFor="rateLimits" className="block text-xs font-medium text-[#a8b0c8] mb-2">
                Rate Limits
              </label>
              <input
                id="rateLimits"
                type="text"
                value={apiIntegration.rateLimits || ''}
                onChange={(e) => handleFieldChange('apiIntegration', 'rateLimits', e.target.value)}
                placeholder="e.g., 1000 requests/hour"
                className="w-full px-3 py-2 bg-[#0a0e1a] border border-[#252d44] rounded-lg text-[#e8eaf0] text-sm focus:outline-none focus:border-[#d4af37] transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Data Model Section */}
        <div className="mt-6">
          <h4 className="text-xs font-semibold text-[#d4af37] uppercase tracking-wider mb-3">
            Data Model
          </h4>

          <div className="space-y-4">
            {/* Schema Complexity */}
            <div>
              <label htmlFor="schemaComplexity" className="block text-xs font-medium text-[#a8b0c8] mb-2">
                Schema Complexity
              </label>
              <select
                id="schemaComplexity"
                value={dataModel.schemaComplexity || ''}
                onChange={(e) => handleFieldChange('dataModel', 'schemaComplexity', e.target.value)}
                className="w-full px-3 py-2 bg-[#0a0e1a] border border-[#252d44] rounded-lg text-[#e8eaf0] text-sm focus:outline-none focus:border-[#d4af37] transition-colors"
              >
                <option value="">Not applicable</option>
                <option value="simple">Simple (1-5 tables)</option>
                <option value="moderate">Moderate (6-20 tables)</option>
                <option value="complex">Complex (21-50 tables)</option>
                <option value="very-complex">Very Complex (50+ tables)</option>
              </select>
            </div>

            {/* Data Relationships */}
            <div>
              <label htmlFor="dataRelationships" className="block text-xs font-medium text-[#a8b0c8] mb-2">
                Data Relationships
              </label>
              <select
                id="dataRelationships"
                value={dataModel.dataRelationships || ''}
                onChange={(e) => handleFieldChange('dataModel', 'dataRelationships', e.target.value)}
                className="w-full px-3 py-2 bg-[#0a0e1a] border border-[#252d44] rounded-lg text-[#e8eaf0] text-sm focus:outline-none focus:border-[#d4af37] transition-colors"
              >
                <option value="">Not applicable</option>
                <option value="flat">Flat/No relationships</option>
                <option value="one-to-many">One-to-Many</option>
                <option value="many-to-many">Many-to-Many</option>
                <option value="complex-hierarchies">Complex hierarchies</option>
              </select>
            </div>

            {/* Key Entities */}
            <div>
              <label htmlFor="keyEntities" className="block text-xs font-medium text-[#a8b0c8] mb-2">
                Key Entities
              </label>
              <textarea
                id="keyEntities"
                value={dataModel.keyEntities || ''}
                onChange={(e) => handleFieldChange('dataModel', 'keyEntities', e.target.value)}
                placeholder="List key data entities and their relationships..."
                rows={4}
                className="w-full px-3 py-2 bg-[#0a0e1a] border border-[#252d44] rounded-lg text-[#e8eaf0] text-sm focus:outline-none focus:border-[#d4af37] transition-colors resize-y"
              />
            </div>

            {/* Data Refresh Rate */}
            <div>
              <label htmlFor="dataRefreshRate" className="block text-xs font-medium text-[#a8b0c8] mb-2">
                Data Refresh Rate
              </label>
              <select
                id="dataRefreshRate"
                value={dataModel.dataRefreshRate || ''}
                onChange={(e) => handleFieldChange('dataModel', 'dataRefreshRate', e.target.value)}
                className="w-full px-3 py-2 bg-[#0a0e1a] border border-[#252d44] rounded-lg text-[#e8eaf0] text-sm focus:outline-none focus:border-[#d4af37] transition-colors"
              >
                <option value="">Not applicable</option>
                <option value="real-time">Real-time</option>
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="on-demand">On-demand</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechnicalRequirementsCard;
