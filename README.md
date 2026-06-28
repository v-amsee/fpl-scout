# FPL Scout - AI Fantasy Football Assistant

An AI-powered full-stack web application for Fantasy Premier League managers.
Get contextual transfer recommendations powered by Claude AI, analysing your
squad composition, upcoming fixtures, player form, xG/xA stats, and injury status.

## Tech Stack

**Frontend:** React, Vite, Tailwind CSS, Recharts
**Backend:** Node.js, Express, WebSockets
**Database:** PostgreSQL
**AI:** Claude API (Anthropic)
**Infrastructure:** Docker, AWS EC2, GitHub Actions

## Features

- Live gameweek score and rank tracking via WebSockets
- AI-generated transfer recommendations with plain-English reasoning
- Fixture difficulty ratings and form analysis
- Squad visualiser with xG/xA breakdowns

## Status

 In active development

## Getting Started

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/fpl-scout.git
cd fpl-scout

# Backend
cd server && npm install && npm run dev

# Frontend
cd client && npm install && npm run dev
```

## Environment Variables

```
DATABASE_URL=
ANTHROPIC_API_KEY=
```