import React from 'react';
import { useApp } from '../context/AppContext';
import { VIEWS } from '../config/views';
import { titleCase } from '../config/workspace';
import SessionDropdown from './SessionDropdown';
import Icon from './ui/Icon';

const NavItem = ({ icon, label, active, onClick, shortcut, badge }) => (
  <button
    type="button"
    onClick={onClick}
    aria-current={active ? 'page' : undefined}
    className={`group w-full flex items-center gap-2.5 h-8 px-2.5 rounded-lg text-[13px] transition-colors
      ${active ? 'bg-surface text-fg font-medium shadow-card ring-1 ring-line' : 'text-fg-2 hover:text-fg hover:bg-muted'}`}
  >
    <Icon name={icon} size={16} className={active ? 'text-accent' : 'text-fg-3 group-hover:text-fg-2'} />
    <span className="flex-1 text-left truncate">{label}</span>
    {badge}
    {shortcut && (
      <kbd className="opacity-0 group-hover:opacity-100 transition-opacity hidden lg:inline-flex">{shortcut}</kbd>
    )}
  </button>
);

const THEME_ORDER = ['system', 'light', 'dark'];
const THEME_ICON = { system: 'monitor', light: 'sun', dark: 'moon' };

const SidebarContent = () => {
  const {
    activeTab,
    setActiveTab,
    currentSession,
    showNotesPanel,
    setShowNotesPanel,
    setShowExportModal,
    setShowSettings,
    setShowShortcuts,
    settings,
    updateSettings,
    setSidebarOpen,
  } = useApp();

  const noteCount = currentSession
    ? Object.keys(currentSession.notes.items).length + (currentSession.notes.general?.trim() ? 1 : 0)
    : 0;
  const selectedCount = currentSession ? Object.values(currentSession.selectedItems).flat().length : 0;

  const cycleTheme = () => {
    const next = THEME_ORDER[(THEME_ORDER.indexOf(settings.theme) + 1) % THEME_ORDER.length];
    updateSettings({ theme: next });
  };

  const group = (id) => VIEWS.map((v, i) => ({ ...v, index: i })).filter(v => v.group === id);

  return (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="flex items-center gap-2.5 h-14 px-4 shrink-0">
        <div className="w-7 h-7 rounded-lg bg-accent text-accent-fg flex items-center justify-center text-[13px] font-bold">
          {titleCase(settings.productName).charAt(0)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-semibold text-fg leading-tight">Demo Assistant</div>
          <div className="text-2xs text-fg-3 truncate leading-tight">{titleCase(settings.productName)}</div>
        </div>
        <button type="button" className="icon-btn lg:hidden" onClick={() => setSidebarOpen(false)} aria-label="Close menu">
          <Icon name="x" />
        </button>
      </div>

      <div className="px-3 pb-3">
        <SessionDropdown />
      </div>

      <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 space-y-5 pb-4" aria-label="Main">
        <div>
          <div className="px-2.5 pb-1.5 section-label">Library</div>
          <div className="space-y-0.5">
            {group('library').map(v => (
              <NavItem
                key={v.id}
                icon={v.icon}
                label={v.label}
                active={activeTab === v.id}
                onClick={() => setActiveTab(v.id)}
                shortcut={v.index + 1}
              />
            ))}
          </div>
        </div>

        <div>
          <div className="px-2.5 pb-1.5 section-label">This deal</div>
          <div className="space-y-0.5">
            {group('deal').map(v => (
              <NavItem
                key={v.id}
                icon={v.icon}
                label={v.label}
                active={activeTab === v.id}
                onClick={() => setActiveTab(v.id)}
                shortcut={v.index + 1}
              />
            ))}
            <NavItem
              icon="notebook"
              label="Notes"
              active={showNotesPanel}
              onClick={() => { setShowNotesPanel(!showNotesPanel); setSidebarOpen(false); }}
              shortcut="J"
              badge={noteCount > 0 ? <span className="chip h-5 px-1.5 text-2xs">{noteCount}</span> : null}
            />
            <NavItem
              icon="download"
              label="Export"
              onClick={() => { setShowExportModal(true); setSidebarOpen(false); }}
              badge={selectedCount > 0 ? <span className="chip chip-accent h-5 px-1.5 text-2xs">{selectedCount}</span> : null}
            />
          </div>
        </div>
      </nav>

      <div className="flex items-center gap-1 px-3 py-3 border-t border-line shrink-0">
        <button type="button" onClick={() => setShowSettings(true)} className="btn btn-ghost btn-sm flex-1 justify-start">
          <Icon name="settings" size={15} /> Settings
        </button>
        <button type="button" onClick={() => setShowShortcuts(true)} className="icon-btn" aria-label="Keyboard shortcuts" title="Keyboard shortcuts (?)">
          <Icon name="keyboard" size={16} />
        </button>
        <button
          type="button"
          onClick={cycleTheme}
          className="icon-btn"
          aria-label={`Theme: ${settings.theme}. Click to change.`}
          title={`Theme: ${settings.theme}`}
        >
          <Icon name={THEME_ICON[settings.theme] || 'monitor'} size={16} />
        </button>
      </div>
    </div>
  );
};

const Sidebar = () => {
  const { sidebarOpen, setSidebarOpen } = useApp();
  return (
    <>
      <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-line bg-canvas">
        <SidebarContent />
      </aside>
      {sidebarOpen && (
        <div className="lg:hidden">
          <div className="fixed inset-0 z-40 bg-black/30 animate-fade-in" onClick={() => setSidebarOpen(false)} aria-hidden="true" />
          <aside className="fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-canvas border-r border-line shadow-dialog animate-slide-in-left">
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  );
};

export default Sidebar;
