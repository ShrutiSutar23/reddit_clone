from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Community(Base):
    """
    Represents a community (like a subreddit e.g. r/cricket).
    One community can have many posts.
    Each community is created by one user.
    """
    __tablename__ = "communities"

    id          = Column(Integer, primary_key=True, index=True)
    name        = Column(String(100), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    created_by  = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at  = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    creator = relationship("User",  back_populates="communities")
    posts   = relationship("Post",  back_populates="community", cascade="all, delete")

    def __repr__(self):
        return f"<Community id={self.id} name={self.name}>"
