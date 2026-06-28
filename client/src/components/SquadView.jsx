const POSITION_ORDER = ['GKP', 'DEF', 'MID', 'FWD'];

const difficultyColour = (label) => {
  if (label === 'easy') return 'bg-green-500 text-black';
  if (label === 'medium') return 'bg-yellow-400 text-black';
  return 'bg-red-500 text-white';
};

const statusBadge = (status, news) => {
  if (status === 'a') return null;
  const colours = {
    d: 'bg-yellow-500',
    i: 'bg-red-500',
    s: 'bg-orange-500',
    u: 'bg-red-700',
  };
  return (
    <span
      title={news}
      className={`text-xs px-2 py-0.5 rounded-full text-white ${colours[status] || 'bg-gray-500'}`}
    >
      {status === 'd' ? 'Doubt' : status === 'i' ? 'Injured' : status === 's' ? 'Susp' : 'Out'}
    </span>
  );
};

function PlayerCard({ player, fixtures }) {
  const teamFixtures = fixtures.find(f => f.teamId === player.teamId);
  const isBench = player.multiplier === 0;

  return (
    <div className={`bg-gray-800 rounded-xl p-4 border ${isBench ? 'border-gray-700 opacity-60' : 'border-gray-600'}`}>
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white">{player.name}</span>
            {player.isCaptain && <span className="text-xs bg-green-500 text-black px-1.5 py-0.5 rounded font-bold">C</span>}
            {player.isViceCaptain && <span className="text-xs bg-blue-500 text-white px-1.5 py-0.5 rounded font-bold">V</span>}
            {statusBadge(player.status, player.news)}
          </div>
          <div className="text-xs text-gray-400 mt-0.5">{player.team} — {player.position}</div>
        </div>
        <div className="text-right">
          <div className="text-green-400 font-bold">£{player.price}m</div>
          <div className="text-xs text-gray-400">{player.totalPoints} pts</div>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex gap-3 text-xs text-gray-400 mb-3">
        <span>xG {player.xG}</span>
        <span>xA {player.xA}</span>
        <span>Form {player.form}</span>
      </div>

      {/* Fixtures */}
      {teamFixtures && (
        <div className="flex gap-1 flex-wrap">
          {teamFixtures.upcoming.map((f, i) => (
            <span key={i} className={`text-xs px-2 py-0.5 rounded font-medium ${difficultyColour(f.difficultyLabel)}`}>
              {f.isHome ? '' : '@'}{f.opponent}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SquadView({ squad, fixtures }) {
  const starting = squad.filter(p => p.multiplier > 0);
  const bench = squad.filter(p => p.multiplier === 0);

  return (
    <div className="mt-8 space-y-8">
      {POSITION_ORDER.map(pos => {
        const players = starting.filter(p => p.position === pos);
        if (!players.length) return null;
        return (
          <div key={pos}>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">{pos}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {players.map(p => <PlayerCard key={p.id} player={p} fixtures={fixtures} />)}
            </div>
          </div>
        );
      })}

      <div>
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Bench</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {bench.map(p => <PlayerCard key={p.id} player={p} fixtures={fixtures} />)}
        </div>
      </div>
    </div>
  );
}