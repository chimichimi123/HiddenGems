"""empty message

Revision ID: bb05fbe34ff3
Revises: 
Create Date: 2024-07-30 23:50:31.804256

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'bb05fbe34ff3'
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
    sa.Column('display_name', sa.String(length=80), nullable=True),
    sa.Column('bio', sa.Text(), nullable=True),
    sa.Column('profile_image', sa.String(length=200), nullable=True),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('email'),
    sa.UniqueConstraint('username')
    )
    op.create_table('least_popular_track',
    sa.Column('id', sa.String(), nullable=False),
    sa.Column('name', sa.String(), nullable=False),
    sa.Column('artist', sa.String(), nullable=False),
    sa.Column('album', sa.String(), nullable=True),
    sa.Column('popularity', sa.Integer(), nullable=True),
    sa.Column('image_url', sa.String(), nullable=True),
    sa.Column('embed_url', sa.String(), nullable=True),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('song',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('title', sa.String(length=150), nullable=False),
    sa.Column('artist', sa.String(length=150), nullable=False),
    sa.Column('album', sa.String(length=150), nullable=True),
    sa.Column('duration', sa.Integer(), nullable=True),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('spotify_account',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=True),
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
    op.create_table('top_artist',
    sa.Column('id', sa.String(), nullable=False),
    sa.Column('name', sa.String(), nullable=False),
    sa.Column('image_url', sa.String(), nullable=True),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('top_track',
    sa.Column('id', sa.String(), nullable=False),
    sa.Column('name', sa.String(), nullable=False),
    sa.Column('artist', sa.String(), nullable=False),
    sa.Column('album', sa.String(), nullable=True),
    sa.Column('popularity', sa.Integer(), nullable=True),
    sa.Column('image_url', sa.String(), nullable=True),
    sa.Column('embed_url', sa.String(), nullable=True),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('spotify_song',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('spotify_account_id', sa.Integer(), nullable=False),
    sa.Column('song_id', sa.String(), nullable=False),
    sa.Column('name', sa.String(), nullable=False),
    sa.Column('artist', sa.String(), nullable=False),
    sa.Column('album', sa.String(), nullable=True),
    sa.Column('popularity', sa.Integer(), nullable=True),
    sa.Column('image', sa.String(), nullable=True),
    sa.ForeignKeyConstraint(['spotify_account_id'], ['spotify_account.id'], ),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('song_id')
    )
    op.create_table('liked_song',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('spotify_song_id', sa.String(), nullable=False),
    sa.Column('added_at', sa.DateTime(), nullable=True),
    sa.Column('name', sa.String(), nullable=False),
    sa.Column('artist', sa.String(), nullable=False),
    sa.Column('album', sa.String(), nullable=True),
    sa.Column('image', sa.String(), nullable=True),
    sa.Column('popularity', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['spotify_song_id'], ['spotify_song.id'], ),
    sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('liked_song')
    op.drop_table('spotify_song')
    op.drop_table('top_track')
    op.drop_table('top_artist')
    op.drop_table('spotify_account')
    op.drop_table('song')
    op.drop_table('least_popular_track')
    op.drop_table('user')
    # ### end Alembic commands ###
