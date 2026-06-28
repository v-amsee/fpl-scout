import { useState } from 'react';
import { useWebSocket } from './hooks/useWebSocket';
import { getSquad, getFixtures } from './services/api';
import SquadView from './components/SquadView';

function App() {
  const [teamId, setTeamId] = useState('');
  const [gameweek, setGameweek] = useState('38');
  const [squad, setSquad] = useState(null);
  const [fixtures, setFixtures] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { connected } = useWebSocket();

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
    } catch (err) {
      setError('Could not load squad. Check your team ID and gameweek.');
    } finally {
      setLoading(false);
    }
  };

const [recommendation, setRecommendation] = useState(null);
const [aiLoading, setAiLoading] = useState(false);

const handleRecommend = async () => {
  if (!squad || !fixtures) return;
  setAiLoading(true);
  try {
    const res = await fetch('/api/ai/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ squad, fixtures }),
    });
    const data = await res.json();
    setRecommendation(data.recommendation);
  } catch (err) {
    console.error(err);
  } finally {
    setAiLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">⚽</span>
          <h1 className="text-xl font-bold text-white">FPL Scout</h1>
          <span className="text-xs text-gray-400 ml-2">AI Fantasy Football Assistant</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'}`} />
          <span className="text-xs text-gray-400">{connected ? 'Live' : 'Offline'}</span>
        </div>
      </header>

      {/* Search */}
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
          <h2 className="text-lg font-semibold mb-6 text-gray-100">Enter your FPL details</h2>
          <div className="flex gap-4 flex-wrap">
            <input
              type="text"
              placeholder="Team ID (e.g. 840512)"
              value={teamId}
              onChange={e => setTeamId(e.target.value)}
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
        </div>

        {squad && fixtures && (
          <SquadView squad={squad} fixtures={fixtures} />
        )}
      </div>
      {squad && (
  <div className="mt-6">
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
        </h3>
        <pre className="text-gray-200 text-sm whitespace-pre-wrap font-sans leading-relaxed">
          {recommendation}
        </pre>
      </div>
    )}
  </div>
)}
    </div>
  );
}

export default App;