# 🔥 ThreadFire – Reddit Clone MVP

A full-stack Reddit-style platform built in 14 days.

**Backend:** Python · FastAPI · PostgreSQL · SQLAlchemy · JWT
**Frontend:** Next.js 15 · TypeScript · Tailwind CSS

---

## ✨ Features

| Feature | Status |
|---------|--------|
| User registration & login | ✅ |
| JWT authentication | ✅ |
| Create communities | ✅ |
| Text / Image / Link posts | ✅ |
| Upvote & Downvote | ✅ |
| Comments | ✅ |
| Sort by New / Top / Old | ✅ |
| User profiles | ✅ |
| Responsive dark UI | ✅ |

---

## 🚀 Quick Start (Local Development)

### Option A – Docker (easiest)
```bash
git clone https://github.com/YOUR_USERNAME/threadfire.git
cd threadfire
docker-compose up --build
# App: http://localhost:3000
# API: http://localhost:8000/docs
```

### Option B – Manual

**Backend**
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env        # edit with your DB credentials
createdb reddit_clone        # create local Postgres DB
alembic upgrade head         # create tables
python run.py                # starts on http://localhost:8000
```

**Frontend**
```bash
cd frontend
npm install
cp .env.local .env.local     # already has localhost:8000
npm run dev                  # starts on http://localhost:3000
```

---

## 📁 Project Structure

```
threadfire/
│
├── backend/                 ← FastAPI Python server
│   ├── app/
│   │   ├── main.py          ← App entry point + CORS
│   │   ├── config.py        ← Settings from .env
│   │   ├── database.py      ← SQLAlchemy setup
│   │   ├── models/          ← 5 DB tables
│   │   ├── routes/          ← 20 API endpoints
│   │   ├── schemas/         ← Pydantic validation
│   │   └── utils/           ← JWT + password helpers
│   ├── alembic/             ← DB migrations
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/                ← Next.js React app
│   ├── app/                 ← 12 pages
│   ├── components/          ← 11 components
│   ├── context/             ← Auth state
│   ├── lib/                 ← API client + utils
│   ├── types/               ← TypeScript types
│   └── Dockerfile
│
├── docker-compose.yml       ← Run everything locally
└── DEPLOYMENT.md            ← Deploy to Render + Vercel
```

---

## 🔗 API Reference

```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me

GET    /api/communities/
POST   /api/communities/
GET    /api/communities/{name}
DELETE /api/communities/{name}

GET    /api/posts/
POST   /api/posts/
GET    /api/posts/community/{name}
GET    /api/posts/{id}
DELETE /api/posts/{id}

POST   /api/posts/{id}/vote
GET    /api/posts/{id}/votes

GET    /api/posts/{id}/comments
POST   /api/posts/{id}/comments
PUT    /api/comments/{id}
DELETE /api/comments/{id}
GET    /api/users/{username}/comments
```

Full interactive docs at `/docs` when backend is running.

---

## 🗓️ Build Timeline

| Day | What was built |
|-----|---------------|
| 1 | FastAPI project setup |
| 2 | Database models + Alembic migrations |
| 3 | Auth APIs + JWT |
| 4 | Communities APIs |
| 5 | Posts APIs |
| 6 | Voting system |
| 7 | Comments APIs |
| 8 | Next.js setup + base layout |
| 9 | Login + Register pages |
| 10 | Home feed + Communities UI |
| 11 | Post detail + Create post |
| 12 | Voting UI + Comments UI + Profile |
| 13 | Testing + bug fixes |
| 14 | Docker + Deployment config |

---

## 📄 License

MIT
