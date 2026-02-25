import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import discoveryData from '../data/discovery.json';
import differentiatorsData from '../data/differentiators.json';
import objectionsData from '../data/objections.json';
import usecasesData from '../data/usecases.json';
import categoriesData from '../data/categories.json';
import {
  createSession as createSessionHelper,
  loadAllSessions,
  loadSessionById,
  saveSession as saveSessionHelper,
  deleteSession as deleteSessionHelper,
  addItemNote as addItemNoteHelper,
  removeItemNote as removeItemNoteHelper,
  updateGeneralNotes as updateGeneralNotesHelper,
  toggleItemSelection as toggleItemSelectionHelper,
  isItemSelected as isItemSelectedHelper,
  getSessionsSortedByDate
} from '../utils/sessionHelpers';
import {
  loadCurrentSessionId,
  saveCurrentSessionId,
  migrateDataIfNeeded,
  getStorageUsage
} from '../utils/storageManager';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  // Existing state
  const [activeTab, setActiveTab] = useState('discovery');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustries, setSelectedIndustries] = useState([]);
  const [selectedUseCases, setSelectedUseCases] = useState([]);
  const [selectedCompetitors, setSelectedCompetitors] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [expandedCard, setExpandedCard] = useState(null);

  // Session management state
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [currentSession, setCurrentSession] = useState(null);

  // UI state
  const [showNotesPanel, setShowNotesPanel] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [editingNoteItemId, setEditingNoteItemId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [showUseCasePanel, setShowUseCasePanel] = useState(false);
  const [selectedUseCaseId, setSelectedUseCaseId] = useState(null);
  const [allCardsCollapsed, setAllCardsCollapsed] = useState(false);

  // Auto-save debounce ref
  const autoSaveTimeoutRef = useRef(null);

  // Toast notification - defined early so other functions can use it
  const showToast = useCallback((message, type = 'info') => {
    setToastMessage({ message, type, id: Date.now() });
    setTimeout(() => setToastMessage(null), 3000);
  }, []);

  // Get filtered content based on active tab and filters
  const getFilteredContent = () => {
    let content = [];

    // Get base content for active tab
    if (activeTab === 'discovery') {
      content = discoveryData.questions;
    } else if (activeTab === 'differentiators') {
      // Flatten differentiators from all competitors
      content = [];
      Object.values(differentiatorsData.competitors).forEach(competitor => {
        competitor.differentiators.forEach(diff => {
          content.push({
            ...diff,
            competitorName: competitor.name,
            competitorId: Object.keys(differentiatorsData.competitors).find(
              key => differentiatorsData.competitors[key].name === competitor.name
            )
          });
        });
      });
    } else if (activeTab === 'objections') {
      content = objectionsData.objections;
    } else if (activeTab === 'usecases') {
      content = usecasesData.useCases;
    }

    // Apply industry filter (OR logic)
    if (selectedIndustries.length > 0 && (activeTab === 'discovery' || activeTab === 'usecases')) {
      content = content.filter(item => {
        if (item.industries.includes('all')) return true;
        return item.industries.some(ind => selectedIndustries.includes(ind));
      });
    }

    // Apply use case filter (OR logic)
    if (selectedUseCases.length > 0 && activeTab === 'discovery') {
      content = content.filter(item => {
        return item.useCases.some(uc => selectedUseCases.includes(uc));
      });
    }

    // Apply competitor filter (for differentiators)
    if (selectedCompetitors.length > 0 && activeTab === 'differentiators') {
      content = content.filter(item => {
        return selectedCompetitors.includes(item.competitorId);
      });
    }

    // Apply category filter (for discovery only - each tab has its own category taxonomy)
    if (selectedCategories.length > 0 && activeTab === 'discovery') {
      content = content.filter(item => {
        return selectedCategories.includes(item.category);
      });
    }

    // Apply search query (fuzzy search across all text fields)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      content = content.filter(item => {
        const searchableText = JSON.stringify(item).toLowerCase();
        return searchableText.includes(query);
      });
    }

    return content;
  };

  const clearFilters = () => {
    setSelectedIndustries([]);
    setSelectedUseCases([]);
    setSelectedCompetitors([]);
    setSelectedCategories([]);
    setSearchQuery('');
  };

  // Reset only tab-specific filters when tab changes (keep Industry, Competitors, and Categories global)
  useEffect(() => {
    // Clear tab-specific filters only (Industry, Competitors, and Categories persist globally)
    setSelectedUseCases([]);
    setSearchQuery('');
    setExpandedCard(null);
  }, [activeTab]);

  // Initialize sessions and migrate data on mount
  useEffect(() => {
    migrateDataIfNeeded();
    const loadedSessions = loadAllSessions();
    setSessions(loadedSessions);

    const savedSessionId = loadCurrentSessionId();
    if (savedSessionId) {
      const session = loadSessionById(savedSessionId);
      if (session) {
        setCurrentSessionId(savedSessionId);
        setCurrentSession(session);
      }
    }
  }, []);

  // Manual save function
  const saveSession = useCallback(() => {
    if (currentSession) {
      try {
        saveSessionHelper(currentSession);
        setSessions(loadAllSessions());

        // Check storage usage
        const usage = getStorageUsage();
        if (usage > 80) {
          showToast(`Saved! Storage: ${usage.toFixed(0)}%`, 'warning');
        } else {
          showToast('Session saved', 'success');
        }
      } catch (error) {
        showToast(`Save failed: ${error.message}`, 'error');
      }
    }
  }, [currentSession]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl/Cmd + S: Manual save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveSession();
      }

      // Ctrl/Cmd + N: New session
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        setShowSessionModal(true);
      }

      // Escape: Close modals and panels
      if (e.key === 'Escape') {
        if (showSessionModal) {
          setShowSessionModal(false);
        } else if (editingNoteItemId) {
          closeNoteModal();
        } else if (showExportModal) {
          setShowExportModal(false);
        } else if (showUseCasePanel) {
          setShowUseCasePanel(false);
        } else if (showNotesPanel) {
          setShowNotesPanel(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSession, showSessionModal, editingNoteItemId, showExportModal, showUseCasePanel, showNotesPanel]);

  // Auto-save current session with debounce (300ms)
  const autoSaveSession = useCallback(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    autoSaveTimeoutRef.current = setTimeout(() => {
      if (currentSession) {
        try {
          setIsAutoSaving(true);
          saveSessionHelper(currentSession);
          // Update sessions list
          setSessions(loadAllSessions());

          // Check storage usage
          const usage = getStorageUsage();
          if (usage > 80) {
            showToast(`Storage usage: ${usage.toFixed(0)}%. Consider deleting old sessions.`, 'warning');
          }
        } catch (error) {
          showToast(`Auto-save failed: ${error.message}`, 'error');
        } finally {
          setTimeout(() => setIsAutoSaving(false), 500);
        }
      }
    }, 300);
  }, [currentSession]);

  // Auto-save disabled - use manual save (Ctrl/Cmd+S) or save button
  // useEffect(() => {
  //   if (currentSession) {
  //     autoSaveSession();
  //   }
  // }, [currentSession, autoSaveSession]);

  // Session management methods
  const createSession = useCallback((name, metadata) => {
    try {
      const newSession = createSessionHelper(name, metadata);
      const saved = saveSessionHelper(newSession);
      setSessions(loadAllSessions());
      setCurrentSessionId(saved.id);
      setCurrentSession(saved);
      saveCurrentSessionId(saved.id);
      showToast('Session created successfully', 'success');
      return saved;
    } catch (error) {
      showToast(`Failed to create session: ${error.message}`, 'error');
      throw error;
    }
  }, []);

  const loadSession = useCallback((sessionId) => {
    try {
      const session = loadSessionById(sessionId);
      if (session) {
        setCurrentSessionId(sessionId);
        setCurrentSession(session);
        saveCurrentSessionId(sessionId);
        showToast(`Loaded: ${session.name}`, 'success');
      }
    } catch (error) {
      showToast(`Failed to load session: ${error.message}`, 'error');
    }
  }, []);

  const updateSession = useCallback((updates) => {
    if (!currentSession) return;

    try {
      const updated = {
        ...currentSession,
        ...updates,
        updatedAt: new Date().toISOString()
      };
      setCurrentSession(updated);
    } catch (error) {
      showToast(`Failed to update session: ${error.message}`, 'error');
    }
  }, [currentSession]);

  const deleteSession = useCallback((sessionId) => {
    try {
      deleteSessionHelper(sessionId);
      setSessions(loadAllSessions());

      if (currentSessionId === sessionId) {
        // If deleting current session, switch to next available or clear
        const remaining = loadAllSessions();
        if (remaining.length > 0) {
          loadSession(remaining[0].id);
        } else {
          setCurrentSessionId(null);
          setCurrentSession(null);
          saveCurrentSessionId(null);
        }
      }

      showToast('Session deleted', 'success');
    } catch (error) {
      showToast(`Failed to delete session: ${error.message}`, 'error');
    }
  }, [currentSessionId, loadSession]);

  // Note management methods
  const addItemNote = useCallback((itemId, content) => {
    if (!currentSession) return;

    try {
      const now = new Date().toISOString();
      const updated = {
        ...currentSession,
        notes: {
          ...currentSession.notes,
          items: {
            ...currentSession.notes.items,
            [itemId]: {
              content: content.trim(),
              timestamp: currentSession.notes.items[itemId]?.timestamp || now,
              lastModified: now
            }
          }
        }
      };
      setCurrentSession(updated);
    } catch (error) {
      showToast(`Failed to save note: ${error.message}`, 'error');
    }
  }, [currentSession]);

  const removeItemNote = useCallback((itemId) => {
    if (!currentSession) return;

    try {
      const updated = { ...currentSession };
      delete updated.notes.items[itemId];
      setCurrentSession(updated);
    } catch (error) {
      showToast(`Failed to remove note: ${error.message}`, 'error');
    }
  }, [currentSession]);

  const updateGeneralNotes = useCallback((content) => {
    if (!currentSession) return;

    try {
      const updated = {
        ...currentSession,
        notes: {
          ...currentSession.notes,
          general: content
        }
      };
      setCurrentSession(updated);
    } catch (error) {
      showToast(`Failed to update notes: ${error.message}`, 'error');
    }
  }, [currentSession]);

  // Use case documentation methods
  const getUseCaseDocumentation = useCallback((useCaseId) => {
    if (!currentSession) return null;
    if (!currentSession.useCaseDocumentation) return null;
    return currentSession.useCaseDocumentation[useCaseId] || null;
  }, [currentSession]);

  const updateUseCaseDocumentation = useCallback((useCaseId, updates) => {
    try {
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

        // Deep merge structured fields so concurrent effect updates don't overwrite each other
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
            [useCaseId]: {
              ...existingDoc,
              ...updates,
              structured: mergedStructured
            }
          },
          updatedAt: new Date().toISOString()
        };
      });
    } catch (error) {
      showToast(`Failed to update documentation: ${error.message}`, 'error');
    }
  }, [showToast]);

  const getItemNote = useCallback((itemId) => {
    if (!currentSession) return null;
    return currentSession.notes.items[itemId] || null;
  }, [currentSession]);

  // Item selection methods
  const toggleItemSelection = useCallback((itemId) => {
    if (!currentSession) return;

    try {
      const category = activeTab; // discovery, differentiators, or objections
      const currentSelections = currentSession.selectedItems[category] || [];
      const index = currentSelections.indexOf(itemId);

      const updated = {
        ...currentSession,
        selectedItems: {
          ...currentSession.selectedItems,
          [category]: index >= 0
            ? currentSelections.filter(id => id !== itemId)
            : [...currentSelections, itemId]
        }
      };

      setCurrentSession(updated);
    } catch (error) {
      showToast(`Failed to toggle selection: ${error.message}`, 'error');
    }
  }, [currentSession, activeTab]);

  const isItemSelected = useCallback((itemId) => {
    if (!currentSession) return false;
    const category = activeTab;
    return currentSession.selectedItems[category]?.includes(itemId) || false;
  }, [currentSession, activeTab]);

  // Note modal methods
  const openNoteModal = useCallback((itemId) => {
    setEditingNoteItemId(itemId);
  }, []);

  const closeNoteModal = useCallback(() => {
    setEditingNoteItemId(null);
  }, []);

  const value = {
    // Existing state and methods
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    selectedIndustries,
    setSelectedIndustries,
    selectedUseCases,
    setSelectedUseCases,
    selectedCompetitors,
    setSelectedCompetitors,
    selectedCategories,
    setSelectedCategories,
    expandedCard,
    setExpandedCard,
    clearFilters,
    filteredContent: getFilteredContent(),
    categories: categoriesData,

    // Session management
    sessions,
    currentSessionId,
    currentSession,
    createSession,
    loadSession,
    updateSession,
    deleteSession,
    saveSession,

    // Note management
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
    showExportModal,
    setShowExportModal,
    editingNoteItemId,
    openNoteModal,
    closeNoteModal,
    toastMessage,
    showToast,
    isAutoSaving,
    showUseCasePanel,
    setShowUseCasePanel,
    selectedUseCaseId,
    setSelectedUseCaseId,
    allCardsCollapsed,
    setAllCardsCollapsed
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
