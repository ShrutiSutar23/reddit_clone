from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base
import app.models  # noqa: F401 – registers all models with SQLAlchemy


def create_tables():
    """
    Create all database tables on startup.
    Called only when the server actually starts.
    In production we use Alembic migrations instead.
    """
    Base.metadata.create_all(bind=engine)

# ---------------------------------------------------------------------------
# Initialize FastAPI app
# ---------------------------------------------------------------------------
app = FastAPI(
    title=settings.APP_NAME,
    description="A Reddit Clone REST API built with FastAPI",
    version="1.0.0",
    debug=settings.DEBUG,
)

import os

# ---------------------------------------------------------------------------
# CORS – allows the React frontend to talk to this backend
# ---------------------------------------------------------------------------
# In production, set ALLOWED_ORIGINS env var to your Vercel URL
# Example: ALLOWED_ORIGINS=https://threadfire.vercel.app
allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "")
allowed_origins = (
    [o.strip() for o in allowed_origins_env.split(",") if o.strip()]
    if allowed_origins_env
    else ["http://localhost:3000", "http://localhost:3001"]
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Startup event – create tables when server starts
# ---------------------------------------------------------------------------
@app.on_event("startup")
def on_startup():
    create_tables()


# ---------------------------------------------------------------------------
# Routers  –  All 5 feature routers now registered
# ---------------------------------------------------------------------------
from app.routes import auth, communities, posts, votes, comments

app.include_router(auth.router,        prefix="/api/auth",        tags=["Auth"])
app.include_router(communities.router, prefix="/api/communities", tags=["Communities"])
app.include_router(posts.router,       prefix="/api/posts",       tags=["Posts"])
app.include_router(votes.router,       prefix="/api",             tags=["Votes"])
app.include_router(comments.router,    prefix="/api",             tags=["Comments"])


# ---------------------------------------------------------------------------
# Root health check endpoint
# ---------------------------------------------------------------------------
@app.get("/", tags=["Health"])
def root():
    return {
        "message": "Reddit Clone API is running!",
        "status": "healthy",
        "version": "1.0.0",
    }


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "ok"}
