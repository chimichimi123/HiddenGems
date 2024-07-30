import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const LikedSongs = () => {
  const [likedSongs, setLikedSongs] = useState([]);

  useEffect(() => {
    const fetchLikedSongs = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/spotify/liked_songs"
        );
        setLikedSongs(response.data);
      } catch (error) {
        console.error("Error fetching liked songs:", error);
      }
    };

    fetchLikedSongs();
  }, []);

  const handleDelete = async (songId) => {
    try {
      await axios.delete(
        `http://localhost:5000/spotify/unlike_song/${songId}`,
        { withCredentials: true }
      );
      setLikedSongs(
        likedSongs.filter((song) => song.spotify_song_id !== songId)
      );
      alert("Song removed from liked list");
    } catch (error) {
      console.error("Error removing liked song:", error);
    }
  };

  return (
    <div>
      <h2>Liked Songs</h2>
      <div className="liked-songs">
        {likedSongs.map((song) => (
          <div key={song.spotify_song_id} className="song">
            <Link to={`/song/${song.spotify_song_id}`}>
              <img src={song.image} alt={song.name} />
              <div>
                <h3>{song.name}</h3>
                <p>{song.artist}</p>
                <p>{song.album}</p>
                <p>Added on: {new Date(song.added_at).toLocaleDateString()}</p>
                <iframe
                  src={song.embed_url}
                  width="300"
                  height="80"
                  frameBorder="0"
                  allowTransparency="true"
                  allow="encrypted-media"
                ></iframe>
              </div>
            </Link>
            <button onClick={() => handleDelete(song.spotify_song_id)}>
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LikedSongs;
