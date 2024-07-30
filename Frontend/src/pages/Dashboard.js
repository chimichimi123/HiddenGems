import React from "react";
import Sidebar from "../components/Sidebar";
import SpotifyOverview from "../components/SpotifyOverview";

function Dashboard() {
  return (
    <div className="dashboard">
      <Sidebar />
      <SpotifyOverview />
    </div>
  );
}

export default Dashboard;
