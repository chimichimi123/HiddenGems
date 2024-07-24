# spotify.py
import requests
from flask import current_app, session
from time import sleep
from requests.exceptions import RequestException

def get_spotify_token():
    auth_url = "https://accounts.spotify.com/api/token"
    auth_data = {
        "grant_type": "client_credentials",
        "client_id": current_app.config['SPOTIFY_CLIENT_ID'],
        "client_secret": current_app.config['SPOTIFY_CLIENT_SECRET'],
    }
    response = requests.post(auth_url, data=auth_data)
    response.raise_for_status()
    return response.json().get('access_token')

def get_spotify_data(endpoint):
    token = session.get('spotify_token')
    if not token:
        return {"error": "User not authenticated with Spotify"}

    headers = {"Authorization": f"Bearer {token}"}
    try:
        response = requests.get(endpoint, headers=headers)
        response.raise_for_status()
        
        # Handle rate limiting
        if response.status_code == 429:
            retry_after = int(response.headers.get('Retry-After', 5))  # Default to 5 seconds
            sleep(retry_after)
            response = requests.get(endpoint, headers=headers)  # Retry the request
            response.raise_for_status()

        return response.json()
    except RequestException as e:
        print(f"Failed to fetch data from Spotify: {e}")
        return {"error": "Failed to fetch data from Spotify"}