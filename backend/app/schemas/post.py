from pydantic import BaseModel, field_validator
from datetime import datetime
from typing import Optional
from app.models.post import PostType


# ── Request Schemas (what frontend SENDS) ──────────────────────────────── #

class PostCreate(BaseModel):
    """Data required to create a new post."""
    title: str
    content: Optional[str] = None
    post_type: PostType = PostType.text
    community_id: int

    @field_validator("title")
    @classmethod
    def title_valid(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 3:
            raise ValueError("Title must be at least 3 characters")
        if len(v) > 300:
            raise ValueError("Title must be under 300 characters")
        return v

    @field_validator("content")
    @classmethod
    def content_valid(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v = v.strip()
            if len(v) > 40000:
                raise ValueError("Content must be under 40,000 characters")
        return v


# ── Nested Info Schemas (embedded inside post responses) ───────────────── #

class PostAuthorInfo(BaseModel):
    """Minimal user info shown on each post."""
    id: int
    username: str

    class Config:
        from_attributes = True


class PostCommunityInfo(BaseModel):
    """Minimal community info shown on each post."""
    id: int
    name: str

    class Config:
        from_attributes = True


# ── Response Schemas (what backend SENDS BACK) ─────────────────────────── #

class PostResponse(BaseModel):
    """Full post info returned in API responses."""
    id: int
    title: str
    content: Optional[str]
    post_type: PostType
    vote_count: int
    comment_count: int
    author_id: int
    community_id: int
    created_at: datetime
    author: PostAuthorInfo
    community: PostCommunityInfo
    # The current user's vote on this post (null if not voted / not logged in)
    user_vote: Optional[str] = None

    class Config:
        from_attributes = True


class PostListResponse(BaseModel):
    """Paginated list of posts."""
    posts: list[PostResponse]
    total: int
    page: int
    per_page: int
    has_more: bool
