from pydantic import BaseModel, field_validator
from datetime import datetime
from typing import Optional


# ── Request Schemas (what frontend SENDS) ──────────────────────────────── #

class CommunityCreate(BaseModel):
    """Data required to create a new community."""
    name: str
    description: Optional[str] = None

    @field_validator("name")
    @classmethod
    def name_valid(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 3:
            raise ValueError("Community name must be at least 3 characters")
        if len(v) > 100:
            raise ValueError("Community name must be under 100 characters")
        if not v.replace("_", "").replace("-", "").isalnum():
            raise ValueError("Name can only contain letters, numbers, _ and -")
        return v.lower()   # store community names in lowercase like Reddit

    @field_validator("description")
    @classmethod
    def description_valid(cls, v: Optional[str]) -> Optional[str]:
        if v and len(v) > 500:
            raise ValueError("Description must be under 500 characters")
        return v


# ── Response Schemas (what backend SENDS BACK) ─────────────────────────── #

class CommunityCreatorInfo(BaseModel):
    """Minimal user info embedded inside community responses."""
    id: int
    username: str

    class Config:
        from_attributes = True


class CommunityResponse(BaseModel):
    """Full community info returned in API responses."""
    id: int
    name: str
    description: Optional[str]
    created_by: int
    created_at: datetime
    creator: CommunityCreatorInfo
    post_count: int = 0       # calculated field – how many posts exist

    class Config:
        from_attributes = True


class CommunityListResponse(BaseModel):
    """Paginated list of communities."""
    communities: list[CommunityResponse]
    total: int
    page: int
    per_page: int
    has_more: bool
