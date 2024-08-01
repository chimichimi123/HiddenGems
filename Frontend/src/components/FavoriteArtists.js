import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Image,
  Text,
  VStack,
  Wrap,
  WrapItem,
  Button,
  Spinner,
} from "@chakra-ui/react";

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
    return <Spinner size="xl" />;
  }

  if (error) {
    return <Text color="red.500">{error}</Text>;
  }

  return (
    <Box p={5}>
      <Text fontSize="2xl" fontWeight="bold" mb={5}>
        Favorite Artists
      </Text>
      {selectedArtist ? (
        <Box>
          <Text fontSize="2xl" fontWeight="bold">
            {selectedArtist.name}
          </Text>
          <Text>Followers: {selectedArtist.followers}</Text>
          <Text>Genres: {selectedArtist.genres}</Text>
          <Text>Popularity: {selectedArtist.popularity}</Text>
          <Image
            src={selectedArtist.image_url || "default_image_url.jpg"}
            alt={`${selectedArtist.name} profile`}
            boxSize="200px"
            objectFit="cover"
            borderRadius="md"
            my={4}
          />
          <Button onClick={handleBackToList} colorScheme="teal">
            Back to list
          </Button>
        </Box>
      ) : (
        <Wrap spacing="30px" justify="center">
          {topArtists.length === 0 ? (
            <Text>No artists available</Text>
          ) : (
            topArtists.map((artist) => (
              <WrapItem key={artist.id}>
                <Box
                  p={5}
                  maxW="sm"
                  borderWidth="1px"
                  borderRadius="lg"
                  overflow="hidden"
                  boxShadow="md"
                  _hover={{ boxShadow: "xl", transform: "scale(1.05)" }}
                  transition="all 0.2s"
                  onClick={() => handleArtistClick(artist)}
                  cursor="pointer"
                >
                  <VStack spacing={4}>
                    <Image
                      src={artist.image_url || "default_image_url.jpg"}
                      alt={`${artist.name} profile`}
                      boxSize="150px"
                      objectFit="cover"
                      borderRadius="full"
                    />
                    <Text fontWeight="bold" fontSize="xl">
                      {artist.name}
                    </Text>
                    <Text>Popularity: {artist.popularity}</Text>
                  </VStack>
                </Box>
              </WrapItem>
            ))
          )}
        </Wrap>
      )}
    </Box>
  );
};

export default FavoriteArtists;
