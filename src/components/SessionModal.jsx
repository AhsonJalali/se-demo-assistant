import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { validateSessionName } from '../utils/sessionHelpers';

const DEAL_STAGES = [
  'Discovery',
  'POC',
  'Final Demo',
  'Negotiation',
  'Other'
];

const SessionModal = () => {
  const {
    currentSession,
    createSession,
    updateSession,
    setShowSessionModal,
    categories
  } = useApp();

  const isEditing = !!currentSession;

  const [formData, setFormData] = useState({
    name: '',
    demoDate: new Date().toISOString().slice(0, 16),
    dealStage: 'Discovery',
    industries: [],
    useCases: []
  });

  const [errors, setErrors] = useState({});

  // Initialize form with current session data if editing
  useEffect(() => {
    if (currentSession) {
      setFormData({
        name: currentSession.name,
        demoDate: currentSession.metadata.demoDate.slice(0, 16),
        dealStage: currentSession.metadata.dealStage,
        industries: currentSession.metadata.industries || [],
        useCases: currentSession.metadata.useCases || []
      });
    }
  }, [currentSession]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleIndustryToggle = (industryId) => {
    setFormData(prev => ({
      ...prev,
      industries: prev.industries.includes(industryId)
        ? prev.industries.filter(id => id !== industryId)
        : [...prev.industries, industryId]
    }));
  };

  const handleUseCaseToggle = (useCaseId) => {
    setFormData(prev => ({
      ...prev,
      useCases: prev.useCases.includes(useCaseId)
        ? prev.useCases.filter(id => id !== useCaseId)
        : [...prev.useCases, useCaseId]
    }));
  };

  const validate = () => {
    const newErrors = {};

    const nameError = validateSessionName(formData.name);
    if (nameError) {
      newErrors.name = nameError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      if (isEditing) {
        // Update existing session
        updateSession({
          name: formData.name.trim(),
          metadata: {
            demoDate: formData.demoDate,
            dealStage: formData.dealStage,
            industries: formData.industries,
            useCases: formData.useCases
          }
        });
      } else {
        // Create new session
        createSession(formData.name.trim(), {
          demoDate: formData.demoDate,
          dealStage: formData.dealStage,
          industries: formData.industries,
          useCases: formData.useCases
        });
      }

      setShowSessionModal(false);
    } catch (error) {
      setErrors({ submit: error.message });
    }
  };

  const handleClose = () => {
    setShowSessionModal(false);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const availableIndustries = categories.industries.filter(i => i.id !== 'all');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fadeIn"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#08062B] border border-[#1B1B61] rounded-xl shadow-2xl animate-scaleIn custom-scrollbar">
        {/* Header */}
        <div className="sticky top-0 bg-[#08062B] border-b border-[#1B1B61] px-6 py-4 z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#e8eaf0]">
              {isEditing ? 'Edit Session' : 'New Session'}
            </h2>
            <button
              onClick={handleClose}
              className="p-2 rounded-lg hover:bg-[#1B1B61] transition-colors duration-200"
            >
              <svg className="w-5 h-5 text-[#a8b0c8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Session Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-[#e8eaf0] mb-2">
              Customer/Prospect Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              maxLength={100}
              placeholder="e.g., Acme Corp"
              className={`w-full px-4 py-2 bg-[#08062B] border ${errors.name ? 'border-red-400' : 'border-[#1B1B61]'} rounded-lg text-[#e8eaf0] placeholder-[#a8b0c8]/50 focus:outline-none focus:border-[#00D2FF] transition-colors duration-200`}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-400">{errors.name}</p>
            )}
            <p className="mt-1 text-xs text-[#a8b0c8]">
              {formData.name.length}/100 characters
            </p>
          </div>

          {/* Demo Date */}
          <div>
            <label htmlFor="demoDate" className="block text-sm font-medium text-[#e8eaf0] mb-2">
              Demo Date & Time
            </label>
            <input
              type="datetime-local"
              id="demoDate"
              value={formData.demoDate}
              onChange={(e) => handleChange('demoDate', e.target.value)}
              className="w-full px-4 py-2 bg-[#08062B] border border-[#1B1B61] rounded-lg text-[#e8eaf0] focus:outline-none focus:border-[#00D2FF] transition-colors duration-200"
            />
          </div>

          {/* Deal Stage */}
          <div>
            <label htmlFor="dealStage" className="block text-sm font-medium text-[#e8eaf0] mb-2">
              Deal Stage
            </label>
            <select
              id="dealStage"
              value={formData.dealStage}
              onChange={(e) => handleChange('dealStage', e.target.value)}
              className="w-full px-4 py-2 bg-[#08062B] border border-[#1B1B61] rounded-lg text-[#e8eaf0] focus:outline-none focus:border-[#00D2FF] transition-colors duration-200 cursor-pointer"
            >
              {DEAL_STAGES.map(stage => (
                <option key={stage} value={stage}>{stage}</option>
              ))}
            </select>
          </div>

          {/* Industries */}
          <div>
            <label className="block text-sm font-medium text-[#e8eaf0] mb-3">
              Industries
            </label>
            <div className="grid grid-cols-2 gap-2">
              {availableIndustries.map(industry => (
                <label
                  key={industry.id}
                  className="flex items-center gap-2 px-3 py-2 bg-[#08062B] border border-[#1B1B61] rounded-lg cursor-pointer hover:border-[#00D2FF]/50 transition-colors duration-200"
                >
                  <input
                    type="checkbox"
                    checked={formData.industries.includes(industry.id)}
                    onChange={() => handleIndustryToggle(industry.id)}
                    className="w-4 h-4 rounded border-[#1B1B61] bg-[#08062B] text-[#00D2FF] focus:ring-[#00D2FF] focus:ring-offset-0"
                  />
                  <span className="text-sm text-[#e8eaf0]">{industry.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Use Cases */}
          <div>
            <label className="block text-sm font-medium text-[#e8eaf0] mb-3">
              Use Cases
            </label>
            <div className="grid grid-cols-1 gap-2">
              {categories.useCases.map(useCase => (
                <label
                  key={useCase.id}
                  className="flex items-center gap-2 px-3 py-2 bg-[#08062B] border border-[#1B1B61] rounded-lg cursor-pointer hover:border-[#00D2FF]/50 transition-colors duration-200"
                >
                  <input
                    type="checkbox"
                    checked={formData.useCases.includes(useCase.id)}
                    onChange={() => handleUseCaseToggle(useCase.id)}
                    className="w-4 h-4 rounded border-[#1B1B61] bg-[#08062B] text-[#00D2FF] focus:ring-[#00D2FF] focus:ring-offset-0"
                  />
                  <span className="text-sm text-[#e8eaf0]">{useCase.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {errors.submit && (
            <div className="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-sm text-red-400">{errors.submit}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1B1B61]">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 rounded-lg border border-[#1B1B61] text-[#e8eaf0] hover:bg-[#1B1B61] transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-lg bg-[#00D2FF] text-[#08062B] font-medium hover:bg-[#00D2FF]/90 transition-colors duration-200"
            >
              {isEditing ? 'Update Session' : 'Create Session'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SessionModal;
