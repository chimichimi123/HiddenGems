import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import defaultProfileImage from "../images/spotify_user_card-default.jpg";
import UserLikedSongs from "../components/UserLikedSongs";
import SongList from "../components/SongList";

function UserProfiles() {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [topTracks, setTopTracks] = useState([]);
  const [topArtists, setTopArtists] = useState([]);
  const [leastPopularTracks, setLeastPopularTracks] = useState([]);
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
        const userData = response.data;
        setUser(userData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setError("Failed to fetch user profile. Please try again later.");
        setLoading(false);
      }
    };

    const fetchSpotifyProfile = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/spotify/user-profile/${userId}`,
          {
            withCredentials: true,
          }
        );
        const profileData = response.data;

        setTopTracks(profileData.top_tracks);
        setTopArtists(profileData.top_artists);
        setLeastPopularTracks(profileData.least_popular_tracks);
      } catch (error) {
        console.error("Error fetching Spotify profile:", error);
        setError("Failed to fetch Spotify profile. Please try again later.");
      }
    };

    fetchUserProfile();
    fetchSpotifyProfile();
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
          <UserLikedSongs userId={userId} />
          <h3>This Users Top Tracks</h3>
          <SongList songs={topTracks} title="Top Tracks" />

          <h3>This Users Top Artists</h3>
          <ul>
            {topArtists.map((artist) => (
              <li key={artist.id}>{artist.name}</li>
            ))}
          </ul>
          <h3>This Users favorite obscure Tracks</h3>
          <SongList songs={leastPopularTracks} title="Most Obscure Songs" />
        </div>
      ) : (
        <p>No user data available.</p>
      )}
    </div>
  );
}

export default UserProfiles;
