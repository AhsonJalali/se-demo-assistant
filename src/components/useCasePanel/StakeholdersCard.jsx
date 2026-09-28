import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

const StakeholdersCard = ({ useCaseId, collapsed = false }) => {
  const { getUseCaseDocumentation, updateUseCaseDocumentation } = useApp();

  const doc = getUseCaseDocumentation(useCaseId);
  const stakeholders = doc?.structured?.stakeholders || {};

  const [newDMName, setNewDMName] = useState('');
  const [newDMRole, setNewDMRole] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleFieldChange = (field, value) => {
    const updated = {
      ...doc,
      structured: {
        ...doc?.structured,
        stakeholders: {
          ...stakeholders,
          [field]: value
        }
      }
    };
    updateUseCaseDocumentation(useCaseId, updated);
  };

  const handlePrimaryContactChange = (field, value) => {
    const updatedPrimaryContact = {
      ...stakeholders.primaryContact,
      [field]: value
    };
    handleFieldChange('primaryContact', updatedPrimaryContact);
  };

  const handleEconomicBuyerChange = (field, value) => {
    const updatedEconomicBuyer = {
      ...stakeholders.economicBuyer,
      [field]: value
    };
    handleFieldChange('economicBuyer', updatedEconomicBuyer);
  };

  const addDecisionMaker = () => {
    if (!newDMName.trim() || !newDMRole.trim()) return;

    const decisionMakers = stakeholders.decisionMakers || [];
    const newDM = {
      id: Date.now().toString(),
      name: newDMName.trim(),
      role: newDMRole.trim(),
      isChampion: false
    };

    handleFieldChange('decisionMakers', [...decisionMakers, newDM]);
    setNewDMName('');
    setNewDMRole('');
  };

  const removeDecisionMaker = (id) => {
    const decisionMakers = stakeholders.decisionMakers || [];
    handleFieldChange('decisionMakers', decisionMakers.filter(dm => dm.id !== id));
  };

  const toggleChampion = (id) => {
    const decisionMakers = stakeholders.decisionMakers || [];
    const updated = decisionMakers.map(dm =>
      dm.id === id ? { ...dm, isChampion: !dm.isChampion } : dm
    );
    handleFieldChange('decisionMakers', updated);
  };

  const isCardCollapsed = collapsed || isCollapsed;

  return (
    <div className="panel p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-fg flex items-center gap-2">
          Stakeholders
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

      <div className={`space-y-6 transition-all duration-300 ${isCardCollapsed ? 'hidden' : 'block'}`}>
        {/* Primary Contact */}
        <div>
          <h4 className="section-label mb-3">
            Primary Contact
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-fg-3 mb-1">
                Name
              </label>
              <input
                type="text"
                value={stakeholders.primaryContact?.name || ''}
                onChange={(e) => handlePrimaryContactChange('name', e.target.value)}
                placeholder="Contact name"
                className="field"
              />
            </div>
            <div>
              <label className="block text-xs text-fg-3 mb-1">
                Role
              </label>
              <input
                type="text"
                value={stakeholders.primaryContact?.role || ''}
                onChange={(e) => handlePrimaryContactChange('role', e.target.value)}
                placeholder="Job title"
                className="field"
              />
            </div>
          </div>
        </div>

        {/* Decision Makers */}
        <div>
          <h4 className="section-label mb-3">
            Decision Makers
          </h4>

          {/* Existing Decision Makers */}
          <div className="space-y-2 mb-3">
            {(stakeholders.decisionMakers || []).map((dm) => (
              <div
                key={dm.id}
                className="flex items-center gap-2 p-2 bg-subtle border border-line rounded-lg"
              >
                <button
                  onClick={() => toggleChampion(dm.id)}
                  className={`icon-btn w-7 h-7 ${dm.isChampion ? 'text-warning hover:text-warning' : ''}`}
                  title={dm.isChampion ? 'Champion' : 'Mark as champion'}
                  aria-pressed={dm.isChampion}
                  aria-label={dm.isChampion ? 'Unmark as champion' : 'Mark as champion'}
                >
                  <svg
                    className="w-4 h-4"
                    fill={dm.isChampion ? 'currentColor' : 'none'}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    />
                  </svg>
                </button>
                <div className="flex-1 grid grid-cols-2 gap-2">
                  <div className="text-sm text-fg">{dm.name}</div>
                  <div className="text-sm text-fg-2">{dm.role}</div>
                </div>
                <button
                  onClick={() => removeDecisionMaker(dm.id)}
                  className="icon-btn w-7 h-7 hover:text-danger"
                  title="Remove"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          {/* Add New Decision Maker */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newDMName}
              onChange={(e) => setNewDMName(e.target.value)}
              placeholder="Name"
              className="field flex-1 w-auto"
              onKeyPress={(e) => e.key === 'Enter' && addDecisionMaker()}
            />
            <input
              type="text"
              value={newDMRole}
              onChange={(e) => setNewDMRole(e.target.value)}
              placeholder="Role"
              className="field flex-1 w-auto"
              onKeyPress={(e) => e.key === 'Enter' && addDecisionMaker()}
            />
            <button
              onClick={addDecisionMaker}
              disabled={!newDMName.trim() || !newDMRole.trim()}
              className="btn btn-secondary"
            >
              Add
            </button>
          </div>
        </div>

        {/* Economic Buyer */}
        <div>
          <h4 className="section-label mb-3">
            Economic Buyer
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-fg-3 mb-1">
                Name
              </label>
              <input
                type="text"
                value={stakeholders.economicBuyer?.name || ''}
                onChange={(e) => handleEconomicBuyerChange('name', e.target.value)}
                placeholder="Buyer name"
                className="field"
              />
            </div>
            <div>
              <label className="block text-xs text-fg-3 mb-1">
                Role
              </label>
              <input
                type="text"
                value={stakeholders.economicBuyer?.role || ''}
                onChange={(e) => handleEconomicBuyerChange('role', e.target.value)}
                placeholder="Job title"
                className="field"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StakeholdersCard;
