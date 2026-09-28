import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { validateSessionName } from '../utils/sessionHelpers';
import { DEAL_STAGES } from '../config/views';
import Dialog from './ui/Dialog';

// datetime-local wants local time without a zone: YYYY-MM-DDTHH:mm
const toLocalInput = (iso) => {
  const d = iso ? new Date(iso) : new Date();
  if (Number.isNaN(d.getTime())) return '';
  const offset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offset).toISOString().slice(0, 16);
};

const SessionModal = () => {
  const { currentSession, createSession, updateSession, setShowSessionModal, sessionModalMode, categories } = useApp();
  const isEditing = sessionModalMode === 'edit' && Boolean(currentSession);

  const [form, setForm] = useState(() => ({
    name: isEditing ? currentSession.name : '',
    demoDate: toLocalInput(isEditing ? currentSession.metadata.demoDate : null),
    dealStage: isEditing ? currentSession.metadata.dealStage || 'Discovery' : 'Discovery',
    industry: isEditing ? currentSession.metadata.industries?.[0] || '' : '',
  }));
  const [errors, setErrors] = useState({});

  const set = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };

  const close = () => setShowSessionModal(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const nameError = validateSessionName(form.name);
    if (nameError) {
      setErrors({ name: nameError });
      return;
    }
    const metadata = {
      demoDate: form.demoDate ? new Date(form.demoDate).toISOString() : new Date().toISOString(),
      dealStage: form.dealStage,
      industries: form.industry ? [form.industry] : [],
    };
    try {
      if (isEditing) {
        updateSession({ name: form.name.trim(), metadata: { ...currentSession.metadata, ...metadata } });
      } else {
        createSession(form.name.trim(), metadata);
      }
      close();
    } catch (error) {
      setErrors({ submit: error.message });
    }
  };

  return (
    <Dialog
      title={isEditing ? 'Edit session' : 'New session'}
      description={isEditing ? undefined : 'One session per prospect. Notes, selections and your 3 Why’s are saved to it automatically.'}
      onClose={close}
      size="sm"
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={close}>Cancel</button>
          <button type="submit" form="session-form" className="btn btn-primary">
            {isEditing ? 'Save changes' : 'Create session'}
          </button>
        </>
      }
    >
      <form id="session-form" onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="session-name" className="label">Prospect</label>
          <input
            id="session-name"
            data-autofocus
            type="text"
            value={form.name}
            onChange={set('name')}
            maxLength={100}
            placeholder="e.g. Northwind Traders"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? 'session-name-error' : undefined}
            className={`field ${errors.name ? 'field-error' : ''}`}
          />
          {errors.name && <p id="session-name-error" className="mt-1.5 text-xs text-danger">{errors.name}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="session-stage" className="label">Deal stage</label>
            <select id="session-stage" value={form.dealStage} onChange={set('dealStage')} className="field">
              {DEAL_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="session-industry" className="label">Industry</label>
            <select id="session-industry" value={form.industry} onChange={set('industry')} className="field">
              <option value="">Not set</option>
              {categories.industries.filter(i => i.id !== 'all').map(i => (
                <option key={i.id} value={i.id}>{i.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="session-date" className="label">Meeting date</label>
          <input id="session-date" type="datetime-local" value={form.demoDate} onChange={set('demoDate')} className="field" />
        </div>

        {errors.submit && (
          <p role="alert" className="px-3 py-2 rounded-lg bg-danger-soft text-sm text-danger">{errors.submit}</p>
        )}
      </form>
    </Dialog>
  );
};

export default SessionModal;
