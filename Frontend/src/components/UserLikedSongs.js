import React, { useEffect, useState } from "react";
import axios from "axios";

const UserLikedSongs = ({ userId }) => {
  const [likedSongs, setLikedSongs] = useState([]);

  useEffect(() => {
    const fetchLikedSongs = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/user/${userId}/liked_songs`
        );
        setLikedSongs(response.data);
      } catch (error) {
        console.error("Error fetching liked songs:", error);
      }
    };

    fetchLikedSongs();
  }, [userId]);

  return (
    <div>
      <h2>Liked Songs</h2>
      <div className="liked-songs">
        {likedSongs.map((song) => (
          <div key={song.id} className="song-card">
            <img src={song.image} alt={song.name} />
            <div className="song-info">
              <h3>{song.name}</h3>
              <p>{song.artist}</p>
              <p>{song.album}</p>
              <p>Popularity: {song.popularity}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserLikedSongs;
