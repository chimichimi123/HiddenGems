from flask import Blueprint, redirect, request, session, current_app, jsonify
from flask_login import login_required, current_user
from spotipy import Spotify
from spotipy.oauth2 import SpotifyOAuth, CacheHandler
from .models import db, SpotifyAccount, SpotifySong, LikedSong, LeastPopularTrack, TopTrack, TopArtist
import spotipy
import logging
import json

spotify_auth_bp = Blueprint('spotify_auth', __name__)

class FlaskSessionHandler(CacheHandler):
    def get_cached_token(self):
        return session.get('token_info', None)

    def save_token_to_cache(self, token_info):
        session['token_info'] = token_info

def get_spotify_oauth():
    SPOTIPY_CLIENT_ID = current_app.config['SPOTIPY_CLIENT_ID']
    SPOTIPY_CLIENT_SECRET = current_app.config['SPOTIPY_CLIENT_SECRET']
    SPOTIPY_REDIRECT_URI = current_app.config['SPOTIPY_REDIRECT_URI']
    
    return SpotifyOAuth(
        SPOTIPY_CLIENT_ID,
        SPOTIPY_CLIENT_SECRET,
        SPOTIPY_REDIRECT_URI,
        scope='user-read-private user-read-email user-top-read user-library-read user-follow-read playlist-read-private',
        cache_handler=FlaskSessionHandler(),
        show_dialog=True
    )

@spotify_auth_bp.route('/spotify/login')
def spotify_login():
    sp_oauth = get_spotify_oauth()
    auth_url = sp_oauth.get_authorize_url()
    return redirect(auth_url)

@spotify_auth_bp.route('/spotify-login', methods=['GET'])
@login_required
def spotify_login_status():
    if is_user_logged_in_to_spotify(current_user.id):
        return jsonify({'success': True}), 200
    return jsonify({'success': False}), 401

def is_user_logged_in_to_spotify(user_id):
    spotify_account = SpotifyAccount.query.filter_by(user_id=user_id).first()
    if not spotify_account or not spotify_account.spotify_access_token:
        return False
    return True


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@spotify_auth_bp.route('/spotify/callback')
@login_required
def spotify_callback():
    sp_oauth = get_spotify_oauth()
    code = request.args.get('code')
    
    if not code:
        return "Error: No authorization code provided", 400

    token_info = sp_oauth.get_access_token(code)
    
    if not token_info:
        return "Error: Failed to get access token", 400

    access_token = token_info['access_token']
    refresh_token = token_info.get('refresh_token')

    sp = Spotify(auth=access_token)
    
    try:
        user_profile = sp.current_user()
    except spotipy.SpotifyException as e:
        logger.error(f"Spotify API error: {e}")
        return "Error: Failed to fetch user profile", 500
    
    logger.info(f"User Profile: {json.dumps(user_profile, indent=2)}")

    FlaskSessionHandler().save_token_to_cache(token_info)
    
    default_profile_image = 'https://www.scdn.co/i/_global/twitter_card-default.jpg'
    
    images = user_profile.get('images', [])
    profile_image = images[0].get('url', default_profile_image) if images else default_profile_image

    spotify_account = SpotifyAccount.query.filter_by(user_id=current_user.id).first()
    if not spotify_account:
        spotify_account = SpotifyAccount(
            user_id=current_user.id,
            spotify_user_id=user_profile['id'],
            spotify_access_token=access_token,
            spotify_refresh_token=refresh_token,
            spotify_profile_image=profile_image,
            spotify_country=user_profile.get('country', ''),
            spotify_email=user_profile.get('email', ''),
            spotify_followers=user_profile.get('followers', {}).get('total', 0)
        )
        db.session.add(spotify_account)
    else:
        spotify_account.spotify_user_id = user_profile['id']
        spotify_account.spotify_access_token = access_token
        spotify_account.spotify_refresh_token = refresh_token
        spotify_account.spotify_profile_image = profile_image
        spotify_account.spotify_country = user_profile.get('country', '')
        spotify_account.spotify_display_name = user_profile.get('display_name', '')
        spotify_account.spotify_email = user_profile.get('email', '')
        spotify_account.spotify_followers = user_profile.get('followers', {}).get('total', 0)

    db.session.commit()

    return redirect("http://localhost:3000/user")

