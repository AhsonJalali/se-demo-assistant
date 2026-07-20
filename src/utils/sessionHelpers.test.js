import { describe, it, expect, beforeEach } from 'vitest';
import {
  createSession,
  loadAllSessions,
  loadSessionById,
  getCurrentSession,
  saveSession,
  deleteSession,
  updateSessionMetadata,
  addItemNote,
  removeItemNote,
  updateGeneralNotes,
  toggleItemSelection,
  getAllSelectedItems,
  isItemSelected,
  getSessionsSortedByDate,
  validateSessionName,
  formatSessionDisplay,
  normalizeSession,
} from './sessionHelpers';

beforeEach(() => {
  localStorage.clear();
});

describe('createSession', () => {
  it('fills in defaults for name and metadata', () => {
    const session = createSession();
    expect(session.name).toBe('New Session');
    expect(session.metadata.dealStage).toBe('Discovery');
    expect(session.selectedItems).toEqual({
      discovery: [],
      usecases: [],
      differentiators: [],
      objections: [],
    });
    expect(session.id).toBeTruthy();
  });

  it('trims the name and falls back when blank', () => {
    expect(createSession('  Acme Corp  ').name).toBe('Acme Corp');
    expect(createSession('   ').name).toBe('New Session');
  });

  it('honors provided metadata overrides', () => {
    const session = createSession('Acme', { dealStage: 'POV', industries: ['fintech'] });
    expect(session.metadata.dealStage).toBe('POV');
    expect(session.metadata.industries).toEqual(['fintech']);
  });
});

