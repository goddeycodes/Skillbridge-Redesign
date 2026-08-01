# SkillBridge — Skills & Knowledge Exchange Platform

> *Bridging the gap between what people know and what people need.*

A peer-to-peer web application where users teach skills they have, learn skills they want,
and are matched intelligently — all without spending money.

---

## Project Structure

```
skillbridge/
├── frontend/           # Next.js 14 + Tailwind CSS
├── backend/            # Node.js + Express REST API + Socket.io
├── matching-engine/    # Python FastAPI + scikit-learn NLP matcher
└── docs/               # Architecture diagrams, DB schema, API docs
```

## Quick Start

### 1. Backend
```bash
cd backend
cp .env.example .env    # fill in your DB credentials & secrets
npm install
npm run dev             # starts on http://localhost:5000
```

> If you are using Supabase for Postgres/auth, set the Supabase environment variables in `backend/.env`:
> - `SUPABASE_URL`
> - `SUPABASE_PUBLISHABLE_KEY`
> - `SUPABASE_SECRET_KEY`
> - `SUPABASE_JWKS_URL`
>
> Keep `MONGO_URI` pointed at a running MongoDB instance because the backend still stores forums, skills, and messages there.

### 2. Matching Engine
```bash
cd matching-engine
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev             # starts on http://localhost:3000
```

---

## API Overview

| Method | Endpoint                     | Description                  | Auth |
|--------|------------------------------|------------------------------|------|
| POST   | /api/auth/register           | Register new user            | No   |
| POST   | /api/auth/login              | Login, receive JWT           | No   |
| GET    | /api/auth/me                 | Get current user             | Yes  |
| GET    | /api/users/:id               | Get user profile + skills    | No   |
| PATCH  | /api/users/me                | Update own profile           | Yes  |
| GET    | /api/skills                  | Browse/search skills         | No   |
| POST   | /api/skills                  | Add a skill listing          | Yes  |
| PATCH  | /api/skills/:id              | Edit a skill                 | Yes  |
| DELETE | /api/skills/:id              | Remove a skill               | Yes  |
| GET    | /api/matches                 | Get AI match suggestions     | Yes  |
| GET    | /api/sessions                | List own sessions            | Yes  |
| POST   | /api/sessions                | Book a session (costs 1 credit) | Yes |
| PATCH  | /api/sessions/:id/complete   | Mark session complete        | Yes  |
| GET    | /api/community               | Forum posts                  | No   |
| GET    | /api/credits                 | Credit ledger                | Yes  |
| GET    | /api/ratings                 | Ratings                      | Yes  |

## Tech Stack

| Layer         | Technology               |
|---------------|--------------------------|
| Frontend      | Next.js 14, Tailwind CSS |
| Backend       | Node.js, Express         |
| Realtime      | Socket.io                |
| DB (relational)| PostgreSQL + Sequelize  |
| DB (documents)| MongoDB + Mongoose       |
| Auth          | JWT + Google OAuth 2.0   |
| AI Matching   | Python FastAPI + sklearn |
| Deployment    | Vercel (FE), Railway (BE)|

## Credit Economy

- New users start with **10 credits**
- Teaching a session earns **+1 credit**
- Booking a session costs **-1 credit**
- Credits are non-monetary and non-transferable

## Team

| Member   | Role                            |
|----------|---------------------------------|
| Member 1 | Full-Stack Lead & AI Engineer   |
| Member 2 | Frontend Developer & UX Designer|


## 2026 Learning Experience Redesign

The frontend has been redesigned around SkillBridge's core product story:

**Learn → Teach → Match → Connect → Session → Community → Grow**

### Major UI/UX changes

- Replaced the single top navigation with a learning-platform application shell and desktop sidebar.
- Added mobile-first bottom navigation for Home, Learn, Matches, Messages and Profile.
- Redesigned the dashboard around learning goals, continued learning, skill discovery, skill exchange and upcoming sessions.
- Added `/learn` for skill discovery and `/teach` for teaching skills.
- Added `/messages`, using the existing session/chat functionality.
- Reframed matching, sessions and community language around learning and teaching.
- Reworked the profile into a learning identity / learning-CV presentation.
- Introduced reusable visual language for learning cards, goals, progress, categories, badges and educational states.
- Preserved the existing backend APIs, authentication, matching engine and core feature components.

### Running the redesign

The project still uses the original three-part architecture:

```text
frontend/       Next.js 14 + Tailwind CSS
backend/        Node.js + Express
matching-engine/ Python FastAPI + sklearn
```

Install dependencies in each service using the existing project instructions before starting the application.
# Skillbridge-Redesign
