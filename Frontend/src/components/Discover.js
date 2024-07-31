import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const Discover = () => {
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/spotify/recommendations"
        );
        setRecommendations(response.data);
      } catch (error) {
        console.error("Error fetching recommendations:", error);
      }
    };

    fetchRecommendations();
  }, []);

  const likeSong = async (song) => {
    try {
      await axios.post("http://localhost:5000/user/like_song", {
        spotify_song_id: song.id,
        name: song.name,
        artist: song.artist,
        album: song.album,
        popularity: song.popularity,
        image: song.image_url,
      });
      alert("Song liked successfully");
    } catch (error) {
      console.error("Error liking song:", error);
    }
  };

  return (
    <div>
      <h2>Discover New Music</h2>
      <Link to="/user/liked_songs">My Liked Songs</Link>
      <div className="recommendations">
        {recommendations.map((song) => (
          <div key={song.id} className="song">
            <Link to={`/song/${song.id}`}>
              <img src={song.image_url} alt={song.name} />
              <div>
                <h3>{song.name}</h3>
                <p>{song.artist}</p>
                <p>{song.album}</p>
              </div>
            </Link>
            <button onClick={() => likeSong(song)}>Like</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Discover;
