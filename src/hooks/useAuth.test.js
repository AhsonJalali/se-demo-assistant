import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { useAuth, getToken, clearToken } from './useAuth';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const STORAGE_KEY = 'ts_auth_token';

function renderHook(callback) {
  const result = { current: undefined };
  function TestComponent() {
    result.current = callback();
    return null;
  }
  const container = document.createElement('div');
  let root;
  act(() => {
    root = createRoot(container);
    root.render(React.createElement(TestComponent));
  });
  return { result, unmount: () => act(() => root.unmount()) };
}

beforeEach(() => {
  sessionStorage.clear();
});

describe('getToken / clearToken', () => {
  it('getToken returns null when nothing is stored', () => {
    expect(getToken()).toBeNull();
  });

  it('getToken returns the stored token', () => {
    sessionStorage.setItem(STORAGE_KEY, 'abc123');
    expect(getToken()).toBe('abc123');
  });

  it('clearToken removes the token and dispatches ts:auth:logout', () => {
    sessionStorage.setItem(STORAGE_KEY, 'abc123');
    const handler = vi.fn();
    window.addEventListener('ts:auth:logout', handler);
    clearToken();
    expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull();
    expect(handler).toHaveBeenCalledTimes(1);
    window.removeEventListener('ts:auth:logout', handler);
  });
});

describe('useAuth', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('starts unauthenticated when nothing is stored', () => {
    const { result, unmount } = renderHook(() => useAuth());
    expect(result.current.token).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    unmount();
  });

  it('reads an existing token from sessionStorage on mount', () => {
    sessionStorage.setItem(STORAGE_KEY, 'existing-token');
    const { result, unmount } = renderHook(() => useAuth());
    expect(result.current.token).toBe('existing-token');
    expect(result.current.isAuthenticated).toBe(true);
    unmount();
  });

  it('login posts credentials and stores the returned token on success', async () => {
    fetch.mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ token: 'new-token' }) });
    const { result, unmount } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login('alice', 'secret');
    });

    expect(fetch).toHaveBeenCalledWith('/api/auth', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ username: 'alice', password: 'secret' }),
    });
    expect(sessionStorage.getItem(STORAGE_KEY)).toBe('new-token');
    expect(result.current.token).toBe('new-token');
    expect(result.current.isAuthenticated).toBe(true);
    unmount();
  });

  it('login throws INVALID_CREDENTIALS on 401 and stores nothing', async () => {
    fetch.mockResolvedValueOnce({ ok: false, status: 401, json: async () => ({}) });
    const { result, unmount } = renderHook(() => useAuth());

    await expect(
      act(async () => {
        await result.current.login('alice', 'wrong');
      })
    ).rejects.toThrow('INVALID_CREDENTIALS');
    expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    unmount();
  });

  it('login throws AUTH_NOT_CONFIGURED on 503', async () => {
    fetch.mockResolvedValueOnce({ ok: false, status: 503, json: async () => ({}) });
    const { result, unmount } = renderHook(() => useAuth());

    await expect(
      act(async () => {
        await result.current.login('alice', 'secret');
      })
    ).rejects.toThrow('AUTH_NOT_CONFIGURED');
    unmount();
  });

  it('login throws a generic AUTH_ERROR for any other non-ok status', async () => {
    fetch.mockResolvedValueOnce({ ok: false, status: 500, json: async () => ({}) });
    const { result, unmount } = renderHook(() => useAuth());

    await expect(
      act(async () => {
        await result.current.login('alice', 'secret');
      })
    ).rejects.toThrow('AUTH_ERROR');
    unmount();
  });

  it('logout clears the token from state and storage', async () => {
    fetch.mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ token: 'tok' }) });
    const { result, unmount } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login('alice', 'secret');
    });
    act(() => {
      result.current.logout();
    });

    expect(result.current.token).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull();
    unmount();
  });

  it('clears its token when a ts:auth:logout event fires elsewhere (e.g. via clearToken)', () => {
    sessionStorage.setItem(STORAGE_KEY, 'existing-token');
    const { result, unmount } = renderHook(() => useAuth());
    expect(result.current.isAuthenticated).toBe(true);

    act(() => {
      clearToken();
    });

    expect(result.current.token).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    unmount();
  });
});
