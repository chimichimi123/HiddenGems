import React, { useEffect, useState } from "react";
import axios from "axios";
import { VStack, Text, Button, Box } from "@chakra-ui/react";

function IncomingFriendRequests() {
  const [incomingRequests, setIncomingRequests] = useState([]);

  useEffect(() => {
    const fetchIncomingRequests = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/incoming-friend-requests",
          {
            withCredentials: true,
          }
        );
        setIncomingRequests(response.data);
      } catch (error) {
        console.error("Error fetching incoming friend requests:", error);
      }
    };

    fetchIncomingRequests();
  }, []);

  const acceptFriendRequest = async (requestId) => {
    try {
      await axios.post(
        `http://localhost:5000/accept-friend-request/${requestId}`,
        {},
        { withCredentials: true }
      );
      // After successfully accepting, remove the request from the list
      setIncomingRequests(
        incomingRequests.filter((req) => req.request_id !== requestId)
      );
    } catch (error) {
      console.error("Error accepting friend request:", error);
    }
  };

  return (
    <VStack spacing={4}>
      {incomingRequests.length > 0 ? (
        incomingRequests.map((request) => (
          <Box
            key={request.request_id}
            p={4}
            borderWidth="1px"
            borderRadius="lg"
          >
            <Text>{request.sender_username}</Text>
            <Button onClick={() => acceptFriendRequest(request.request_id)}>
              Accept
            </Button>
          </Box>
        ))
      ) : (
        <Text>No incoming friend requests</Text>
      )}
    </VStack>
  );
}

export default IncomingFriendRequests;
