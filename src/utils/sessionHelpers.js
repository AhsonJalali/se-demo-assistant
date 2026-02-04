/**
 * Session Helpers - Business logic for session operations
 * Handles session CRUD operations and data transformations
 */

import { v4 as uuidv4 } from 'uuid';
import { saveSessions, loadSessions, saveCurrentSessionId, loadCurrentSessionId } from './storageManager';

/**
 * Create a new session with default values
 */
export const createSession = (name = 'New Session', metadata = {}) => {
  const now = new Date().toISOString();

  return {
    id: uuidv4(),
    name: name.trim() || 'New Session',
    metadata: {
      demoDate: metadata.demoDate || now,
      dealStage: metadata.dealStage || 'Discovery',
      industries: metadata.industries || [],
      useCases: metadata.useCases || []
    },
    notes: {
      items: {}, // { [itemId]: { content, timestamp, lastModified } }
      general: ''
    },
    selectedItems: {
      discovery: [],
      usecases: [],
      differentiators: [],
      objections: []
    },
    threeWhys: {
      'why-change': '',
      'why-now': '',
      'why-thoughtspot': ''
    },
    // NEW: Use case documentation
    useCaseDocumentation: {},
    createdAt: now,
    updatedAt: now
  };
};

/**
 * Load all sessions from storage
 */
export const loadAllSessions = () => {
  try {
    return loadSessions();
  } catch (e) {
    console.error('Error loading sessions:', e);
    return [];
  }
};

/**
 * Load a specific session by ID
 */
export const loadSessionById = (sessionId, sessions = null) => {
  const allSessions = sessions || loadAllSessions();
  return allSessions.find(s => s.id === sessionId) || null;
};

/**
 * Get the current active session
 */
export const getCurrentSession = () => {
  const currentId = loadCurrentSessionId();
  if (!currentId) return null;

  return loadSessionById(currentId);
};

/**
 * Save a session (create or update)
 */
export const saveSession = (session) => {
  if (!session || !session.id) {
    throw new Error('Invalid session object');
  }

  const allSessions = loadAllSessions();
  const existingIndex = allSessions.findIndex(s => s.id === session.id);

  // Update timestamp
  session.updatedAt = new Date().toISOString();

  if (existingIndex >= 0) {
    // Update existing session
    allSessions[existingIndex] = session;
  } else {
    // Add new session
    allSessions.push(session);
  }

  saveSessions(allSessions);
  return session;
};

/**
 * Delete a session by ID
 */
export const deleteSession = (sessionId) => {
  const allSessions = loadAllSessions();
  const filtered = allSessions.filter(s => s.id !== sessionId);

  if (filtered.length === allSessions.length) {
    // Session not found
    return false;
  }

  saveSessions(filtered);

  // If this was the current session, clear it
  const currentId = loadCurrentSessionId();
  if (currentId === sessionId) {
    saveCurrentSessionId(null);
  }

  return true;
};

/**
 * Update session metadata
 */
export const updateSessionMetadata = (sessionId, metadata) => {
  const session = loadSessionById(sessionId);
  if (!session) {
    throw new Error('Session not found');
  }

  session.metadata = {
    ...session.metadata,
    ...metadata
  };

  return saveSession(session);
};

/**
 * Add or update a note on an item
 */
export const addItemNote = (sessionId, itemId, content) => {
  const session = loadSessionById(sessionId);
  if (!session) {
    throw new Error('Session not found');
  }

  const now = new Date().toISOString();

  if (!session.notes.items[itemId]) {
    // New note
    session.notes.items[itemId] = {
      content: content.trim(),
      timestamp: now,
      lastModified: now
    };
  } else {
    // Update existing note
    session.notes.items[itemId].content = content.trim();
    session.notes.items[itemId].lastModified = now;
  }

  return saveSession(session);
};

/**
 * Remove a note from an item
 */
export const removeItemNote = (sessionId, itemId) => {
  const session = loadSessionById(sessionId);
  if (!session) {
    throw new Error('Session not found');
  }

  delete session.notes.items[itemId];
  return saveSession(session);
};

/**
 * Update general notes
 */
export const updateGeneralNotes = (sessionId, content) => {
  const session = loadSessionById(sessionId);
  if (!session) {
    throw new Error('Session not found');
  }

  session.notes.general = content;
  return saveSession(session);
};

/**
 * Toggle item selection
 */
export const toggleItemSelection = (sessionId, category, itemId) => {
  const session = loadSessionById(sessionId);
  if (!session) {
    throw new Error('Session not found');
  }

  if (!session.selectedItems[category]) {
    session.selectedItems[category] = [];
  }

  const index = session.selectedItems[category].indexOf(itemId);
  if (index >= 0) {
    // Remove selection
    session.selectedItems[category].splice(index, 1);
  } else {
    // Add selection
    session.selectedItems[category].push(itemId);
  }

  return saveSession(session);
};

/**
 * Get all selected items across all categories
 */
export const getAllSelectedItems = (session) => {
  if (!session || !session.selectedItems) return [];

  const items = [];
  Object.values(session.selectedItems).forEach(categoryItems => {
    items.push(...categoryItems);
  });

  return items;
};

/**
 * Check if an item is selected
 */
export const isItemSelected = (session, category, itemId) => {
  if (!session || !session.selectedItems || !session.selectedItems[category]) {
    return false;
  }

  return session.selectedItems[category].includes(itemId);
};

/**
 * Get sessions sorted by most recently updated
 */
export const getSessionsSortedByDate = () => {
  const sessions = loadAllSessions();
  return sessions.sort((a, b) => {
    return new Date(b.updatedAt) - new Date(a.updatedAt);
  });
};

/**
 * Validate session name
 */
export const validateSessionName = (name) => {
  if (!name || name.trim().length === 0) {
    return 'Session name is required';
  }

  if (name.trim().length > 100) {
    return 'Session name must be 100 characters or less';
  }

  return null;
};

/**
 * Format session for display
 */
export const formatSessionDisplay = (session) => {
  if (!session) return null;

  const noteCount = Object.keys(session.notes.items).length;
  const hasGeneralNotes = session.notes.general && session.notes.general.trim().length > 0;
  const selectedCount = getAllSelectedItems(session).length;

  return {
    ...session,
    displayInfo: {
      noteCount,
      hasGeneralNotes,
      selectedCount,
      formattedDate: new Date(session.metadata.demoDate).toLocaleDateString(),
      lastUpdated: new Date(session.updatedAt).toLocaleString()
    }
  };
};
