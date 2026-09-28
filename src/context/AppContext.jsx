import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import discoveryData from '../data/discovery.json';
import differentiatorsData from '../data/differentiators.json';
import objectionsData from '../data/objections.json';
import usecasesData from '../data/usecases.json';
import threeWhysData from '../data/threeWhys.json';
import categoriesData from '../data/categories.json';
import {
  createSession as createSessionHelper,
  loadAllSessions,
  loadSessionById,
  saveSession as saveSessionHelper,
  deleteSession as deleteSessionHelper,
  normalizeSession,
} from '../utils/sessionHelpers';
import {
  loadCurrentSessionId,
  saveCurrentSessionId,
  migrateDataIfNeeded,
  getStorageUsage
} from '../utils/storageManager';
import { loadSettings, saveSettings, applyAppearance, fillDeep } from '../config/workspace';
import { VIEWS, LIBRARY_VIEWS } from '../config/views';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

const isTypingTarget = (el) =>
  el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable);

export const AppProvider = ({ children }) => {
  // ── Workspace settings (product name, theme, accent) ─────────────────────
  const [settings, setSettings] = useState(loadSettings);

  const updateSettings = useCallback((patch) => {
    setSettings(prev => {
      const next = { ...prev, ...patch };
      saveSettings(next);
      return next;
    });
  }, []);

  useEffect(() => {
    applyAppearance(settings);
    if (settings.theme !== 'system') return undefined;
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!mq) return undefined;
    const onChange = () => applyAppearance(settings);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [settings.theme, settings.accent]); // eslint-disable-line react-hooks/exhaustive-deps

  // Content library with {{product}}/{{company}} tokens filled in.
  const content = useMemo(() => {
    const differentiators = Object.entries(differentiatorsData.competitors).flatMap(([competitorId, competitor]) =>
      competitor.differentiators.map(diff => ({ ...diff, competitorName: competitor.name, competitorId }))
    );
    return {
      discovery: fillDeep(discoveryData.questions, settings),
      differentiators: fillDeep(differentiators, settings),
      objections: fillDeep(objectionsData.objections, settings),
      usecases: fillDeep(usecasesData.useCases, settings),
      threeWhys: fillDeep(threeWhysData.questions, settings),
    };
  }, [settings.productName, settings.companyName]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Navigation, search, filters ──────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('discovery');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustries, setSelectedIndustries] = useState([]);
  const [selectedCompetitors, setSelectedCompetitors] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [expandedCard, setExpandedCard] = useState(null);
  const searchInputRef = useRef(null);

  // ── Sessions ─────────────────────────────────────────────────────────────
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [currentSession, setCurrentSession] = useState(null);
  const [saveState, setSaveState] = useState({ status: 'idle', at: null });
  const lastPersistedRef = useRef(null);
  const currentSessionRef = useRef(null);
  currentSessionRef.current = currentSession;

  // Objection-copilot-matched library item ids, highlighted in the card list.
  const [highlightedItemIds, setHighlightedItemIds] = useState([]);

  // ── Overlays & UI ────────────────────────────────────────────────────────
  const [showNotesPanel, setShowNotesPanel] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [sessionModalMode, setSessionModalMode] = useState('new'); // 'new' | 'edit'
  const [showExportModal, setShowExportModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false); // mobile drawer
  const [editingNoteItemId, setEditingNoteItemId] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [showUseCasePanel, setShowUseCasePanel] = useState(false);
  const [selectedUseCaseId, setSelectedUseCaseId] = useState(null);
  const [allCardsCollapsed, setAllCardsCollapsed] = useState(false);

  // ── AI Prep ──────────────────────────────────────────────────────────────
  const [aiPrepInputs, setAiPrepInputs] = useState({
    companyName: '',
    companyWebsite: '',
    linkedinProfiles: [''],
    additionalContext: '',
  });
  const [aiPrepResult, setAiPrepResult] = useState(null);
  const [aiPrepIsGenerating, setAiPrepIsGenerating] = useState(false);
  const [aiPrepError, setAiPrepError] = useState(null);
  const aiPrepAbortRef = useRef(null);

  // ── Toasts ───────────────────────────────────────────────────────────────
  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'info') => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts(prev => [...prev.slice(-2), { id, message, type }]);
    setTimeout(() => dismissToast(id), type === 'error' ? 6000 : 3500);
  }, [dismissToast]);

  // ── Filtering ────────────────────────────────────────────────────────────
  const filteredContent = useMemo(() => {
    if (!LIBRARY_VIEWS.has(activeTab)) return [];
    let items = content[activeTab] || [];

    if (selectedIndustries.length > 0 && (activeTab === 'discovery' || activeTab === 'usecases')) {
      items = items.filter(item =>
        item.industries.includes('all') || item.industries.some(ind => selectedIndustries.includes(ind))
      );
    }
    if (selectedCompetitors.length > 0 && activeTab === 'differentiators') {
      items = items.filter(item => selectedCompetitors.includes(item.competitorId));
    }
    if (selectedCategories.length > 0 && activeTab === 'discovery') {
      items = items.filter(item => selectedCategories.includes(item.category));
    }
    const query = searchQuery.trim().toLowerCase();
    if (query) {
      items = items.filter(item => JSON.stringify(item).toLowerCase().includes(query));
    }
    return items;
  }, [activeTab, content, selectedIndustries, selectedCompetitors, selectedCategories, searchQuery]);

  const clearFilters = useCallback(() => {
    setSelectedIndustries([]);
    setSelectedCompetitors([]);
    setSelectedCategories([]);
    setSearchQuery('');
  }, []);

  // Search and expansion are per-view; filters persist across views.
  useEffect(() => {
    setSearchQuery('');
    setExpandedCard(null);
    setSidebarOpen(false);
    if (activeTab !== 'objections') setHighlightedItemIds([]);
  }, [activeTab]);

  // ── Session lifecycle ────────────────────────────────────────────────────
  const activateSession = useCallback((session) => {
    lastPersistedRef.current = session;
    setCurrentSessionId(session ? session.id : null);
    setCurrentSession(session);
    saveCurrentSessionId(session ? session.id : null);
    setSaveState({ status: session ? 'saved' : 'idle', at: session ? Date.now() : null });
  }, []);

  useEffect(() => {
    migrateDataIfNeeded();
    const loaded = loadAllSessions();
    setSessions(loaded);
    const savedId = loadCurrentSessionId();
    const session = savedId ? loadSessionById(savedId, loaded) : null;
    if (session) activateSession(session);
  }, [activateSession]);

  const persistNow = useCallback((session) => {
    if (!session) return false;
    try {
      saveSessionHelper(session);
      lastPersistedRef.current = session;
      setSessions(loadAllSessions());
      setSaveState({ status: 'saved', at: Date.now() });
      if (getStorageUsage() > 80) {
        showToast('Browser storage is over 80% full. Export and delete old sessions to free space.', 'warning');
      }
      return true;
    } catch (error) {
      setSaveState({ status: 'error', at: null, error: error.message });
      showToast(`Couldn't save: ${error.message}`, 'error');
      return false;
    }
  }, [showToast]);

  // Auto-save: every change to the active session is persisted after a short pause.
  useEffect(() => {
    if (!currentSession || lastPersistedRef.current === currentSession) return undefined;
    setSaveState(s => ({ ...s, status: 'saving' }));
    const timer = setTimeout(() => persistNow(currentSession), 600);
    return () => clearTimeout(timer);
  }, [currentSession, persistNow]);

  // Flush pending edits if the tab is closed mid-debounce.
  useEffect(() => {
    const flush = () => {
      const s = currentSessionRef.current;
      if (s && lastPersistedRef.current !== s) {
        try { saveSessionHelper(s); } catch { /* best effort */ }
      }
    };
    window.addEventListener('beforeunload', flush);
    return () => window.removeEventListener('beforeunload', flush);
  }, []);

  const saveSession = useCallback(() => {
    if (currentSessionRef.current && persistNow(currentSessionRef.current)) {
      showToast('Session saved', 'success');
    }
  }, [persistNow, showToast]);

  const exportSessionAsJson = useCallback((session) => {
    try {
      const fileName = `${session.name.replace(/[^a-z0-9]/gi, '_')}_${new Date(session.updatedAt).toISOString().split('T')[0]}.json`;
      const blob = new Blob([JSON.stringify(session, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
      showToast(`Downloaded "${session.name}"`, 'success');
    } catch (error) {
      showToast(`Download failed: ${error.message}`, 'error');
    }
  }, [showToast]);

  const importSessionFromJson = useCallback((file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const session = JSON.parse(e.target.result);
        if (!session.name || !session.notes || !session.selectedItems) {
          showToast("That file isn't a session export", 'error');
          return;
        }
        // Fresh id so an import never overwrites an existing session.
        const imported = normalizeSession({ ...session, id: crypto.randomUUID(), updatedAt: new Date().toISOString() });
        saveSessionHelper(imported);
        setSessions(loadAllSessions());
        activateSession(imported);
        showToast(`Imported "${imported.name}"`, 'success');
      } catch {
        showToast("Couldn't read that file. Make sure it's a session export (.json).", 'error');
      }
    };
    reader.readAsText(file);
  }, [showToast, activateSession]);

  const createSession = useCallback((name, metadata) => {
    try {
      const saved = saveSessionHelper(createSessionHelper(name, metadata));
      setSessions(loadAllSessions());
      activateSession(saved);
      showToast(`Started session for ${saved.name}`, 'success');
      return saved;
    } catch (error) {
      showToast(`Couldn't create session: ${error.message}`, 'error');
      throw error;
    }
  }, [showToast, activateSession]);

  const loadSession = useCallback((sessionId) => {
    const pending = currentSessionRef.current;
    if (pending && lastPersistedRef.current !== pending) persistNow(pending);
    const session = loadSessionById(sessionId);
    if (session) activateSession(session);
  }, [activateSession, persistNow]);

  const closeSession = useCallback(() => {
    const pending = currentSessionRef.current;
    if (pending && lastPersistedRef.current !== pending) persistNow(pending);
    activateSession(null);
  }, [activateSession, persistNow]);

  const updateSession = useCallback((updates) => {
    setCurrentSession(prev => (prev ? { ...prev, ...updates, updatedAt: new Date().toISOString() } : prev));
  }, []);

  const deleteSession = useCallback((sessionId) => {
    try {
      deleteSessionHelper(sessionId);
      const remaining = loadAllSessions();
      setSessions(remaining);
      if (currentSessionRef.current?.id === sessionId) activateSession(null);
      showToast('Session deleted', 'success');
    } catch (error) {
      showToast(`Couldn't delete session: ${error.message}`, 'error');
    }
  }, [showToast, activateSession]);

  // ── Notes ────────────────────────────────────────────────────────────────
  const addItemNote = useCallback((itemId, text) => {
    setCurrentSession(prev => {
      if (!prev) return prev;
      const now = new Date().toISOString();
      return {
        ...prev,
        notes: {
          ...prev.notes,
          items: {
            ...prev.notes.items,
            [itemId]: { content: text.trim(), timestamp: prev.notes.items[itemId]?.timestamp || now, lastModified: now },
          },
        },
      };
    });
  }, []);

  const removeItemNote = useCallback((itemId) => {
    setCurrentSession(prev => {
      if (!prev) return prev;
      const items = { ...prev.notes.items };
      delete items[itemId];
      return { ...prev, notes: { ...prev.notes, items } };
    });
  }, []);

  const updateGeneralNotes = useCallback((text) => {
    setCurrentSession(prev => (prev ? { ...prev, notes: { ...prev.notes, general: text } } : prev));
  }, []);

  const getItemNote = useCallback((itemId) => {
    return currentSession?.notes.items[itemId] || null;
  }, [currentSession]);

  // ── Use case documentation ───────────────────────────────────────────────
  const getUseCaseDocumentation = useCallback((useCaseId) => {
    return currentSession?.useCaseDocumentation?.[useCaseId] || null;
  }, [currentSession]);

  const updateUseCaseDocumentation = useCallback((useCaseId, updates) => {
    setCurrentSession(prev => {
      if (!prev) return prev;
      const existingDocs = prev.useCaseDocumentation || {};
      const existingDoc = existingDocs[useCaseId] || {
        structured: {
          customerContext: {},
          stakeholders: {},
          timeline: {},
          businessRequirements: {},
          technicalRequirements: {}
        },
        notes: { content: '', quickCaptureItems: [], lastModified: null }
      };
      // Deep-merge structured fields so concurrent effect updates don't overwrite each other.
      const mergedStructured = updates.structured
        ? Object.keys({ ...existingDoc.structured, ...updates.structured }).reduce((acc, key) => {
            acc[key] = { ...existingDoc.structured?.[key], ...updates.structured?.[key] };
            return acc;
          }, {})
        : existingDoc.structured;
      return {
        ...prev,
        useCaseDocumentation: {
          ...existingDocs,
          [useCaseId]: { ...existingDoc, ...updates, structured: mergedStructured }
        },
        updatedAt: new Date().toISOString()
      };
    });
  }, []);

  // ── Item selection ("save to export") ───────────────────────────────
  const toggleItemSelection = useCallback((itemId) => {
    setCurrentSession(prev => {
      if (!prev) return prev;
      const current = prev.selectedItems[activeTab] || [];
      return {
        ...prev,
        selectedItems: {
          ...prev.selectedItems,
          [activeTab]: current.includes(itemId) ? current.filter(id => id !== itemId) : [...current, itemId],
        },
      };
    });
  }, [activeTab]);

  const isItemSelected = useCallback((itemId) => {
    return currentSession?.selectedItems[activeTab]?.includes(itemId) || false;
  }, [currentSession, activeTab]);

  // ── Note modal ───────────────────────────────────────────────────────────
  const openNoteModal = useCallback((itemId) => setEditingNoteItemId(itemId), []);
  const closeNoteModal = useCallback(() => setEditingNoteItemId(null), []);

  // ── New session shortcut helper ──────────────────────────────────────────
  const openNewSession = useCallback(() => {
    setSessionModalMode('new');
    setShowSessionModal(true);
  }, []);

  // ── Keyboard shortcuts ───────────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e) => {
      const mod = e.metaKey || e.ctrlKey;
      const typing = isTypingTarget(e.target);

      if (mod && e.key.toLowerCase() === 's') {
        e.preventDefault();
        saveSession();
        return;
      }
      if (mod && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (!LIBRARY_VIEWS.has(activeTab)) setActiveTab('discovery');
        requestAnimationFrame(() => searchInputRef.current?.focus());
        return;
      }
      if (e.key === 'Escape') {
        if (editingNoteItemId) closeNoteModal();
        else if (showSessionModal) setShowSessionModal(false);
        else if (showExportModal) setShowExportModal(false);
        else if (showSettings) setShowSettings(false);
        else if (showShortcuts) setShowShortcuts(false);
        else if (showUseCasePanel) setShowUseCasePanel(false);
        else if (showNotesPanel) setShowNotesPanel(false);
        else if (sidebarOpen) setSidebarOpen(false);
        else if (typing && e.target === searchInputRef.current) searchInputRef.current.blur();
        return;
      }
      if (typing || mod || e.altKey) return;
      const overlayOpen = editingNoteItemId || showSessionModal || showExportModal || showSettings || showShortcuts || showUseCasePanel;
      if (overlayOpen) return;

      if (e.key === '/') {
        e.preventDefault();
        if (!LIBRARY_VIEWS.has(activeTab)) setActiveTab('discovery');
        requestAnimationFrame(() => searchInputRef.current?.focus());
      } else if (e.key === '?') {
        e.preventDefault();
        setShowShortcuts(true);
      } else if (e.key.toLowerCase() === 'n' && !e.shiftKey) {
        e.preventDefault();
        openNewSession();
      } else if (e.key.toLowerCase() === 'j' && !e.shiftKey) {
        e.preventDefault();
        setShowNotesPanel(v => !v);
      } else if (/^[1-9]$/.test(e.key)) {
        const view = VIEWS[Number(e.key) - 1];
        if (view) {
          e.preventDefault();
          setActiveTab(view.id);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, saveSession, openNewSession, closeNoteModal, editingNoteItemId, showSessionModal, showExportModal,
      showSettings, showShortcuts, showUseCasePanel, showNotesPanel, sidebarOpen]);

  // ── AI Prep controls ─────────────────────────────────────────────────────
  const cancelAiPrep = useCallback(() => {
    if (aiPrepAbortRef.current) {
      aiPrepAbortRef.current.abort();
      aiPrepAbortRef.current = null;
    }
    setAiPrepIsGenerating(false);
  }, []);

  const clearAiPrep = useCallback(() => {
    cancelAiPrep();
    setAiPrepResult(null);
    setAiPrepError(null);
  }, [cancelAiPrep]);

  const value = {
    // Workspace
    settings,
    updateSettings,
    content,

    // Objection copilot ↔ card list
    highlightedItemIds,
    setHighlightedItemIds,

    // Navigation, search, filters
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    searchInputRef,
    selectedIndustries,
    setSelectedIndustries,
    selectedCompetitors,
    setSelectedCompetitors,
    selectedCategories,
    setSelectedCategories,
    expandedCard,
    setExpandedCard,
    clearFilters,
    filteredContent,
    categories: categoriesData,

    // Sessions
    sessions,
    currentSessionId,
    currentSession,
    saveState,
    createSession,
    loadSession,
    closeSession,
    updateSession,
    deleteSession,
    saveSession,
    exportSessionAsJson,
    importSessionFromJson,
    openNewSession,

    // Notes
    addItemNote,
    removeItemNote,
    updateGeneralNotes,
    getItemNote,

    // Use case documentation
    getUseCaseDocumentation,
    updateUseCaseDocumentation,

    // Item selection
    toggleItemSelection,
    isItemSelected,

    // UI state
    showNotesPanel,
    setShowNotesPanel,
    showSessionModal,
    setShowSessionModal,
    sessionModalMode,
    setSessionModalMode,
    showExportModal,
    setShowExportModal,
    showSettings,
    setShowSettings,
    showShortcuts,
    setShowShortcuts,
    sidebarOpen,
    setSidebarOpen,
    editingNoteItemId,
    openNoteModal,
    closeNoteModal,
    toasts,
    showToast,
    dismissToast,
    showUseCasePanel,
    setShowUseCasePanel,
    selectedUseCaseId,
    setSelectedUseCaseId,
    allCardsCollapsed,
    setAllCardsCollapsed,

    // AI Prep
    aiPrepInputs,
    setAiPrepInputs,
    aiPrepResult,
    setAiPrepResult,
    aiPrepIsGenerating,
    setAiPrepIsGenerating,
    aiPrepError,
    setAiPrepError,
    aiPrepAbortRef,
    cancelAiPrep,
    clearAiPrep,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
