// src/pages/FavoriteArtistsPage.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import ArtistDetails from "../components/ArtistDetails";

const FavoriteArtistsPage = () => {
  const [spotifyData, setSpotifyData] = useState({ topArtists: [] });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedArtist, setSelectedArtist] = useState(null);

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
  }, []);

  const handleArtistClick = (artistId) => {
    setSelectedArtist(artistId);
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <h2>Favorite Artists</h2>
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {spotifyData.topArtists.length > 0 ? (
          spotifyData.topArtists.map((artist) => (
            <div
              key={artist.id}
              onClick={() => handleArtistClick(artist.id)}
              style={{
                margin: "10px",
                cursor: "pointer",
                textAlign: "center",
                width: "150px",
              }}
            >
              <img
                src={artist.image_url}
                alt={`${artist.name} image`}
                style={{ width: "100px", height: "100px" }}
              />
              <p>{artist.name}</p>
            </div>
          ))
        ) : (
          <p>No favorite artists found.</p>
        )}
      </div>
      {selectedArtist && <ArtistDetails artistId={selectedArtist} />}
    </div>
  );
};

export default FavoriteArtistsPage;
