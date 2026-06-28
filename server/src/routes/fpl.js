const express = require('express');
const axios = require('axios');
const router = express.Router();

const FPL_BASE = 'https://fantasy.premierleague.com/api';

// Get all players, teams and gameweek info
router.get('/bootstrap', async (req, res) => {
  try {
    const response = await axios.get(`${FPL_BASE}/bootstrap-static/`);
    
    const { elements, teams, events } = response.data;
    
    // Current gameweek
    const currentGW = events.find(e => e.is_current) || events.find(e => e.is_next);

    // Simplify player data — FPL returns a lot of fields we don't need
    const players = elements.map(p => ({
      id: p.id,
      name: p.web_name,
      fullName: `${p.first_name} ${p.second_name}`,
      team: teams.find(t => t.id === p.team)?.name,
      teamId: p.team,
      position: ['', 'GKP', 'DEF', 'MID', 'FWD'][p.element_type],
      price: p.now_cost / 10,  // FPL stores price as integer e.g. 55 = £5.5m
      totalPoints: p.total_points,
      form: p.form,
      selectedBy: p.selected_by_percent,
      xG: p.expected_goals,
      xA: p.expected_assists,
      minutes: p.minutes,
      goals: p.goals_scored,
      assists: p.assists,
      cleanSheets: p.clean_sheets,
      status: p.status,  // a=available, d=doubtful, i=injured, u=unavailable
      news: p.news,
    }));

    res.json({
      players,
      teams,
      currentGameweek: currentGW?.id,
      gameweekName: currentGW?.name,
    });

  } catch (error) {
    console.error('FPL bootstrap error:', error.message);
    res.status(500).json({ error: 'Failed to fetch FPL data' });
  }
});

// Get a specific manager's squad by their FPL team ID
router.get('/squad/:teamId', async (req, res) => {
  try {
    const { teamId } = req.params;

    // Fetch manager's picks for current gameweek
    const [bootstrapRes, picksRes] = await Promise.all([
      axios.get(`${FPL_BASE}/bootstrap-static/`),
      axios.get(`${FPL_BASE}/entry/${teamId}/event/${req.query.gw}/picks/`)
    ]);

    const { elements, teams, events } = bootstrapRes.data;
    const { picks } = picksRes.data;

    // Map each pick to full player data
    const squad = picks.map(pick => {
      const player = elements.find(e => e.id === pick.element);
      const team = teams.find(t => t.id === player.team);
      return {
        id: player.id,
        name: player.web_name,
        fullName: `${player.first_name} ${player.second_name}`,
        team: team?.name,
        teamId: player.team,
        position: ['', 'GKP', 'DEF', 'MID', 'FWD'][player.element_type],
        price: player.now_cost / 10,
        totalPoints: player.total_points,
        form: player.form,
        xG: player.expected_goals,
        xA: player.expected_assists,
        status: player.status,
        news: player.news,
        isCaptain: pick.is_captain,
        isViceCaptain: pick.is_vice_captain,
        multiplier: pick.multiplier,
      };
    });

    res.json({ squad, gameweek: req.query.gw });

  } catch (error) {
    console.error('FPL squad error:', error.message);
    res.status(500).json({ error: 'Failed to fetch squad data' });
  }
});

module.exports = router;