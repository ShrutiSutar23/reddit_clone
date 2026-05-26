"""Initial migration - create all tables

Revision ID: 001_initial
Revises:
Create Date: 2026-05-09

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers
revision = '001_initial'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Create all tables from scratch."""

    # ------------------------------------------------------------------ #
    # 1. USERS
    # ------------------------------------------------------------------ #
    op.create_table(
        'users',
        sa.Column('id',         sa.Integer(),     nullable=False),
        sa.Column('username',   sa.String(50),    nullable=False),
        sa.Column('email',      sa.String(255),   nullable=False),
        sa.Column('password',   sa.String(255),   nullable=False),
        sa.Column('is_active',  sa.Boolean(),     nullable=True,  default=True),
        sa.Column('created_at', sa.DateTime(timezone=True),
                  server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_users_id',       'users', ['id'],       unique=False)
    op.create_index('ix_users_username', 'users', ['username'], unique=True)
    op.create_index('ix_users_email',    'users', ['email'],    unique=True)

    # ------------------------------------------------------------------ #
    # 2. COMMUNITIES
    # ------------------------------------------------------------------ #
    op.create_table(
        'communities',
        sa.Column('id',          sa.Integer(),    nullable=False),
        sa.Column('name',        sa.String(100),  nullable=False),
        sa.Column('description', sa.Text(),       nullable=True),
        sa.Column('created_by',  sa.Integer(),    nullable=False),
        sa.Column('created_at',  sa.DateTime(timezone=True),
                  server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['created_by'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_communities_id',   'communities', ['id'],   unique=False)
    op.create_index('ix_communities_name', 'communities', ['name'], unique=True)

    # ------------------------------------------------------------------ #
    # 3. POSTS
    # ------------------------------------------------------------------ #
    op.create_table(
        'posts',
        sa.Column('id',            sa.Integer(),    nullable=False),
        sa.Column('title',         sa.String(300),  nullable=False),
        sa.Column('content',       sa.Text(),       nullable=True),
        sa.Column('post_type',     sa.Enum('text', 'image', 'link', name='posttype'),
                  nullable=False, default='text'),
        sa.Column('vote_count',    sa.Integer(),    nullable=True, default=0),
        sa.Column('comment_count', sa.Integer(),    nullable=True, default=0),
        sa.Column('author_id',     sa.Integer(),    nullable=False),
        sa.Column('community_id',  sa.Integer(),    nullable=False),
        sa.Column('created_at',    sa.DateTime(timezone=True),
                  server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['author_id'],    ['users.id'],       ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['community_id'], ['communities.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_posts_id', 'posts', ['id'], unique=False)

    # ------------------------------------------------------------------ #
    # 4. VOTES
    # ------------------------------------------------------------------ #
    op.create_table(
        'votes',
        sa.Column('id',         sa.Integer(),   nullable=False),
        sa.Column('vote_type',  sa.Enum('upvote', 'downvote', name='votetype'), nullable=False),
        sa.Column('user_id',    sa.Integer(),   nullable=False),
        sa.Column('post_id',    sa.Integer(),   nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True),
                  server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['post_id'], ['posts.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id', 'post_id', name='unique_user_post_vote'),
    )
    op.create_index('ix_votes_id', 'votes', ['id'], unique=False)

    # ------------------------------------------------------------------ #
    # 5. COMMENTS
    # ------------------------------------------------------------------ #
    op.create_table(
        'comments',
        sa.Column('id',         sa.Integer(),  nullable=False),
        sa.Column('content',    sa.Text(),     nullable=False),
        sa.Column('author_id',  sa.Integer(),  nullable=False),
        sa.Column('post_id',    sa.Integer(),  nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True),
                  server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['author_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['post_id'],   ['posts.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_comments_id', 'comments', ['id'], unique=False)


def downgrade() -> None:
    """Drop all tables (reverse of upgrade)."""
    op.drop_table('comments')
    op.drop_table('votes')
    op.drop_table('posts')
    op.drop_table('communities')
    op.drop_table('users')
    # Drop custom enum types
    op.execute("DROP TYPE IF EXISTS posttype")
    op.execute("DROP TYPE IF EXISTS votetype")
