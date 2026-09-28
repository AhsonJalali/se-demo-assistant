import React from 'react';
import { useApp } from '../context/AppContext';
import { VIEWS } from '../config/views';
import Dialog from './ui/Dialog';

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
const MOD = isMac ? '⌘' : 'Ctrl';

const GROUPS = [
  {
    title: 'General',
    items: [
      { keys: [MOD, 'K'], label: 'Search the library' },
      { keys: ['/'], label: 'Search the library' },
      { keys: ['N'], label: 'New session' },
      { keys: ['J'], label: 'Toggle notes' },
      { keys: [MOD, 'S'], label: 'Save now (sessions also auto-save)' },
      { keys: ['?'], label: 'Show shortcuts' },
      { keys: ['Esc'], label: 'Close the top panel or dialog' },
    ],
  },
  {
    title: 'Go to',
    items: VIEWS.map((v, i) => ({ keys: [String(i + 1)], label: v.label })),
  },
  {
    title: 'In text fields',
    items: [
      { keys: [MOD, '↵'], label: 'Send to the objection copilot / save a note' },
    ],
  },
];

const ShortcutsDialog = () => {
  const { setShowShortcuts } = useApp();
  return (
    <Dialog title="Keyboard shortcuts" onClose={() => setShowShortcuts(false)} size="md">
      <div className="space-y-5">
        {GROUPS.map(group => (
          <section key={group.title}>
            <h3 className="section-label mb-2">{group.title}</h3>
            <dl className="divide-y divide-line border border-line rounded-lg">
              {group.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between gap-4 px-3 py-2">
                  <dt className="text-[13px] text-fg">{item.label}</dt>
                  <dd className="flex gap-1">{item.keys.map(k => <kbd key={k}>{k}</kbd>)}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>
    </Dialog>
  );
};

export default ShortcutsDialog;
