import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
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

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/login", {
        email,
        password,
      });
      navigate("/dashboard");
    } catch (error) {
      console.error("Error logging in:", error);
      toast({
        title: "Login Failed",
        description: "Invalid email or password. Please try again.",
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
          Login
        </Heading>
        <Stack spacing={4} as="form" onSubmit={handleLogin}>
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
            loadingText="Logging in"
            mt={4}
          >
            Login
          </Button>
        </Stack>
      </Container>
    </Center>
  );
};

export default Login;
