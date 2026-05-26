from pydantic import BaseModel, field_validator
from datetime import datetime
from typing import Optional


# ── Request Schemas ─────────────────────────────────────────────────────── #

class CommentCreate(BaseModel):
    """Data required to post a comment."""
    content: str

    @field_validator("content")
    @classmethod
    def content_valid(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 1:
            raise ValueError("Comment cannot be empty")
        if len(v) > 1000:
            raise ValueError("Comment must be under 1,000 characters")
        return v


class CommentUpdate(BaseModel):
    """Data required to edit a comment."""
    content: str

    @field_validator("content")
    @classmethod
    def content_valid(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 1:
            raise ValueError("Comment cannot be empty")
        if len(v) > 1000:
            raise ValueError("Comment must be under 1,000 characters")
        return v


# ── Nested Info Schemas ─────────────────────────────────────────────────── #

class CommentAuthorInfo(BaseModel):
    """Minimal user info embedded in each comment."""
    id: int
    username: str

    class Config:
        from_attributes = True


# ── Response Schemas ────────────────────────────────────────────────────── #

class CommentResponse(BaseModel):
    """Full comment info returned in API responses."""
    id:         int
    content:    str
    author_id:  int
    post_id:    int
    created_at: datetime
    author:     CommentAuthorInfo
    # Tells the frontend whether to show the Delete button
    is_owner:   bool = False

    class Config:
        from_attributes = True


class CommentListResponse(BaseModel):
    """Paginated list of comments for a post."""
    comments:  list[CommentResponse]
    total:     int
    page:      int
    per_page:  int
    has_more:  bool


class DeleteResponse(BaseModel):
    """Returned after successful deletion."""
    message: str
    comment_id: int
