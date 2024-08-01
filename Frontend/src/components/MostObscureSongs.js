import React, { useState, useEffect } from "react";
import axios from "axios";
import { Box, Text } from "@chakra-ui/react";
import SongList from "./SongList";

function MostObscureSongs() {
  const [songs, setSongs] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/spotify/least-popular-songs",
          {
            withCredentials: true,
          }
        );

        const songsData = response.data;

        setSongs(songsData);
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
    <Box textAlign="center">
      <Text fontSize="2xl" fontWeight="bold" mb={5}>
        These are the most obscure songs you've been loving lately!
      </Text>
      <SongList songs={songs} />
    </Box>
  );
}

export default MostObscureSongs;
