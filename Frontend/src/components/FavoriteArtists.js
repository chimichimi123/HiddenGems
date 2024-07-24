import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const FavoriteArtistsPage = () => {
  const [spotifyData, setSpotifyData] = useState({ topArtists: [] });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSpotifyTopArtists = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/spotify-top-artists",
          {
            withCredentials: true,
          }
        );
        setSpotifyData((prevState) => ({
          ...prevState,
          topArtists: response.data,
        }));
        setLoading(false);
      } catch (error) {
        console.error("Error fetching top artists:", error);
        setLoading(false);
        setError("Failed to fetch top artists. Please try again later.");
      }
    };

    fetchSpotifyTopArtists();
  }, [navigate]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <h2>Favorite Artists</h2>
      {spotifyData.topArtists.length > 0 ? (
        <ul>
          {spotifyData.topArtists.map((artist) => (
            <li key={artist.id}>{artist.name}</li>
          ))}
        </ul>
      ) : (
        <p>No favorite artists found.</p>
      )}
    </div>
  );
};

export default FavoriteArtistsPage;
