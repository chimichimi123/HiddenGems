import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import defaultProfileImage from "../images/spotify_user_card-default.jpg";
import UserLikedSongs from "../components/UserLikedSongs";

function UserProfiles() {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [topTracks, setTopTracks] = useState([]);
  const [topArtists, setTopArtists] = useState([]);
  const [obscureSongs, setObscureSongs] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/spotify/user-profile/${userId}`,
          {
            withCredentials: true,
          }
        );
        setUser(response.data);

        const topTracksResponse = await axios.get(
          `http://localhost:5000/spotify/user-profile/${userId}/top-tracks`,
          { withCredentials: true }
        );
        setTopTracks(topTracksResponse.data);

        const topArtistsResponse = await axios.get(
          `http://localhost:5000/spotify/user-profile/${userId}/top-artists`,
          { withCredentials: true }
        );
        setTopArtists(topArtistsResponse.data);

        const obscureSongsResponse = await axios.get(
          `http://localhost:5000/spotify/user-profile/${userId}/obscure-songs`,
          { withCredentials: true }
        );
        setObscureSongs(obscureSongsResponse.data);

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
          <UserLikedSongs userId={userId} />

          <h3>Top Tracks</h3>
          <ul>
            {topTracks.map((track) => (
              <li key={track.id}>
                {track.name} by {track.artist}
              </li>
            ))}
          </ul>

          <h3>Top Artists</h3>
          <ul>
            {topArtists.map((artist) => (
              <li key={artist.id}>{artist.name}</li>
            ))}
          </ul>

          <h3>Most Obscure Songs</h3>
          <ul>
            {obscureSongs.map((song) => (
              <li key={song.id}>
                {song.name} by {song.artist}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p>No user data available.</p>
      )}
    </div>
  );
}

export default UserProfiles;
