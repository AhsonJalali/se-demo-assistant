import { describe, it, expect, beforeEach } from 'vitest';
import {
  isStorageAvailable,
  saveSessions,
  loadSessions,
  saveCurrentSessionId,
  loadCurrentSessionId,
  saveAppVersion,
  getStoredAppVersion,
  clearAllData,
  migrateDataIfNeeded,
} from './storageManager';

beforeEach(() => {
  localStorage.clear();
});

describe('isStorageAvailable', () => {
  it('returns true when localStorage works', () => {
    expect(isStorageAvailable()).toBe(true);
  });
});

describe('saveSessions / loadSessions', () => {
  it('round-trips an array of sessions', () => {
    const sessions = [{ id: 'a', name: 'One' }, { id: 'b', name: 'Two' }];
    saveSessions(sessions);
    expect(loadSessions()).toEqual(sessions);
  });

  it('returns an empty array when nothing has been saved', () => {
    expect(loadSessions()).toEqual([]);
  });

  it('clears and returns an empty array for corrupted JSON', () => {
    localStorage.setItem('ts-demo-sessions', '{not valid json');
    expect(loadSessions()).toEqual([]);
    expect(localStorage.getItem('ts-demo-sessions')).toBeNull();
  });

  it('returns an empty array when stored data is not an array', () => {
    localStorage.setItem('ts-demo-sessions', JSON.stringify({ foo: 'bar' }));
    expect(loadSessions()).toEqual([]);
  });
});

describe('saveCurrentSessionId / loadCurrentSessionId', () => {
  it('round-trips a session id', () => {
    saveCurrentSessionId('session-123');
    expect(loadCurrentSessionId()).toBe('session-123');
  });

  it('clears the stored id when saving null', () => {
    saveCurrentSessionId('session-123');
    saveCurrentSessionId(null);
    expect(loadCurrentSessionId()).toBeNull();
  });
});

describe('app version', () => {
  it('has no stored version before saveAppVersion is called', () => {
    expect(getStoredAppVersion()).toBeNull();
  });

  it('stores the current app version', () => {
    saveAppVersion();
    expect(getStoredAppVersion()).toBe('1.1.0');
  });
});

describe('clearAllData', () => {
  it('removes sessions, current session id, and app version', () => {
    saveSessions([{ id: 'a' }]);
    saveCurrentSessionId('a');
    saveAppVersion();

    clearAllData();

    expect(loadSessions()).toEqual([]);
    expect(loadCurrentSessionId()).toBeNull();
    expect(getStoredAppVersion()).toBeNull();
  });
});

describe('migrateDataIfNeeded', () => {
  it('sets the app version on first run', () => {
    migrateDataIfNeeded();
    expect(getStoredAppVersion()).toBe('1.1.0');
  });

  it('leaves the stored version untouched when already current', () => {
    saveAppVersion();
    migrateDataIfNeeded();
    expect(getStoredAppVersion()).toBe('1.1.0');
  });

  it('bumps an older stored version up to current', () => {
    localStorage.setItem('ts-demo-app-version', '0.9.0');
    migrateDataIfNeeded();
    expect(getStoredAppVersion()).toBe('1.1.0');
  });
});
