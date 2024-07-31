from flask import Blueprint, redirect, request, session, current_app, jsonify
from spotipy.cache_handler import CacheHandler
from flask_login import login_required, current_user
from spotipy import Spotify, oauth2
from .models import db, SpotifyAccount, SpotifySong, LikedSong
import logging
import json

spotify_auth_bp = Blueprint('spotify_auth', __name__)

class FlaskSessionHandler(CacheHandler):
    def get_cached_token(self):
        return session.get('token_info', None)

    def save_token_to_cache(self, token_info):
        session['token_info'] = token_info

    def clear_token_cache(self):
        session.pop('token_info', None)

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
    
    session.pop('token_info', None)
    
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
    
    # Commented out code that pulls songs from the user
    # playlists = sp.current_user_playlists(limit=50)
    # all_songs = []

    # for playlist in playlists['items']:
    #     if playlist.get('collaborative', False):
    #         continue

    #     playlist_id = playlist['id']
    #     tracks = sp.playlist_tracks(playlist_id)
    #     for item in tracks['items']:
    #         track = item.get('track')
    #         if track and track.get('id'):
    #             album = track.get('album', {})
    #             images = album.get('images', [])
    #             image_url = images[0].get('url', '') if images else ''
    #             song_data = {
    #                 'spotify_account_id': spotify_account.id,
    #                 'song_id': track.get('id'),
    #                 'name': track.get('name'),
    #                 'artist': ', '.join(artist.get('name') or '' for artist in track.get('artist', [])),
    #                 'album': album.get('name', ''),
    #                 'popularity': track.get('popularity', 50) if track.get('popularity', 0) == 0 else track.get('popularity', 50),
    #                 'image': image_url
    #             }
    #             all_songs.append(song_data)
                
    # liked_albums = sp.current_user_saved_albums(limit=50)
    # for album_item in liked_albums['items']:
    #     album = album_item.get('album')
    #     if album:
    #         images = album.get('images', [])
    #         image_url = images[0].get('url', '') if images else ''
    #         for track in album.get('tracks', {}).get('items', []):
    #             if track and track.get('id'):
    #                 song_data = {
    #                     'spotify_account_id': spotify_account.id,
    #                     'song_id': track.get('id'),
    #                     'name': track.get('name'),
    #                     'artist': ', '.join(artist.get('name') or '' for artist in track.get('artist', [])),
    #                     'album': album.get('name', ''),
    #                     'popularity': track.get('popularity', 50) if track.get('popularity', 0) == 0 else track.get('popularity', 50),
    #                     'image': image_url
    #                 }
    #                 all_songs.append(song_data)

    # unique_songs = {song['song_id']: song for song in all_songs}
    # unique_songs_list = list(unique_songs.values())

    # existing_song_ids = {song.song_id for song in SpotifySong.query.filter_by(spotify_account_id=spotify_account.id).all()}
    # new_songs = [SpotifySong(**song) for song in unique_songs_list if song['song_id'] not in existing_song_ids]

    # db.session.bulk_save_objects(new_songs)
    # db.session.commit()
    
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

    playlists = sp.current_user_playlists(limit=15)
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
    sp_oauth = get_spotify_oauth()
    token_info = sp_oauth.get_cached_token()

    if not token_info:
        return "Error: User not authenticated with Spotify", 401

    access_token = token_info['access_token']
    sp = Spotify(auth=access_token)

    top_tracks = sp.current_user_top_tracks(limit=50)
    tracks = top_tracks['items']

    tracks = [track for track in tracks if track['popularity'] > 0]

    sorted_tracks = sorted(tracks, key=lambda x: x['popularity'])

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
            least_popular_tracks.append({
                'id': track['id'],
                'name': track['name'],
                'artist': artist_names,
                'album': album_name,
                'popularity': track['popularity'],
                'image_url': track['album']['images'][0]['url'] if track['album']['images'] else '',
                'embed_url': embed_url
            })
            if len(least_popular_tracks) >= 10:
                break

    return jsonify(least_popular_tracks)

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
        return "Error: User not authenticated with Spotify", 401

    access_token = token_info['access_token']
    sp = Spotify(auth=access_token)

    try:
        artist_details = sp.artist(artist_id)
        return jsonify(artist_details)
    except Exception as e:
        print(f"Failed to fetch artist details: {e}")
        return "Error: Failed to fetch artist details", 500

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
        top_tracks_with_embed = []

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
                'embed_url': embed_url
            }
            top_tracks_with_embed.append(track_data)
        
        return jsonify(top_tracks_with_embed)
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
        top_artists_with_image = []
        for artist in top_artists['items']:
            artist_data = {
                'id': artist['id'],
                'name': artist['name'],
                'image_url': artist['images'][0]['url'] if artist['images'] else ''
            }
            top_artists_with_image.append(artist_data)
        return jsonify(top_artists_with_image)
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
                'embed_url': f"https://open.spotify.com/embed/track/{track['id']}"
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
        # Create a new SpotifySong record
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
    

