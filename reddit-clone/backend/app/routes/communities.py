from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models.community import Community
from app.models.post import Post
from app.models.user import User
from app.schemas.community import (
    CommunityCreate,
    CommunityResponse,
    CommunityListResponse,
)
from app.utils.jwt import get_current_user

router = APIRouter()


# ─────────────────────────────────────────────────────────────────────────── #
#  Helper – builds a CommunityResponse with post_count attached
# ─────────────────────────────────────────────────────────────────────────── #
def _build_response(community: Community, db: Session) -> dict:
    """
    SQLAlchemy models don't have post_count directly.
    We count posts separately and attach it before returning.
    """
    post_count = db.query(func.count(Post.id)).filter(
        Post.community_id == community.id
    ).scalar() or 0

    return {
        "id":          community.id,
        "name":        community.name,
        "description": community.description,
        "created_by":  community.created_by,
        "created_at":  community.created_at,
        "creator":     community.creator,
        "post_count":  post_count,
    }


# ─────────────────────────────────────────────────────────────────────────── #
#  POST /api/communities   – Create a community  (protected)
# ─────────────────────────────────────────────────────────────────────────── #
@router.post(
    "/",
    response_model=CommunityResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new community",
)
def create_community(
    data: CommunityCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Create a new community (login required).

    Steps:
    1. Check community name is not already taken
    2. Save community linked to current user
    3. Return the new community with creator info
    """
    # Step 1 – name must be unique (schema already lowercases it)
    existing = db.query(Community).filter(
        Community.name == data.name
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Community '{data.name}' already exists",
        )

    # Step 2 – create and save
    community = Community(
        name=data.name,
        description=data.description,
        created_by=current_user.id,
    )
    db.add(community)
    db.commit()
    db.refresh(community)

    # Step 3 – return with post_count = 0 (brand new community)
    return _build_response(community, db)


# ─────────────────────────────────────────────────────────────────────────── #
#  GET /api/communities   – List all communities  (public)
# ─────────────────────────────────────────────────────────────────────────── #
@router.get(
    "/",
    response_model=CommunityListResponse,
    summary="List all communities with pagination",
)
def list_communities(
    page: int = Query(default=1, ge=1, description="Page number"),
    per_page: int = Query(default=10, ge=1, le=50, description="Results per page"),
    search: str = Query(default="", description="Search communities by name"),
    db: Session = Depends(get_db),
):
    """
    Returns a paginated list of all communities.
    Optional search filter by name.
    No authentication required – anyone can browse.

    Query params:
      ?page=1          → which page
      ?per_page=10     → how many per page (max 50)
      ?search=cricket  → filter by name containing "cricket"
    """
    query = db.query(Community)

    # Apply search filter if provided
    if search:
        query = query.filter(Community.name.ilike(f"%{search}%"))

    # Count total before pagination (for frontend to show "X communities")
    total = query.count()

    # Apply pagination
    offset = (page - 1) * per_page
    communities = (
        query
        .order_by(Community.created_at.desc())
        .offset(offset)
        .limit(per_page)
        .all()
    )

    return CommunityListResponse(
        communities=[_build_response(c, db) for c in communities],
        total=total,
        page=page,
        per_page=per_page,
        has_more=(offset + len(communities)) < total,
    )


# ─────────────────────────────────────────────────────────────────────────── #
#  GET /api/communities/{name}   – Get one community  (public)
# ─────────────────────────────────────────────────────────────────────────── #
@router.get(
    "/{name}",
    response_model=CommunityResponse,
    summary="Get a single community by name",
)
def get_community(name: str, db: Session = Depends(get_db)):
    """
    Returns full details of one community by its name.
    Used when a user clicks on a community to view it.
    No authentication required.
    """
    community = db.query(Community).filter(
        Community.name == name.lower()
    ).first()

    if not community:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Community '{name}' not found",
        )

    return _build_response(community, db)


# ─────────────────────────────────────────────────────────────────────────── #
#  DELETE /api/communities/{name}   – Delete a community  (protected, creator only)
# ─────────────────────────────────────────────────────────────────────────── #
@router.delete(
    "/{name}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a community (creator only)",
)
def delete_community(
    name: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Delete a community. Only the creator can do this.
    All posts inside the community are also deleted (cascade).
    """
    community = db.query(Community).filter(
        Community.name == name.lower()
    ).first()

    if not community:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Community '{name}' not found",
        )

    # Only the creator can delete their community
    if community.created_by != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the community creator can delete it",
        )

    db.delete(community)
    db.commit()
    # 204 No Content – nothing to return after deletion
