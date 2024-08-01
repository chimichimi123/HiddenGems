import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  Box,
  Button,
  Flex,
  Grid,
  Heading,
  Image,
  Text,
  VStack,
  useToast,
  IconButton,
  Spinner,
} from "@chakra-ui/react";
import { FaPlay, FaPause } from "react-icons/fa";
import ReactPlayer from "react-player";

const Discover = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [playingSong, setPlayingSong] = useState(null);
  const [loading, setLoading] = useState(false);
  const playerRef = useRef(null);
  const toast = useToast();

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/spotify/recommendations"
        );
        setRecommendations(response.data);
      } catch (error) {
        console.error("Error fetching recommendations:", error);
        toast({
          title: "Error",
          description: "Failed to fetch recommendations.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    };

    fetchRecommendations();
  }, [toast]);

  const likeSong = async (song) => {
    try {
      await axios.post("http://localhost:5000/user/like_song", {
        spotify_song_id: song.id,
        name: song.name,
        artist: song.artist,
        album: song.album,
        popularity: song.popularity,
        image: song.image_url,
      });
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

  const handlePlayClick = (url) => {
    if (playingSong === url) {
      setPlayingSong(null);
      playerRef.current.seekTo(0);
    } else {
      setPlayingSong(url);
    }
  };

  const handleOnReady = () => {
    setLoading(false);
  };

  const handleOnBuffer = () => {
    setLoading(true);
  };

  return (
    <Box
      bgGradient="linear(to-b, #2D3748, #000000)"
      color="white"
      minHeight="100vh"
      p={5}
    >
      <Flex
        direction="column"
        align="center"
        mb={5}
        p={5}
        bg="gray.800"
        borderRadius="md"
      >
        <Heading as="h2" size="lg" mb={4}>
          Find Some New Songs 🎵
        </Heading>
        <Button
          colorScheme="teal"
          variant="solid"
          as={Link}
          to="/user/liked_songs"
        >
          My Liked Songs
        </Button>
      </Flex>

      <Grid
        templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(3, 1fr)" }}
        gap={6}
      >
        {recommendations.map((song) => (
          <VStack
            key={song.id}
            spacing={3}
            bg="gray.700"
            borderRadius="md"
            p={4}
            align="start"
            position="relative"
            overflow="hidden"
            _hover={{ bg: "gray.600", cursor: "pointer" }}
          >
            <Link to={`/song/${song.id}`}>
              <Image
                src={song.image_url}
                alt={song.name}
                borderRadius="md"
                boxSize="150px"
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
                Popularity: {song.popularity}
              </Text>
            </Box>
            {song.preview_url && (
              <Box
                position="absolute"
                bottom="80px"
                right="80px"
                display="flex"
                alignItems="center"
                justifyContent="center"
                h="150px"
                w="150px"
                bg="gray.800"
                borderRadius="md"
                p={2}
              >
                {loading && <Spinner size="sm" color="teal" />}
                <IconButton
                  icon={
                    playingSong === song.preview_url ? <FaPause /> : <FaPlay />
                  }
                  colorScheme="teal"
                  onClick={() => handlePlayClick(song.preview_url)}
                  aria-label={
                    playingSong === song.preview_url ? "Pause" : "Play"
                  }
                  size="lg"
                  isRound={true}
                />
                <ReactPlayer
                  url={song.preview_url}
                  ref={playerRef}
                  width="0"
                  height="0"
                  playing={playingSong === song.preview_url}
                  onReady={handleOnReady}
                  onBuffer={handleOnBuffer}
                  style={{ display: "none" }}
                />
              </Box>
            )}
            <Button
              colorScheme="teal"
              variant="outline"
              onClick={() => likeSong(song)}
            >
              Like
            </Button>
          </VStack>
        ))}
      </Grid>
    </Box>
  );
};

export default Discover;
