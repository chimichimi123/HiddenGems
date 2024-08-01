import React from "react";
import {
  Avatar,
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  useDisclosure,
  useToast,
  VStack,
  Link,
} from "@chakra-ui/react";
import axios from "axios";
import defaultProfileImage from "../images/spotify_user_card-default.jpg"; // Adjust path as necessary

const UserProfile = () => {
  const [profileImage, setProfileImage] = React.useState(defaultProfileImage);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = React.useRef();
  const toast = useToast();

  React.useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get("http://localhost:5000/user", {
          withCredentials: true,
        });
        const userProfileImage = response.data.profile_image;
        if (userProfileImage) {
          const imageUrl = `http://localhost:5000/uploads/${userProfileImage}`;
          setProfileImage(imageUrl);
        } else {
          setProfileImage(defaultProfileImage);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setProfileImage(defaultProfileImage);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:5000/logout",
        {},
        { withCredentials: true }
      );
      window.location.href = "/login";
    } catch (error) {
      toast({
        title: "Logout Failed",
        description: "There was an error logging out. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleUnlinkSpotify = async () => {
    try {
      await axios.get("http://localhost:5000/unlink-spotify", {
        withCredentials: true,
      });
      setProfileImage(defaultProfileImage);
      toast({
        title: "Spotify Account Unlinked",
        description: "Your Spotify account has been unlinked successfully.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Unlink Failed",
        description:
          "There was an error unlinking your Spotify account. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box position="relative">
      <Avatar
        ref={btnRef}
        size="md"
        src={profileImage}
        alt="User Profile"
        onClick={onOpen}
        position="absolute"
        top="10px"
        right="10px"
        cursor="pointer"
      />

      <Drawer
        isOpen={isOpen}
        placement="right"
        onClose={onClose}
        finalFocusRef={btnRef}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Your Account</DrawerHeader>
          <DrawerBody>
            <VStack spacing={4} align="start">
              <Link href="/user" onClick={onClose}>
                Profile
              </Link>
              <Link href="/user/liked_songs" onClick={onClose}>
                Liked Songs
              </Link>
              <Link href="/edit-profile" onClick={onClose}>
                Edit Profile
              </Link>
              <Link href="http://localhost:5000/spotify/login" isExternal>
                Login to Spotify
              </Link>
              <Button
                onClick={handleUnlinkSpotify}
                colorScheme="red"
                variant="outline"
              >
                Unlink Spotify
              </Button>
              <Button onClick={handleLogout} colorScheme="teal">
                Logout
              </Button>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};

export default UserProfile;
