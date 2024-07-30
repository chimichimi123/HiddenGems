// src/components/ArtistDetails.js
import React, { useEffect, useState } from "react";
import axios from "axios";

const ArtistDetails = ({ artistId }) => {
  const [artistDetails, setArtistDetails] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArtistDetails = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/spotify-artist-details/${artistId}`,
          {
            withCredentials: true,
          }
        );
        setArtistDetails(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching artist details:", error);
        setLoading(false);
        setError("Failed to fetch artist details. Please try again later.");
      }
    };

    fetchArtistDetails();
  }, [artistId]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!artistDetails) {
    return <p>No artist details found.</p>;
  }

  return (
    <div>
      <h2>{artistDetails.name}</h2>
      <p>Genres: {artistDetails.genres.join(", ")}</p>
      <p>Followers: {artistDetails.followers.total}</p>
      <p>
        <img
          src={artistDetails.images[0]?.url}
          alt={`${artistDetails.name} profile`}
          style={{ width: "200px", height: "200px" }}
        />
      </p>
      <p>Popularity: {artistDetails.popularity}</p>
    </div>
  );
};

export default ArtistDetails;
