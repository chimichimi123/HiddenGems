"""empty message

Revision ID: 6988d8c2243f
Revises: 
Create Date: 2024-07-24 18:07:24.843664

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '6988d8c2243f'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('user',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('username', sa.String(length=150), nullable=False),
    sa.Column('email', sa.String(length=150), nullable=False),
    sa.Column('password_hash', sa.String(length=128), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('email'),
    sa.UniqueConstraint('username')
    )
    op.create_table('song',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('spotify_id', sa.String(length=50), nullable=False),
    sa.Column('title', sa.String(length=100), nullable=False),
    sa.Column('artist', sa.String(length=100), nullable=False),
    sa.Column('release_date', sa.Date(), nullable=False),
    sa.Column('cover_image', sa.String(length=255), nullable=True),
    sa.Column('embed_link', sa.String(length=255), nullable=True),
    sa.Column('popularity', sa.Integer(), nullable=True),
    sa.Column('label', sa.String(length=100), nullable=True),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('spotify_account',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('spotify_user_id', sa.String(), nullable=False),
    sa.Column('spotify_access_token', sa.String(), nullable=False),
    sa.Column('spotify_refresh_token', sa.String(), nullable=True),
    sa.Column('spotify_profile_image', sa.String(), nullable=True),
    sa.Column('spotify_country', sa.String(), nullable=True),
    sa.Column('spotify_display_name', sa.String(), nullable=True),
    sa.Column('spotify_email', sa.String(), nullable=True),
    sa.Column('spotify_followers', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('spotify_account')
    op.drop_table('song')
    op.drop_table('user')
    # ### end Alembic commands ###