describe('saveSession / loadSessionById / loadAllSessions', () => {
  it('adds a new session and can load it back by id', () => {
    const session = createSession('Acme');
    saveSession(session);

    expect(loadAllSessions()).toHaveLength(1);
    expect(loadSessionById(session.id).name).toBe('Acme');
  });

  it('updates an existing session in place rather than duplicating it', () => {
    const session = createSession('Acme');
    saveSession(session);

    session.name = 'Acme Renamed';
    saveSession(session);

    const all = loadAllSessions();
    expect(all).toHaveLength(1);
    expect(all[0].name).toBe('Acme Renamed');
  });

  it('sets updatedAt to a fresh ISO timestamp no earlier than createdAt', () => {
    const session = createSession('Acme');
    saveSession(session);
    expect(new Date(session.updatedAt).getTime()).toBeGreaterThanOrEqual(new Date(session.createdAt).getTime());
    expect(session.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('throws for a session without an id', () => {
    expect(() => saveSession({ name: 'no id' })).toThrow('Invalid session object');
  });

  it('returns null for an id that does not exist', () => {
    expect(loadSessionById('missing')).toBeNull();
  });
});

describe('getCurrentSession', () => {
  it('returns null when no current session id is set', () => {
    expect(getCurrentSession()).toBeNull();
  });

  it('returns the session matching the stored current id', () => {
    const session = createSession('Acme');
    saveSession(session);
    saveCurrentIdFor(session.id);
    expect(getCurrentSession().id).toBe(session.id);
  });
});

// Small local helper so this test file doesn't need to import storageManager directly.
function saveCurrentIdFor(id) {
  localStorage.setItem('ts-demo-current-session', id);
}

describe('deleteSession', () => {
  it('removes the session and returns true', () => {
    const session = createSession('Acme');
    saveSession(session);

    expect(deleteSession(session.id)).toBe(true);
    expect(loadAllSessions()).toHaveLength(0);
  });

  it('returns false when the session does not exist', () => {
    expect(deleteSession('missing')).toBe(false);
  });

  it('clears the current session id when the deleted session was active', () => {
    const session = createSession('Acme');
    saveSession(session);
    saveCurrentIdFor(session.id);

    deleteSession(session.id);

    expect(getCurrentSession()).toBeNull();
  });
});

describe('updateSessionMetadata', () => {
  it('merges new metadata into the existing session', () => {
    const session = createSession('Acme', { dealStage: 'Discovery' });
    saveSession(session);

    updateSessionMetadata(session.id, { dealStage: 'POV' });

    const updated = loadSessionById(session.id);
    expect(updated.metadata.dealStage).toBe('POV');
    expect(updated.metadata.demoDate).toBe(session.metadata.demoDate);
  });

  it('throws for a session that does not exist', () => {
    expect(() => updateSessionMetadata('missing', {})).toThrow('Session not found');
  });
});

describe('addItemNote / removeItemNote', () => {
  it('adds a trimmed note and updates it on a second call', () => {
    const session = createSession('Acme');
    saveSession(session);

    addItemNote(session.id, 'item-1', '  hello  ');
    let updated = loadSessionById(session.id);
    expect(updated.notes.items['item-1'].content).toBe('hello');
    const firstTimestamp = updated.notes.items['item-1'].timestamp;

    addItemNote(session.id, 'item-1', 'hello again');
    updated = loadSessionById(session.id);
    expect(updated.notes.items['item-1'].content).toBe('hello again');
    expect(updated.notes.items['item-1'].timestamp).toBe(firstTimestamp);
  });

  it('removes a note from an item', () => {
    const session = createSession('Acme');
    saveSession(session);
    addItemNote(session.id, 'item-1', 'hello');

    removeItemNote(session.id, 'item-1');

    expect(loadSessionById(session.id).notes.items['item-1']).toBeUndefined();
  });
});

describe('updateGeneralNotes', () => {
  it('sets the general notes field', () => {
    const session = createSession('Acme');
    saveSession(session);

    updateGeneralNotes(session.id, 'General thoughts');

    expect(loadSessionById(session.id).notes.general).toBe('General thoughts');
  });
});

describe('toggleItemSelection / getAllSelectedItems / isItemSelected', () => {
  it('adds then removes an item from a category on repeated toggles', () => {
    const session = createSession('Acme');
    saveSession(session);

    toggleItemSelection(session.id, 'discovery', 'q1');
    let updated = loadSessionById(session.id);
    expect(isItemSelected(updated, 'discovery', 'q1')).toBe(true);
    expect(getAllSelectedItems(updated)).toEqual(['q1']);

    toggleItemSelection(session.id, 'discovery', 'q1');
    updated = loadSessionById(session.id);
    expect(isItemSelected(updated, 'discovery', 'q1')).toBe(false);
    expect(getAllSelectedItems(updated)).toEqual([]);
  });

  it('getAllSelectedItems returns [] for a session without selections', () => {
    expect(getAllSelectedItems(null)).toEqual([]);
    expect(getAllSelectedItems({})).toEqual([]);
  });

  it('isItemSelected returns false for an unknown category', () => {
    const session = createSession('Acme');
    expect(isItemSelected(session, 'nonexistent', 'x')).toBe(false);
  });
});

describe('getSessionsSortedByDate', () => {
  it('sorts sessions by updatedAt descending', () => {
    const older = createSession('Older');
    older.updatedAt = '2026-01-01T00:00:00.000Z';
    const newer = createSession('Newer');
    newer.updatedAt = '2026-06-01T00:00:00.000Z';

    saveSessions([older, newer]);

    const sorted = getSessionsSortedByDate();
    expect(sorted.map(s => s.name)).toEqual(['Newer', 'Older']);
  });
});

function saveSessions(sessions) {
  localStorage.setItem('ts-demo-sessions', JSON.stringify(sessions));
}

describe('validateSessionName', () => {
  it('rejects empty or whitespace-only names', () => {
    expect(validateSessionName('')).toBe('Session name is required');
    expect(validateSessionName('   ')).toBe('Session name is required');
  });

  it('rejects names over 100 characters', () => {
    expect(validateSessionName('a'.repeat(101))).toBe('Session name must be 100 characters or less');
  });

  it('accepts a normal name', () => {
    expect(validateSessionName('Acme Corp')).toBeNull();
  });
});

describe('formatSessionDisplay', () => {
  it('returns null for a null session', () => {
    expect(formatSessionDisplay(null)).toBeNull();
  });

  it('computes note count, general notes flag, and selected count', () => {
    const session = createSession('Acme');
    session.notes.items['item-1'] = { content: 'note', timestamp: session.createdAt, lastModified: session.createdAt };
    session.notes.general = 'general notes';
    session.selectedItems.discovery = ['q1', 'q2'];

    const display = formatSessionDisplay(session);

    expect(display.displayInfo.noteCount).toBe(1);
    expect(display.displayInfo.hasGeneralNotes).toBe(true);
    expect(display.displayInfo.selectedCount).toBe(2);
  });
});

describe('normalizeSession', () => {
  it('moves a legacy why-thoughtspot answer to why-us', () => {
    const s = normalizeSession({ id: 'x', name: 'Old', threeWhys: { 'why-change': 'a', 'why-thoughtspot': 'legacy' } });
    expect(s.threeWhys['why-us']).toBe('legacy');
    expect(s.threeWhys).not.toHaveProperty('why-thoughtspot');
    expect(s.threeWhys['why-change']).toBe('a');
  });

  it('keeps an existing why-us answer over the legacy key', () => {
    const s = normalizeSession({ id: 'x', name: 'Old', threeWhys: { 'why-us': 'new', 'why-thoughtspot': 'legacy' } });
    expect(s.threeWhys['why-us']).toBe('new');
  });

  it('fills in missing structures so the UI can rely on them', () => {
    const s = normalizeSession({ id: 'x', name: 'Bare' });
    expect(s.notes).toEqual({ items: {}, general: '' });
    expect(s.selectedItems).toEqual({ discovery: [], usecases: [], differentiators: [], objections: [] });
    expect(s.metadata.dealStage).toBe('Discovery');
    expect(s.useCaseDocumentation).toEqual({});
  });
});
