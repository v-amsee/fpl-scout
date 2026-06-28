const express = require('express');
const axios = require('axios');
const router = express.Router();

const FPL_BASE = 'https://fantasy.premierleague.com/api';

// Difficulty colour mapping
// 1-2 = easy (green), 3 = medium (yellow), 4-5 = hard (red)
const difficultyLabel = (d) => {
  if (d <= 2) return 'easy';
  if (d === 3) return 'medium';
  return 'hard';
};

router.get('/', async (req, res) => {
  try {
    const [fixturesRes, bootstrapRes] = await Promise.all([
      axios.get(`${FPL_BASE}/fixtures/`),
      axios.get(`${FPL_BASE}/bootstrap-static/`)
    ]);

    const fixtures = fixturesRes.data;
    const { teams, events } = bootstrapRes.data;

    // Find next 5 gameweeks from current/next gw
    const nextGW = events.find(e => e.is_next) || events.find(e => e.is_current);
    const nextGWId = nextGW?.id || 1;
    const upcomingGWs = [nextGWId, nextGWId+1, nextGWId+2, nextGWId+3, nextGWId+4];

    // For each team, get their next 5 fixtures with difficulty
    const teamFixtures = teams.map(team => {
      const upcoming = fixtures
        .filter(f =>
          upcomingGWs.includes(f.event) &&
          (f.team_h === team.id || f.team_a === team.id)
        )
        .slice(0, 5)
        .map(f => {
          const isHome = f.team_h === team.id;
          const opponent = teams.find(t => t.id === (isHome ? f.team_a : f.team_h));
          const difficulty = isHome ? f.team_h_difficulty : f.team_a_difficulty;
          return {
            gameweek: f.event,
            opponent: opponent?.short_name,
            isHome,
            difficulty,
            difficultyLabel: difficultyLabel(difficulty),
          };
        });

      return {
        teamId: team.id,
        teamName: team.name,
        shortName: team.short_name,
        upcoming,
      };
    });

    res.json({ teamFixtures, fromGameweek: nextGWId });

  } catch (error) {
    console.error('Fixtures error:', error.message);
    res.status(500).json({ error: 'Failed to fetch fixtures' });
  }
});

module.exports = router;