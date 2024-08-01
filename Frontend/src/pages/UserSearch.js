import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  List,
  ListItem,
  Text,
  Image,
  useToast,
  VStack,
} from "@chakra-ui/react";
import defaultProfileImage from "../images/spotify_user_card-default.jpg";

function UserSearch() {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const toast = useToast();

  const handleSearch = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.get(
        `http://localhost:5000/search-users?query=${query}`,
        { withCredentials: true }
      );
      setSearchResults(response.data);
      setError(null);
    } catch (error) {
      console.error("Error fetching search results:", error);
      setError("Failed to fetch search results. Please try again later.");
      toast({
        title: "Error",
        description: "Failed to fetch search results. Please try again later.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleUserClick = (userId) => {
    navigate(`/spotify/user/${userId}`);
  };

  return (
    <Box
      p={6}
      bgGradient="linear(to-b, #2D3748, #000000)"
      minH="100vh"
      color="white"
    >
      <VStack spacing={6} align="center">
        <FormControl as="form" onSubmit={handleSearch} width="100%" maxW="lg">
          <FormLabel htmlFor="search" fontSize="lg" fontWeight="bold">
            Search for users:
          </FormLabel>
          <Input
            id="search"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter username or email..."
            mb={4}
            bg="white"
            color="black"
          />
          <Button type="submit" colorScheme="teal" width="full">
            Search
          </Button>
        </FormControl>

        {error && (
          <Text color="red.400" fontSize="lg">
            {error}
          </Text>
        )}

        <List spacing={4} width="100%" maxW="lg">
          {searchResults.length > 0 ? (
            searchResults.map((user) => (
              <ListItem
                key={user.id}
                onClick={() => handleUserClick(user.id)}
                cursor="pointer"
                _hover={{ bg: "gray.700", borderRadius: "md" }}
                p={4}
                borderWidth="1px"
                borderColor="gray.600"
                borderRadius="md"
                transition="background-color 0.2s"
              >
                <Box display="flex" alignItems="center">
                  <Image
                    src={
                      user.profile_image
                        ? `http://localhost:5000/uploads/${user.profile_image}`
                        : defaultProfileImage
                    }
                    alt={user.username}
                    boxSize="50px"
                    borderRadius="full"
                    mr={4}
                  />
                  <Box>
                    <Text fontSize="lg" fontWeight="bold">
                      {user.username}
                    </Text>
                    <Text fontSize="md">{user.display_name}</Text>
                    <Text fontSize="sm" color="gray.300">
                      {user.email}
                    </Text>
                  </Box>
                </Box>
              </ListItem>
            ))
          ) : (
            <Text>No results found.</Text>
          )}
        </List>
      </VStack>
    </Box>
  );
}

export default UserSearch;
