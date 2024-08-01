from sqlalchemy_serializer import SerializerMixin
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin
from .BAH import db
from datetime import datetime
from sqlalchemy import PrimaryKeyConstraint

class User(db.Model, UserMixin, SerializerMixin):
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), unique=True, nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=True)
    display_name = db.Column(db.String(80))
    bio = db.Column(db.Text)
    profile_image = db.Column(db.String(200))
    

    @property
    def is_active(self):
        return True
    
    @property
    def is_authenticated(self):
        return True
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def get_id(self):
        return str(self.id)
    
    liked_songs = db.relationship('LikedSong', back_populates='user')
    songs = db.relationship('Song', back_populates='user', lazy=True)
    spotify_account = db.relationship('SpotifyAccount', back_populates='user', uselist=False)

    serialize_rules = ('-spotify_account', '-liked_songs')

class SpotifyAccount(db.Model, SerializerMixin):
        
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    spotify_user_id = db.Column(db.String, nullable=False)
    spotify_access_token = db.Column(db.String, nullable=False)
    spotify_refresh_token = db.Column(db.String, nullable=True)
    spotify_profile_image = db.Column(db.String, nullable=True)
    spotify_country = db.Column(db.String, nullable=True)
    spotify_display_name = db.Column(db.String, nullable=True)
    spotify_email = db.Column(db.String, nullable=True)
    spotify_followers = db.Column(db.Integer, nullable=True)

    user = db.relationship('User', back_populates='spotify_account')
    spotify_songs = db.relationship('SpotifySong', back_populates='spotify_account')

    serialize_rules = ('-user', '-spotify_songs')

class SpotifySong(db.Model, SerializerMixin):
    id = db.Column(db.Integer, primary_key=True)
    spotify_account_id = db.Column(db.Integer, db.ForeignKey('spotify_account.id'), nullable=False)
    song_id = db.Column(db.String, unique=True, nullable=False)
    name = db.Column(db.String, nullable=False)
    artist = db.Column(db.String, nullable=False)
    album = db.Column(db.String, nullable=True)
    popularity = db.Column(db.Integer, nullable=True)
    image = db.Column(db.String, nullable=True)

    spotify_account = db.relationship('SpotifyAccount', back_populates='spotify_songs')
    liked_by_users = db.relationship('LikedSong', back_populates='spotify_song')
    
    serialize_rules = ('-spotify_account', '-liked_by_users.user')

class LikedSong(db.Model, SerializerMixin):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    spotify_song_id = db.Column(db.String, db.ForeignKey('spotify_song.id'), nullable=False)
    added_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    name = db.Column(db.String, nullable=False)
    artist = db.Column(db.String, nullable=False)
    album = db.Column(db.String, nullable=True)
    image = db.Column(db.String, nullable=True)
    popularity = db.Column(db.Integer, nullable=True)
    
    user = db.relationship('User', back_populates='liked_songs')
    spotify_song = db.relationship('SpotifySong', back_populates='liked_by_users')
    
    serialize_rules = ('-user', '-spotify_song.liked_by_users')
    
class Song(db.Model, SerializerMixin):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(150), nullable=False)
    artist = db.Column(db.String(150), nullable=False)
    album = db.Column(db.String(150))
    duration = db.Column(db.Integer)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    user = db.relationship('User', back_populates='songs')
    
    serialize_rules = ('-user',)
    
class TopArtist(db.Model, SerializerMixin):
    id = db.Column(db.String)
    name = db.Column(db.String, nullable=False)
    image_url = db.Column(db.String)
    followers = db.Column(db.Integer)
    genres = db.Column(db.String)
    popularity = db.Column(db.Integer)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    user = db.relationship('User', backref=db.backref('top_artists', lazy=True))
    
    __table_args__ = (
        PrimaryKeyConstraint('id', 'user_id'),
    )
    
    serialize_rules = ('-user',)

class TopTrack(db.Model, SerializerMixin):
    id = db.Column(db.String, primary_key=True)
    name = db.Column(db.String, nullable=False)
    artist = db.Column(db.String, nullable=False)
    album = db.Column(db.String)
    popularity = db.Column(db.Integer)
    image_url = db.Column(db.String)
    embed_url = db.Column(db.String)

    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    user = db.relationship('User', backref=db.backref('top_tracks', lazy=True))
    
    serialize_rules = ('-user',)

class LeastPopularTrack(db.Model, SerializerMixin):
    id = db.Column(db.String, primary_key=True)
    name = db.Column(db.String, nullable=False)
    artist = db.Column(db.String, nullable=False)
    album = db.Column(db.String)
    popularity = db.Column(db.Integer)
    image_url = db.Column(db.String)
    embed_url = db.Column(db.String)

    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    user = db.relationship('User', backref=db.backref('least_popular_tracks', lazy=True))
    
    serialize_rules = ('-user',)