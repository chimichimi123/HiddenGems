from flask import Blueprint, request, jsonify, session, make_response, current_app, send_from_directory, url_for, redirect
from flask_login import login_required, current_user, login_user, logout_user
from .models import db, User, Genre, Instrument
from datetime import datetime
import json
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
        return jsonify({'message': 'Login successful'})
    else:
        return jsonify({'error': 'Invalid email or password'}), 401




@main_bp.route('/check_login', methods=['GET'])
@cross_origin(supports_credentials=True)
def check_login():
    if current_user.is_authenticated:
        return jsonify({
            'logged_in': True,
            'user': current_user.to_dict(),
        })
    else:
        return jsonify({'logged_in': False})


@main_bp.route('/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    
    session.pop('access_token', None)
    session.pop('refresh_token', None)
    
    session.clear()
    return jsonify({'message': 'Logout successful!'}), 200

@main_bp.route('/user', methods=['GET'])
@login_required
def get_user():
    if current_user.is_anonymous:
        return make_response(jsonify({"message": "No user logged in"}), 401)

    user = current_user

    # Retrieve genres and instruments associated with the user
    genres = [genre.name for genre in user.genres]
    instruments = [instrument.name for instrument in user.instruments]

    user_data = {
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'display_name': user.display_name,
        'bio': user.bio,
        'profile_image': user.profile_image,
        'created_at': user.created_at.strftime("%Y-%m-%d %H:%M:%S"),
        'genres': genres,  # List of genre names
        'instruments': instruments  # List of instrument names
    }

    return jsonify(user_data)




@main_bp.route('/user-profile/<int:user_id>')
@login_required
def get_user_profile(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    # Retrieve genres and instruments associated with the user
    genres = [genre.name for genre in user.genres]
    instruments = [instrument.name for instrument in user.instruments]

    user_data = {
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'display_name': user.display_name,
        'bio': user.bio,
        'profile_image': user.profile_image,
        'created_at': user.created_at.strftime("%Y-%m-%d %H:%M:%S"),
        'genres': genres,  # List of genre names
        'instruments': instruments  # List of instrument names
    }

    return jsonify(user_data)


    
    
@main_bp.route('/edit-profile', methods=['POST'])
@login_required
def edit_profile():
    data = request.form

    display_name = data.get('display_name')
    bio = data.get('bio')

    # Retrieve and parse JSON arrays from the form data
    genres_json = data.get('genres', '[]')
    instruments_json = data.get('instruments', '[]')

    try:
        genres = json.loads(genres_json)
        instruments = json.loads(instruments_json)
    except json.JSONDecodeError:
        return jsonify({"error": "Invalid data format for genres or instruments."}), 400

    file = request.files.get('file')

    # Update display_name and bio
    if display_name:
        current_user.display_name = display_name
    if bio:
        current_user.bio = bio

    # Handle genres
    if genres:
        existing_genres = Genre.query.filter(Genre.name.in_(genres)).all()
        if len(existing_genres) != len(genres):
            return jsonify({"error": "Some genres do not exist."}), 400
        current_user.genres = existing_genres

    # Handle instruments
    if instruments:
        existing_instruments = Instrument.query.filter(Instrument.name.in_(instruments)).all()
        if len(existing_instruments) != len(instruments):
            return jsonify({"error": "Some instruments do not exist."}), 400
        current_user.instruments = existing_instruments

    # Handle profile image upload
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        current_user.profile_image = filename
    elif file:
        logging.error(f"File upload failed or file type not allowed: {file.filename}")

    try:
        db.session.commit()
        return jsonify({"message": "Profile updated successfully!"}), 200
    except Exception as e:
        db.session.rollback()
        logging.error(f"Error updating profile: {str(e)}")
        return jsonify({"error": "Failed to update profile."}), 500




@main_bp.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(current_app.config['UPLOAD_FOLDER'], filename)

@main_bp.route('/search-users', methods=['GET'])
@login_required
def search_users():
    query = request.args.get('query', '')
    search_type = request.args.get('type', 'username')

    users = []

    if search_type == 'username':
        users = User.query.filter(
            (User.username.ilike(f"%{query}%")) |
            (User.email.ilike(f"%{query}%"))
        ).all()
    elif search_type == 'instrument':
        users = User.query.join(User.instruments).filter(
            Instrument.name.ilike(f"%{query}%")
        ).all()
    elif search_type == 'genre':
        users = User.query.join(User.genres).filter(
            Genre.name.ilike(f"%{query}%")
        ).all()

    user_data = [{
        "id": user.id,
        "username": user.username,
        "display_name": user.display_name,
        "email": user.email,
        "profile_image": user.profile_image
    } for user in users]

    return jsonify(user_data)
