import React, { useState, useEffect } from "react";
import axios from "axios";
import { Box, Text } from "@chakra-ui/react";
import SongList from "./SongList"; // Assuming you have a SongList component

const FavoriteSongsPage = () => {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        console.log("Fetched songs data:", songsData);
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
    <Box textAlign="center">
      <Text fontSize="2xl" fontWeight="bold" mb={5}>
        These were your favorite songs lately!
      </Text>
      <SongList songs={songs} />
    </Box>
  );
};

export default FavoriteSongsPage;
