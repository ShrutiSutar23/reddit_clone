# Reddit Clone – Backend API

Built with **FastAPI** + **PostgreSQL** + **SQLAlchemy**

---

## 🚀 Getting Started

### 1. Create virtual environment
```bash
python -m venv venv
source venv/bin/activate        # Mac/Linux
venv\Scripts\activate           # Windows
```

### 2. Install dependencies
```bash
pip install -r requirements.txt
```

### 3. Set up environment variables
```bash
cp .env.example .env
# Edit .env with your database credentials
```

### 4. Set up PostgreSQL database
```bash
createdb reddit_clone
```

### 5. Run the server
```bash
python run.py
```

Server runs at: **http://localhost:8000**
API Docs at:    **http://localhost:8000/docs**

---

## 📁 Project Structure

```
backend/
├── app/
│   ├── main.py          ← FastAPI app entry point
│   ├── config.py        ← App settings
│   ├── database.py      ← DB connection & session
│   ├── models/          ← SQLAlchemy DB models
│   ├── routes/          ← API endpoints
│   ├── schemas/         ← Pydantic validation
│   └── utils/           ← JWT & helper functions
├── alembic/             ← Database migrations
├── requirements.txt
├── run.py               ← Start server
└── .env.example
```

---

## 🗓️ Build Progress

- [x] Day 1 – Project Setup
- [ ] Day 2 – Database Models
- [ ] Day 3 – Authentication
- [ ] Day 4 – Communities
- [ ] Day 5 – Posts
- [ ] Day 6 – Voting
- [ ] Day 7 – Comments
