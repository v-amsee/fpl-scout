const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');
const pool = require('../db');
const jwt = require('jsonwebtoken');
const router = express.Router();

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const JWT_SECRET = process.env.JWT_SECRET || 'fplscout_dev_secret';

function getOptionalUser(req) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    const token = authHeader.split(' ')[1];
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

router.post('/recommend', async (req, res) => {
  const { squad, fixtures, gameweek } = req.body;

  if (!squad || !fixtures) {
    return res.status(400).json({ error: 'Squad and fixtures data required' });
  }

  const user = getOptionalUser(req);

  const squadSummary = squad
    .filter(p => p.multiplier > 0)
    .map(p => {
      const teamFix = fixtures.find(f => f.teamId === p.teamId);
      const nextFixtures = teamFix?.upcoming
        .map(f => `${f.isHome ? '' : '@'}${f.opponent}(${f.difficultyLabel})`)
        .join(', ') || 'unknown';
      return `${p.name} | ${p.position} | ${p.team} | £${p.price}m | Form: ${p.form} | xG: ${p.xG} | xA: ${p.xA} | Status: ${p.status === 'a' ? 'fit' : p.news} | Next fixtures: ${nextFixtures}`;
    })
    .join('\n');

  const prompt = `You are an expert Fantasy Premier League analyst. Analyse this FPL squad and give 2-3 specific transfer recommendations.

CURRENT SQUAD:
${squadSummary}

Provide your response in this exact format:

TRANSFER 1:
OUT: [player name] — [one sentence reason]
IN: [suggested replacement] — [one sentence reason]
IMPACT: [one sentence on expected points impact]

TRANSFER 2:
OUT: [player name] — [one sentence reason]
IN: [suggested replacement] — [one sentence reason]
IMPACT: [one sentence on expected points impact]

TRANSFER 3 (optional):
OUT: [player name] — [one sentence reason]
IN: [suggested replacement] — [one sentence reason]
IMPACT: [one sentence on expected points impact]

Keep each reason concise and specific. Focus on fixture difficulty, form, xG/xA, and value for money.`;

  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 600,
      messages: [{ role: 'user', content: prompt }],
    });

    const recommendation = message.content[0].text;

    // Save to DB if user is logged in
    if (user) {
      await pool.query(
        'INSERT INTO recommendations (user_id, gameweek, squad_snapshot, recommendation) VALUES ($1, $2, $3, $4)',
        [user.userId, gameweek || 0, JSON.stringify(squad), recommendation]
      );
    }

    res.json({ recommendation, saved: !!user });

  } catch (error) {
    console.error('Claude API error:', error.message);
    res.status(500).json({ error: 'Failed to get AI recommendations' });
  }
});

// Get recommendation history for logged in user
router.get('/history', async (req, res) => {
  const user = getOptionalUser(req);
  if (!user) return res.status(401).json({ error: 'Login to view history' });

  try {
    const result = await pool.query(
      'SELECT id, gameweek, recommendation, created_at FROM recommendations WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10',
      [user.userId]
    );
    res.json({ history: result.rows });
  } catch (error) {
    console.error('History error:', error.message);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

module.exports = router;