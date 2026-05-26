from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.database import Base


class PostType(str, enum.Enum):
    """The three types of posts allowed."""
    text  = "text"
    image = "image"
    link  = "link"


class Post(Base):
    """
    Represents a post inside a community.
    Each post belongs to one user and one community.
    A post can have many votes and comments.
    """
    __tablename__ = "posts"

    id           = Column(Integer, primary_key=True, index=True)
    title        = Column(String(300), nullable=False)
    content      = Column(Text, nullable=True)               # text body or URL
    post_type    = Column(Enum(PostType), default=PostType.text, nullable=False)
    vote_count   = Column(Integer, default=0)                # cached vote total
    comment_count = Column(Integer, default=0)               # cached comment total
    author_id    = Column(Integer, ForeignKey("users.id",       ondelete="CASCADE"), nullable=False)
    community_id = Column(Integer, ForeignKey("communities.id", ondelete="CASCADE"), nullable=False)
    created_at   = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    author    = relationship("User",      back_populates="posts")
    community = relationship("Community", back_populates="posts")
    comments  = relationship("Comment",   back_populates="post", cascade="all, delete")
    votes     = relationship("Vote",      back_populates="post", cascade="all, delete")

    def __repr__(self):
        return f"<Post id={self.id} title={self.title[:30]}>"
