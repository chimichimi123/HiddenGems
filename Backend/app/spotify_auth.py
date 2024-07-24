from flask import Blueprint, redirect, request, url_for, session, current_app, jsonify
from spotipy.cache_handler import CacheHandler
from flask_login import login_required, current_user
from spotipy import Spotify, oauth2
from .models import db, SpotifyAccount

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
    
    session.clear()

    spotify_account = SpotifyAccount.query.filter_by(user_id=current_user.id).first()
    if not spotify_account:
        spotify_account = SpotifyAccount(
            user_id=current_user.id,
            spotify_user_id=user_profile['id'],
            spotify_access_token=access_token,
            spotify_refresh_token=refresh_token,
            spotify_profile_image=user_profile.get('images', [{}])[0].get('url', ''),
            spotify_country=user_profile.get('country', ''),
            spotify_email=user_profile.get('email', ''),
            spotify_followers=user_profile.get('followers', {}).get('total', 0)
        )
        db.session.add(spotify_account)
    else:
        spotify_account.spotify_user_id = user_profile['id']
        spotify_account.spotify_access_token = access_token
        spotify_account.spotify_refresh_token = refresh_token
        spotify_account.spotify_profile_image = user_profile.get('images', [{}])[0].get('url', '')
        spotify_account.spotify_country = user_profile.get('country', '')
        spotify_account.spotify_display_name = user_profile.get('display_name', '')
        spotify_account.spotify_email = user_profile.get('email', '')
        spotify_account.spotify_followers = user_profile.get('followers', {}).get('total', 0)

    db.session.commit()
    
    # Save tokens to session
    FlaskSessionHandler().save_token_to_cache(token_info)

    return redirect("http://localhost:3000/user")

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
