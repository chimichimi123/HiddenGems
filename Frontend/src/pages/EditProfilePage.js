import React, { useState } from "react";
import axios from "axios";
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Textarea,
  useToast,
  VStack,
} from "@chakra-ui/react";
import Select from "react-select";
import { useNavigate } from "react-router-dom";

const EditProfilePage = () => {
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [genres, setGenres] = useState([]);
  const [instruments, setInstruments] = useState([]);
  const [file, setFile] = useState(null);
  const toast = useToast();
  const navigate = useNavigate();

  const genreOptions = [
    { value: "Rock", label: "Rock" },
    { value: "Pop", label: "Pop" },
    { value: "Jazz", label: "Jazz" },
    { value: "Classical", label: "Classical" },
    { value: "Hip-Hop", label: "Hip-Hop" },
    { value: "Electronic", label: "Electronic" },
    { value: "Country", label: "Country" },
    { value: "R&B", label: "R&B" },
    { value: "Blues", label: "Blues" },
    { value: "Folk", label: "Folk" },
  ];

  const instrumentOptions = [
    { value: "Guitar", label: "Guitar" },
    { value: "Piano", label: "Piano" },
    { value: "Violin", label: "Violin" },
    { value: "Drums", label: "Drums" },
    { value: "Bass", label: "Bass" },
    { value: "Saxophone", label: "Saxophone" },
    { value: "Flute", label: "Flute" },
    { value: "Trumpet", label: "Trumpet" },
    { value: "Cello", label: "Cello" },
    { value: "Harmonica", label: "Harmonica" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("display_name", displayName);
    formData.append("bio", bio);
    formData.append(
      "genres",
      JSON.stringify(genres.map((genre) => genre.value))
    ); // Serialize as JSON array
    formData.append(
      "instruments",
      JSON.stringify(instruments.map((instrument) => instrument.value))
    ); // Serialize as JSON array
    if (file) {
      formData.append("file", file);
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/edit-profile",
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      toast({
        title: "Profile Updated",
        description: response.data.message,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      navigate("/user");
    } catch (error) {
      console.error("There was an error updating the profile!", error);
      toast({
        title: "Update Failed",
        description:
          "There was an error updating the profile. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box
      minHeight="100vh"
      bgGradient="linear(to-b, #2D3748, #000000)"
      color="white"
      p={6}
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <Container maxW="container.md" bg="gray.800" p={6} borderRadius="md">
        <Heading mb={6}>Edit Profile</Heading>
        <form onSubmit={handleSubmit}>
          <VStack spacing={4} align="stretch">
            <FormControl id="display_name" isRequired>
              <FormLabel>Display Name</FormLabel>
              <Input
                type="text"
                placeholder="Enter your display name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </FormControl>
            <FormControl id="bio">
              <FormLabel>Bio</FormLabel>
              <Textarea
                placeholder="Write a short bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </FormControl>
            <FormControl id="genres">
              <FormLabel>Genres</FormLabel>
              <Select
                isMulti
                options={genreOptions}
                value={genres}
                onChange={(selectedOptions) => setGenres(selectedOptions)}
                placeholder="Select your favorite genres"
              />
            </FormControl>
            <FormControl id="instruments">
              <FormLabel>Instruments</FormLabel>
              <Select
                isMulti
                options={instrumentOptions}
                value={instruments}
                onChange={(selectedOptions) => setInstruments(selectedOptions)}
                placeholder="Select the instruments you play"
              />
            </FormControl>
            <FormControl id="profile_image">
              <FormLabel>Profile Image</FormLabel>
              <Box>
                <Input
                  type="file"
                  onChange={(e) => setFile(e.target.files[0])}
                  accept="image/*"
                />
              </Box>
            </FormControl>
            <Button type="submit" colorScheme="teal" variant="solid" mt={4}>
              Save Changes
            </Button>
          </VStack>
        </form>
      </Container>
    </Box>
  );
};

export default EditProfilePage;
