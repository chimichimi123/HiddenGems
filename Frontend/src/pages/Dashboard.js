import React from "react";
import Sidebar from "../components/Sidebar";
import SpotifyOverview from "../components/SpotifyOverview";
import MyLikedSongs from "../components/MyLikedSongs";
import MyPlaylists from "../components/MyPlaylists";

function Dashboard() {
  return (
    <div className="dashboard">
      <Sidebar />
      <SpotifyOverview />
      <MyLikedSongs />
      <MyPlaylists />
    </div>
  );
}

export default Dashboard;
