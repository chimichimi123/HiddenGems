from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from .models import db, SpotifySong, LikedSong, SpotifyAccount

user_bp = Blueprint('user', __name__)

@user_bp.route('/like_song', methods=['POST'])
@login_required
def like_song():
    data = request.get_json()
    spotify_song_id = data.get('spotify_song_id')
    name = data.get('name')
    artist = data.get('artist')
    album = data.get('album')
    popularity = data.get('popularity')
    image = data.get('image')
    
    spotify_account = SpotifyAccount.query.filter_by(user_id=current_user.id).first()
    if not spotify_account:
        return jsonify({"error": "Spotify account not found"}), 404

    existing_song = SpotifySong.query.filter_by(song_id=spotify_song_id).first()
    if not existing_song:
        new_song = SpotifySong(
            spotify_account_id=spotify_account.id,
            song_id=spotify_song_id,
            name=name,
            artist=artist,
            album=album,
            popularity=popularity,
            image=image
        )
        db.session.add(new_song)
        db.session.commit()
        existing_song = new_song

    liked_song = LikedSong(
        user_id=current_user.id,
        spotify_song_id=spotify_song_id,
        name=name,
        artist=artist,
        album=album,
        image=image,
        popularity=popularity
    )
    db.session.add(liked_song)
    db.session.commit()
    
    return jsonify({"message": "Song liked successfully"}), 201

@user_bp.route('/liked_songs', methods=['GET'])
@login_required
def liked_songs():
    liked_songs = LikedSong.query.filter_by(user_id=current_user.id).all()
    songs = [song.to_dict() for song in liked_songs]
    return jsonify(songs)

@user_bp.route('/unlike_song/<int:song_id>', methods=['DELETE'])
@login_required
def unlike_song(song_id):
    try:
        liked_song = LikedSong.query.filter_by(user_id=current_user.id, spotify_song_id=song_id).first()
        
        if liked_song:
            db.session.delete(liked_song)
            db.session.commit()
            return jsonify({"message": "Song removed from liked list"}), 200
        else:
            return jsonify({"error": "Song not found in liked list"}), 404
    except Exception as e:
        print(f"Failed to remove liked song: {e}")
        return jsonify({"error": "Failed to remove liked song"}), 500


@user_bp.route('/<int:user_id>/liked_songs', methods=['GET'])
def get_user_liked_songs(user_id):
    liked_songs = LikedSong.query.filter_by(user_id=user_id).all()
    songs = [song.to_dict() for song in liked_songs]
    return jsonify(songs)