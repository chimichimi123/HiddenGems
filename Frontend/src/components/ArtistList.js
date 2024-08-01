import React from "react";
import { Box, Image, Text, VStack, Wrap, WrapItem } from "@chakra-ui/react";

function ArtistList({ artists, onArtistClick }) {
  return (
    <Box p={5}>
      {artists.length === 0 ? (
        <Text>No artists available</Text>
      ) : (
        <Wrap spacing="30px" justify="center">
          {artists.map((artist) => (
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
                onClick={() => onArtistClick(artist)}
                cursor="pointer"
              >
                <VStack spacing={4}>
                  <Image
                    src={
                      artist.images && artist.images.length > 0
                        ? artist.images[0].url
                        : "default_image_url.jpg"
                    }
                    alt={`${artist.name} profile`}
                    boxSize="150px"
                    objectFit="cover"
                    borderRadius="full"
                  />
                  <Text fontWeight="bold" fontSize="xl">
                    {artist.name}
                  </Text>
                  <Text>
                    Genres:{" "}
                    {artist.genres
                      ? artist.genres.join(", ")
                      : "No genres available"}
                  </Text>
                  <Text>Popularity: {artist.popularity}</Text>
                </VStack>
              </Box>
            </WrapItem>
          ))}
        </Wrap>
      )}
    </Box>
  );
}

export default ArtistList;
