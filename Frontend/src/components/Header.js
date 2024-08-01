import React from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Flex,
  Heading,
  Link as ChakraLink,
  Spacer,
} from "@chakra-ui/react";
import UserProfile from "../components/UserProfile";

function Header({ user }) {
  return (
    <Flex
      as="header"
      align="center"
      p={4}
      bg="gray.800"
      color="white"
      position="relative"
    >
      <Heading as="h1" size="lg" ml={4}>
        Hidden Gems
      </Heading>
      <Flex align="center" justify="center" flex="1" mx={4}>
        <Box>
          <ChakraLink as={Link} to="/" mr={4}>
            Home
          </ChakraLink>
          <ChakraLink as={Link} to="/search" mr={4}>
            Search
          </ChakraLink>
          <ChakraLink as={Link} to="/dashboard" mr={4}>
            Dashboard
          </ChakraLink>
          <ChakraLink as={Link} to="/discover" mr={4}>
            Discover
          </ChakraLink>
          <ChakraLink as={Link} to="/login" mr={4}>
            Log In
          </ChakraLink>
          <ChakraLink as={Link} to="/register" mr={4}>
            Sign Up
          </ChakraLink>
        </Box>
      </Flex>
      <Box position="absolute" right="10px" top="4px">
        {" "}
        <UserProfile user={user} />
      </Box>
    </Flex>
  );
}

export default Header;