@spotify_auth_bp.route('/spotify/least-popular-songs')
@login_required
def get_least_popular_songs():
    sp_oauth = get_spotify_oauth()
    token_info = sp_oauth.get_cached_token()
    if not token_info:
        return "Error: User not authenticated with Spotify", 401

    access_token = token_info['access_token']
    sp = Spotify(auth=access_token)

    try:
        top_tracks = sp.current_user_top_tracks(limit=50)
        tracks = top_tracks['items']
        tracks = [track for track in tracks if track['popularity'] > 0]
        sorted_tracks = sorted(tracks, key=lambda x: x['popularity'])

        user_id = current_user.id

        existing_tracks = {track.id for track in LeastPopularTrack.query.filter_by(user_id=user_id).all()}

        least_popular_tracks = []
        included_artists = set()
        included_albums = set()

        for track in sorted_tracks:
            artist_names = ', '.join(artist['name'] for artist in track['artists'])
            album_name = track['album']['name']
            if artist_names not in included_artists and album_name not in included_albums:
                included_artists.add(artist_names)
                included_albums.add(album_name)
                embed_url = f"https://open.spotify.com/embed/track/{track['id']}"
                track_data = {
                    'id': track['id'],
                    'name': track['name'],
                    'artist': artist_names,
                    'album': album_name,
                    'popularity': track['popularity'],
                    'image_url': track['album']['images'][0]['url'] if track['album']['images'] else '',
                    'embed_url': embed_url,
                    'user_id': user_id
                }
                if track_data['id'] in existing_tracks:
                    LeastPopularTrack.query.filter_by(id=track_data['id'], user_id=user_id).update(track_data)
                else:
                    least_popular_tracks.append(track_data)
                if len(least_popular_tracks) >= 10:
                    break

        if least_popular_tracks:
            db.session.bulk_insert_mappings(LeastPopularTrack, least_popular_tracks)
            db.session.commit()
        
        least_popular_tracks_for_user = LeastPopularTrack.query.filter_by(user_id=user_id).limit(10).all()
        least_popular_tracks_data = [
            {
                'id': track.id,
                'name': track.name,
                'artist': track.artist,
                'album': track.album,
                'popularity': track.popularity,
                'image_url': track.image_url,
                'embed_url': track.embed_url
            }
            for track in least_popular_tracks_for_user
        ]
        
        return jsonify(least_popular_tracks_data), 200

    except Exception as e:
        print(f"Failed to fetch or update least popular songs: {e}")
        return "Error: Failed to fetch or update least popular songs", 500



@spotify_auth_bp.route('/spotify/audio-features/<track_id>')
@login_required
def get_audio_features(track_id):
    sp_oauth = get_spotify_oauth()
    token_info = sp_oauth.get_cached_token()
    if not token_info:
        return "Error: User not authenticated with Spotify", 401

    access_token = token_info['access_token']
    sp = Spotify(auth=access_token)

    try:
        audio_features = sp.audio_features([track_id])
        if audio_features:
            return jsonify(audio_features[0])
        else:
            return "Error: No audio features found for the given track ID", 404
    except Exception as e:
        print(f"Failed to fetch audio features: {e}")
        return "Error: Failed to fetch audio features", 500

@spotify_auth_bp.route('/spotify-artist-details/<artist_id>')
@login_required
def get_artist_details(artist_id):
    sp_oauth = get_spotify_oauth()
    token_info = sp_oauth.get_cached_token()
    if not token_info:
        return jsonify({"error": "User not authenticated with Spotify"}), 401

    access_token = token_info['access_token']
    sp = Spotify(auth=access_token)

    try:
        artist_details = sp.artist(artist_id)
        return jsonify(artist_details)
    except Exception as e:
        print(f"Failed to fetch artist details: {e}")
        return jsonify({"error": "Failed to fetch artist details"}), 500

@spotify_auth_bp.route('/spotify-top-tracks')
@login_required
def spotify_top_tracks():
    try:
        sp_oauth = get_spotify_oauth()
        token_info = sp_oauth.get_cached_token()

        if not token_info:
            print("No cached token found.")
            return jsonify({"error": "User not authenticated with Spotify"}), 401

        access_token = token_info['access_token']
        sp = Spotify(auth=access_token)

        # Verify if the token is still valid
        try:
            sp.current_user()
        except spotipy.SpotifyException as e:
            if e.http_status == 401:
                # Token expired or invalid, attempt to refresh
                spotify_account = SpotifyAccount.query.filter_by(user_id=current_user.id).first()
                if spotify_account:
                    try:
                        token_info = sp_oauth.refresh_access_token(spotify_account.spotify_refresh_token)
                        new_access_token = token_info['access_token']
                        
                        # Update the database with the new access token
                        spotify_account.spotify_access_token = new_access_token
                        db.session.commit()
                        
                        # Retry the Spotify request with the new token
                        sp = Spotify(auth=new_access_token)
                    except Exception as refresh_e:
                        print(f"Failed to refresh access token: {refresh_e}")
                        return jsonify({'error': 'Failed to refresh Spotify token'}), 500

        # Fetch and process top tracks
        top_tracks = sp.current_user_top_tracks(limit=10)
        user_id = current_user.id

        existing_tracks = {track.id for track in TopTrack.query.filter_by(user_id=user_id).all()}

        new_tracks = []

        for track in top_tracks['items']:
            embed_url = f"https://open.spotify.com/embed/track/{track['id']}"
            album_images = track['album']['images']
            album_image_url = album_images[0]['url'] if album_images else ''

            track_data = {
                'id': track['id'],
                'name': track['name'],
                'artist': ', '.join(artist['name'] for artist in track['artists']),
                'album': track['album']['name'],
                'popularity': track['popularity'],
                'image_url': album_image_url,
                'embed_url': embed_url,
                'user_id': user_id
            }

            if track_data['id'] in existing_tracks:
                TopTrack.query.filter_by(id=track_data['id'], user_id=user_id).update(track_data)
            else:
                new_track = TopTrack(**track_data)
                new_tracks.append(new_track)

        if new_tracks:
            db.session.bulk_save_objects(new_tracks)

        db.session.commit()

        top_tracks_for_user = TopTrack.query.filter_by(user_id=user_id).all()
        top_tracks_data = [
            {
                'id': track.id,
                'name': track.name,
                'artist': track.artist,
                'album': track.album,
                'popularity': track.popularity,
                'image_url': track.image_url,
                'embed_url': track.embed_url
            }
            for track in top_tracks_for_user
        ]

        return jsonify(top_tracks_data), 200

    except Exception as e:
        print(f"Failed to fetch or update top tracks: {e}")
        return jsonify({"error": "Failed to fetch or update top tracks"}), 500


