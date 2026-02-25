/**
 * Storage Manager - Handles localStorage operations for session persistence
 * Includes error handling for quota exceeded and corrupted data
 */

const STORAGE_KEYS = {
  SESSIONS: 'ts-demo-sessions',
  CURRENT_SESSION: 'ts-demo-current-session',
  APP_VERSION: 'ts-demo-app-version'
};

const APP_VERSION = '1.1.0';

/**
 * Check if localStorage is available and working
 */
export const isStorageAvailable = () => {
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Get current storage usage percentage (approximate)
 */
export const getStorageUsage = () => {
  if (!isStorageAvailable()) return 0;

  try {
    let total = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length + key.length;
      }
    }
    // Approximate quota (5MB = 5 * 1024 * 1024 characters)
    const quota = 5 * 1024 * 1024;
    return (total / quota) * 100;
  } catch (e) {
    console.error('Error calculating storage usage:', e);
    return 0;
  }
};

/**
 * Save sessions array to localStorage
 */
export const saveSessions = (sessions) => {
  if (!isStorageAvailable()) {
    throw new Error('localStorage is not available');
  }

  try {
    const usage = getStorageUsage();
    if (usage > 80) {
      console.warn(`Storage usage is at ${usage.toFixed(1)}%`);
    }

    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
    return true;
  } catch (e) {
    if (e.name === 'QuotaExceededError') {
      throw new Error('Storage quota exceeded. Consider deleting old sessions.');
    }
    throw new Error(`Failed to save sessions: ${e.message}`);
  }
};

/**
 * Load sessions array from localStorage
 */
export const loadSessions = () => {
  if (!isStorageAvailable()) {
    return [];
  }

  try {
    const data = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    if (!data) return [];

    const sessions = JSON.parse(data);
    return Array.isArray(sessions) ? sessions : [];
  } catch (e) {
    console.error('Failed to load sessions:', e);
    // Corrupted data - clear it
    try {
      localStorage.removeItem(STORAGE_KEYS.SESSIONS);
    } catch (clearError) {
      console.error('Failed to clear corrupted sessions:', clearError);
    }
    return [];
  }
};

/**
 * Save current session ID
 */
export const saveCurrentSessionId = (sessionId) => {
  if (!isStorageAvailable()) {
    throw new Error('localStorage is not available');
  }

  try {
    if (sessionId) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, sessionId);
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
    }
    return true;
  } catch (e) {
    throw new Error(`Failed to save current session ID: ${e.message}`);
  }
};

/**
 * Load current session ID
 */
export const loadCurrentSessionId = () => {
  if (!isStorageAvailable()) {
    return null;
  }

  try {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_SESSION);
  } catch (e) {
    console.error('Failed to load current session ID:', e);
    return null;
  }
};

/**
 * Save app version for future migrations
 */
export const saveAppVersion = () => {
  if (!isStorageAvailable()) return;

  try {
    localStorage.setItem(STORAGE_KEYS.APP_VERSION, APP_VERSION);
  } catch (e) {
    console.error('Failed to save app version:', e);
  }
};

/**
 * Get app version from storage
 */
export const getStoredAppVersion = () => {
  if (!isStorageAvailable()) return null;

  try {
    return localStorage.getItem(STORAGE_KEYS.APP_VERSION);
  } catch (e) {
    console.error('Failed to get app version:', e);
    return null;
  }
};

/**
 * Clear all app data from localStorage
 */
export const clearAllData = () => {
  if (!isStorageAvailable()) return;

  try {
    localStorage.removeItem(STORAGE_KEYS.SESSIONS);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
    localStorage.removeItem(STORAGE_KEYS.APP_VERSION);
  } catch (e) {
    console.error('Failed to clear data:', e);
  }
};

/**
 * Migrate data from old version to new version if needed
 */
export const migrateDataIfNeeded = () => {
  const storedVersion = getStoredAppVersion();

  if (!storedVersion) {
    // First time or no previous version
    saveAppVersion();
    return;
  }

  if (storedVersion === APP_VERSION) {
    // Already on current version
    return;
  }

  // Add migration logic here for future versions
  console.log(`Migrating from version ${storedVersion} to ${APP_VERSION}`);

  // Save new version
  saveAppVersion();
};
