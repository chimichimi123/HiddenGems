from flask import Blueprint, redirect, request, session, current_app, jsonify
from spotipy.cache_handler import CacheHandler
from flask_login import login_required, current_user
from spotipy import Spotify, oauth2
from .models import db, SpotifyAccount, SpotifySong
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
    
    return oauth2.SpotifyOAuth(
        SPOTIPY_CLIENT_ID,
        SPOTIPY_CLIENT_SECRET,
        SPOTIPY_REDIRECT_URI,
        scope='user-read-private user-read-email user-top-read user-library-read user-follow-read playlist-read-private',
        show_dialog=True,
        cache_handler=FlaskSessionHandler()
    )

@spotify_auth_bp.route('/spotify/login')
def spotify_login():
    sp_oauth = get_spotify_oauth()
    auth_url = sp_oauth.get_authorize_url()
    return redirect(auth_url)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@spotify_auth_bp.route('/spotify/callback')
@login_required
def spotify_callback():
    sp_oauth = get_spotify_oauth()
    code = request.args.get('code')
    token_info = sp_oauth.get_access_token(code)
    
    if not token_info:
        return "Error: Failed to get access token", 400

    access_token = token_info['access_token']
    refresh_token = token_info.get('refresh_token')

    sp = Spotify(auth=access_token)
    user_profile = sp.current_user()
    
    logger.info(f"User Profile: {json.dumps(user_profile, indent=2)}")
    
    session.clear()
    
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
    
    playlists = sp.current_user_playlists(limit=50)
    all_songs = []

    for playlist in playlists['items']:
        if playlist.get('collaborative', False):
            continue

        playlist_id = playlist['id']
        tracks = sp.playlist_tracks(playlist_id)
        for item in tracks['items']:
            track = item.get('track')
            if track and track.get('id'):
                album = track.get('album', {})
                song_data = {
                    'spotify_account_id': spotify_account.id,
                    'song_id': track.get('id'),
                    'name': track.get('name'),
                    'artist': ', '.join(artist.get('name', '') for artist in track.get('artists', [])),
                    'album': album.get('name', ''),
                    'popularity': track.get('popularity', 50) if track.get('popularity', 0) == 0 else track.get('popularity', 50),
                    'image': album.get('images', [{}])[0].get('url', '')
                }
                all_songs.append(song_data)
                
    liked_albums = sp.current_user_saved_albums(limit=50)
    for album_item in liked_albums['items']:
        album = album_item.get('album')
        if album:
            for track in album.get('tracks', {}).get('items', []):
                if track and track.get('id'):
                    song_data = {
                        'spotify_account_id': spotify_account.id,
                        'song_id': track.get('id'),
                        'name': track.get('name'),
                        'artist': ', '.join(artist.get('name', '') for artist in track.get('artists', [])),
                        'album': album.get('name', ''),
                        'popularity': track.get('popularity', 50) if track.get('popularity', 0) == 0 else track.get('popularity', 50),
                        'image': album.get('images', [{}])[0].get('url', '')
                    }
                    all_songs.append(song_data)

    unique_songs = {song['song_id']: song for song in all_songs}
    unique_songs_list = list(unique_songs.values())

    existing_song_ids = {song.song_id for song in SpotifySong.query.filter_by(spotify_account_id=spotify_account.id).all()}
    new_songs = [SpotifySong(**song) for song in unique_songs_list if song['song_id'] not in existing_song_ids]

    db.session.bulk_save_objects(new_songs)
    db.session.commit()
    
    FlaskSessionHandler().save_token_to_cache(token_info)

    return redirect("http://localhost:3000/user")


@spotify_auth_bp.route('/spotify/playlists')
@login_required
def get_playlists():
    sp_oauth = get_spotify_oauth()
    token_info = sp_oauth.get_cached_token()
    if not token_info:
        return "Error: User not authenticated with Spotify", 401

    access_token = token_info['access_token']
    sp = Spotify(auth=access_token)

    playlists = sp.current_user_playlists(limit=50)
    playlist_ids = [pl['id'] for pl in playlists['items']]
    
    return jsonify(playlist_ids)

@spotify_auth_bp.route('/spotify/playlist-tracks/<playlist_id>')
@login_required
def get_playlist_tracks(playlist_id):
    sp_oauth = get_spotify_oauth()
    token_info = sp_oauth.get_cached_token()
    if not token_info:
        return "Error: User not authenticated with Spotify", 401

    access_token = token_info['access_token']
    sp = Spotify(auth=access_token)

    results = sp.playlist_tracks(playlist_id)
    tracks = results['items']
    while results['next']:
        results = sp.next(results)
        tracks.extend(results['items'])

    return jsonify(tracks)

@spotify_auth_bp.route('/spotify/least-popular-songs')
@login_required
def get_least_popular_songs():
    least_popular_songs = SpotifySong.query.filter(
        SpotifySong.spotify_account_id == current_user.spotify_account.id,
        SpotifySong.popularity > 5
    ).order_by(SpotifySong.popularity.asc()).limit(10).all()

    least_popular_tracks = [
        {
            'id': song.song_id,
            'name': song.name,
            'artist': song.artist,
            'album': song.album,
            'popularity': song.popularity
        }
        for song in least_popular_songs
    ]

    return jsonify(least_popular_tracks)



@spotify_auth_bp.route('/spotify-top-tracks')
@login_required
def spotify_top_tracks():
    sp_oauth = get_spotify_oauth()
    token_info = sp_oauth.get_cached_token()
    if not token_info:
        return "Error: User not authenticated with Spotify", 401

    access_token = token_info['access_token']
    sp = Spotify(auth=access_token)

    try:
        top_tracks = sp.current_user_top_tracks(limit=10)
        return jsonify(top_tracks['items'])
    except Exception as e:
        print(f"Failed to fetch top tracks: {e}")
        return "Error: Failed to fetch top tracks", 500

@spotify_auth_bp.route('/spotify-top-artists')
@login_required
def spotify_top_artists():
    sp_oauth = get_spotify_oauth()
    token_info = sp_oauth.get_cached_token()
    if not token_info:
        return "Error: User not authenticated with Spotify", 401

    access_token = token_info['access_token']
    sp = Spotify(auth=access_token)

    try:
        top_artists = sp.current_user_top_artists(limit=10)
        return jsonify(top_artists['items'])
    except Exception as e:
        print(f"Failed to fetch top artists: {e}")
        return "Error: Failed to fetch top artists", 500

@spotify_auth_bp.route('/spotify-data')
@login_required
def spotify_data():
    sp_oauth = get_spotify_oauth()
    token_info = sp_oauth.get_cached_token()
    if not token_info:
        return "Error: User not authenticated with Spotify", 401

    access_token = token_info['access_token']
    sp = Spotify(auth=access_token)

    try:
        user_data = sp.current_user()
        return jsonify(user_data)
    except Exception as e:
        print(f"Failed to fetch Spotify data: {e}")
        return "Error: Failed to fetch Spotify data", 500

@spotify_auth_bp.route('/unlink-spotify')
@login_required
def unlink_spotify():
    spotify_account = SpotifyAccount.query.filter_by(user_id=current_user.id).first()
    if spotify_account:
        db.session.delete(spotify_account)
        db.session.commit()
    session.pop('token_info', None)
    return redirect("http://localhost:3000/dashboard")
