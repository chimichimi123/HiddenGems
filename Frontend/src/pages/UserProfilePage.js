import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar"; // Ensure the path is correct
import defaultProfileImage from "../images/spotify_user_card-default.jpg";

function UserProfilePage() {
  const [user, setUser] = useState(null);
  const [spotifyUserData, setSpotifyUserData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unlinking, setUnlinking] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get("http://localhost:5000/user", {
          withCredentials: true,
        });
        setUser(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setLoading(false);
        setError("Failed to fetch user data. Please try again later.");
      }
    };

    const fetchSpotifyUserData = async () => {
      try {
        const response = await axios.get("http://localhost:5000/spotify-data", {
          withCredentials: true,
        });
        setSpotifyUserData(response.data);
      } catch (error) {
        console.error("Error fetching Spotify user data:", error);
        setError("Failed to fetch Spotify user data. Please try again later.");
      }
    };

    fetchUserData();
    fetchSpotifyUserData();
  }, []);

  const handleUnlinkSpotify = async () => {
    setUnlinking(true);
    try {
      await axios.get("http://localhost:5000/unlink-spotify", {
        withCredentials: true,
      });
      setSpotifyUserData(null);
      setUnlinking(false);
      navigate("/user");
    } catch (error) {
      console.error("Error unlinking Spotify account:", error);
      setError("Failed to unlink Spotify account. Please try again later.");
      setUnlinking(false);
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ marginLeft: "200px" }}>
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

            {spotifyUserData && (
              <div>
                <h3>Spotify Profile</h3>
                <p>Display Name: {spotifyUserData.display_name}</p>
                <p>Email: {spotifyUserData.email}</p>
                <p>Country: {spotifyUserData.country}</p>
                <p>
                  Spotify Profile:{" "}
                  <a
                    href={spotifyUserData.external_urls.spotify}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {spotifyUserData.external_urls.spotify}
                  </a>
                </p>
                <p>Followers: {spotifyUserData.followers.total}</p>
                <img
                  src={
                    spotifyUserData.images.length > 0
                      ? spotifyUserData.images[0].url
                      : defaultProfileImage
                  }
                  alt="Spotify Profile"
                />
                <button onClick={handleUnlinkSpotify} disabled={unlinking}>
                  {unlinking ? "Unlinking..." : "Unlink Spotify Account"}
                </button>
              </div>
            )}
          </div>
        ) : (
          <p>No user data available.</p>
        )}
      </div>
    </div>
  );
}

export default UserProfilePage;
