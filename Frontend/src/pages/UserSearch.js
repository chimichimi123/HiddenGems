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
  Radio,
  RadioGroup,
  Stack,
  Select,
} from "@chakra-ui/react";
import defaultProfileImage from "../images/empty_pfp.jpg"; // Update the default image path

function UserSearch() {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState(null);
  const [searchType, setSearchType] = useState("name"); // Default search type is "name"
  const navigate = useNavigate();
  const toast = useToast();

  const genreOptions = [
    "Rock",
    "Pop",
    "Jazz",
    "Classical",
    "Hip-Hop",
    "Electronic",
    "Country",
    "R&B",
    "Blues",
    "Folk",
  ];
  const instrumentOptions = [
    "Guitar",
    "Piano",
    "Violin",
    "Drums",
    "Bass",
    "Saxophone",
    "Flute",
    "Trumpet",
    "Cello",
    "Harmonica",
  ];

  const handleSearch = async (event) => {
    event.preventDefault();
    try {
      // Adjust the search URL based on the selected search type
      const response = await axios.get(
        `http://localhost:5000/search-users?query=${query}&type=${searchType}`,
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
    navigate(`/user/${userId}`);
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

          {/* Toggle search input based on search type */}
          <RadioGroup onChange={setSearchType} value={searchType} mb={4}>
            <Stack direction="row" spacing={4}>
              <Radio value="name">Name</Radio>
              <Radio value="instrument">Instrument</Radio>
              <Radio value="genre">Genre</Radio>
            </Stack>
          </RadioGroup>

          {searchType === "name" && (
            <Input
              id="search"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter name or email..."
              mb={4}
              bg="white"
              color="black"
            />
          )}

          {searchType === "instrument" && (
            <Select
              placeholder="Select instrument"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              mb={4}
              bg="white"
              color="black"
            >
              {instrumentOptions.map((instrument) => (
                <option key={instrument} value={instrument}>
                  {instrument}
                </option>
              ))}
            </Select>
          )}

          {searchType === "genre" && (
            <Select
              placeholder="Select genre"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              mb={4}
              bg="white"
              color="black"
            >
              {genreOptions.map((genre) => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </Select>
          )}

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
