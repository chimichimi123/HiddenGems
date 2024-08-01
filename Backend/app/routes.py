from flask import Blueprint, request, jsonify, session, make_response, current_app, send_from_directory, url_for, redirect
from flask_login import login_required, current_user, login_user, logout_user
from .models import db, User, SpotifyAccount, LikedSong, SpotifySong
from datetime import datetime
from spotipy import Spotify
from .spotify_auth import FlaskSessionHandler
from spotipy.oauth2 import SpotifyOAuth
import spotipy
from flask_cors import cross_origin
from flask_bcrypt import Bcrypt, check_password_hash
from werkzeug.utils import secure_filename
import os
import logging

bcrypt = Bcrypt()
main_bp = Blueprint('main', __name__)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS
           
           

def get_spotify_oauth():
    SPOTIPY_CLIENT_ID = current_app.config['SPOTIPY_CLIENT_ID']
    SPOTIPY_CLIENT_SECRET = current_app.config['SPOTIPY_CLIENT_SECRET']
    SPOTIPY_REDIRECT_URI = current_app.config['SPOTIPY_REDIRECT_URI']
    
    return SpotifyOAuth(
        SPOTIPY_CLIENT_ID,
        SPOTIPY_CLIENT_SECRET,
        SPOTIPY_REDIRECT_URI,
        scope='user-read-private user-read-email user-top-read user-library-read user-follow-read playlist-read-private',
        show_dialog=True,
        cache_handler=FlaskSessionHandler()  # Ensure FlaskSessionHandler is imported here
    )
           
           

#########################SPOTIFY ROUTES#####################


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
        
        spotify_account = SpotifyAccount.query.filter_by(user_id=user.id).first()
        
        if spotify_account:
            if spotify_account.spotify_access_token:
                sp = Spotify(auth=spotify_account.spotify_access_token)
                try:
                    sp.current_user()
                except spotipy.SpotifyException as e:
                    if e.http_status == 401:
                        # Token is expired, refresh it
                        sp_oauth = get_spotify_oauth()
                        try:
                            token_info = sp_oauth.refresh_access_token(spotify_account.spotify_refresh_token)
                            new_access_token = token_info['access_token']
                            
                            # Update the database with the new access token
                            spotify_account.spotify_access_token = new_access_token
                            db.session.commit()
                            
                            # Use the new access token
                            sp = Spotify(auth=new_access_token)
                        except Exception as refresh_e:
                            print(f"Failed to refresh access token: {refresh_e}")
                            return jsonify({'error': 'Failed to refresh Spotify token'}), 500
            else:
                # No access token found, start the OAuth flow
                sp_oauth = get_spotify_oauth()
                authorize_url = sp_oauth.get_authorize_url()
                
                # Return the authorization URL for the client to handle
                return jsonify({'authorize_url': authorize_url})
        
        # Return a success message after successful login
        return jsonify({'message': 'Login successful'})
    else:
        return jsonify({'error': 'Invalid email or password'}), 401




@main_bp.route('/check_login', methods=['GET'])
@cross_origin(supports_credentials=True)
def check_login():
    if current_user.is_authenticated:
        # Check if Spotify account is linked and has a valid access token
        spotify_account = SpotifyAccount.query.filter_by(user_id=current_user.id).first()
        if spotify_account and spotify_account.spotify_access_token:
            # Optionally, verify if the access token is still valid
            sp = Spotify(auth=spotify_account.spotify_access_token)
            try:
                sp.current_user()  # Attempt to fetch current user to validate token
                spotify_authenticated = True
            except:
                spotify_authenticated = False
        else:
            spotify_authenticated = False

        return jsonify({
            'logged_in': True,
            'user': current_user.to_dict(),
            'spotify_authenticated': spotify_authenticated
        })
    else:
        return jsonify({'logged_in': False})


@main_bp.route('/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    session.clear()
    return jsonify({'message': 'Logout successful!'}), 200

@main_bp.route('/user', methods=['GET'])
@login_required
def get_user():
    if current_user.is_anonymous:
        return make_response(jsonify({"message": "no user logged in"}), 401)
    
    
    user = current_user
    spotifyaccount = SpotifyAccount.query.filter_by(user_id=user.id).first()
    liked_songs_data = [song.to_dict() for song in user.liked_songs]

    user_data = {
        'id': user.id,
        'username': user.username,
        'email': user.email,
        "display_name": user.display_name,
        "bio": user.bio,
        "profile_image": user.profile_image,
        'spotify_user_id': spotifyaccount.spotify_user_id if spotifyaccount else None,
        'spotify_profile_image': spotifyaccount.spotify_profile_image if spotifyaccount else None,
        'spotify_country': spotifyaccount.spotify_country if spotifyaccount else None,
        'created_at': user.created_at.strftime("%Y-%m-%d %H:%M:%S"),
        'songs': [song.to_dict() for song in user.songs],
        'liked_songs': liked_songs_data,
        'spotify_account': spotifyaccount.to_dict() if spotifyaccount else None,
        'spotify_email': spotifyaccount.spotify_email if spotifyaccount else None,
        'spotify_followers': spotifyaccount.spotify_followers if spotifyaccount else None,
        'spotify_display_name': spotifyaccount.spotify_display_name if spotifyaccount else None
    }
    return jsonify(user_data)


@main_bp.route('/user-profile/<int:user_id>')
@login_required
def get_user_profile(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    user_data = {
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'display_name': user.display_name,
        'bio': user.bio,
        'profile_image': user.profile_image
    }
    
    return jsonify(user_data)

    
    
@main_bp.route('/edit-profile', methods=['POST'])
@login_required
def edit_profile():
    data = request.form
    display_name = data.get('display_name')
    bio = data.get('bio')
    file = request.files.get('file')

    if display_name:
        current_user.display_name = display_name

    if bio:
        current_user.bio = bio

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        current_user.profile_image = filename
    else:
        logging.error(f"File upload failed or file type not allowed: {file.filename}")

    db.session.commit()

    return jsonify({"message": "Profile updated successfully!"}), 200

@main_bp.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(current_app.config['UPLOAD_FOLDER'], filename)

@main_bp.route('/search-users')
@login_required
def search_users():
    query = request.args.get('query', '')
    if not query:
        return jsonify([]), 200

    users = User.query.filter(User.username.ilike(f'%{query}%')).all()

    results = [{
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'display_name': user.display_name,
        'profile_image': user.profile_image
    } for user in users]

    return jsonify(results), 200

@main_bp.route('/user/<int:user_id>/liked_songs', methods=['GET'])
@login_required
def get_liked_songs(user_id):
    user = User.query.get_or_404(user_id)
    liked_songs = LikedSong.query.filter_by(user_id=user.id).all()
    liked_songs_data = [
        {
            'id': liked_song.id,
            'name': liked_song.name,
            'artist': liked_song.artist,
            'album': liked_song.album,
            'image': liked_song.image,
            'popularity': liked_song.popularity,
            'spotify_song_id': liked_song.spotify_song_id
        }
        for liked_song in liked_songs
    ]
    return jsonify(liked_songs_data)