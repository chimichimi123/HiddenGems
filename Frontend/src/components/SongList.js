import React from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Image,
  Text,
  Button,
  Link,
  VStack,
  HStack,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";

const SongList = ({ songs = [] }) => {
  return (
    <Box p={5}>
      {songs.length === 0 ? (
        <Text>No songs available</Text>
      ) : (
        <Wrap spacing="30px" justify="center">
          {songs.map((song) => (
            <WrapItem key={song.id}>
              <Box
                p={5}
                maxW="sm"
                borderWidth="1px"
                borderRadius="lg"
                overflow="hidden"
                boxShadow="md"
                _hover={{ boxShadow: "xl", transform: "scale(1.05)" }}
                transition="all 0.2s"
              >
                <VStack spacing={4}>
                  <Image
                    src={song.image_url || "default_image_url.jpg"}
                    alt={song.name}
                    boxSize="150px"
                    objectFit="cover"
                    borderRadius="full"
                  />
                  <Text fontWeight="bold" fontSize="xl">
                    {song.name}
                  </Text>
                  <Text>Artist: {song.artist}</Text>
                  <Text>Album: {song.album}</Text>
                  <Text>Popularity: {song.popularity}</Text>
                  <Button
                    as={RouterLink}
                    to={`/song/${song.id}`}
                    colorScheme="teal"
                  >
                    View Song Details
                  </Button>
                </VStack>
              </Box>
            </WrapItem>
          ))}
        </Wrap>
      )}
    </Box>
  );
};

export default SongList;
