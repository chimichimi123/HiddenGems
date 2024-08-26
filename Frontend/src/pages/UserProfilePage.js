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
import defaultProfileImage from "../images/empty_pfp.jpg";

const UserProfilePage = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
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

    fetchUserData();
  }, []);

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

              {/* Display multiple genres */}
              <Text fontSize="md">
                Genres:
                {user.genres && user.genres.length > 0 ? (
                  user.genres.map((genre, index) => (
                    <Text as="span" key={index}>
                      {genre}
                      {index < user.genres.length - 1 ? ", " : ""}
                    </Text>
                  ))
                ) : (
                  <Text as="span">No genres specified</Text>
                )}
              </Text>

              {/* Display multiple instruments */}
              <Text fontSize="md">
                Instruments:
                {user.instruments && user.instruments.length > 0 ? (
                  user.instruments.map((instrument, index) => (
                    <Text as="span" key={index}>
                      {instrument}
                      {index < user.instruments.length - 1 ? ", " : ""}
                    </Text>
                  ))
                ) : (
                  <Text as="span">No instruments specified</Text>
                )}
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
