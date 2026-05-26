from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional

from app.database import get_db
from app.models.post import Post, PostType
from app.models.community import Community
from app.models.vote import Vote
from app.models.user import User
from app.schemas.post import PostCreate, PostResponse, PostListResponse
from app.utils.jwt import get_current_user, get_optional_user

router = APIRouter()


# ─────────────────────────────────────────────────────────────────────────── #
#  Helper – attach user_vote to a post dict
# ─────────────────────────────────────────────────────────────────────────── #
def _build_post_response(
    post: Post,
    db: Session,
    current_user: Optional[User] = None,
) -> dict:
    """
    Convert a Post model into a dict ready for PostResponse.
    Attaches user_vote so frontend knows if/how the user already voted.
    """
    user_vote = None
    if current_user:
        vote = db.query(Vote).filter(
            Vote.post_id == post.id,
            Vote.user_id == current_user.id,
        ).first()
        user_vote = vote.vote_type.value if vote else None

    return {
        "id":            post.id,
        "title":         post.title,
        "content":       post.content,
        "post_type":     post.post_type,
        "vote_count":    post.vote_count,
        "comment_count": post.comment_count,
        "author_id":     post.author_id,
        "community_id":  post.community_id,
        "created_at":    post.created_at,
        "author":        post.author,
        "community":     post.community,
        "user_vote":     user_vote,
    }


def _apply_sort(query, sort: str):
    """
    Apply sorting to a post query.
    sort=new   → newest first (default)
    sort=top   → highest vote count first
    sort=old   → oldest first
    """
    if sort == "top":
        return query.order_by(Post.vote_count.desc(), Post.created_at.desc())
    elif sort == "old":
        return query.order_by(Post.created_at.asc())
    else:  # "new" is default
        return query.order_by(Post.created_at.desc())


# ─────────────────────────────────────────────────────────────────────────── #
#  POST /api/posts   – Create a post  (protected)
# ─────────────────────────────────────────────────────────────────────────── #
@router.post(
    "/",
    response_model=PostResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new post",
)
def create_post(
    data: PostCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Create a new post inside a community (login required).

    Three post types supported:
    - text  → content is the body text
    - image → content is the image URL
    - link  → content is the external URL

    Steps:
    1. Verify the community exists
    2. Validate content rules per post type
    3. Save post linked to user and community
    4. Return the new post
    """
    # Step 1 – community must exist
    community = db.query(Community).filter(
        Community.id == data.community_id
    ).first()
    if not community:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Community with id {data.community_id} not found",
        )

    # Step 2 – content rules per type
    if data.post_type in (PostType.image, PostType.link):
        if not data.content or not data.content.startswith("http"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"{data.post_type.value} posts require a valid URL in content",
            )

    # Step 3 – create and save
    post = Post(
        title=data.title,
        content=data.content,
        post_type=data.post_type,
        author_id=current_user.id,
        community_id=data.community_id,
        vote_count=0,
        comment_count=0,
    )
    db.add(post)
    db.commit()
    db.refresh(post)

    return _build_post_response(post, db, current_user)


# ─────────────────────────────────────────────────────────────────────────── #
#  GET /api/posts   – List all posts  (public)
# ─────────────────────────────────────────────────────────────────────────── #
@router.get(
    "/",
    response_model=PostListResponse,
    summary="List all posts with sorting and pagination",
)
def list_posts(
    sort: str = Query(default="new", pattern="^(new|top|old)$"),
    page: int = Query(default=1, ge=1),
    per_page: int = Query(default=10, ge=1, le=50),
    db: Session = Depends(get_db),
    request: Request = None,
):
    current_user = get_optional_user(request, db) if request else None
    """
    Returns paginated posts from ALL communities.
    Used for the main home feed.

    Query params:
      ?sort=new      → newest first (default)
      ?sort=top      → most voted first
      ?sort=old      → oldest first
      ?page=1        → page number
      ?per_page=10   → results per page (max 50)
    """
    query = db.query(Post)
    total = query.count()

    query = _apply_sort(query, sort)
    offset = (page - 1) * per_page
    posts = query.offset(offset).limit(per_page).all()

    return PostListResponse(
        posts=[_build_post_response(p, db, current_user) for p in posts],
        total=total,
        page=page,
        per_page=per_page,
        has_more=(offset + len(posts)) < total,
    )


# ─────────────────────────────────────────────────────────────────────────── #
#  GET /api/posts/community/{name}  – Posts by community  (public)
# ─────────────────────────────────────────────────────────────────────────── #
@router.get(
    "/community/{name}",
    response_model=PostListResponse,
    summary="Get posts for a specific community",
)
def list_community_posts(
    name: str,
    sort: str = Query(default="new", pattern="^(new|top|old)$"),
    page: int = Query(default=1, ge=1),
    per_page: int = Query(default=10, ge=1, le=50),
    db: Session = Depends(get_db),
    request: Request = None,
):
    current_user = get_optional_user(request, db) if request else None
    """
    Returns paginated posts filtered to one community.
    Used when a user opens a specific community page.
    """
    # Verify the community exists first
    community = db.query(Community).filter(
        Community.name == name.lower()
    ).first()
    if not community:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Community '{name}' not found",
        )

    query = db.query(Post).filter(Post.community_id == community.id)
    total = query.count()

    query = _apply_sort(query, sort)
    offset = (page - 1) * per_page
    posts = query.offset(offset).limit(per_page).all()

    return PostListResponse(
        posts=[_build_post_response(p, db, current_user) for p in posts],
        total=total,
        page=page,
        per_page=per_page,
        has_more=(offset + len(posts)) < total,
    )


# ─────────────────────────────────────────────────────────────────────────── #
#  GET /api/posts/{id}   – Get single post  (public)
# ─────────────────────────────────────────────────────────────────────────── #
@router.get(
    "/{post_id}",
    response_model=PostResponse,
    summary="Get a single post by ID",
)
def get_post(
    post_id: int,
    db: Session = Depends(get_db),
    request: Request = None,
):
    current_user = get_optional_user(request, db) if request else None
    """
    Returns full details of a single post.
    Used when a user opens a post's detail page.
    Includes user_vote so frontend can highlight the correct button.
    """
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Post with id {post_id} not found",
        )
    return _build_post_response(post, db, current_user)


# ─────────────────────────────────────────────────────────────────────────── #
#  DELETE /api/posts/{id}   – Delete a post  (protected, author only)
# ─────────────────────────────────────────────────────────────────────────── #
@router.delete(
    "/{post_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a post (author only)",
)
def delete_post(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Delete a post. Only the original author can do this.
    All comments and votes on this post are also deleted (cascade).
    """
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Post with id {post_id} not found",
        )

    # Only the author can delete their own post
    if post.author_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the post author can delete this post",
        )

    db.delete(post)
    db.commit()
    # 204 No Content – nothing to return
