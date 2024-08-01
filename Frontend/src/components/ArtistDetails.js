import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Button,
  Box,
  Heading,
  Image,
  Text,
  Spinner,
  useToast,
} from "@chakra-ui/react";

const ArtistDetails = ({ artistId, onBackClick }) => {
  const [artistDetails, setArtistDetails] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

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
        setError("Failed to fetch artist details. Please try again later.");
        setLoading(false);
      }
    };

    fetchArtistDetails();
  }, [artistId]);

  if (loading) {
    return <Spinner size="xl" color="teal" />;
  }

  if (error) {
    toast({
      title: "Error",
      description: error,
      status: "error",
      duration: 5000,
      isClosable: true,
    });
    return null;
  }

  if (!artistDetails) {
    return <Text>No artist details found.</Text>;
  }

  return (
    <Box
      p={5}
      bg="gray.800"
      borderRadius="md"
      boxShadow="md"
      color="white"
      textAlign="center"
    >
      <Heading as="h2" size="lg" mb={4}>
        {artistDetails.name}
      </Heading>
      <Image
        src={artistDetails.images[0]?.url}
        alt={`${artistDetails.name} profile`}
        borderRadius="full"
        boxSize="200px"
        objectFit="cover"
        mb={4}
      />
      <Text mb={2}>Genres: {artistDetails.genres.join(", ")}</Text>
      <Text mb={2}>Followers: {artistDetails.followers.total}</Text>
      <Text mb={4}>Popularity: {artistDetails.popularity}</Text>
      <Button colorScheme="teal" onClick={onBackClick}>
        Back to List
      </Button>
    </Box>
  );
};

export default ArtistDetails;
