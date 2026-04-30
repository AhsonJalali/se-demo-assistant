import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

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
    <div className="min-h-screen bg-[#08062B] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-3 justify-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00D2FF] to-[#0099CC] flex items-center justify-center shadow-lg shadow-[#00D2FF]/20">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-[#08062B]">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="currentColor" fillOpacity="0.3"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <div className="text-xl font-bold text-[#00D2FF]" style={{ fontFamily: "'Geist', sans-serif" }}>
              ThoughtSpot
            </div>
            <div className="text-xs text-[#6B7280] font-medium tracking-wide uppercase">
              SE Demo Assistant
            </div>
          </div>
        </div>

        {/* Card */}
        <div className="bg-[#0D0B3A] border border-[#1B1B61] rounded-2xl p-8 shadow-2xl shadow-black/40">
          <h2 className="text-lg font-semibold text-[#e8eaf0] mb-6 text-center">Sign in</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-medium text-[#9CA3AF] mb-1.5">Username</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                autoFocus
                autoComplete="username"
                className="w-full px-4 py-2.5 bg-[#08062B] border border-[#1B1B61] rounded-xl text-[#e8eaf0] text-sm
                         focus:outline-none focus:ring-2 focus:ring-[#00D2FF]/40 focus:border-[#00D2FF]/60
                         placeholder-[#4B5563] transition-all duration-200"
                placeholder="Enter username"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#9CA3AF] mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full px-4 py-2.5 bg-[#08062B] border border-[#1B1B61] rounded-xl text-[#e8eaf0] text-sm
                         focus:outline-none focus:ring-2 focus:ring-[#00D2FF]/40 focus:border-[#00D2FF]/60
                         placeholder-[#4B5563] transition-all duration-200"
                placeholder="Enter password"
              />
            </div>

            {error && (
              <p className="text-xs text-red-400 text-center bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !username || !password}
              className="w-full py-2.5 mt-1 rounded-xl font-semibold text-sm
                       bg-gradient-to-r from-[#00D2FF] to-[#0099CC] text-[#08062B]
                       hover:from-[#00E5FF] hover:to-[#00AADD] transition-all duration-200
                       disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-[#00D2FF]/20"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
