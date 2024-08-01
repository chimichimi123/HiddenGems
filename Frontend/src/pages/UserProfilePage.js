import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Center,
  Container,
  Divider,
  Flex,
  Heading,
  Image,
  Stack,
  Text,
  useToast,
} from "@chakra-ui/react";
import defaultProfileImage from "../images/spotify_user_card-default.jpg";

const UserProfilePage = () => {
  const [user, setUser] = useState(null);
  const [spotifyUserData, setSpotifyUserData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unlinking, setUnlinking] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get("http://localhost:5000/user", {
          withCredentials: true,
        });
        setUser(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setLoading(false);
        setError("Failed to fetch user data. Please try again later.");
      }
    };

    const fetchSpotifyUserData = async () => {
      try {
        const response = await axios.get("http://localhost:5000/spotify-data", {
          withCredentials: true,
        });
        setSpotifyUserData(response.data);
      } catch (error) {
        console.error("Error fetching Spotify user data:", error);
        setError("Failed to fetch Spotify user data. Please try again later.");
      }
    };

    fetchUserData();
    fetchSpotifyUserData();
  }, []);

  const handleUnlinkSpotify = async () => {
    setUnlinking(true);
    try {
      await axios.get("http://localhost:5000/unlink-spotify", {
        withCredentials: true,
      });
      setSpotifyUserData(null);
      setUnlinking(false);
      navigate("/user");
      toast({
        title: "Spotify Account Unlinked",
        description: "Your Spotify account has been successfully unlinked.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error unlinking Spotify account:", error);
      setError("Failed to unlink Spotify account. Please try again later.");
      setUnlinking(false);
      toast({
        title: "Unlink Failed",
        description: "An error occurred while unlinking your Spotify account.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  if (loading) {
    return (
      <Center
        h="100vh"
        bgGradient="linear(to-b, #2D3748, #000000)"
        color="white"
      >
        <Heading>Loading...</Heading>
      </Center>
    );
  }

  if (error) {
    return (
      <Center
        h="100vh"
        bgGradient="linear(to-b, #2D3748, #000000)"
        color="white"
      >
        <Text color="red.500">{error}</Text>
      </Center>
    );
  }

  return (
    <Flex minH="100vh">
      <Box
        flex="1"
        p={6}
        bgGradient="linear(to-b, #2D3748, #000000)"
        color="white"
        overflowY="auto"
        position="relative"
      >
        <Container maxW="container.lg">
          {user ? (
            <Stack spacing={6}>
              <Heading as="h2" size="xl">
                {user.username}
              </Heading>
              <Text fontSize="lg">{user.email}</Text>
              <Text fontSize="md">Display Name: {user.display_name}</Text>
              <Text fontSize="md">Bio: {user.bio}</Text>
              <Text fontSize="md">
                Joined: {new Date(user.created_at).toDateString()}
              </Text>
              <Image
                src={
                  user.profile_image
                    ? `http://localhost:5000/uploads/${user.profile_image}`
                    : defaultProfileImage
                }
                alt="Profile"
                boxSize="150px"
                borderRadius="full"
                mb={4}
              />

              {spotifyUserData && (
                <>
                  <Divider my={4} />
                  <Heading as="h3" size="lg">
                    Spotify Profile
                  </Heading>
                  <Text fontSize="md">
                    Display Name: {spotifyUserData.display_name}
                  </Text>
                  <Text fontSize="md">Email: {spotifyUserData.email}</Text>
                  <Text fontSize="md">Country: {spotifyUserData.country}</Text>
                  <Text fontSize="md">
                    Spotify Profile:{" "}
                    <a
                      href={spotifyUserData.external_urls.spotify}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#4CAF50" }}
                    >
                      {spotifyUserData.external_urls.spotify}
                    </a>
                  </Text>
                  <Text fontSize="md">
                    Followers: {spotifyUserData.followers.total}
                  </Text>
                  <Image
                    src={
                      spotifyUserData.images.length > 0
                        ? spotifyUserData.images[0].url
                        : defaultProfileImage
                    }
                    alt="Spotify Profile"
                    boxSize="150px"
                    borderRadius="full"
                    mb={4}
                  />
                </>
              )}
              <Button
                colorScheme="teal"
                isLoading={unlinking}
                onClick={handleUnlinkSpotify}
              >
                Unlink Spotify Account
              </Button>
            </Stack>
          ) : (
            <Text>No user data available.</Text>
          )}
        </Container>
      </Box>
    </Flex>
  );
};

export default UserProfilePage;
