// src/pages/HomePage.js
import React from "react";
import SpotifyLoginButton from "../components/SpotifyLoginButton";

function HomePage() {
  return (
    <div className="HomePage">
      <h1>Welcome to HiddenGems</h1>
      <SpotifyLoginButton />
    </div>
  );
}

export default HomePage;
