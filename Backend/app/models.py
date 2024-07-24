from sqlalchemy_serializer import SerializerMixin
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin
from . import db, login_manager
from datetime import datetime

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

class User(db.Model, UserMixin, SerializerMixin):
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), unique=True, nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=True)

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
    
    songs = db.relationship('Song', back_populates='user')
    spotify_account = db.relationship('SpotifyAccount', back_populates='user', uselist=False)
    
    serialize_rules = ('-spotify_account',)

class Song(db.Model, SerializerMixin):
    id = db.Column(db.Integer, primary_key=True)
    spotify_id = db.Column(db.String(50), nullable=False)
    title = db.Column(db.String(100), nullable=False)
    artist = db.Column(db.String(100), nullable=False)
    release_date = db.Column(db.Date, nullable=False)
    cover_image = db.Column(db.String(255), nullable=True)
    embed_link = db.Column(db.String(255), nullable=True)
    popularity = db.Column(db.Integer, nullable=True)
    label = db.Column(db.String(100), nullable=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    user = db.relationship('User', back_populates='songs')

class SpotifyAccount(db.Model, SerializerMixin):
        
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    spotify_user_id = db.Column(db.String, nullable=False)
    spotify_access_token = db.Column(db.String, nullable=False)
    spotify_refresh_token = db.Column(db.String, nullable=True)
    spotify_profile_image = db.Column(db.String, nullable=True)
    spotify_country = db.Column(db.String, nullable=True)
    spotify_display_name = db.Column(db.String, nullable=True)
    spotify_email = db.Column(db.String, nullable=True)
    spotify_followers = db.Column(db.Integer, nullable=True)

    user = db.relationship('User', back_populates='spotify_account')

    serialize_rules = ('-user',)