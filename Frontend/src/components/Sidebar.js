import React from "react";
import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <aside>
      <nav>
        <Link to="/dashboard">My Liked Songs</Link>
        <Link to="/dashboard">My Playlists</Link>
        <Link to="/edit-profile">Edit Profile</Link>
      </nav>
    </aside>
  );
}

export default Sidebar;
