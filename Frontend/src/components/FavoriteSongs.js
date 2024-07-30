// src/pages/FavoriteSongsPage.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const FavoriteSongsPage = () => {
  const [spotifyData, setSpotifyData] = useState({ topTracks: [] });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSong, setSelectedSong] = useState(null);
  const [audioFeatures, setAudioFeatures] = useState(null);
  const [embedUrl, setEmbedUrl] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSpotifyTopTracks = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/spotify-top-tracks",
          {
            withCredentials: true,
          }
        );
        setSpotifyData((prevState) => ({
          ...prevState,
          topTracks: response.data,
        }));
        setLoading(false);
      } catch (error) {
        console.error("Error fetching top tracks:", error);
        setLoading(false);
        setError("Failed to fetch top tracks. Please try again later.");
      }
    };

    fetchSpotifyTopTracks();
  }, [navigate]);

  const handleSongClick = async (track) => {
    try {
      const audioFeaturesResponse = await axios.get(
        `http://localhost:5000/spotify/audio-features/${track.id}`
      );
      setAudioFeatures(audioFeaturesResponse.data);
      setSelectedSong(track);
      setEmbedUrl(`https://open.spotify.com/embed/track/${track.id}`);
    } catch (error) {
      console.error("Error fetching song details:", error);
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <h2>Favorite Songs</h2>
      {selectedSong ? (
        <div>
          <h2>Selected Song Details</h2>
          <p>
            <strong>{selectedSong.name}</strong> by {selectedSong.artist}
          </p>
          <p>Album: {selectedSong.album}</p>
          <p>Popularity: {selectedSong.popularity}</p>
          <p>
            <img
              src={selectedSong.image_url}
              alt={`${selectedSong.name} album cover`}
              style={{ width: "100px", height: "100px" }}
            />
          </p>
          {audioFeatures ? (
            <div>
              <h3>Audio Features</h3>
              <p>Danceability: {audioFeatures.danceability}</p>
              <p>Energy: {audioFeatures.energy}</p>
              <p>Key: {audioFeatures.key}</p>
              <p>Loudness: {audioFeatures.loudness}</p>
              <p>Mode: {audioFeatures.mode}</p>
              <p>Speechiness: {audioFeatures.speechiness}</p>
              <p>Acousticness: {audioFeatures.acousticness}</p>
              <p>Instrumentalness: {audioFeatures.instrumentalness}</p>
              <p>Liveness: {audioFeatures.liveness}</p>
              <p>Valence: {audioFeatures.valence}</p>
              <p>Tempo: {audioFeatures.tempo}</p>
            </div>
          ) : (
            <p>Loading audio features...</p>
          )}
          {embedUrl && (
            <div>
              <h3>Listen on Spotify</h3>
              <iframe
                src={embedUrl}
                width="300"
                height="380"
                frameBorder="0"
                allow="encrypted-media"
                title={selectedSong.name}
              ></iframe>
            </div>
          )}
          <button onClick={() => setSelectedSong(null)}>Back to list</button>
        </div>
      ) : (
        <ul>
          {spotifyData.topTracks.length > 0 ? (
            spotifyData.topTracks.map((track) => (
              <li key={track.id} onClick={() => handleSongClick(track)}>
                {track.name} by {track.artist}
                <br />
                <img
                  src={track.image_url}
                  alt={`${track.name} album cover`}
                  style={{ width: "50px", height: "50px" }}
                />
              </li>
            ))
          ) : (
            <p>No favorite songs found.</p>
          )}
        </ul>
      )}
    </div>
  );
};

export default FavoriteSongsPage;
