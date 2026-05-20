from sqlalchemy import Column, Integer, String, DateTime, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class User(Base):
    """
    Represents a registered user.
    One user can have many posts, comments, and votes.
    """
    __tablename__ = "users"

    id         = Column(Integer, primary_key=True, index=True)
    username   = Column(String(50), unique=True, nullable=False, index=True)
    email      = Column(String(255), unique=True, nullable=False, index=True)
    password   = Column(String(255), nullable=False)          # bcrypt hash
    is_active  = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships – makes it easy to get a user's posts/comments
    posts      = relationship("Post",      back_populates="author",  cascade="all, delete")
    comments   = relationship("Comment",   back_populates="author",  cascade="all, delete")
    votes      = relationship("Vote",      back_populates="user",    cascade="all, delete")
    communities = relationship("Community", back_populates="creator", cascade="all, delete")

    def __repr__(self):
        return f"<User id={self.id} username={self.username}>"
