const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');
const router = express.Router();

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

router.post('/recommend', async (req, res) => {
  const { squad, fixtures } = req.body;

  if (!squad || !fixtures) {
    return res.status(400).json({ error: 'Squad and fixtures data required' });
  }

  // Build a clean summary of the squad to send to Claude
  // We don't send the raw JSON — too many tokens. We summarise it.
  const squadSummary = squad
    .filter(p => p.multiplier > 0) // starting 11 only
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

Keep each reason concise and specific. Focus on fixture difficulty, form, xG/xA, and value for money. Only suggest realistic transfers within FPL budget constraints.`;

  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 600,
      messages: [{ role: 'user', content: prompt }],
    });

    const recommendation = message.content[0].text;
    res.json({ recommendation });

  } catch (error) {
    console.error('Claude API error:', error.message);
    res.status(500).json({ error: 'Failed to get AI recommendations' });
  }
});

module.exports = router;