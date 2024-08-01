import React from "react";
import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <aside>
      <nav>
        <Link to="/user/liked_songs" style={{ color: "black" }}>
          My Liked Songs
        </Link>
        <Link to="/edit-profile" style={{ color: "black" }}>
          Edit Profile
        </Link>
      </nav>
    </aside>
  );
}

export default Sidebar;
