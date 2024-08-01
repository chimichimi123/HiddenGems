// src/pages/FavoriteSongsPage.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import SongList from "./SongList";

const FavoriteSongsPage = () => {
  const [songs, setSongs] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/spotify-top-tracks",
          {
            withCredentials: true,
          }
        );

        const songsData = response.data;
        console.log("Fetched songs data:", songsData); // Add this line
        setSongs(songsData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching top tracks:", error);
        setLoading(false);
        if (error.response && error.response.status === 401) {
          setError("User not authenticated with Spotify. Please log in.");
        } else {
          setError("Failed to fetch top tracks. Please try again later.");
        }
      }
    };

    fetchSongs();
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <h2>These were your favorite songs recently</h2>
      <SongList songs={songs} /> {}
    </div>
  );
};

export default FavoriteSongsPage;
