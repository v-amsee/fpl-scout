require('dotenv').config();
console.log('PORT from env:', process.env.PORT);
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('All env keys:', Object.keys(process.env).filter(k => !k.startsWith('npm_')));
const express = require('express');
const cors = require('cors');
const { WebSocketServer } = require('ws');
const http = require('http');
const fplRoutes = require('./routes/fpl');
const fixtureRoutes = require('./routes/fixtures');
const aiRoutes = require('./routes/ai');
const authRoutes = require('./routes/auth');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(cors());
app.use(express.json());
app.use('/api/fpl', fplRoutes);
app.use('/api/fixtures', fixtureRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/auth', authRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// WebSocket connection
wss.on('connection', (ws) => {
  console.log('Client connected via WebSocket');
  ws.send(JSON.stringify({ type: 'connected', message: 'FPL Scout live' }));

  const heartbeat = setInterval(() => {
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify({ type: 'ping' }));
    }
  }, 30000);

  ws.on('close', () => {
    clearInterval(heartbeat);
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, "0.0.0.0",() => {
  console.log(`Server running on port ${PORT}`);
});