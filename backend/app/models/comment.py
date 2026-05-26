from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Comment(Base):
    """
    Represents a comment on a post.
    Each comment belongs to one user and one post.
    """
    __tablename__ = "comments"

    id         = Column(Integer, primary_key=True, index=True)
    content    = Column(Text, nullable=False)
    author_id  = Column(Integer, ForeignKey("users.id",  ondelete="CASCADE"), nullable=False)
    post_id    = Column(Integer, ForeignKey("posts.id",  ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    author = relationship("User", back_populates="comments")
    post   = relationship("Post", back_populates="comments")

    def __repr__(self):
        return f"<Comment id={self.id} author={self.author_id}>"
