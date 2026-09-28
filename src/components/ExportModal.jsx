import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import Dialog from './ui/Dialog';
import EmptyState from './ui/EmptyState';
import Icon from './ui/Icon';

const FORMATS = [
  { id: 'pdf', label: 'PDF', hint: 'Polished, read-only', icon: 'file-text' },
  { id: 'docx', label: 'Word', hint: 'Editable', icon: 'edit' },
];

const ExportModal = () => {
  const { currentSession, setShowExportModal, showToast, content, settings, categories, openNewSession } = useApp();
  const [format, setFormat] = useState('pdf');
  const [scope, setScope] = useState('selected');
  const [isExporting, setIsExporting] = useState(false);

  const close = () => { if (!isExporting) setShowExportModal(false); };

  const selected = useMemo(() => {
    if (!currentSession) return null;
    const pick = (list, key) => list.filter(i => currentSession.selectedItems[key]?.includes(i.id));
    return {
      discovery: pick(content.discovery, 'discovery'),
      usecases: pick(content.usecases, 'usecases'),
      differentiators: pick(content.differentiators, 'differentiators'),
      objections: pick(content.objections, 'objections'),
    };
  }, [currentSession, content]);

  if (!currentSession) {
    return (
      <Dialog title="Export session" onClose={close} size="sm">
        <EmptyState
          icon="download"
          title="No session open"
          action={<button type="button" className="btn btn-primary btn-sm" onClick={() => { setShowExportModal(false); openNewSession(); }}>New session</button>}
          className="py-8"
        >
          Exports summarise one prospect’s session: their 3 Why’s, your notes, and the library items you saved.
        </EmptyState>
      </Dialog>
    );
  }

  const selectedCount = Object.values(selected).reduce((n, list) => n + list.length, 0);
  const effectiveScope = selectedCount === 0 ? 'all' : scope;
  const items = effectiveScope === 'selected' ? selected : {
    discovery: content.discovery,
    usecases: content.usecases,
    differentiators: content.differentiators,
    objections: content.objections,
  };

  const hasWhys = Object.values(currentSession.threeWhys || {}).some(a => a?.trim());
  const hasNotes = Boolean(currentSession.notes.general?.trim());
  const itemNoteCount = Object.keys(currentSession.notes.items).length;

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const ctx = { settings, threeWhys: content.threeWhys, categories };
      // Export libraries are large, so they load on demand.
      const fileName = format === 'pdf'
        ? await (await import('../utils/exportToPDF')).generatePDF(currentSession, items, ctx)
        : await (await import('../utils/exportToDocx')).generateDocx(currentSession, items, ctx);
      showToast(`Downloaded ${fileName}`, 'success');
      setShowExportModal(false);
    } catch (error) {
      console.error('Export error:', error);
      showToast(`Export failed: ${error.message}`, 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const rows = [
    { label: 'Session details', ok: true },
    { label: "3 Why's", ok: hasWhys, empty: 'Not answered yet' },
    { label: 'Meeting notes', ok: hasNotes, empty: 'None yet' },
    { label: 'Notes on items', ok: itemNoteCount > 0, value: itemNoteCount || null, empty: 'None yet' },
    { label: 'Discovery questions', ok: items.discovery.length > 0, value: items.discovery.length },
    { label: 'Use cases', ok: items.usecases.length > 0, value: items.usecases.length },
    { label: 'Positioning', ok: items.differentiators.length > 0, value: items.differentiators.length },
    { label: 'Objections', ok: items.objections.length > 0, value: items.objections.length },
  ];

  return (
    <Dialog
      title="Export session"
      description={currentSession.name}
      icon="download"
      onClose={close}
      size="md"
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={close} disabled={isExporting}>Cancel</button>
          <button type="button" className="btn btn-primary" onClick={handleExport} disabled={isExporting} data-autofocus>
            {isExporting ? <><Icon name="loader" size={14} className="animate-spin" /> Exporting…</> : <><Icon name="download" size={14} /> Download {format === 'pdf' ? 'PDF' : 'Word'}</>}
          </button>
        </>
      }
    >
      <div className="space-y-5">
        <fieldset>
          <legend className="label">Format</legend>
          <div className="grid grid-cols-2 gap-2" role="radiogroup">
            {FORMATS.map(f => {
              const active = format === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setFormat(f.id)}
                  className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-colors
                    ${active ? 'border-accent bg-accent-soft' : 'border-line hover:border-line-strong'}`}
                >
                  <Icon name={f.icon} size={18} className={active ? 'text-accent-text' : 'text-fg-3'} />
                  <div>
                    <div className={`text-[13px] font-semibold ${active ? 'text-accent-text' : 'text-fg'}`}>{f.label}</div>
                    <div className="text-xs text-fg-3">{f.hint}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </fieldset>

        <fieldset>
          <legend className="label">Library items</legend>
          {selectedCount === 0 ? (
            <p className="text-[13px] text-fg-2 flex gap-2">
              <Icon name="info" size={15} className="text-fg-3 mt-0.5" />
              <span>
                You haven’t saved any items yet, so the whole library will be included. Use the
                <Icon name="bookmark" size={13} className="inline mx-1 -mt-0.5" />
                button on cards to pick specific ones.
              </span>
            </p>
          ) : (
            <div className="flex gap-2">
              {[['selected', `Saved items (${selectedCount})`], ['all', 'Entire library']].map(([id, text]) => (
                <label key={id} className={`flex-1 flex items-center gap-2 px-3 h-9 rounded-lg border cursor-pointer text-[13px]
                  ${scope === id ? 'border-accent bg-accent-soft text-accent-text font-medium' : 'border-line text-fg-2 hover:border-line-strong'}`}>
                  <input type="radio" name="scope" value={id} checked={scope === id} onChange={() => setScope(id)} className="accent-[rgb(var(--accent))]" />
                  {text}
                </label>
              ))}
            </div>
          )}
        </fieldset>

        <div>
          <div className="label">Includes</div>
          <ul className="border border-line rounded-lg divide-y divide-line">
            {rows.map(r => (
              <li key={r.label} className="flex items-center gap-2.5 px-3 py-2 text-[13px]">
                <Icon name={r.ok ? 'check-circle' : 'x-circle'} size={15} className={r.ok ? 'text-success' : 'text-fg-3'} />
                <span className={`flex-1 ${r.ok ? 'text-fg' : 'text-fg-3'}`}>{r.label}</span>
                <span className="text-xs text-fg-3 tabular-nums">{r.ok ? (r.value ?? '') : (r.empty ?? '0')}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Dialog>
  );
};

export default ExportModal;
