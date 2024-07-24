import React, { useState, useEffect } from "react";
import axios from "axios";
import SongList from "./SongList";

function MostObscureSongs() {
  const [songs, setSongs] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/spotify-songs",
          {
            withCredentials: true,
          }
        );

        const songsData = response.data;

        // Sort the songs by popularity (ascending)
        const sortedSongs = songsData.sort(
          (a, b) => a.popularity - b.popularity
        );

        // You can adjust the number of obscure songs you want to display
        const numberOfObscureSongs = 10;
        const obscureSongs = sortedSongs.slice(0, numberOfObscureSongs);

        setSongs(obscureSongs);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching songs:", error);
        setLoading(false);
        setError("Failed to fetch songs. Please try again later.");
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
      <h3>Most Obscure Songs</h3>
      <SongList songs={songs} />
    </div>
  );
}

export default MostObscureSongs;
