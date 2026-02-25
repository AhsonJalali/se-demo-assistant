import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { validateSessionName } from '../utils/sessionHelpers';

const SessionModal = () => {
  const { currentSession, createSession, updateSession, setShowSessionModal, sessionModalMode } = useApp();

  const isEditing = sessionModalMode === 'edit';

  const [formData, setFormData] = useState({
    name: '',
    demoDate: new Date().toISOString().slice(0, 16),
  });

  const [errors, setErrors] = useState({});

  // When editing, load existing session data. When creating, always use current time.
  useEffect(() => {
    if (currentSession) {
      setFormData({
        name: currentSession.name,
        demoDate: currentSession.metadata.demoDate.slice(0, 16),
      });
    } else {
      setFormData({
        name: '',
        demoDate: new Date().toISOString().slice(0, 16),
      });
    }
  }, [currentSession]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };

  const validate = () => {
    const newErrors = {};
    const nameError = validateSessionName(formData.name);
    if (nameError) newErrors.name = nameError;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      if (isEditing) {
        updateSession({
          name: formData.name.trim(),
          metadata: { demoDate: formData.demoDate }
        });
      } else {
        createSession(formData.name.trim(), { demoDate: formData.demoDate });
      }
      setShowSessionModal(false);
    } catch (error) {
      setErrors({ submit: error.message });
    }
  };

  const handleClose = () => setShowSessionModal(false);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) handleClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fadeIn"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-md bg-[#08062B] border border-[#1B1B61] rounded-xl shadow-2xl animate-scaleIn">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1B1B61]">
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Customer / Prospect Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-[#e8eaf0] mb-2">
              Customer / Prospect Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              maxLength={100}
              placeholder="e.g., Acme Corp"
              autoFocus
              className={`w-full px-4 py-2.5 bg-[#0D0A35] border ${errors.name ? 'border-red-400' : 'border-[#1B1B61]'} rounded-lg text-[#e8eaf0] placeholder-[#a8b0c8]/50 focus:outline-none focus:border-[#00D2FF] transition-colors duration-200`}
            />
            {errors.name && <p className="mt-1 text-sm text-red-400">{errors.name}</p>}
          </div>

          {/* Date & Time */}
          <div>
            <label htmlFor="demoDate" className="block text-sm font-medium text-[#e8eaf0] mb-2">
              Date &amp; Time
            </label>
            <input
              type="datetime-local"
              id="demoDate"
              value={formData.demoDate}
              onChange={(e) => handleChange('demoDate', e.target.value)}
              className="w-full px-4 py-2.5 bg-[#0D0A35] border border-[#1B1B61] rounded-lg text-[#e8eaf0] focus:outline-none focus:border-[#00D2FF] transition-colors duration-200"
            />
          </div>

          {/* Error */}
          {errors.submit && (
            <div className="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-sm text-red-400">{errors.submit}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#1B1B61]">
            <button
              type="button"
              onClick={handleClose}
              className="px-5 py-2 rounded-lg border border-[#1B1B61] text-[#e8eaf0] hover:bg-[#1B1B61] transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-[#00D2FF] text-[#08062B] font-medium hover:bg-[#00D2FF]/90 transition-colors duration-200"
            >
              {isEditing ? 'Update' : 'Create Session'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SessionModal;
