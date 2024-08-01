import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import {
  Box,
  Button,
  Center,
  Container,
  Divider,
  Flex,
  Heading,
  Image,
  Link,
  Stack,
  Text,
  useToast,
} from "@chakra-ui/react";

const SongDetails = () => {
  const { id } = useParams();
  const [songDetails, setSongDetails] = useState(null);
  const [liked, setLiked] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const fetchSongDetails = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/spotify/track/${id}`,
          { withCredentials: true }
        );
        setSongDetails(response.data);
      } catch (error) {
        console.error("Error fetching song details:", error);
        toast({
          title: "Error",
          description: "Failed to fetch song details.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    };

    fetchSongDetails();
  }, [id, toast]);

  const likeSong = async (song) => {
    try {
      await axios.post(
        "http://localhost:5000/spotify/like_song",
        {
          spotify_song_id: song.id,
          name: song.name,
          artist: song.artist,
          album: song.album,
          popularity: song.popularity,
          image: song.image_url,
        },
        { withCredentials: true }
      );
      setLiked(true);
      toast({
        title: "Success",
        description: "Song liked successfully.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error liking song:", error);
      toast({
        title: "Error",
        description: "Failed to like song.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleLikeSong = () => {
    if (songDetails) {
      likeSong(songDetails);
    }
  };

  if (!songDetails) {
    return (
      <Center
        h="100vh"
        bgGradient="linear(to-b, #2D3748, #000000)"
        color="white"
      >
        <Text fontSize="xl">Loading...</Text>
      </Center>
    );
  }

  return (
    <Box
      minH="100vh"
      bgGradient="linear(to-b, #2D3748, #000000)"
      p={8}
      color="white"
    >
      <Center h="full">
        <Container maxW="container.xl" centerContent>
          <Stack spacing={8} align="center">
            <Image
              src={songDetails.image_url}
              alt={songDetails.name}
              boxSize="500px"
              borderRadius="md"
              mb={6}
            />
            <Heading as="h1" size="2xl">
              {songDetails.name}
            </Heading>
            <Text fontSize="2xl" color="gray.300">
              Artist: {songDetails.artist}
            </Text>
            <Text fontSize="xl" color="gray.400">
              Album: {songDetails.album}
            </Text>
            <Text fontSize="xl" color="gray.400">
              Popularity: {songDetails.popularity}
            </Text>
            <Text fontSize="xl" color="gray.400">
              Duration: {(songDetails.duration_ms / 60000).toFixed(2)} minutes
            </Text>
            <Text fontSize="xl" color="gray.400">
              Explicit: {songDetails.explicit ? "Yes" : "No"}
            </Text>
            {songDetails.embed_url && (
              <iframe
                src={songDetails.embed_url}
                width="500"
                height="150"
                allowtransparency="true"
                allow="encrypted-media"
                title="Song Embed"
              ></iframe>
            )}
            <Link
              href={songDetails.external_urls.spotify}
              isExternal
              color="teal.300"
              fontWeight="bold"
              fontSize="xl"
            >
              View on Spotify
            </Link>
            <Divider />
            <Button
              onClick={handleLikeSong}
              colorScheme={liked ? "green" : "teal"}
              variant={liked ? "solid" : "outline"}
              size="lg"
              isDisabled={liked}
            >
              {liked ? "Liked" : "Like this song"}
            </Button>
          </Stack>
        </Container>
      </Center>
    </Box>
  );
};

export default SongDetails;
