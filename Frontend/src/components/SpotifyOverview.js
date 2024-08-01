import React from "react";
import {
  Box,
  Flex,
  Heading,
  Stack,
  Button,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from "@chakra-ui/react";
import { ArrowForwardIcon } from "@chakra-ui/icons";
import MostObscureSongs from "./MostObscureSongs";
import FavoriteArtistsPage from "./FavoriteArtists";
import FavoriteSongsPage from "./FavoriteSongs";

function SpotifyOverview() {
  return (
    <Box
      bgGradient="linear(to-b, #2D3748, #000000)"
      color="white"
      minHeight="100vh"
      p={5}
    >
      <Flex
        as="nav"
        justify="space-between"
        align="center"
        mb={5}
        p={5}
        bg="gray.800"
        borderRadius="md"
      >
        <Heading as="h1" size="lg">
          Your Spotify Overview
        </Heading>
        <Button
          colorScheme="teal"
          variant="solid"
          rightIcon={<ArrowForwardIcon />}
          onClick={() =>
            (window.location.href = "http://localhost:3000/discover")
          }
        >
          Recommendations
        </Button>
      </Flex>

      <Tabs variant="enclosed" colorScheme="teal">
        <TabList>
          <Tab>Favorite Songs</Tab>
          <Tab>Favorite Artists</Tab>
          <Tab>Most Obscure Songs</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <FavoriteSongsPage />
          </TabPanel>
          <TabPanel>
            <FavoriteArtistsPage />
          </TabPanel>
          <TabPanel>
            <MostObscureSongs />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}

export default SpotifyOverview;
