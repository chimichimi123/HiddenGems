import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  Box,
  Button,
  Flex,
  Grid,
  Heading,
  Image,
  Stack,
  Text,
  useToast,
} from "@chakra-ui/react";

const LikedSongs = () => {
  const [likedSongs, setLikedSongs] = useState([]);
  const toast = useToast();

  useEffect(() => {
    const fetchLikedSongs = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/user/liked_songs"
        );
        setLikedSongs(response.data);
      } catch (error) {
        console.error("Error fetching liked songs:", error);
        toast({
          title: "Error",
          description: "Failed to fetch liked songs.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    };

    fetchLikedSongs();
  }, [toast]);

  const handleDelete = async (songId) => {
    try {
      await axios.delete(`http://localhost:5000/user/unlike_song/${songId}`, {
        withCredentials: true,
      });
      setLikedSongs(
        likedSongs.filter((song) => song.spotify_song_id !== songId)
      );
      toast({
        title: "Success",
        description: "Song removed from liked list.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error removing liked song:", error);
      toast({
        title: "Error",
        description: "Failed to remove liked song.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box
      bgGradient="linear(to-b, #2D3748, #000000)"
      color="white"
      minHeight="100vh"
      p={5}
    >
      <Heading as="h2" size="lg" mb={5}>
        Liked Songs
      </Heading>

      <Grid
        templateColumns={{
          base: "repeat(1, 1fr)",
          md: "repeat(2, 1fr)",
          lg: "repeat(3, 1fr)",
        }}
        gap={6}
      >
        {likedSongs.map((song) => (
          <Stack
            key={song.spotify_song_id}
            spacing={4}
            bg="gray.700"
            borderRadius="md"
            p={4}
            _hover={{ bg: "gray.600" }}
          >
            <Link to={`/song/${song.spotify_song_id}`}>
              <Image
                src={song.image}
                alt={song.name}
                borderRadius="md"
                boxSize="200px"
                objectFit="cover"
              />
            </Link>
            <Box>
              <Heading as="h3" size="md">
                {song.name}
              </Heading>
              <Text fontSize="sm">{song.artist}</Text>
              <Text fontSize="sm">{song.album}</Text>
              <Text fontSize="sm" color="gray.400">
                Added on: {new Date(song.added_at).toLocaleDateString()}
              </Text>
              <Box mt={2}>
                <iframe
                  src={song.embed_url}
                  width="300"
                  height="80"
                  frameBorder="0"
                  allowTransparency="true"
                  allow="encrypted-media"
                ></iframe>
              </Box>
            </Box>
            <Button
              colorScheme="teal"
              variant="outline"
              onClick={() => handleDelete(song.spotify_song_id)}
            >
              Remove
            </Button>
          </Stack>
        ))}
      </Grid>
    </Box>
  );
};

export default LikedSongs;
