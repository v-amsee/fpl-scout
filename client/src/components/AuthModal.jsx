import { useState } from 'react';

export default function AuthModal({ onAuth, onClose }) {
  const [tab, setTab] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fplTeamId, setFplTeamId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (!email || !password) return;
    setLoading(true);
    setError(null);

    const endpoint = tab === 'login' ? '/api/auth/login' : '/api/auth/register';
    const body = tab === 'login'
      ? { email, password }
      : { email, password, fplTeamId };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong');
        return;
      }

      localStorage.setItem('fplscout_token', data.token);
      localStorage.setItem('fplscout_user', JSON.stringify(data.user));
      onAuth(data.user, data.token);

    } catch (err) {
      setError('Network error — is the server running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 w-full max-w-md mx-4 relative">

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white text-lg leading-none"
        >
          x
        </button>

        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <span className="text-3xl">⚽</span>
          <div>
            <h1 className="text-xl font-bold text-white leading-tight">FPL Scout</h1>
            <p className="text-xs text-gray-400">AI Fantasy Football Assistant</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-800 rounded-xl p-1 mb-6">
          <button
            onClick={() => { setTab('login'); setError(null); }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === 'login'
                ? 'bg-green-500 text-black'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => { setTab('register'); setError(null); }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === 'register'
                ? 'bg-green-500 text-black'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Register
          </button>
        </div>

        {/* Fields */}
        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
          />
          {tab === 'register' && (
            <input
              type="text"
              placeholder="FPL Team ID (optional — add later)"
              value={fplTeamId}
              onChange={e => setFplTeamId(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
            />
          )}
        </div>

        {error && (
          <p className="text-red-400 text-sm mt-4">{error}</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full mt-6 bg-green-500 hover:bg-green-400 disabled:opacity-50 text-black font-semibold py-3 rounded-xl transition-colors"
        >
          {loading ? 'Please wait...' : tab === 'login' ? 'Login' : 'Create Account'}
        </button>

        <p className="text-xs text-gray-500 text-center mt-4">
          {tab === 'login'
            ? "Don't have an account? "
            : 'Already have an account? '}
          <button
            onClick={() => { setTab(tab === 'login' ? 'register' : 'login'); setError(null); }}
            className="text-green-400 hover:text-green-300"
          >
            {tab === 'login' ? 'Register here' : 'Login here'}
          </button>
        </p>

      </div>
    </div>
  );
}