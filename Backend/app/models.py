from sqlalchemy_serializer import SerializerMixin
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin
from .Lemon import db
from datetime import datetime

# Association tables for many-to-many relationships
user_genres = db.Table(
    'user_genres',
    db.Column('user_id', db.Integer, db.ForeignKey('user.id'), primary_key=True),
    db.Column('genre_id', db.Integer, db.ForeignKey('genre.id'), primary_key=True)
)

user_instruments = db.Table(
    'user_instruments',
    db.Column('user_id', db.Integer, db.ForeignKey('user.id'), primary_key=True),
    db.Column('instrument_id', db.Integer, db.ForeignKey('instrument.id'), primary_key=True)
)

class User(db.Model, UserMixin, SerializerMixin):
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), unique=True, nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=True)
    display_name = db.Column(db.String(80))
    bio = db.Column(db.Text)
    profile_image = db.Column(db.String(200))
    
    # Establish many-to-many relationships
    genres = db.relationship('Genre', secondary=user_genres, backref='users')
    instruments = db.relationship('Instrument', secondary=user_instruments, backref='users')

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

    serialize_rules = ('-password_hash', '-user_genres', '-user_instruments', '-user_friendships', '-messages_sent', '-messages_received')


class Genre(db.Model, SerializerMixin):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)


class Instrument(db.Model, SerializerMixin):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)


class Friendship(db.Model, SerializerMixin):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    friend_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    status = db.Column(db.String(20), default='pending')  # status: pending, accepted, declined
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', foreign_keys=[user_id], backref='friendships')
    friend = db.relationship('User', foreign_keys=[friend_id])
    
    serialize_rules = ('-user.friendships', '-friend.friendships')


class Message(db.Model, SerializerMixin):
    id = db.Column(db.Integer, primary_key=True)
    sender_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    receiver_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    sender = db.relationship('User', foreign_keys=[sender_id], backref='sent_messages')
    receiver = db.relationship('User', foreign_keys=[receiver_id], backref='received_messages')
    
    serialize_rules = ('-sender.sent_messages', '-receiver.received_messages')
