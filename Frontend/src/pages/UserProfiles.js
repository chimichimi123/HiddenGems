import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import {
  Box,
  Heading,
  Image,
  Text,
  VStack,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Spinner,
  Wrap,
  WrapItem,
  Button,
  useToast,
} from "@chakra-ui/react";
import defaultProfileImage from "../images/spotify_user_card-default.jpg";
import UserLikedSongs from "../components/UserLikedSongs";
import SongList from "../components/SongList";
import ArtistDetails from "../components/ArtistDetails";

function UserProfiles() {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [topTracks, setTopTracks] = useState([]);
  const [topArtists, setTopArtists] = useState([]);
  const [leastPopularTracks, setLeastPopularTracks] = useState([]);
  const [selectedArtistId, setSelectedArtistId] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
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

    const fetchSpotifyProfile = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/spotify/user-profile/${userId}`,
          {
            withCredentials: true,
          }
        );
        const profileData = response.data;

        setTopTracks(profileData.top_tracks);
        setTopArtists(profileData.top_artists);
        setLeastPopularTracks(profileData.least_popular_tracks);
      } catch (error) {
        console.error("Error fetching Spotify profile:", error);
        setError("Failed to fetch Spotify profile. Please try again later.");
      }
    };

    fetchUserProfile();
    fetchSpotifyProfile();
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

  const handleArtistClick = (artistId) => {
    setSelectedArtistId(artistId);
  };

  const handleBackToList = () => {
    setSelectedArtistId(null);
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
          </Box>

          <Tabs variant="enclosed" colorScheme="teal">
            <TabList>
              <Tab>Liked Songs</Tab>
              <Tab>Top Tracks</Tab>
              <Tab>Top Artists</Tab>
              <Tab>Most Obscure Songs</Tab>
            </TabList>

            <TabPanels>
              <TabPanel>
                <UserLikedSongs userId={userId} />
              </TabPanel>
              <TabPanel>
                <SongList songs={topTracks} title="Top Tracks" />
              </TabPanel>
              <TabPanel>
                {selectedArtistId ? (
                  <ArtistDetails
                    artistId={selectedArtistId}
                    onBackClick={handleBackToList}
                  />
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
                            _hover={{
                              boxShadow: "xl",
                              transform: "scale(1.05)",
                            }}
                            transition="all 0.2s"
                            onClick={() => handleArtistClick(artist.id)}
                            cursor="pointer"
                          >
                            <VStack spacing={4}>
                              <Image
                                src={artist.image_url || defaultProfileImage}
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
              </TabPanel>
              <TabPanel>
                <SongList
                  songs={leastPopularTracks}
                  title="Most Obscure Songs"
                />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </VStack>
      ) : (
        <Text>No user data available.</Text>
      )}
    </Box>
  );
}

export default UserProfiles;
