import { useState, useEffect } from 'react';
import { useWebSocket } from './hooks/useWebSocket';
import { getSquad, getFixtures } from './services/api';
import SquadView from './components/SquadView';
import AuthModal from './components/AuthModal';

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [teamId, setTeamId] = useState('');
  const [gameweek, setGameweek] = useState('38');
  const [squad, setSquad] = useState(null);
  const [fixtures, setFixtures] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const { connected } = useWebSocket();

  useEffect(() => {
    const savedToken = localStorage.getItem('fplscout_token');
    const savedUser = localStorage.getItem('fplscout_user');
    if (savedToken && savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setToken(savedToken);
      setUser(parsedUser);
      if (parsedUser.fplTeamId) setTeamId(parsedUser.fplTeamId);
    }
  }, []);

  const handleAuth = (user, token) => {
    setUser(user);
    setToken(token);
    if (user.fplTeamId) setTeamId(user.fplTeamId);
    setShowAuth(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('fplscout_token');
    localStorage.removeItem('fplscout_user');
    setUser(null);
    setToken(null);
    setSquad(null);
    setFixtures(null);
    setRecommendation(null);
    setTeamId('');
    setHistory([]);
    setShowHistory(false);
  };

  const handleSearch = async () => {
    if (!teamId) return;
    setLoading(true);
    setError(null);
    try {
      const [squadRes, fixturesRes] = await Promise.all([
        getSquad(teamId, gameweek),
        getFixtures(),
      ]);
      setSquad(squadRes.data.squad);
      setFixtures(fixturesRes.data.teamFixtures);
      setRecommendation(null);
    } catch (err) {
      setError('Could not load squad. Check your team ID and gameweek.');
    } finally {
      setLoading(false);
    }
  };

  const handleRecommend = async () => {
    if (!squad || !fixtures) return;
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ squad, fixtures, gameweek }),
      });
      const data = await res.json();
      setRecommendation(data.recommendation);
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  const loadHistory = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/ai/history', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setHistory(data.history || []);
      setShowHistory(true);
    } catch (err) {
      console.error(err);
    }
  };

  const saveTeamId = async () => {
    if (!token || !teamId) return;
    try {
      const res = await fetch('/api/auth/team', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ fplTeamId: teamId }),
      });
      const data = await res.json();
      if (data.user) {
        const updatedUser = { ...user, fplTeamId: teamId };
        setUser(updatedUser);
        localStorage.setItem('fplscout_user', JSON.stringify(updatedUser));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">

      {showAuth && (
        <AuthModal
          onAuth={handleAuth}
          onClose={() => setShowAuth(false)}
        />
      )}

      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">⚽</span>
          <div>
            <h1 className="text-xl font-bold text-white leading-tight">FPL Scout</h1>
            <p className="text-xs text-gray-400 leading-tight">AI Fantasy Football Assistant</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'}`} />
            <span className="text-xs text-gray-400">{connected ? 'Live' : 'Offline'}</span>
          </div>
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400">{user.email}</span>
              <button
                onClick={handleLogout}
                className="text-xs text-gray-500 hover:text-red-400 transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAuth(true)}
              className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-lg transition-colors"
            >
              Login / Register
            </button>
          )}
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-10 pb-20">

        {/* Search card */}
        <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-100">Enter your FPL details</h2>
            {!user && (
              <p className="text-xs text-gray-500">
                <button
                  onClick={() => setShowAuth(true)}
                  className="text-green-400 hover:text-green-300"
                >
                  Login
                </button>{' '}
                to save your team ID
              </p>
            )}
          </div>
          <div className="flex gap-4 flex-wrap">
            <input
              type="text"
              placeholder="Team ID (e.g. 840512)"
              value={teamId}
              onChange={e => setTeamId(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              className="flex-1 min-w-48 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
            />
            <input
              type="number"
              placeholder="Gameweek"
              value={gameweek}
              onChange={e => setGameweek(e.target.value)}
              className="w-36 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="bg-green-500 hover:bg-green-400 disabled:opacity-50 text-black font-semibold px-8 py-3 rounded-xl transition-colors"
            >
              {loading ? 'Loading...' : 'Scout Squad'}
            </button>
          </div>
          {error && <p className="text-red-400 mt-4 text-sm">{error}</p>}

          {/* Save team ID button */}
          {squad && user && user.fplTeamId !== teamId && (
            <p className="text-xs mt-3">
              <button
                onClick={saveTeamId}
                className="text-green-400 hover:text-green-300 underline"
              >
                Save {teamId} as my default team
              </button>
              <span className="text-gray-500"> — loads automatically next login</span>
            </p>
          )}
        </div>

        {/* Squad */}
        {squad && fixtures && (
          <SquadView squad={squad} fixtures={fixtures} />
        )}

        {/* AI recommendations */}
        {squad && (
          <div className="mt-8">
            <button
              onClick={handleRecommend}
              disabled={aiLoading}
              className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold px-8 py-4 rounded-xl transition-colors flex items-center justify-center gap-3"
            >
              <span>🤖</span>
              {aiLoading ? 'Analysing your squad...' : 'Get AI Transfer Recommendations'}
            </button>

            {recommendation && (
              <div className="mt-4 bg-gray-900 border border-purple-800 rounded-2xl p-6">
                <h3 className="text-purple-400 font-semibold mb-4 flex items-center gap-2">
                  <span>⚡</span> AI Recommendations
                  {user && (
                    <span className="text-xs text-gray-500 ml-auto">Saved to your history</span>
                  )}
                  <button
                    onClick={() => setRecommendation(null)}
                    className="ml-auto text-gray-500 hover:text-white text-lg leading-none"
                  >
                    x
                  </button>
                </h3>
                <pre className="text-gray-200 text-sm whitespace-pre-wrap font-sans leading-relaxed">
                  {recommendation}
                </pre>
              </div>
            )}

            {/* Login prompt for non-logged in users */}
            {recommendation && !user && (
              <p className="text-xs text-gray-500 mt-3 text-center">
                <button
                  onClick={() => setShowAuth(true)}
                  className="text-green-400 hover:text-green-300"
                >
                  Login or register
                </button>
                {' '}to save recommendations to your history
              </p>
            )}
          </div>
        )}

        {/* History — logged in users only */}
        {user && (
          <div className="mt-8">
            <button
              onClick={() => showHistory ? setShowHistory(false) : loadHistory()}
              className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2"
            >
              <span>📋</span>
              {showHistory ? 'Hide recommendation history' : 'View recommendation history'}
            </button>

            {showHistory && history.length > 0 && (
              <div className="mt-4 space-y-4">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                  Past Recommendations
                </h3>
                {history.map(h => (
                  <div key={h.id} className="bg-gray-900 border border-gray-700 rounded-xl p-5">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs text-gray-400">Gameweek {h.gameweek}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(h.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <pre className="text-gray-300 text-xs whitespace-pre-wrap font-sans leading-relaxed">
                      {h.recommendation}
                    </pre>
                  </div>
                ))}
              </div>
            )}

            {showHistory && history.length === 0 && (
              <p className="text-xs text-gray-500 mt-2">No recommendations saved yet.</p>
            )}
          </div>
        )}

      </main>

      <footer className="border-t border-gray-800 py-6 text-center">
        <p className="text-xs text-gray-500">
          FPL Scout is not affiliated with the Premier League or Fantasy Premier League.
          Data sourced from the official FPL API.
        </p>
        <p className="text-xs text-gray-600 mt-1">
          &copy; {new Date().getFullYear()} FPL Scout
        </p>
      </footer>

    </div>
  );
}

export default App;