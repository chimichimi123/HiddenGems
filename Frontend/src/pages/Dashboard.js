import React from "react";
import Sidebar from "../components/Sidebar";
import SpotifyOverview from "../components/SpotifyOverview";
import MyLikedSongs from "../components/MyLikedSongs";
import MyPlaylists from "../components/MyPlaylists";
import MostObscureSongs from "../components/MostObscureSongs";

function Dashboard() {
  return (
    <div className="dashboard">
      <Sidebar />
      <SpotifyOverview />
      <MyLikedSongs />
      <MyPlaylists />
      <MostObscureSongs />
    </div>
  );
}

export default Dashboard;
