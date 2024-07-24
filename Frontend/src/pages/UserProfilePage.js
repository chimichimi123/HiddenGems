import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function UserProfilePage() {
  const [user, setUser] = useState(null);
  const [spotifyUserData, setSpotifyUserData] = useState(null);
  const [spotifyData, setSpotifyData] = useState({
    topTracks: [],
    topArtists: [],
  });
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

    fetchUserData();
  }, [navigate]);

  useEffect(() => {
    const fetchSpotifyTopTracks = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/spotify-top-tracks",
          {
            withCredentials: true,
          }
        );
        setSpotifyData((prevState) => ({
          ...prevState,
          topTracks: response.data,
        }));
      } catch (error) {
        console.error("Error fetching top tracks:", error);
        setError("Failed to fetch top tracks. Please try again later.");
      }
    };

    const fetchSpotifyTopArtists = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/spotify-top-artists",
          {
            withCredentials: true,
          }
        );
        setSpotifyData((prevState) => ({
          ...prevState,
          topArtists: response.data,
        }));
      } catch (error) {
        console.error("Error fetching top artists:", error);
        setError("Failed to fetch top artists. Please try again later.");
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

    if (user && user.id) {
      fetchSpotifyTopTracks();
      fetchSpotifyTopArtists();
      fetchSpotifyUserData();
    }
  }, [user]);

  const handleUnlinkSpotify = async () => {
    setUnlinking(true);
    try {
      await axios.get("http://localhost:5000/spotify-auth/unlink-spotify", {
        withCredentials: true,
      });
      setSpotifyUserData(null);
      setSpotifyData({ topTracks: [], topArtists: [] });
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
    <div>
      {user ? (
        <div>
          <h2>{user.username}</h2>
          <p>{user.email}</p>

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
              {spotifyUserData.images.length > 0 && (
                <img
                  src={spotifyUserData.images[0].url}
                  alt="Spotify Profile"
                />
              )}
              <button onClick={handleUnlinkSpotify} disabled={unlinking}>
                {unlinking ? "Unlinking..." : "Unlink Spotify Account"}
              </button>
            </div>
          )}

          {spotifyData.topTracks.length > 0 && (
            <div>
              <h3>Top Tracks</h3>
              <ul>
                {spotifyData.topTracks.map((track) => (
                  <li key={track.id}>
                    {track.name} by{" "}
                    {track.artists.map((artist) => artist.name).join(", ")}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {spotifyData.topArtists.length > 0 && (
            <div>
              <h3>Top Artists</h3>
              <ul>
                {spotifyData.topArtists.map((artist) => (
                  <li key={artist.id}>{artist.name}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <p>No user data available.</p>
      )}
    </div>
  );
}

export default UserProfilePage;
