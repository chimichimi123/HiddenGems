import React from "react";
import PlaylistList from "./PlaylistList";

function MyPlaylists() {
  // Placeholder data
  const playlists = [
    { id: 1, title: "Playlist 1" },
    { id: 2, title: "Playlist 2" },
  ];

  return (
    <div>
      <h3>My Playlists</h3>
      <PlaylistList playlists={playlists} />
    </div>
  );
}

export default MyPlaylists;
