import React from "react";

const SpotifyLoginButton = () => {
  const handleLogin = () => {
    window.location.href = "http://localhost:5000/spotify/login";
  };

  return <button onClick={handleLogin}>Link Spotify Account</button>;
};

export default SpotifyLoginButton;
