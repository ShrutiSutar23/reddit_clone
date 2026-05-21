from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.models.comment import Comment
from app.models.post import Post
from app.models.user import User
from app.schemas.comment import (
    CommentCreate,
    CommentUpdate,
    CommentResponse,
    CommentListResponse,
    DeleteResponse,
)
from app.utils.jwt import get_current_user, get_optional_user

router = APIRouter()


# ─────────────────────────────────────────────────────────────────────────── #
#  Helper – attach is_owner flag to a comment
# ─────────────────────────────────────────────────────────────────────────── #
def _build_comment_response(
    comment: Comment,
    current_user: Optional[User] = None,
) -> dict:
    """
    Convert a Comment model into a dict for CommentResponse.
    Attaches is_owner so frontend knows whether to show Delete button.
    """
    return {
        "id":         comment.id,
        "content":    comment.content,
        "author_id":  comment.author_id,
        "post_id":    comment.post_id,
        "created_at": comment.created_at,
        "author":     comment.author,
        "is_owner":   (current_user is not None and
                       comment.author_id == current_user.id),
    }


# ─────────────────────────────────────────────────────────────────────────── #
#  POST /api/posts/{post_id}/comments  – Add a comment  (protected)
# ─────────────────────────────────────────────────────────────────────────── #
@router.post(
    "/posts/{post_id}/comments",
    response_model=CommentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add a comment to a post",
)
def add_comment(
    post_id: int,
    data: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Add a comment to a post (login required).

    Steps:
    1. Verify the post exists
    2. Save the comment linked to post and user
    3. Increment the post's comment_count
    4. Return the new comment with author info
    """
    # Step 1 – post must exist
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Post with id {post_id} not found",
        )

    # Step 2 – save the comment
    comment = Comment(
        content=data.content,
        author_id=current_user.id,
        post_id=post_id,
    )
    db.add(comment)
    db.commit()

    # Step 3 – increment comment count on the post
    post.comment_count = (post.comment_count or 0) + 1
    db.commit()
    db.refresh(comment)

    # Step 4 – return with is_owner=True (user just created it)
    return _build_comment_response(comment, current_user)


# ─────────────────────────────────────────────────────────────────────────── #
#  GET /api/posts/{post_id}/comments  – List comments  (public)
# ─────────────────────────────────────────────────────────────────────────── #
@router.get(
    "/posts/{post_id}/comments",
    response_model=CommentListResponse,
    summary="Get all comments for a post",
)
def list_comments(
    post_id: int,
    page: int = Query(default=1, ge=1),
    per_page: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
    request: Request = None,
):
    current_user = get_optional_user(request, db) if request else None
    """
    Returns paginated comments for a post, oldest first.
    No login required — anyone can read comments.

    is_owner flag on each comment tells the frontend
    whether to show the Delete button for that comment.
    """
    # Verify the post exists
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Post with id {post_id} not found",
        )

    query = db.query(Comment).filter(Comment.post_id == post_id)
    total = query.count()

    # Show oldest comments first (chronological order)
    offset = (page - 1) * per_page
    comments = (
        query
        .order_by(Comment.created_at.asc())
        .offset(offset)
        .limit(per_page)
        .all()
    )

    return CommentListResponse(
        comments=[_build_comment_response(c, current_user) for c in comments],
        total=total,
        page=page,
        per_page=per_page,
        has_more=(offset + len(comments)) < total,
    )


# ─────────────────────────────────────────────────────────────────────────── #
#  PUT /api/comments/{comment_id}  – Edit a comment  (protected, author only)
# ─────────────────────────────────────────────────────────────────────────── #
@router.put(
    "/comments/{comment_id}",
    response_model=CommentResponse,
    summary="Edit a comment (author only)",
)
def edit_comment(
    comment_id: int,
    data: CommentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Edit the content of a comment.
    Only the comment author can edit it.
    """
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Comment with id {comment_id} not found",
        )

    # Only author can edit
    if comment.author_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the comment author can edit this comment",
        )

    comment.content = data.content
    db.commit()
    db.refresh(comment)

    return _build_comment_response(comment, current_user)


# ─────────────────────────────────────────────────────────────────────────── #
#  DELETE /api/comments/{comment_id}  – Delete a comment  (protected, author only)
# ─────────────────────────────────────────────────────────────────────────── #
@router.delete(
    "/comments/{comment_id}",
    response_model=DeleteResponse,
    summary="Delete a comment (author only)",
)
def delete_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Delete a comment (login required, author only).

    Steps:
    1. Find the comment
    2. Verify the current user is the author
    3. Delete the comment
    4. Decrement the post's comment_count
    5. Return confirmation message
    """
    # Step 1 – find comment
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Comment with id {comment_id} not found",
        )

    # Step 2 – only author can delete
    if comment.author_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the comment author can delete this comment",
        )

    # Step 3 – delete comment
    post_id = comment.post_id
    db.delete(comment)
    db.commit()

    # Step 4 – decrement comment_count on the post
    post = db.query(Post).filter(Post.id == post_id).first()
    if post and post.comment_count > 0:
        post.comment_count -= 1
        db.commit()

    # Step 5 – return confirmation
    return DeleteResponse(
        message="Comment deleted successfully",
        comment_id=comment_id,
    )


# ─────────────────────────────────────────────────────────────────────────── #
#  GET /api/users/{username}/comments  – All comments by a user  (public)
# ─────────────────────────────────────────────────────────────────────────── #
@router.get(
    "/users/{username}/comments",
    response_model=CommentListResponse,
    summary="Get all comments made by a user",
)
def list_user_comments(
    username: str,
    page: int = Query(default=1, ge=1),
    per_page: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
    request: Request = None,
):
    current_user = get_optional_user(request, db) if request else None
    """
    Returns all comments made by a specific user.
    Useful for profile pages showing a user's comment history.
    """
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User '{username}' not found",
        )

    query = db.query(Comment).filter(Comment.author_id == user.id)
    total = query.count()

    offset = (page - 1) * per_page
    comments = (
        query
        .order_by(Comment.created_at.desc())
        .offset(offset)
        .limit(per_page)
        .all()
    )

    return CommentListResponse(
        comments=[_build_comment_response(c, current_user) for c in comments],
        total=total,
        page=page,
        per_page=per_page,
        has_more=(offset + len(comments)) < total,
    )
