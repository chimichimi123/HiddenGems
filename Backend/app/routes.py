from flask import Blueprint, request, jsonify, session
from flask_login import login_required, current_user, login_user, logout_user
from .spotify import get_spotify_data
from .models import db, Song, User, SpotifyAccount
from datetime import datetime
from flask_cors import cross_origin
from flask_bcrypt import Bcrypt, check_password_hash

bcrypt = Bcrypt()
main_bp = Blueprint('main', __name__)

# Spotify-related routes
@main_bp.route('/spotify-data')
@login_required
def spotify_data():
    data = get_spotify_data("https://api.spotify.com/v1/me")
    return jsonify(data)

@main_bp.route('/add-song', methods=['POST'])
@login_required
def add_song():
    data = request.get_json()
    song = Song.query.filter_by(spotify_id=data['spotify_id']).first()
    if not song:
        song = Song(
            spotify_id=data['spotify_id'],
            title=data['title'],
            artist=data['artist'],
            release_date=datetime.strptime(data['release_date'], '%Y-%m-%d'),
            cover_image=data.get('cover_image'),
            embed_link=data.get('embed_link'),
            popularity=data.get('popularity'),
            label=data.get('label')
        )
        db.session.add(song)
        db.session.commit()
    if song not in current_user.songs:
        current_user.songs.append(song)
        db.session.commit()
    return jsonify({'message': 'Song added to collection'})

@main_bp.route('/liked-songs')
@login_required
def liked_songs():
    liked_songs = current_user.songs
    return jsonify([song.to_dict() for song in liked_songs])

@main_bp.route('/obscure-songs')
@login_required
def obscure_songs():
    obscure_songs = Song.query.filter(Song.popularity <= 35).all()
    return jsonify([song.to_dict() for song in obscure_songs])

@main_bp.route('/user-profile')
@login_required
def spotify_user_profile():
    profile_data = get_spotify_data("https://api.spotify.com/v1/me")
    return jsonify(profile_data)

@main_bp.route('/user-playlists')
@login_required
def user_playlists():
    playlists_data = get_spotify_data("https://api.spotify.com/v1/me/playlists")
    return jsonify(playlists_data)

@main_bp.route('/playlist-tracks/<playlist_id>')
@login_required
def playlist_tracks(playlist_id):
    tracks_data = get_spotify_data(f"https://api.spotify.com/v1/playlists/{playlist_id}/tracks")
    return jsonify(tracks_data)

@main_bp.route('/artist-info/<artist_id>')
@login_required
def artist_info(artist_id):
    artist_data = get_spotify_data(f"https://api.spotify.com/v1/artists/{artist_id}")
    return jsonify(artist_data)

@main_bp.route('/album-info/<album_id>')
@login_required
def album_info(album_id):
    album_data = get_spotify_data(f"https://api.spotify.com/v1/albums/{album_id}")
    return jsonify(album_data)

@main_bp.route('/search')
@login_required
def search():
    query = request.args.get('q')
    search_type = request.args.get('type', 'track') 
    search_data = get_spotify_data(f"https://api.spotify.com/v1/search?q={query}&type={search_type}")
    return jsonify(search_data)

#####################site routes#####################

@main_bp.route('/register', methods=['POST'])
@cross_origin(supports_credentials=True)
def register():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    if not username or not email or not password:
        return jsonify({"error": "Username, email, and password are required"}), 400

    if User.query.filter_by(username=username).first() or User.query.filter_by(email=email).first():
        return jsonify({"error": "Username or email already exists"}), 400

    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    user = User(username=username, email=email, password_hash=hashed_password)
    db.session.add(user)
    db.session.commit()
    return jsonify({"message": "User registered successfully"}), 201

@main_bp.route('/login', methods=['POST'])
@cross_origin(supports_credentials=True)
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    if not email or not password:
        return jsonify({'error': 'Missing email or password'}), 400

    user = User.query.filter_by(email=email).first()
    if user and check_password_hash(user.password_hash, password):
        login_user(user)
        response = jsonify({'message': 'Login successful!', 'user': user.to_dict()})
        return response, 200
    else:
        return jsonify({'error': 'Invalid email or password'}), 401


@main_bp.route('/check_login', methods=['GET'])
@cross_origin(supports_credentials=True)
def check_login():
    if current_user.is_authenticated:
        return jsonify({'logged_in': True, 'user': current_user.to_dict()})
    else:
        return jsonify({'logged_in': False})

@main_bp.route('/logout', methods=['POST'])
@cross_origin(supports_credentials=True)
@login_required
def logout():
    logout_user()
    session.clear()
    return jsonify({'message': 'Logout successful!'}), 200

@main_bp.route('/user', methods=['GET'])
@login_required
def get_user():
    user = current_user
    spotifyaccount = SpotifyAccount.query.filter_by(user_id=user.id).first()

    user_data = {
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'spotify_user_id': spotifyaccount.spotify_user_id if spotifyaccount else None,
        'spotify_profile_image': spotifyaccount.spotify_profile_image if spotifyaccount else None,
        'spotify_country': spotifyaccount.spotify_country if spotifyaccount else None,
        'created_at': user.created_at.strftime("%Y-%m-%d %H:%M:%S"),
        'songs': [song.to_dict() for song in user.songs],
        'spotify_account': spotifyaccount.to_dict() if spotifyaccount else None,
        'spotify_email': spotifyaccount.spotify_email if spotifyaccount else None,
        'spotify_followers': spotifyaccount.spotify_followers if spotifyaccount else None,
        'spotify_display_name': spotifyaccount.spotify_display_name if spotifyaccount else None
    }
    return jsonify(user_data)


@main_bp.route('/user/<int:id>', methods=['GET'])
@login_required
def get_user_by_id(id):
    user = User.query.get(id)
    if user:
        return jsonify(user.to_dict()), 200
    else:
        return jsonify({"error": "User not found"}), 404

@main_bp.route('/site-profile')
@login_required
def site_profile():
    user_profile = {
        "username": current_user.username,
        "email": current_user.email,
        "created_at": current_user.created_at.strftime("%Y-%m-%d %H:%M:%S"),
    }
    return jsonify(user_profile)
