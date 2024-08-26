import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import {
  Box,
  Heading,
  Image,
  Text,
  VStack,
  Spinner,
  Button,
  useToast,
} from "@chakra-ui/react";
import defaultProfileImage from "../images/empty_pfp.jpg";

function UserProfiles() {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [friendshipStatus, setFriendshipStatus] = useState(null);
  const toast = useToast();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/user-profile/${userId}`,
          {
            withCredentials: true,
          }
        );
        const userData = response.data;
        setUser(userData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setError("Failed to fetch user profile. Please try again later.");
        setLoading(false);
      }
    };

    const fetchFriendshipStatus = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/friendship-status/${userId}`,
          {
            withCredentials: true,
          }
        );
        setFriendshipStatus(response.data.status);
      } catch (error) {
        console.error("Error fetching friendship status:", error);
        setError("Failed to fetch friendship status. Please try again later.");
      }
    };

    fetchUserProfile();
    fetchFriendshipStatus();
  }, [userId]);

  if (loading) {
    return (
      <VStack
        spacing={4}
        minHeight="100vh"
        justifyContent="center"
        bgGradient="linear(to-b, #2D3748, #000000)"
      >
        <Spinner size="xl" color="teal" />
        <Text color="white">Loading...</Text>
      </VStack>
    );
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

  const handleFriendRequest = async () => {
    try {
      await axios.post(
        "http://localhost:5000/send-friend-request",
        { friend_id: user.id },
        { withCredentials: true }
      );
      toast({
        title: "Friend request sent",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      setFriendshipStatus("pending");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send friend request.",
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
      {user ? (
        <VStack spacing={5} align="start">
          <Box textAlign="center" mb={5}>
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
              mx="auto"
            />
            <Heading as="h2" size="lg">
              {user.username}
            </Heading>
            <Text fontSize="md" color="gray.300">
              {user.email}
            </Text>
            <Text fontSize="md" color="gray.300">
              Display Name: {user.display_name}
            </Text>
            <Text fontSize="md" color="gray.300">
              Bio: {user.bio}
            </Text>
            <Text fontSize="md" color="gray.300">
              Joined: {new Date(user.created_at).toDateString()}
            </Text>
            <Text fontSize="md" color="gray.300">
              Genre: {user.genre}
            </Text>
            <Text fontSize="md" color="gray.300">
              Instruments: {user.instruments}
            </Text>
          </Box>
          <Button
            colorScheme={
              friendshipStatus === "accepted"
                ? "green"
                : friendshipStatus === "pending"
                ? "yellow"
                : "teal"
            }
            onClick={
              friendshipStatus === "pending" ? undefined : handleFriendRequest
            }
            disabled={friendshipStatus === "accepted"}
          >
            {friendshipStatus === "accepted"
              ? "Already Added"
              : friendshipStatus === "pending"
              ? "Pending Request"
              : "Add Friend"}
          </Button>
        </VStack>
      ) : (
        <Text>No user data available.</Text>
      )}
    </Box>
  );
}

export default UserProfiles;
