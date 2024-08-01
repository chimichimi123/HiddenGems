import React, { useState } from "react";
import axios from "axios";
import {
  Box,
  Button,
  Center,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  useToast,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("http://localhost:5000/register", {
        username,
        email,
        password,
      });
      toast({
        title: "Registration Successful",
        description: "You have been registered successfully.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Registration failed:", error);
      setError("Registration failed");
      toast({
        title: "Registration Failed",
        description: "An error occurred while registering. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Center h="100vh" bgGradient="linear(to-b, #2D3748, #000000)" color="white">
      <Container maxW="md" bg="gray.800" p={6} borderRadius="md" boxShadow="lg">
        <Heading mb={6} textAlign="center">
          Register
        </Heading>
        <Stack spacing={4} as="form" onSubmit={handleSubmit}>
          <FormControl id="username" isRequired>
            <FormLabel>Username</FormLabel>
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              bg="white"
              color="black"
              borderColor="gray.600"
              _placeholder={{ color: "gray.500" }}
            />
          </FormControl>
          <FormControl id="email" isRequired>
            <FormLabel>Email</FormLabel>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              bg="white"
              color="black"
              borderColor="gray.600"
              _placeholder={{ color: "gray.500" }}
            />
          </FormControl>
          <FormControl id="password" isRequired>
            <FormLabel>Password</FormLabel>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              bg="white"
              color="black"
              borderColor="gray.600"
              _placeholder={{ color: "gray.500" }}
            />
          </FormControl>
          <Button
            type="submit"
            colorScheme="teal"
            isLoading={loading}
            loadingText="Registering"
            mt={4}
          >
            Register
          </Button>
          {error && (
            <Box mt={4} p={3} borderRadius="md" bg="red.600" color="white">
              {error}
            </Box>
          )}
        </Stack>
        <Box mt={4} textAlign="center">
          <Link to="/login">
            <Button variant="link" colorScheme="teal">
              Already have an account? Login
            </Button>
          </Link>
        </Box>
      </Container>
    </Center>
  );
};

export default Register;
