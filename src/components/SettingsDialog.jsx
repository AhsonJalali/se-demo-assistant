import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ACCENTS, THEMES, DEFAULT_SETTINGS } from '../config/workspace';
import Dialog from './ui/Dialog';
import Icon from './ui/Icon';

const THEME_META = {
  system: { label: 'System', icon: 'monitor' },
  light: { label: 'Light', icon: 'sun' },
  dark: { label: 'Dark', icon: 'moon' },
};

const SettingsDialog = () => {
  const { settings, updateSettings, setShowSettings, showToast } = useApp();
  const [draft, setDraft] = useState({
    productName: settings.productName === DEFAULT_SETTINGS.productName ? '' : settings.productName,
    companyName: settings.companyName === DEFAULT_SETTINGS.companyName ? '' : settings.companyName,
    productPitch: settings.productPitch,
  });

  const close = () => setShowSettings(false);

  const save = (e) => {
    e?.preventDefault();
    updateSettings({
      productName: draft.productName.trim() || DEFAULT_SETTINGS.productName,
      companyName: draft.companyName.trim() || DEFAULT_SETTINGS.companyName,
      productPitch: draft.productPitch.trim(),
    });
    showToast('Settings saved', 'success');
    close();
  };

  return (
    <Dialog
      title="Settings"
      description="Make the assistant yours. Stored in this browser only."
      onClose={close}
      size="md"
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={close}>Cancel</button>
          <button type="submit" form="settings-form" className="btn btn-primary">Save</button>
        </>
      }
    >
      <form id="settings-form" onSubmit={save} className="space-y-6">
        <fieldset className="space-y-4">
          <legend className="section-label mb-3">What you sell</legend>
          <div>
            <label htmlFor="set-product" className="label">Product name</label>
            <input
              id="set-product"
              data-autofocus
              className="field"
              value={draft.productName}
              onChange={e => setDraft(d => ({ ...d, productName: e.target.value }))}
              placeholder="e.g. Acme Cloud"
              maxLength={60}
            />
            <p className="hint mt-1.5">Replaces “our platform” across the library, 3 Why’s, exports, and AI prompts.</p>
          </div>
          <div>
            <label htmlFor="set-company" className="label">Your company</label>
            <input
              id="set-company"
              className="field"
              value={draft.companyName}
              onChange={e => setDraft(d => ({ ...d, companyName: e.target.value }))}
              placeholder="e.g. Acme Inc."
              maxLength={60}
            />
          </div>
          <div>
            <label htmlFor="set-pitch" className="label">One-paragraph pitch <span className="font-normal text-fg-3">(optional)</span></label>
            <textarea
              id="set-pitch"
              className="field min-h-[88px] resize-y"
              value={draft.productPitch}
              onChange={e => setDraft(d => ({ ...d, productPitch: e.target.value }))}
              placeholder="What the product does, who it's for, and what makes it different. The AI features use this to tailor briefs and objection responses."
              maxLength={1200}
            />
          </div>
        </fieldset>

        <fieldset>
          <legend className="section-label mb-3">Appearance</legend>
          <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Theme">
            {THEMES.map(id => {
              const active = settings.theme === id;
              return (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => updateSettings({ theme: id })}
                  className={`flex items-center justify-center gap-2 h-9 rounded-lg border text-[13px] transition-colors
                    ${active ? 'border-accent bg-accent-soft text-accent-text font-medium' : 'border-line text-fg-2 hover:border-line-strong hover:text-fg'}`}
                >
                  <Icon name={THEME_META[id].icon} size={15} />
                  {THEME_META[id].label}
                </button>
              );
            })}
          </div>

          <div className="mt-4">
            <span className="label">Accent colour</span>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Accent colour">
              {ACCENTS.map(a => {
                const active = settings.accent === a.id;
                return (
                  <button
                    key={a.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    aria-label={a.name}
                    title={a.name}
                    onClick={() => updateSettings({ accent: a.id })}
                    className={`w-8 h-8 rounded-full flex items-center justify-center ring-offset-2 ring-offset-surface transition-shadow
                      ${active ? 'ring-2 ring-fg/70' : 'hover:ring-2 hover:ring-line-strong'}`}
                    style={{ backgroundColor: a.swatch }}
                  >
                    {active && <Icon name="check" size={14} strokeWidth={3} className="text-white" />}
                  </button>
                );
              })}
            </div>
            <p className="hint mt-2">Theme and accent apply immediately.</p>
          </div>
        </fieldset>
      </form>
    </Dialog>
  );
};

export default SettingsDialog;
