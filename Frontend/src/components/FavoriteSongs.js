// src/pages/FavoriteSongsPage.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const FavoriteSongsPage = () => {
  const [spotifyData, setSpotifyData] = useState({ topTracks: [] });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
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

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <h2>Favorite Songs</h2>
      {spotifyData.topTracks.length > 0 ? (
        <ul>
          {spotifyData.topTracks.map((track) => (
            <li key={track.id}>
              {track.name} by{" "}
              {track.artists.map((artist) => artist.name).join(", ")}
            </li>
          ))}
        </ul>
      ) : (
        <p>No favorite songs found.</p>
      )}
    </div>
  );
};

export default FavoriteSongsPage;
