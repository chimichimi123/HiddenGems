import React, { useState } from "react";
import axios from "axios";

function SongList({ songs }) {
  const [selectedSong, setSelectedSong] = useState(null);
  const [audioFeatures, setAudioFeatures] = useState(null);

  const handleSongClick = async (song) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/spotify/audio-features/${song.id}`
      );
      setAudioFeatures(response.data);
      setSelectedSong(song);
    } catch (error) {
      console.error("Error fetching audio features:", error);
    }
  };

  return (
    <div>
      {songs.length === 0 ? (
        <p>No songs available</p>
      ) : selectedSong ? (
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
          <button onClick={() => setSelectedSong(null)}>Back to list</button>
        </div>
      ) : (
        <ul>
          {songs.map((song) => (
            <li key={song.id} onClick={() => handleSongClick(song)}>
              <p>
                <strong>{song.name}</strong> by {song.artist}
              </p>
              <p>Album: {song.album}</p>
              <p>Popularity: {song.popularity}</p>
              <p>
                <img
                  src={song.image_url}
                  alt={`${song.name} album cover`}
                  style={{ width: "100px", height: "100px" }}
                />
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SongList;
