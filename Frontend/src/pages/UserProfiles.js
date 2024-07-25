import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import defaultProfileImage from "../images/spotify_user_card-default.jpg";

function UserProfiles() {
  const { userId } = useParams(); // Get userId from URL parameters
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/user-profile/${userId}`,
          {
            withCredentials: true,
          }
        );
        setUser(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setError("Failed to fetch user profile. Please try again later.");
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      {user ? (
        <div>
          <h2>{user.username}</h2>
          <p>{user.email}</p>
          <p>Display Name: {user.display_name}</p>
          <p>Bio: {user.bio}</p>
          <img
            src={
              user.profile_image
                ? `http://localhost:5000/uploads/${user.profile_image}`
                : defaultProfileImage
            }
            alt="Profile"
            style={{ width: "150px", height: "150px", borderRadius: "50%" }}
          />
        </div>
      ) : (
        <p>No user data available.</p>
      )}
    </div>
  );
}

export default UserProfiles;
