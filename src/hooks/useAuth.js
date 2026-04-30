import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'ts_auth_token';

export function getToken() {
  return sessionStorage.getItem(STORAGE_KEY);
}

export function clearToken() {
  sessionStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new CustomEvent('ts:auth:logout'));
}

export function useAuth() {
  const [token, setToken] = useState(() => sessionStorage.getItem(STORAGE_KEY));

  useEffect(() => {
    const handler = () => setToken(null);
    window.addEventListener('ts:auth:logout', handler);
    return () => window.removeEventListener('ts:auth:logout', handler);
  }, []);

  const login = useCallback(async (username, password) => {
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (res.status === 401) throw new Error('INVALID_CREDENTIALS');
    if (res.status === 503) throw new Error('AUTH_NOT_CONFIGURED');
    if (!res.ok) throw new Error('AUTH_ERROR');

    const { token: newToken } = await res.json();
    sessionStorage.setItem(STORAGE_KEY, newToken);
    setToken(newToken);
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY);
    setToken(null);
  }, []);

  return { token, login, logout, isAuthenticated: !!token };
}
