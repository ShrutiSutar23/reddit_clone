from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models.post import Post
from app.models.vote import Vote, VoteType
from app.models.user import User
from app.schemas.vote import VoteCreate, VoteResponse
from app.utils.jwt import get_current_user

router = APIRouter()


# ─────────────────────────────────────────────────────────────────────────── #
#  Helper – recalculate and save vote_count on a post
# ─────────────────────────────────────────────────────────────────────────── #
def _recalculate_vote_count(post: Post, db: Session) -> int:
    """
    Count all upvotes minus all downvotes for a post.
    Updates post.vote_count in the database.

    We always recalculate from the votes table rather than
    just +1 or -1 to prevent count drift over time.
    """
    upvotes = db.query(func.count(Vote.id)).filter(
        Vote.post_id == post.id,
        Vote.vote_type == VoteType.upvote,
    ).scalar() or 0

    downvotes = db.query(func.count(Vote.id)).filter(
        Vote.post_id == post.id,
        Vote.vote_type == VoteType.downvote,
    ).scalar() or 0

    new_count = upvotes - downvotes
    post.vote_count = new_count
    db.commit()
    return new_count


# ─────────────────────────────────────────────────────────────────────────── #
#  POST /api/posts/{post_id}/vote   – Vote on a post  (protected)
# ─────────────────────────────────────────────────────────────────────────── #
@router.post(
    "/posts/{post_id}/vote",
    response_model=VoteResponse,
    summary="Upvote or downvote a post",
)
def vote_on_post(
    post_id: int,
    vote_data: VoteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Handle all 3 voting scenarios for a post (login required):

    SCENARIO 1 – No existing vote → ADD new vote
        User hasn't voted → save new vote row → count +1 or -1

    SCENARIO 2 – Same vote type clicked again → REMOVE vote (undo)
        User upvoted and clicks upvote again → delete vote row → undo

    SCENARIO 3 – Different vote type clicked → SWITCH vote
        User upvoted then clicks downvote → update vote row → count -2

    Returns the new vote count and user's current vote state.
    """
    # Verify post exists
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Post with id {post_id} not found",
        )

    # Check for existing vote by this user on this post
    existing_vote = db.query(Vote).filter(
        Vote.post_id  == post_id,
        Vote.user_id  == current_user.id,
    ).first()

    # ── SCENARIO 1: No existing vote → ADD ─────────────────────────────── #
    if existing_vote is None:
        new_vote = Vote(
            vote_type=vote_data.vote_type,
            user_id=current_user.id,
            post_id=post_id,
        )
        db.add(new_vote)
        db.commit()

        new_count = _recalculate_vote_count(post, db)
        return VoteResponse(
            post_id=post_id,
            new_vote_count=new_count,
            user_vote=vote_data.vote_type.value,
            action="added",
        )

    # ── SCENARIO 2: Same vote type → REMOVE (undo) ──────────────────────── #
    if existing_vote.vote_type == vote_data.vote_type:
        db.delete(existing_vote)
        db.commit()

        new_count = _recalculate_vote_count(post, db)
        return VoteResponse(
            post_id=post_id,
            new_vote_count=new_count,
            user_vote=None,       # no active vote after undo
            action="removed",
        )

    # ── SCENARIO 3: Different vote type → SWITCH ────────────────────────── #
    existing_vote.vote_type = vote_data.vote_type
    db.commit()

    new_count = _recalculate_vote_count(post, db)
    return VoteResponse(
        post_id=post_id,
        new_vote_count=new_count,
        user_vote=vote_data.vote_type.value,
        action="switched",
    )


# ─────────────────────────────────────────────────────────────────────────── #
#  GET /api/posts/{post_id}/votes  – Get vote summary for a post  (public)
# ─────────────────────────────────────────────────────────────────────────── #
@router.get(
    "/posts/{post_id}/votes",
    summary="Get vote counts for a post",
)
def get_post_votes(
    post_id: int,
    db: Session = Depends(get_db),
):
    """
    Returns upvote count, downvote count and total score for a post.
    Useful for detailed vote breakdowns on the post detail page.
    """
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Post with id {post_id} not found",
        )

    upvotes = db.query(func.count(Vote.id)).filter(
        Vote.post_id  == post_id,
        Vote.vote_type == VoteType.upvote,
    ).scalar() or 0

    downvotes = db.query(func.count(Vote.id)).filter(
        Vote.post_id  == post_id,
        Vote.vote_type == VoteType.downvote,
    ).scalar() or 0

    return {
        "post_id":   post_id,
        "upvotes":   upvotes,
        "downvotes": downvotes,
        "score":     upvotes - downvotes,
    }