@spotify_auth_bp.route('/spotify-top-artists')
@login_required
def spotify_top_artists():
    sp_oauth = get_spotify_oauth()
    token_info = sp_oauth.get_cached_token()
    if not token_info:
        return jsonify({"error": "User not authenticated with Spotify"}), 401

    access_token = token_info['access_token']
    sp = Spotify(auth=access_token)

    try:
        top_artists = sp.current_user_top_artists(limit=10)
        user_id = current_user.id

        for artist in top_artists['items']:
            artist_data = {
                'id': artist['id'],
                'name': artist['name'],
                'image_url': artist['images'][0]['url'] if artist['images'] else '',
                'followers': artist['followers']['total'],
                'genres': ', '.join(artist['genres']),
                'popularity': artist['popularity'],
                'user_id': user_id
            }
            existing_artist = TopArtist.query.filter_by(id=artist_data['id'], user_id=user_id).first()
            if existing_artist:
                existing_artist.name = artist_data['name']
                existing_artist.image_url = artist_data['image_url']
                existing_artist.followers = artist_data['followers']
                existing_artist.genres = artist_data['genres']
                existing_artist.popularity = artist_data['popularity']
            else:
                new_artist = TopArtist(**artist_data)
                db.session.add(new_artist)

        db.session.commit()

        top_artists_for_user = TopArtist.query.filter_by(user_id=user_id).all()
        top_artists_data = [
            {
                'id': artist.id,
                'name': artist.name,
                'image_url': artist.image_url,
                'followers': artist.followers,
                'genres': artist.genres,
                'popularity': artist.popularity
            }
            for artist in top_artists_for_user
        ]

        return jsonify(top_artists_data), 200

    except Exception as e:
        print(f"Failed to fetch or update top artists: {e}")
        return jsonify({"error": "Failed to fetch or update top artists"}), 500



    
@spotify_auth_bp.route('/spotify-data', methods=['GET'])
@login_required
def get_spotify_data():
    spotify_account = SpotifyAccount.query.filter_by(user_id=current_user.id).first()
    if not spotify_account or not spotify_account.spotify_access_token:
        return jsonify({'error': 'User not authenticated with Spotify'}), 401

    sp = Spotify(auth=spotify_account.spotify_access_token)
    try:
        user_data = sp.current_user()
        return jsonify(user_data)
    except Exception as e:
        print(f"Failed to fetch Spotify data: {e}")
        return jsonify({'error': 'Failed to fetch Spotify data'}), 500


