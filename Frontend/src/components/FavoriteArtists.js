import React, { useState, useEffect } from "react";
import axios from "axios";

const FavoriteArtists = () => {
  const [topArtists, setTopArtists] = useState([]);
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
        if (response.data.error) {
          setError(response.data.error);
        } else {
          setTopArtists(response.data);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching top artists:", error);
        setError("Failed to fetch top artists. Please try again later.");
        setLoading(false);
      }
    };

    fetchSpotifyTopArtists();
  }, []);

  const handleArtistClick = (artist) => {
    setSelectedArtist(artist);
  };

  const handleBackToList = () => {
    setSelectedArtist(null);
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
      {selectedArtist ? (
        <div>
          <h2>{selectedArtist.name}</h2>
          <p>Followers: {selectedArtist.followers}</p>
          <p>Genres: {selectedArtist.genres}</p>
          <p>Popularity: {selectedArtist.popularity}</p>
          <p>
            <img
              src={selectedArtist.image_url || "default_image_url.jpg"}
              alt={`${selectedArtist.name} profile`}
              style={{ width: "200px", height: "200px" }}
            />
          </p>
          <button onClick={handleBackToList}>Back to list</button>
        </div>
      ) : (
        <ul>
          {topArtists.length === 0 ? (
            <p>No artists available</p>
          ) : (
            topArtists.map((artist) => (
              <li key={artist.id} onClick={() => handleArtistClick(artist)}>
                <div>
                  <p>
                    <strong>{artist.name}</strong>
                  </p>
                  <p>Popularity: {artist.popularity}</p>
                  <p>
                    <img
                      src={artist.image_url || "default_image_url.jpg"}
                      alt={`${artist.name} profile`}
                      style={{ width: "100px", height: "100px" }}
                    />
                  </p>
                </div>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
};

export default FavoriteArtists;
