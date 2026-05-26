# Import all models here so Alembic can detect them
# and SQLAlchemy can create all tables at once

from app.models.user      import User
from app.models.community import Community
from app.models.post      import Post, PostType
from app.models.vote      import Vote, VoteType
from app.models.comment   import Comment

__all__ = [
    "User",
    "Community",
    "Post", "PostType",
    "Vote", "VoteType",
    "Comment",
]