@spotify_auth_bp.route('/unlink-spotify', methods=['GET'])
def unlink_spotify():
    if current_user.is_authenticated:
        try:
            session.pop('token_info', None)
            session.pop('spotify_access_token', None)
            session.pop('spotify_user_id', None)

            spotify_account = SpotifyAccount.query.filter_by(user_id=current_user.id).first()
            if spotify_account:
                spotify_account.user_id = None
                SpotifySong.query.filter_by(spotify_account_id=spotify_account.id).update({"spotify_account_id": None})
                db.session.commit()
            
            return jsonify({"message": "Spotify account unlinked successfully."}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": str(e)}), 500
    else:
        return jsonify({"error": "User not authenticated."}), 401
    

@spotify_auth_bp.route('/spotify/recommendations')
@login_required
def get_recommendations():
    sp_oauth = get_spotify_oauth()
    token_info = sp_oauth.get_cached_token()
    if not token_info:
        return jsonify({"error": "User not authenticated with Spotify"}), 401

    access_token = token_info['access_token']
    sp = Spotify(auth=access_token)

    try:
        top_tracks = sp.current_user_top_tracks(limit=5)['items']
        top_artists = sp.current_user_top_artists(limit=5)['items']

        seed_tracks = [track['id'] for track in top_tracks]
        seed_artists = [artist['id'] for artist in top_artists]
        
        recommendations = sp.recommendations(seed_artists=seed_artists[:2], seed_tracks=seed_tracks[:3], limit=20)
        recommended_tracks = recommendations['tracks']

        recommended_tracks_list = []
        for track in recommended_tracks:
            track_data = {
                'id': track['id'],
                'name': track['name'],
                'artist': ', '.join(artist['name'] for artist in track['artists']),
                'album': track['album']['name'],
                'popularity': track['popularity'],
                'image_url': track['album']['images'][0]['url'] if track['album']['images'] else '',
                'embed_url': f"https://open.spotify.com/embed/track/{track['id']}",
                'preview_url': track['preview_url'],
            }
            recommended_tracks_list.append(track_data)

        return jsonify(recommended_tracks_list)
    except Exception as e:
        print(f"Failed to fetch recommendations: {e}")
        return jsonify({"error": "Failed to fetch recommendations"}), 500


@spotify_auth_bp.route('/spotify/track/<track_id>')
@login_required
def get_track_details(track_id):
    sp_oauth = get_spotify_oauth()
    token_info = sp_oauth.get_cached_token()
    if not token_info:
        return jsonify({"error": "User not authenticated with Spotify"}), 401

    access_token = token_info['access_token']
    sp = Spotify(auth=access_token)

    try:
        print(f"Fetching track details for ID: {track_id}")

        track_details = sp.track(track_id)
        album = track_details.get('album', {})

        track_data = {
            'id': track_details['id'],
            'name': track_details['name'],
            'artist': ', '.join(artist['name'] for artist in track_details['artists']),
            'album': album.get('name', ''),
            'popularity': track_details['popularity'],
            'image_url': album.get('images', [{}])[0].get('url', ''),
            'embed_url': f"https://open.spotify.com/embed/track/{track_details['id']}",
            'duration_ms': track_details['duration_ms'],
            'explicit': track_details['explicit'],
            'preview_url': track_details['preview_url'],
            'external_urls': track_details['external_urls'],
        }

        return jsonify(track_data)
    except Exception as e:
        print(f"Failed to fetch track details: {e}")
        return jsonify({"error": "Failed to fetch track details"}), 500



@spotify_auth_bp.route('/spotify/like_song', methods=['POST'])
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


@spotify_auth_bp.route('/spotify/liked_songs', methods=['GET'])
@login_required
def liked_songs():
    liked_songs = LikedSong.query.filter_by(user_id=current_user.id).all()
    songs = [song.to_dict() for song in liked_songs]
    return jsonify(songs)

@spotify_auth_bp.route('/spotify/unlike_song/<int:song_id>', methods=['DELETE'])
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
    

@spotify_auth_bp.route('/spotify/user-profile/<int:user_id>', methods=['GET'])
@login_required
def user_profile(user_id):
    try:
        spotify_account = SpotifyAccount.query.filter_by(user_id=user_id).first()
        if not spotify_account:
            return jsonify({"error": "Spotify account not found for this user"}), 404

        top_tracks = TopTrack.query.filter_by(user_id=user_id).all()
        top_artists = TopArtist.query.filter_by(user_id=user_id).all()
        least_popular_tracks = LeastPopularTrack.query.filter_by(user_id=user_id).all()

        profile_data = {
            'top_tracks': [
                {
                    'id': track.id,
                    'name': track.name,
                    'artist': track.artist,
                    'album': track.album,
                    'popularity': track.popularity,
                    'image_url': track.image_url,
                    'embed_url': track.embed_url
                }
                for track in top_tracks
            ],
            'top_artists': [
                {
                    'id': artist.id,
                    'name': artist.name,
                    'image_url': artist.image_url,
                    'followers': artist.followers,
                    'genres': artist.genres,
                    'popularity': artist.popularity
                }
                for artist in top_artists
            ],
            'least_popular_tracks': [
                {
                    'id': track.id,
                    'name': track.name,
                    'artist': track.artist,
                    'album': track.album,
                    'popularity': track.popularity,
                    'image_url': track.image_url,
                    'embed_url': track.embed_url
                }
                for track in least_popular_tracks
            ]
        }

        return jsonify(profile_data)
    except Exception as e:
        print(f"Failed to fetch user profile data: {e}")
        return jsonify({"error": "Failed to fetch user profile data"}), 500