import React, { useEffect, useState } from "react";
import axios from "axios";
import { VStack, Text, Button, Box } from "@chakra-ui/react";
import { Link } from "react-router-dom"; // Import Link from react-router-dom
import Messaging from "./Messaging";
import IncomingFriends from "../components/IncomingFriends"; // Import the new component

function FriendsList() {
  const [friends, setFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);

  // Function to fetch friends from the server
  const fetchFriends = async () => {
    try {
      const response = await axios.get("http://localhost:5000/friends-list", {
        withCredentials: true,
      });
      setFriends(response.data);
    } catch (error) {
      console.error("Error fetching friends:", error);
    }
  };

  // Function to handle friend removal
  const removeFriend = async (friendId) => {
    try {
      await axios.post(
        `http://localhost:5000/remove-friend/${friendId}`,
        {},
        { withCredentials: true }
      );
      // Refresh the friends list after removal
      fetchFriends();
    } catch (error) {
      console.error("Error removing friend:", error);
    }
  };

  useEffect(() => {
    fetchFriends(); // Fetch friends initially

    // Polling or other logic can be added here if needed
  }, []);

  return (
    <VStack spacing={8}>
      {/* Incoming Friend Requests Section */}
      <Box>
        <Text fontSize="xl" mb={4}>
          Incoming Friend Requests
        </Text>
        <IncomingFriends />
      </Box>

      {/* Friends List Section */}
      <Box>
        <Text fontSize="xl" mb={4}>
          Your Friends
        </Text>
        {friends.length > 0 ? (
          friends.map((friend) => (
            <Box key={friend.id} display="flex" alignItems="center" mb={2}>
              {/* Friend's name as a link to their profile */}
              <Link to={`/user/${friend.id}`}>
                <Button variant="link" mr={4}>
                  {friend.username}
                </Button>
              </Link>
              {/* Message button */}
              <Button
                colorScheme="blue"
                onClick={() => setSelectedFriend(friend.id)}
                mr={4}
              >
                Message
              </Button>
              {/* Remove button */}
              <Button colorScheme="red" onClick={() => removeFriend(friend.id)}>
                Remove
              </Button>
            </Box>
          ))
        ) : (
          <Text>No friends found</Text>
        )}
      </Box>

      {/* Messaging Section */}
      {selectedFriend && <Messaging friendId={selectedFriend} />}
    </VStack>
  );
}

export default FriendsList;
