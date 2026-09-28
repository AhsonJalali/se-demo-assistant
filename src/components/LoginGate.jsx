import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import Icon from './ui/Icon';

export default function LoginGate({ children }) {
  const { isAuthenticated, login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Skip auth in local dev unless VITE_FORCE_AUTH=true is set in .env
  if ((import.meta.env.DEV && !import.meta.env.VITE_FORCE_AUTH) || isAuthenticated) return children;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
    } catch (err) {
      switch (err.message) {
        case 'INVALID_CREDENTIALS':
          setError('Incorrect username or password.');
          break;
        case 'AUTH_NOT_CONFIGURED':
          setError('Authentication is not configured on the server. Contact your administrator.');
          break;
        default:
          setError('Unable to sign in. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2.5 justify-center mb-6">
          <div className="w-8 h-8 rounded-lg bg-accent text-accent-fg flex items-center justify-center">
            <Icon name="layers" size={16} />
          </div>
          <span className="text-[15px] font-semibold text-fg">Demo Assistant</span>
        </div>

        <div className="panel p-6 sm:p-8 shadow-pop">
          <h1 className="text-base font-semibold text-fg">Sign in</h1>
          <p className="text-sm text-fg-2 mt-1 mb-6">Use the credentials your admin shared with you.</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="login-user" className="label">Username</label>
              <input
                id="login-user"
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                autoFocus
                autoComplete="username"
                className="field"
              />
            </div>
            <div>
              <label htmlFor="login-pass" className="label">Password</label>
              <input
                id="login-pass"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="field"
              />
            </div>

            {error && (
              <p role="alert" className="text-[13px] text-danger bg-danger-soft rounded-lg px-3 py-2">{error}</p>
            )}

            <button type="submit" disabled={loading || !username || !password} className="btn btn-primary w-full btn-lg">
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
