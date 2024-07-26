from flask import Blueprint, request, jsonify, session, make_response, current_app, send_from_directory
from flask_login import login_required, current_user, login_user, logout_user
from .models import db, User, SpotifyAccount, Song
from datetime import datetime
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

