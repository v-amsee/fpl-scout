# FPL Scout — AI Fantasy Football Assistant

🔗 **[Live Demo](https://ideal-quietude-production-c4e1.up.railway.app)**

An AI-powered full-stack web application for Fantasy Premier League managers.
Get contextual transfer recommendations powered by Claude AI, analysing your
squad composition, upcoming fixtures, player form, xG/xA stats, and injury status.

![FPL Scout Demo](demo.gif)

## Tech Stack

**Frontend:** React, Vite, Tailwind CSS
**Backend:** Node.js, Express, WebSockets
**Database:** PostgreSQL
**Auth:** JWT, bcrypt
**AI:** Claude API (Anthropic)
**Infrastructure:** Docker, Railway, GitHub Actions

## Features

- Live squad viewer with real-time data from the official FPL API
- Fixture difficulty ratings for the next 5 gameweeks, colour-coded by difficulty
- AI-generated transfer recommendations via Claude, with plain-English reasoning based on form, fixtures, and xG/xA
- Optional JWT authentication — save your FPL team ID and view recommendation history
- Live WebSocket connection status
- Rate-limited AI endpoint to protect against abuse

## Status

🟢 Live and deployed

## Getting Started Locally

```bash
git clone https://github.com/v-amsee/fpl-scout.git
cd fpl-scout

# Backend
cd server && npm install && npm run dev

# Frontend (new terminal)
cd client && npm install && npm run dev
```

Or run the full stack with Docker:

```bash
docker compose up
```

## Environment Variables

Create a `.env` file in `server/`:

PORT=3001
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/fplscout
ANTHROPIC_API_KEY=your_key_here
JWT_SECRET=your_secret_here

## Disclaimer

FPL Scout is not affiliated with the Premier League or Fantasy Premier League. Data is sourced from the official public FPL API.