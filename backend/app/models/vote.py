from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.database import Base


class VoteType(str, enum.Enum):
    """Only two vote types allowed."""
    upvote   = "upvote"
    downvote = "downvote"


class Vote(Base):
    """
    Represents one user's vote on one post.
    The UniqueConstraint ensures one user = one vote per post.
    """
    __tablename__ = "votes"

    # Enforce: one user can only have ONE vote per post
    __table_args__ = (
        UniqueConstraint("user_id", "post_id", name="unique_user_post_vote"),
    )

    id         = Column(Integer, primary_key=True, index=True)
    vote_type  = Column(Enum(VoteType), nullable=False)
    user_id    = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    post_id    = Column(Integer, ForeignKey("posts.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="votes")
    post = relationship("Post", back_populates="votes")

    def __repr__(self):
        return f"<Vote user={self.user_id} post={self.post_id} type={self.vote_type}>"
