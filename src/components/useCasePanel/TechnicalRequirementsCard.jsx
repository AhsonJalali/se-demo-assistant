import React from 'react';
import { useApp } from '../../context/AppContext';

const TechnicalRequirementsCard = ({ useCaseId }) => {
  const { getUseCaseDocumentation, updateUseCaseDocumentation } = useApp();

  const doc = getUseCaseDocumentation(useCaseId);
  const technicalRequirements = doc?.structured?.technicalRequirements || {};
  const overview = technicalRequirements.overview || {};

  const handleFieldChange = (field, value) => {
    const updated = {
      ...doc,
      structured: {
        ...doc?.structured,
        technicalRequirements: {
          ...technicalRequirements,
          overview: {
            ...overview,
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
    handleFieldChange('securityRequirements', updated);
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
                onChange={(e) => handleFieldChange('integrationNeeds', e.target.value)}
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
                onChange={(e) => handleFieldChange('dataVolume', e.target.value)}
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
                onChange={(e) => handleFieldChange('performanceNeeds', e.target.value)}
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
      </div>
    </div>
  );
};

export default TechnicalRequirementsCard;
