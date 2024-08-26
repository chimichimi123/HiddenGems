import React, { useEffect, useState } from "react";
import axios from "axios";
import { VStack, Text, Box, Input, Button } from "@chakra-ui/react";

function Messaging({ friendId }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  // Function to fetch messages from the server
  const fetchMessages = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/get-messages?friend_id=${friendId}`,
        {
          withCredentials: true,
        }
      );
      setMessages(response.data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  // Function to send a new message
  const sendMessage = async () => {
    if (!newMessage.trim()) {
      return;
    }
    try {
      await axios.post(
        "http://localhost:5000/send-message",
        {
          receiver_id: friendId,
          content: newMessage,
        },
        {
          withCredentials: true,
        }
      );
      setNewMessage(""); // Clear the input field
      fetchMessages(); // Fetch messages immediately after sending
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Set up polling to fetch messages periodically
  useEffect(() => {
    fetchMessages(); // Fetch messages initially

    const intervalId = setInterval(fetchMessages, 5000); // Poll every 5 seconds

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, [friendId]);

  return (
    <VStack spacing={4}>
      <Box>
        {messages.length > 0 ? (
          messages.map((message, index) => (
            <Box key={index} p={4} borderWidth="1px" borderRadius="lg">
              <Text>{message.content}</Text>
              <Text fontSize="sm">{message.timestamp}</Text>
            </Box>
          ))
        ) : (
          <Text>No messages found</Text>
        )}
      </Box>

      <Box>
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <Button onClick={sendMessage} colorScheme="teal" mt={2}>
          Send
        </Button>
      </Box>
    </VStack>
  );
}

export default Messaging;
