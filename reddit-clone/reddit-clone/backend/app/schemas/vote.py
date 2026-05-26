from pydantic import BaseModel
from typing import Optional
from app.models.vote import VoteType


# ── Request Schema ──────────────────────────────────────────────────────── #

class VoteCreate(BaseModel):
    """
    Data sent when a user clicks upvote or downvote.
    vote_type must be exactly "upvote" or "downvote".
    """
    vote_type: VoteType


# ── Response Schema ─────────────────────────────────────────────────────── #

class VoteResponse(BaseModel):
    """
    Returned after every vote action.
    Frontend uses this to update the vote count and button state instantly.
    """
    post_id:        int
    new_vote_count: int
    user_vote:      Optional[str]   # "upvote" | "downvote" | null (if removed)
    action:         str             # "added" | "removed" | "switched" — for debugging
